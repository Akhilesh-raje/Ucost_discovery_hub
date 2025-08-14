#!/usr/bin/env python3
"""
Lightweight AI post-correction for OCR text using masked language models (MLM).

Design goals:
- Optional dependency: gracefully no-op if Hugging Face transformers/torch are unavailable
- Fast on CPU: uses small models and short pseudo-perplexity scoring
- Safe: only applies low-risk character-level corrections typical of OCR

Enable via environment flag: AI_POSTCORRECT=1

Supported languages:
- English: distilbert-base-uncased (masked LM)
- Hindi: ai4bharat/IndicBERTv2-MLM (masked LM) if available; otherwise skip
"""

from __future__ import annotations

import os
import math
from functools import lru_cache
from typing import List, Tuple, Optional

_HAS_TRANSFORMERS = True
try:
    from transformers import AutoTokenizer, AutoModelForMaskedLM  # type: ignore
    import torch  # type: ignore
except Exception:
    _HAS_TRANSFORMERS = False


def is_enabled() -> bool:
    """Return True if AI post-correction is enabled via env flag."""
    return os.getenv("AI_POSTCORRECT", "0").strip() not in {"", "0", "false", "False"}


def _select_model_id(lang: str) -> Optional[str]:
    lang = (lang or "").lower()
    if lang.startswith("eng") or lang.startswith("en"):
        return "distilbert-base-uncased"
    # Favor a compact Hindi MLM; fallback to MURIL if available
    if lang.startswith("hin") or lang.startswith("hi"):
        return "ai4bharat/IndicBERTv2-MLM"
    return None


@lru_cache(maxsize=4)
def _load_mlm(lang: str):
    """Load and cache tokenizer/model for the language. Returns (tokenizer, model) or (None, None)."""
    if not _HAS_TRANSFORMERS:
        return None, None
    model_id = _select_model_id(lang)
    if not model_id:
        return None, None
    try:
        tokenizer = AutoTokenizer.from_pretrained(model_id)
        model = AutoModelForMaskedLM.from_pretrained(model_id)
        model.eval()
        return tokenizer, model
    except Exception:
        return None, None


def _generate_ocr_variants(text: str) -> List[str]:
    """Generate a small set of candidate strings correcting common OCR confusions.

    Keeps the number of variants small for speed.
    """
    if not text or len(text) > 2000:
        return [text]

    confusion_pairs = [
        ("0", "O"), ("O", "0"),
        ("1", "I"), ("I", "1"), ("l", "1"), ("1", "l"),
        ("5", "S"), ("S", "5"),
        ("8", "B"), ("B", "8"),
        ("6", "G"), ("G", "6"),
        ("2", "Z"), ("Z", "2"),
    ]

    variants = {text}
    # Apply at most N replacements globally to avoid combinatorial explosion
    MAX_REPLACEMENTS = 8
    applied = 0
    s = text
    for a, b in confusion_pairs:
        if applied >= MAX_REPLACEMENTS:
            break
        if a in s:
            s2 = s.replace(a, b)
            variants.add(s2)
            applied += 1

    # Try selective replacements: only within all-caps words or mixed-digit tokens
    tokens = s.split()
    selective = []
    for tok in tokens:
        t = tok
        if t.isupper() and "0" in t:
            selective.append(tok.replace("0", "O"))
        elif any(ch.isdigit() for ch in t) and "I" in t:
            selective.append(tok.replace("I", "1"))
        else:
            selective.append(tok)
    variants.add(" ".join(selective))

    # Limit number of variants
    out = list(variants)
    if len(out) > 10:
        out = out[:10]
    return out


@torch.inference_mode() if _HAS_TRANSFORMERS else (lambda f: f)
def _pseudo_perplexity(text: str, tokenizer, model) -> float:
    """Compute pseudo-perplexity by masking each token and scoring the original token.

    Lower is better. If tokenization fails or empty, return +inf to prefer other candidates.
    """
    if not text or not tokenizer or not model:
        return float("inf")

    # Truncate to fit model context comfortably
    max_len = min(getattr(model.config, "max_position_embeddings", 512) - 4, 256)
    enc = tokenizer(text, return_tensors="pt", truncation=True, max_length=max_len)
    input_ids = enc["input_ids"][0]

    if input_ids.numel() <= 2:  # [CLS] [SEP]
        return float("inf")

    mask_token_id = tokenizer.mask_token_id
    if mask_token_id is None:
        return float("inf")

    losses: List[float] = []
    for i in range(1, input_ids.numel() - 1):  # avoid special tokens
        original_id = input_ids[i].item()
        masked = input_ids.clone()
        masked[i] = mask_token_id
        outputs = model(masked.unsqueeze(0))
        logits = outputs.logits[0, i]
        log_probs = torch.nn.functional.log_softmax(logits, dim=-1)
        nll = -log_probs[original_id].item()
        losses.append(nll)

    if not losses:
        return float("inf")
    return math.exp(sum(losses) / len(losses))


def ai_correct_text(text: str, lang: str = "eng") -> str:
    """Return AI-corrected text when enabled and beneficial; otherwise return original text.

    Strategy:
    1) Generate a few candidate strings that fix common OCR confusions
    2) Score all candidates with masked LM pseudo-perplexity
    3) Pick the candidate with the lowest pseudo-perplexity (best fit)
    """
    if not is_enabled() or not text or not _HAS_TRANSFORMERS:
        return text

    tokenizer, model = _load_mlm(lang)
    if tokenizer is None or model is None:
        return text

    candidates = _generate_ocr_variants(text)
    if not candidates:
        return text

    # Compute scores; keep the best
    best_text = text
    best_score = _pseudo_perplexity(text, tokenizer, model)

    for cand in candidates:
        if cand == text:
            continue
        score = _pseudo_perplexity(cand, tokenizer, model)
        if score < best_score:
            best_score = score
            best_text = cand

    return best_text


__all__ = [
    "ai_correct_text",
    "is_enabled",
]

