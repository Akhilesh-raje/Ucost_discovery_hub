#!/usr/bin/env python3
"""
Lightweight AI vision helpers for OCR:
- Optional super-resolution preprocessing via OpenCV dnn_superres
- Optional EAST text detection via OpenCV DNN

Environment flags:
- AI_PREPROCESS=1   -> enable super-resolution (requires model file)
- AI_TEXT_DETECT=1  -> enable EAST text detection (requires model file)

Environment variables for models:
- AI_SR_MODEL_PATH: path to super-resolution .pb model (e.g., FSRCNN_x2.pb)
- AI_SR_MODEL_NAME: SR model name (e.g., FSRCNN, EDSR, ESPCN, LapSRN). Default: FSRCNN
- AI_SR_SCALE: upscaling factor (2/3/4). Default: 2
- AI_EAST_MODEL_PATH: path to frozen_east_text_detection.pb
- AI_EAST_INPUT_W / AI_EAST_INPUT_H: network input size (multiples of 32). Default: 640x640
- AI_EAST_SCORE: score threshold (default 0.5)
- AI_EAST_NMS: NMS threshold (default 0.3)
"""

from __future__ import annotations

import os
import math
from functools import lru_cache
from typing import List, Tuple, Optional

import cv2  # type: ignore
import numpy as np  # type: ignore


def _enabled(flag_name: str) -> bool:
    val = os.getenv(flag_name, "0").strip()
    return val not in {"", "0", "false", "False"}


# ===== Super-resolution (optional, via OpenCV dnn_superres) =====

def _sr_enabled() -> bool:
    return _enabled("AI_PREPROCESS")


@lru_cache(maxsize=1)
def _load_sr_model():
    if not _sr_enabled():
        return None
    # dnn_superres is in opencv-contrib-python
    if not hasattr(cv2, "dnn_superres"):
        return None
    model_path = os.getenv("AI_SR_MODEL_PATH", "").strip()
    if not model_path or not os.path.exists(model_path):
        return None
    model_name = os.getenv("AI_SR_MODEL_NAME", "FSRCNN").strip()
    try:
        scale = int(os.getenv("AI_SR_SCALE", "2"))
    except Exception:
        scale = 2
    try:
        sr = cv2.dnn_superres.DnnSuperResImpl_create()
        sr.readModel(model_path)
        sr.setModel(model_name, scale)
        return (sr, scale)
    except Exception:
        return None


def enhance_image_bgr(image_bgr: np.ndarray) -> np.ndarray:
    """Optionally apply super-resolution; returns original if disabled/unavailable."""
    try:
        handle = _load_sr_model()
        if not handle:
            return image_bgr
        sr, scale = handle
        h, w = image_bgr.shape[:2]
        # Avoid upscaling very large images
        if max(h, w) > 2400:
            return image_bgr
        up = sr.upsample(image_bgr)
        # Gentle sharpening
        kernel = np.array([[-1, -1, -1], [-1, 9, -1], [-1, -1, -1]])
        up = cv2.filter2D(up, -1, kernel)
        return up
    except Exception:
        return image_bgr


# ===== EAST text detection (optional, via OpenCV DNN) =====

def _text_detect_enabled() -> bool:
    return _enabled("AI_TEXT_DETECT")


@lru_cache(maxsize=1)
def _load_east_model():
    if not _text_detect_enabled():
        return None
    model_path = os.getenv("AI_EAST_MODEL_PATH", "").strip()
    if not model_path or not os.path.exists(model_path):
        return None
    try:
        net = cv2.dnn.readNet(model_path)
        return net
    except Exception:
        return None


def _decode_east(scores: np.ndarray, geometry: np.ndarray, score_thresh: float = 0.5):
    num_rows, num_cols = scores.shape[2:4]
    rects = []
    confidences = []
    for y in range(num_rows):
        scores_data = scores[0, 0, y]
        x0_data = geometry[0, 0, y]
        x1_data = geometry[0, 1, y]
        x2_data = geometry[0, 2, y]
        x3_data = geometry[0, 3, y]
        angles_data = geometry[0, 4, y]
        for x in range(num_cols):
            score = float(scores_data[x])
            if score < score_thresh:
                continue
            offset_x, offset_y = x * 4.0, y * 4.0
            angle = float(angles_data[x])
            cos = math.cos(angle)
            sin = math.sin(angle)
            h = float(x0_data[x] + x2_data[x])
            w = float(x1_data[x] + x3_data[x])
            end_x = int(offset_x + (cos * x1_data[x]) + (sin * x2_data[x]))
            end_y = int(offset_y - (sin * x1_data[x]) + (cos * x2_data[x]))
            start_x = int(end_x - w)
            start_y = int(end_y - h)
            rects.append((start_x, start_y, int(w), int(h)))
            confidences.append(score)
    return rects, confidences


def detect_text_boxes(image_bgr: np.ndarray) -> List[Tuple[int, int, int, int]]:
    """Detect text boxes using EAST if enabled. Returns [] if disabled/unavailable."""
    try:
        net = _load_east_model()
        if net is None:
            return []
        h, w = image_bgr.shape[:2]
        target_w = int(os.getenv("AI_EAST_INPUT_W", "640"))
        target_h = int(os.getenv("AI_EAST_INPUT_H", "640"))
        target_w = max(320, (target_w // 32) * 32)
        target_h = max(320, (target_h // 32) * 32)

        blob = cv2.dnn.blobFromImage(image_bgr, 1.0, (target_w, target_h), (123.68, 116.78, 103.94), swapRB=True, crop=False)
        net.setInput(blob)
        scores, geometry = net.forward(["feature_fusion/Conv_7/Sigmoid", "feature_fusion/concat_3"])
        score_thresh = float(os.getenv("AI_EAST_SCORE", "0.5"))
        rects, confidences = _decode_east(scores, geometry, score_thresh=score_thresh)

        # NMS and rescale boxes
        nms_thresh = float(os.getenv("AI_EAST_NMS", "0.3"))
        if len(rects) == 0:
            return []
        # OpenCV NMS requires boxes as [x, y, w, h]
        indices = cv2.dnn.NMSBoxes(rects, confidences, score_thresh, nms_thresh)

        boxes: List[Tuple[int, int, int, int]] = []
        scale_w = w / float(target_w)
        scale_h = h / float(target_h)
        if hasattr(indices, "flatten"):
            idx_list = indices.flatten().tolist()
        else:
            idx_list = indices
        for idx in idx_list:
            x, y, ww, hh = rects[idx]
            x = max(0, int(x * scale_w))
            y = max(0, int(y * scale_h))
            ww = int(ww * scale_w)
            hh = int(hh * scale_h)
            if ww <= 1 or hh <= 1:
                continue
            # Clip
            ww = min(ww, w - x)
            hh = min(hh, h - y)
            boxes.append((x, y, ww, hh))
        return boxes
    except Exception:
        return []


__all__ = [
    "enhance_image_bgr",
    "detect_text_boxes",
]

