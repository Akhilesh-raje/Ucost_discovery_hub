#!/usr/bin/env python3
"""
🏛️ MUSEUM-GRADE OCR PIPELINE
Advanced OCR with exact text layout preservation
Multi-language (Hindi + English) with zone-aware extraction
"""

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import easyocr
import logging
import os
import time
import sys
import json
from typing import List, Tuple, Dict
from dataclasses import dataclass

try:
    # Optional AI post-correction
    from ai_postcorrect import ai_correct_text  # type: ignore
except Exception:
    def ai_correct_text(text: str, lang: str = "eng") -> str:  # type: ignore
        return text

try:
    # Optional AI vision helpers
    from ai_vision import enhance_image_bgr, detect_text_boxes  # type: ignore
except Exception:
    def enhance_image_bgr(img):
        return img
    def detect_text_boxes(img):
        return []

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class TextZone:
    x: int
    y: int
    w: int
    h: int
    language: str
    confidence: float
    text: str = ""

@dataclass
class OCRResult:
    text: str
    hindi_text: str
    english_text: str
    confidence: float
    processing_time: float
    zones: List[TextZone]
    preprocessing_steps: List[str]

class MuseumOCR:
    """
    Museum-Grade OCR Engine with advanced preprocessing and multi-language support
    """
    
    def __init__(self, force_language: str = None):
        """Initialize the OCR engine

        force_language: Optional override for language detection.
        Accepts 'english', 'hindi', or None for auto-detect per zone.
        """
        logger.info("🚀 Initializing Museum-Grade OCR Engine...")
        
        try:
            # Initialize EasyOCR readers
            self.hindi_reader = easyocr.Reader(['hi'], gpu=False)
            self.english_reader = easyocr.Reader(['en'], gpu=False)
            logger.info("✅ EasyOCR readers initialized successfully")
        except Exception as e:
            logger.error(f"❌ Failed to initialize EasyOCR: {e}")
            raise
        
        # Preprocessing parameters
        self.morph_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
        self.min_zone_area = 200
        self.max_zone_area = 50000
        self.min_zone_width = 30
        self.min_zone_height = 15
        self.force_language = (force_language or '').strip().lower() or None

    def _deskew(self, gray: np.ndarray) -> np.ndarray:
        """Estimate skew angle and rotate to correct it."""
        try:
            # Binarize for angle estimation
            thr = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
            # Invert so text is 1s for coordinate extraction
            inv = 255 - thr
            coords = np.column_stack(np.where(inv > 0))
            if coords.size == 0:
                return gray
            angle = cv2.minAreaRect(coords)[-1]
            if angle < -45:
                angle = -(90 + angle)
            else:
                angle = -angle
            (h, w) = gray.shape[:2]
            M = cv2.getRotationMatrix2D((w // 2, h // 2), angle, 1.0)
            rotated = cv2.warpAffine(gray, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
            return rotated
        except Exception:
            return gray

    def _normalize_illumination(self, gray: np.ndarray) -> np.ndarray:
        """Apply background estimation and normalize uneven lighting."""
        try:
            # Large-kernel morphological opening approximates background
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (31, 31))
            background = cv2.morphologyEx(gray, cv2.MORPH_OPEN, kernel)
            # Subtract background then normalize contrast
            corrected = cv2.subtract(gray, background)
            corrected = cv2.normalize(corrected, None, 0, 255, cv2.NORM_MINMAX)
            return corrected
        except Exception:
            return gray

    def _remove_grid_lines(self, bin_img: np.ndarray) -> np.ndarray:
        """Remove horizontal and vertical lines typical of tables/boxes."""
        try:
            # Expect binary image (text white on black). If not, threshold.
            if bin_img.ndim == 3:
                gray = cv2.cvtColor(bin_img, cv2.COLOR_BGR2GRAY)
            else:
                gray = bin_img
            if gray.dtype != np.uint8:
                gray = gray.astype(np.uint8)

            # Ensure text is white (255) on black (0)
            th = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]

            # Detect horizontal lines
            horiz_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (40, 1))
            detect_h = cv2.morphologyEx(th, cv2.MORPH_OPEN, horiz_kernel, iterations=1)

            # Detect vertical lines
            vert_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 40))
            detect_v = cv2.morphologyEx(th, cv2.MORPH_OPEN, vert_kernel, iterations=1)

            # Combine and subtract from threshold image
            lines = cv2.bitwise_or(detect_h, detect_v)
            cleaned = cv2.bitwise_and(th, cv2.bitwise_not(lines))
            return cleaned
        except Exception:
            return bin_img
        
    def process_image(self, image_path: str) -> OCRResult:
        """Main pipeline: process image through all stages"""
        start_time = time.time()
        preprocessing_steps = []
        
        try:
            # Load image
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError(f"Could not load image: {image_path}")
            
            logger.info(f"📸 Processing image: {image_path}")
            # Optional SR enhancement
            image = enhance_image_bgr(image)
            original_image = image.copy()
            
            # Stage 1: Basic preprocessing
            image, step_info = self.preprocess_image(image)
            preprocessing_steps.append(step_info)
            
            # Stage 2: Text zone detection
            zones = self.detect_text_zones(image)
            # Optional: refine/add boxes via EAST if enabled
            try:
                east_boxes = detect_text_boxes(image)
                if east_boxes:
                    # Merge: union of both sets; de-dup by IoU > 0.5
                    def iou(a, b):
                        ax, ay, aw, ah = a; bx, by, bw, bh = b
                        x1 = max(ax, bx); y1 = max(ay, by)
                        x2 = min(ax+aw, bx+bw); y2 = min(ay+ah, by+bh)
                        inter = max(0, x2-x1) * max(0, y2-y1)
                        union = aw*ah + bw*bh - inter
                        return inter/union if union > 0 else 0.0
                    merged = zones[:]
                    for eb in east_boxes:
                        if all(iou(eb, zb) < 0.5 for zb in merged):
                            merged.append(eb)
                    zones = merged
            except Exception:
                pass
            logger.info(f"🔍 Detected {len(zones)} text zones")
            
            # Stage 3: Process each zone
            processed_zones = []
            for i, zone in enumerate(zones):
                logger.info(f"Processing zone {i+1}: {zone}")
                
                # Detect language
                language = self.detect_language(zone, image)
                
                # Extract text
                text = self.recognize_text_in_zone(image, zone, language)
                
                # Calculate confidence
                confidence = self.calculate_text_confidence(text, image[zone[1]:zone[1]+zone[3], zone[0]:zone[0]+zone[2]])
                
                # Create TextZone object
                text_zone = TextZone(
                    x=zone[0], y=zone[1], w=zone[2], h=zone[3],
                    language=language, confidence=confidence, text=text
                )
                processed_zones.append(text_zone)
                
                logger.info(f"Zone {i+1}: Language={language}, Text='{text[:50]}...', Confidence={confidence:.2f}")
            
            # Stage 4: Extract language-specific text
            hindi_text = self.extract_language_text(processed_zones, 'hindi')
            english_text = self.extract_language_text(processed_zones, 'english')

            # Optional AI post-correction per language block
            try:
                if hindi_text.strip():
                    hindi_text = ai_correct_text(hindi_text, 'hin')
            except Exception:
                pass
            try:
                if english_text.strip():
                    english_text = ai_correct_text(english_text, 'eng')
            except Exception:
                pass
            
            # Combine all text
            all_text = []
            if hindi_text.strip():
                all_text.append(f"[HINDI] {hindi_text}")
            if english_text.strip():
                all_text.append(f"[ENGLISH] {english_text}")
            
            combined_text = '\n\n'.join(all_text)
            # Global pass on combined for coherence
            try:
                if combined_text.strip():
                    combined_text = ai_correct_text(combined_text, 'eng')
            except Exception:
                pass
            
            # Calculate overall confidence
            overall_confidence = np.mean([zone.confidence for zone in processed_zones]) if processed_zones else 0.0
            
            processing_time = time.time() - start_time
            
            result = OCRResult(
                text=combined_text,
                hindi_text=hindi_text,
                english_text=english_text,
                confidence=overall_confidence,
                processing_time=processing_time,
                zones=processed_zones,
                preprocessing_steps=preprocessing_steps
            )
            
            logger.info(f"✅ OCR completed in {processing_time:.2f}s with {len(processed_zones)} zones")
            logger.info(f"Overall Confidence: {overall_confidence:.2%}")
            
            return result
            
        except Exception as e:
            logger.error(f"❌ OCR processing failed: {e}")
            import traceback
            traceback.print_exc()
            raise
    
    def preprocess_image(self, image: np.ndarray) -> Tuple[np.ndarray, str]:
        """Enhanced image preprocessing: illumination norm -> deskew -> CLAHE/denoise -> line removal."""
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

            # Normalize uneven illumination first
            gray = self._normalize_illumination(gray)

            # Deskew to align text lines
            gray = self._deskew(gray)
            
            # Apply CLAHE for better contrast
            clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
            enhanced = clahe.apply(gray)
            
            # Denoise
            denoised = cv2.fastNlMeansDenoising(enhanced, None, 10, 7, 21)
            
            # Sharpen
            kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
            sharpened = cv2.filter2D(denoised, -1, kernel)

            # Remove grid/table lines from binarized view, then blend
            bin_for_lines = cv2.threshold(sharpened, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
            no_lines = self._remove_grid_lines(bin_for_lines)

            # Combine: favor cleaned binary where it is text-like
            result_gray = cv2.bitwise_or(sharpened, no_lines)

            # Convert back to BGR for downstream processing
            result = cv2.cvtColor(result_gray, cv2.COLOR_GRAY2BGR)
            
            logger.info("✅ Image preprocessing completed")
            return result, "Illumination normalization, deskew, contrast, denoise, line removal"
            
        except Exception as e:
            logger.error(f"❌ Preprocessing failed: {e}")
            return image, "Basic preprocessing only"
    
    def detect_text_zones(self, image: np.ndarray) -> List[Tuple[int, int, int, int]]:
        """Detect text zones using multiple strategies"""
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Strategy 1: Adaptive thresholding
            binary = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 11, 2)
            
            # Strategy 2: Morphological operations
            morph = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, self.morph_kernel)
            morph = cv2.morphologyEx(morph, cv2.MORPH_OPEN, self.morph_kernel)
            
            # Strategy 3: Find contours
            contours, _ = cv2.findContours(morph, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # Filter contours by size and shape
            zones = []
            for contour in contours:
                x, y, w, h = cv2.boundingRect(contour)
                area = w * h
                
                # Filter by area and dimensions
                if (self.min_zone_area <= area <= self.max_zone_area and
                    w >= self.min_zone_width and h >= self.min_zone_height):
                    zones.append((x, y, w, h))
            
            # If no zones found, try fallback strategy
            if not zones:
                logger.warning("No zones detected with primary method, trying fallback...")
                zones = self.fallback_zone_detection(gray)
            
            logger.info(f"🔍 Detected {len(zones)} text zones")
            return zones
            
        except Exception as e:
            logger.error(f"❌ Zone detection failed: {e}")
            return []
    
    def fallback_zone_detection(self, gray: np.ndarray) -> List[Tuple[int, int, int, int]]:
        """Fallback zone detection using edge detection"""
        try:
            # Canny edge detection
            edges = cv2.Canny(gray, 50, 150)
            
            # Find contours on edges
            contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            zones = []
            for contour in contours:
                x, y, w, h = cv2.boundingRect(contour)
                area = w * h
                
                if (self.min_zone_area <= area <= self.max_zone_area and
                    w >= self.min_zone_width and h >= self.min_zone_height):
                    zones.append((x, y, w, h))
            
            # If still no zones, create a default zone
            if not zones:
                logger.warning("No zones detected with fallback, creating default zone...")
                h, w = gray.shape
                zones = [(w//4, h//4, w//2, h//2)]
            
            return zones
            
        except Exception as e:
            logger.error(f"❌ Fallback zone detection failed: {e}")
            return []
    
    def detect_language(self, zone: Tuple[int, int, int, int], image: np.ndarray) -> str:
        """Detect language of text in a zone"""
        try:
            # If user enforces language, skip detection
            if self.force_language in {"english", "hindi"}:
                return self.force_language
            x, y, w, h = zone
            roi = image[y:y+h, x:x+w]
            
            # Try both readers and compare confidence
            hindi_results = self.hindi_reader.readtext(roi)
            english_results = self.english_reader.readtext(roi)
            
            # Calculate average confidence for each language
            hindi_conf = np.mean([result[2] for result in hindi_results]) if hindi_results else 0.0
            english_conf = np.mean([result[2] for result in english_results]) if english_results else 0.0
            
            # Determine language based on confidence
            if hindi_conf > english_conf and hindi_conf > 0.3:
                return 'hindi'
            elif english_conf > 0.3:
                return 'english'
            else:
                return 'mixed'
                
        except Exception as e:
            logger.error(f"❌ Language detection failed: {e}")
            return 'unknown'
    
    def recognize_text_in_zone(self, image: np.ndarray, zone: Tuple[int, int, int, int], language: str) -> str:
        """Extract text from a specific zone"""
        try:
            x, y, w, h = zone
            roi = image[y:y+h, x:x+w]
            
            if language == 'hindi':
                results = self.hindi_reader.readtext(roi)
            elif language == 'english':
                results = self.english_reader.readtext(roi)
            else:
                # Try both languages and combine
                hindi_results = self.hindi_reader.readtext(roi)
                english_results = self.english_reader.readtext(roi)
                results = hindi_results + english_results
            
            # Extract text from results
            texts = []
            for (bbox, text, confidence) in results:
                if text.strip() and confidence > 0.3:  # Filter low confidence results
                    texts.append(text.strip())
            
            combined_text = ' '.join(texts)
            logger.info(f"Extracted text: '{combined_text[:50]}...' (confidence: {np.mean([r[2] for r in results]):.2f})")
            
            return combined_text
            
        except Exception as e:
            logger.error(f"❌ Text recognition failed: {e}")
            return ""
    
    def calculate_text_confidence(self, text: str, region: np.ndarray) -> float:
        """Calculate confidence score for extracted text"""
        try:
            if not text.strip():
                return 0.0
            
            # Basic confidence based on text length and content
            base_confidence = min(len(text.strip()) / 50.0, 1.0)  # Normalize by expected text length
            
            # Additional confidence based on text quality
            quality_score = 0.0
            if any(char.isalpha() for char in text):
                quality_score += 0.3
            if any(char.isdigit() for char in text):
                quality_score += 0.2
            if len(text.split()) > 1:
                quality_score += 0.2
            
            final_confidence = min(base_confidence + quality_score, 1.0)
            return final_confidence
            
        except Exception as e:
            logger.error(f"❌ Confidence calculation failed: {e}")
            return 0.0
    
    def split_text_by_script(self, text: str) -> Tuple[str, str]:
        """Split a text string into Hindi (Devanagari) and English (Latin) components.

        Preserves whitespace and punctuation in-place while routing characters to the
        most likely script bucket based on their Unicode block.
        """
        try:
            hindi_chars: List[str] = []
            english_chars: List[str] = []

            for ch in text:
                codepoint = ord(ch)
                # Devanagari block: U+0900–U+097F (basic)
                # Include common punctuation/whitespace in both, but we will normalize later
                if 0x0900 <= codepoint <= 0x097F:
                    hindi_chars.append(ch)
                    # Maintain spacing in the other stream to keep word boundaries sensible
                    english_chars.append(' ' if ch.isspace() else '')
                # Basic Latin and Latin-1 Supplement ranges
                elif (0x0000 <= codepoint <= 0x007F) or (0x0080 <= codepoint <= 0x00FF):
                    english_chars.append(ch)
                    hindi_chars.append(' ' if ch.isspace() else '')
                else:
                    # For other symbols, route as neutral spacing so they don't cross-contaminate
                    hindi_chars.append(' ' if ch.isspace() else '')
                    english_chars.append(' ' if ch.isspace() else '')

            hindi_text = ' '.join(''.join(hindi_chars).split())
            english_text = ' '.join(''.join(english_chars).split())
            return hindi_text, english_text
        except Exception:
            # In case of any unexpected error, fail safe by returning the full text as mixed English
            return '', text

    def extract_language_text(self, zones: List[TextZone], language: str) -> str:
        """Extract text from zones of a specific language"""
        try:
            language_texts: List[str] = []
            target = language.lower()
            for zone in zones:
                if not zone.text.strip():
                    continue

                zone_lang = zone.language.lower()

                if zone_lang == target:
                    language_texts.append(zone.text)
                elif zone_lang == 'mixed':
                    hindi_part, english_part = self.split_text_by_script(zone.text)
                    if target == 'hindi' and hindi_part:
                        language_texts.append(hindi_part)
                    if target == 'english' and english_part:
                        language_texts.append(english_part)
            
            return '\n'.join(language_texts)
            
        except Exception as e:
            logger.error(f"❌ Language text extraction failed: {e}")
            return ""
    
    def generate_report(self, result: OCRResult) -> str:
        """Generate a comprehensive OCR report with customized language headings"""
        try:
            report = []
            report.append("🏛️ MUSEUM OCR REPORT")
            report.append("=" * 50)
            report.append(f"Processing Time: {result.processing_time:.2f}s")
            report.append(f"Overall Confidence: {result.confidence:.2%}")
            report.append(f"Text Zones Detected: {len(result.zones)}")
            report.append("")
            
            if result.hindi_text.strip():
                report.append("🇮🇳 🕉️ हिंदी पाठ 🕉️ 🇮🇳")
                report.append("=" * 40)
                report.append(result.hindi_text)
                report.append("")
            
            if result.english_text.strip():
                report.append("🇺🇸 🗽 ENGLISH TEXT 🗽 🇺🇸")
                report.append("=" * 40)
                report.append(result.english_text)
                report.append("")
            
            if result.zones:
                report.append("📍 ZONE DETAILS:")
                report.append("-" * 20)
                for i, zone in enumerate(result.zones):
                    report.append(f"Zone {i+1}: {zone.language.upper()} at ({zone.x}, {zone.y})")
                    report.append(f"  Size: {zone.w} x {zone.h}, Confidence: {zone.confidence:.2%}")
                    report.append(f"  Text: {zone.text[:100]}...")
                    report.append("")
            
            return '\n'.join(report)
            
        except Exception as e:
            logger.error(f"❌ Report generation failed: {e}")
            return f"Error generating report: {e}"

def main():
    """Main function for testing and backend integration"""
    try:
        # Check if called from backend (with image path argument)
        if len(sys.argv) > 1:
            image_path = sys.argv[1]
            logger.info(f"🔍 Backend mode - processing image: {image_path}")
            
            # Check if image exists
            if not os.path.exists(image_path):
                error_result = {
                    "success": False,
                    "error": f"Image not found: {image_path}",
                    "text": "",
                    "hindi_text": "",
                    "english_text": "",
                    "confidence": 0.0,
                    "processing_time": 0.0,
                    "zones_count": 0
                }
                print(json.dumps(error_result))
                return
            
            # Initialize OCR engine
            ocr = MuseumOCR()
            
            # Process image
            start_time = time.time()
            result = ocr.process_image(image_path)
            processing_time = time.time() - start_time
            
            # Prepare JSON output for backend
            json_result = {
                "success": True,
                "text": result.text,
                "hindi_text": result.hindi_text,
                "english_text": result.english_text,
                "confidence": result.confidence,
                "processing_time": processing_time,
                "zones_count": len(result.zones)
            }
            
            # Output JSON for backend
            print(json.dumps(json_result))
            logger.info("✅ JSON output sent to backend")
            
        else:
            # Test mode - use demo image
            logger.info("🧪 Test mode - no image path provided")
            
            # Initialize OCR engine
            ocr = MuseumOCR()
            
            # Test with demo image
            demo_image = "demo_fish_board.png"
            if os.path.exists(demo_image):
                logger.info(f"Testing with demo image: {demo_image}")
                result = ocr.process_image(demo_image)
                
                # Generate and print report
                report = ocr.generate_report(result)
                print(report)
                
            else:
                logger.warning(f"Demo image not found: {demo_image}")
                logger.info("Please provide an image path to test the OCR system")
                logger.info("Usage: python museum_ocr.py <image_path>")
            
    except Exception as e:
        logger.error(f"❌ Main execution failed: {e}")
        
        # If called from backend, return error as JSON
        if len(sys.argv) > 1:
            error_result = {
                "success": False,
                "error": f"OCR processing failed: {str(e)}",
                "text": "",
                "hindi_text": "",
                "english_text": "",
                "confidence": 0.0,
                "processing_time": 0.0,
                "zones_count": 0
            }
            print(json.dumps(error_result))
        else:
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    main() 