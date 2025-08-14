#!/usr/bin/env python3
"""
Lightweight OCR pipeline with strong preprocessing and pluggable backends.

Priority backend: PaddleOCR (Lite) if available locally or via HTTP service.
Fallback backend: EasyOCR (already in requirements).

Usage:
  python lite_ocr.py --image test_images/clean_museum_board.png --lang eng

Environment (optional):
  PADDLE_OCR_URL  -> If set, sends base64 image to an HTTP PaddleOCR service.
"""

from __future__ import annotations

import os
import base64
import json
import argparse
from dataclasses import dataclass
from typing import List, Tuple, Optional

import cv2
import numpy as np

try:
    # Optional AI post-correction
    from ai_postcorrect import ai_correct_text  # type: ignore
except Exception:
    def ai_correct_text(text: str, lang: str = "eng") -> str:  # type: ignore
        return text

try:
    # Optional AI vision helpers (SR + EAST)
    from ai_vision import enhance_image_bgr, detect_text_boxes  # type: ignore
except Exception:
    def enhance_image_bgr(img):
        return img
    def detect_text_boxes(img):
        return []

try:
    # Optional local PaddleOCR (may not be available on Python 3.13)
    from paddleocr import PaddleOCR  # type: ignore
    _HAS_LOCAL_PADDLE = True
except Exception:
    _HAS_LOCAL_PADDLE = False

try:
    import easyocr  # type: ignore
    _HAS_EASYOCR = True
except Exception:
    _HAS_EASYOCR = False

try:
    import requests  # lightweight HTTP client
    _HAS_REQUESTS = True
except Exception:
    _HAS_REQUESTS = False


@dataclass
class OCRText:
    text: str
    boxes: List[Tuple[int, int, int, int]]
    backend: str


def normalize_illumination(gray: np.ndarray) -> np.ndarray:
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (31, 31))
    background = cv2.morphologyEx(gray, cv2.MORPH_OPEN, kernel)
    corrected = cv2.subtract(gray, background)
    corrected = cv2.normalize(corrected, None, 0, 255, cv2.NORM_MINMAX)
    return corrected


def deskew(gray: np.ndarray) -> np.ndarray:
    thr = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
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
    return cv2.warpAffine(gray, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)


def remove_grid_lines(bin_img: np.ndarray) -> np.ndarray:
    if bin_img.ndim == 3:
        gray = cv2.cvtColor(bin_img, cv2.COLOR_BGR2GRAY)
    else:
        gray = bin_img
    th = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
    horiz_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (40, 1))
    vert_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 40))
    detect_h = cv2.morphologyEx(th, cv2.MORPH_OPEN, horiz_kernel, iterations=1)
    detect_v = cv2.morphologyEx(th, cv2.MORPH_OPEN, vert_kernel, iterations=1)
    lines = cv2.bitwise_or(detect_h, detect_v)
    return cv2.bitwise_and(th, cv2.bitwise_not(lines))


def preprocess_image(path: str, target_height: int = 1600) -> Tuple[np.ndarray, np.ndarray]:
    img_bgr = cv2.imread(path)
    if img_bgr is None:
        raise ValueError(f"Could not load image: {path}")
    # Optional SR enhancement (no-op if disabled)
    img_bgr = enhance_image_bgr(img_bgr)
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    gray = normalize_illumination(gray)
    gray = deskew(gray)
    # Contrast boosting
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    gray = clahe.apply(gray)
    # Denoise
    gray = cv2.fastNlMeansDenoising(gray, None, 10, 7, 21)
    # Binarize + remove lines
    bin_img = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
    bin_img = remove_grid_lines(bin_img)
    # Resize keeping aspect to a readable height
    h, w = gray.shape
    scale = target_height / float(h)
    if scale > 0 and abs(scale - 1.0) > 1e-3:
        gray = cv2.resize(gray, (int(w * scale), target_height), interpolation=cv2.INTER_CUBIC)
        bin_img = cv2.resize(bin_img, (int(w * scale), target_height), interpolation=cv2.INTER_NEAREST)
    return gray, bin_img


def postprocess_text(text: str, lang: str) -> str:
    if not text:
        return text
    cleaned = (
        text
        .replace("\t", " ")
        .replace("\r", " ")
        .replace("\f", " ")
    )
    cleaned = " ".join(cleaned.split())
    # Simple OCR confusions for English
    if lang.startswith("eng"):
        cleaned = cleaned.replace("0", "O")
        cleaned = cleaned.replace("1", "I")
    cleaned = cleaned.strip()
    # Optional AI correction (no-op unless enabled and deps present)
    try:
        cleaned = ai_correct_text(cleaned, lang)
    except Exception:
        pass
    return cleaned


def run_paddle_http(bin_img: np.ndarray) -> Optional[str]:
    if not _HAS_REQUESTS:
        return None
    url = os.getenv("PADDLE_OCR_URL")
    if not url:
        return None
    _, encoded = cv2.imencode('.jpg', bin_img)
    b64 = base64.b64encode(encoded.tobytes()).decode('utf-8')
    payload = {"images": [f"data:image/jpeg;base64,{b64}"]}
    try:
        r = requests.post(url, data=json.dumps(payload), headers={"Content-Type": "application/json"}, timeout=20)
        r.raise_for_status()
        data = r.json()
        if isinstance(data, dict) and isinstance(data.get("text"), str):
            return data["text"].strip()
        if isinstance(data, dict) and isinstance(data.get("results"), list):
            first = data["results"][0]
            if isinstance(first, dict) and isinstance(first.get("text"), str):
                return first["text"].strip()
            if isinstance(first, list):
                return " ".join([str(x.get("text", "")).strip() for x in first if isinstance(x, dict)]).strip()
    except Exception:
        return None
    return None


def run_paddle_local(bin_img: np.ndarray, lang: str) -> Optional[str]:
    if not _HAS_LOCAL_PADDLE:
        return None
    try:
        ocr = PaddleOCR(use_angle_cls=True, lang='en' if lang.startswith('eng') else 'hi', show_log=False)
        # PaddleOCR expects RGB image arrays
        rgb = cv2.cvtColor(bin_img, cv2.COLOR_GRAY2RGB)
        result = ocr.ocr(rgb, cls=True)
        if not result:
            return ""
        lines = []
        for page in result:
            for item in page:
                txt = item[1][0]
                if isinstance(txt, str) and txt.strip():
                    lines.append(txt.strip())
        return "\n".join(lines)
    except Exception:
        return None


def _score_text(s: str) -> float:
    if not s:
        return 0.0
    # length + word count - special chars
    length_score = min(len(s) / 10.0, 50)
    words = len([w for w in s.split() if w])
    word_score = min(words * 0.5, 30)
    specials = len([c for c in s if not (c.isalnum() or c.isspace())])
    special_penalty = min(specials * 0.5, 20)
    return max(0.0, length_score + word_score - special_penalty)


def run_easyocr(gray_img: np.ndarray, lang: str) -> Optional[str]:
    if not _HAS_EASYOCR:
        return None
    langs = ['en'] if lang.startswith('eng') else (['hi'] if lang.startswith('hin') else ['en'])
    reader = easyocr.Reader(langs, gpu=False)

    candidates: List[str] = []

    # Prepare variants: grayscale, binarized, and small dilated binary
    bin_img = cv2.threshold(gray_img, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
    bin_dilate = cv2.dilate(bin_img, kernel, iterations=1)

    variants = [gray_img, bin_img, bin_dilate]
    rotations = [0, 90, 270]  # 180 rarely adds value after deskew

    for v in variants:
        for rot in rotations:
            if rot:
                v2 = cv2.rotate(v, cv2.ROTATE_90_CLOCKWISE if rot == 90 else cv2.ROTATE_90_COUNTERCLOCKWISE)
            else:
                v2 = v
            result = reader.readtext(v2, paragraph=True)
            texts: List[str] = []
            for item in result:
                # easyocr can return either (bbox, text, conf) or (bbox, (text, conf)) in some versions
                if len(item) == 3:
                    _bbox, text, conf = item
                elif len(item) == 2 and isinstance(item[1], (list, tuple)) and len(item[1]) >= 2:
                    _bbox, meta = item
                    text, conf = meta[0], float(meta[1])
                else:
                    continue
                if isinstance(text, str) and text.strip() and float(conf) > 0.3:
                    texts.append(text.strip())
            if texts:
                candidates.append(" ".join(texts))

    if not candidates:
        return ""
    best = max(candidates, key=_score_text)
    return best


def ocr_image(path: str, lang: str = 'eng') -> OCRText:
    gray, bin_img = preprocess_image(path)

    # Try Paddle via HTTP, then local Paddle, then EasyOCR
    text: Optional[str] = run_paddle_http(bin_img)
    backend = 'paddle-http'
    if not text:
        text = run_paddle_local(bin_img, lang)
        backend = 'paddle-local'
    if not text:
        text = run_easyocr(gray, lang)
        backend = 'easyocr'
    if text is None:
        text = ''
        backend = 'none'

    text = postprocess_text(text, lang)
    h, w = gray.shape
    return OCRText(text=text, boxes=[(0, 0, w, h)], backend=backend)


def main():
    ap = argparse.ArgumentParser(description='Lightweight OCR pipeline')
    ap.add_argument('--image', required=True, help='Path to input image')
    ap.add_argument('--lang', default='eng', help='Language hint: eng or hin')
    args = ap.parse_args()

    result = ocr_image(args.image, args.lang)
    print(f"Backend: {result.backend}")
    print("--- OCR TEXT ---")
    print(result.text or '(no text)')


if __name__ == '__main__':
    main()

