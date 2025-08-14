#!/usr/bin/env python3
"""
🧪 Test script for the consolidated Museum OCR system
"""

import os
import sys
import json
from museum_ocr import MuseumOCR

def test_ocr_system():
    """Test the OCR system with available images"""
    print("🧪 TESTING MUSEUM OCR SYSTEM")
    print("=" * 50)
    
    try:
        # Initialize OCR engine
        print("🚀 Initializing OCR engine...")
        ocr = MuseumOCR()
        print("✅ OCR engine initialized successfully")
        
        # Check for available test images
        test_images = []
        
        # Check for demo fish board
        if os.path.exists("demo_fish_board.png"):
            test_images.append("demo_fish_board.png")
        
        # Check for test images
        if os.path.exists("test_images"):
            for file in os.listdir("test_images"):
                if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                    test_images.append(os.path.join("test_images", file))
        
        if not test_images:
            print("❌ No test images found!")
            print("Please ensure you have at least one image file to test with.")
            return
        
        print(f"📸 Found {len(test_images)} test image(s)")
        
        # Test each image
        for i, image_path in enumerate(test_images):
            print(f"\n🔍 Testing image {i+1}/{len(test_images)}: {image_path}")
            print("-" * 40)
            
            try:
                # Process image
                result = ocr.process_image(image_path)
                
                # Generate report
                report = ocr.generate_report(result)
                print(report)
                
            except Exception as e:
                print(f"❌ Failed to process {image_path}: {e}")
                import traceback
                traceback.print_exc()
        
        print(f"\n✅ Testing completed for {len(test_images)} image(s)")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()

def test_specific_image(image_path: str):
    """Test the OCR system with a specific image"""
    # Check if this is being called from backend (expecting JSON output)
    if len(sys.argv) > 1 and sys.argv[1] == image_path:
        # Backend mode - output JSON
        try:
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
            result = ocr.process_image(image_path)
            
            # Convert to JSON format expected by backend
            json_result = {
                "success": True,
                "text": result.text,
                "hindi_text": result.hindi_text,
                "english_text": result.english_text,
                "confidence": result.confidence,
                "processing_time": result.processing_time,
                "zones_count": len(result.zones)
            }
            
            # Output JSON to stdout (this is what backend reads)
            print(json.dumps(json_result))
            
        except Exception as e:
            error_result = {
                "success": False,
                "error": str(e),
                "text": "",
                "hindi_text": "",
                "english_text": "",
                "confidence": 0.0,
                "processing_time": 0.0,
                "zones_count": 0
            }
            print(json.dumps(error_result))
    else:
        # Interactive mode - output human-readable report
        print(f"🎯 TESTING SPECIFIC IMAGE: {image_path}")
        print("=" * 50)
        
        try:
            # Check if image exists
            if not os.path.exists(image_path):
                print(f"❌ Image not found: {image_path}")
                return
            
            # Initialize OCR engine
            print("🚀 Initializing OCR engine...")
            ocr = MuseumOCR()
            print("✅ OCR engine initialized successfully")
            
            # Process image
            print(f"📸 Processing image: {image_path}")
            result = ocr.process_image(image_path)
            
            # Generate and display report
            report = ocr.generate_report(result)
            print("\n" + report)
            
        except Exception as e:
            print(f"❌ Test failed: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Test specific image
        image_path = sys.argv[1]
        test_specific_image(image_path)
    else:
        # Test all available images
        test_ocr_system() 