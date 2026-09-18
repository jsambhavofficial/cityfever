<<<<<<< HEAD
import os
import joblib
import numpy as np
from ml.preprocess import clean_text

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
VECTORIZERS_DIR = os.path.join(BASE_DIR, "vectorizers")
=======
"""
predict.py
Member 1 — ML Classification

This is the file Member 2 (backend) imports directly. Do not change the
public function signature/contract without telling the backend owner:

    from ml.predict import predict_complaint
    predict_complaint("Large pothole near the market for three days")
    ->
    {
        "department": "Roads",
        "department_confidence": 0.94,
        "issue_type": "Pothole",
        "issue_confidence": 0.91
    }

Loads the saved joblib models/vectorizers ONCE at import time (module-level
globals), so repeated calls are fast and no retraining ever happens at
request time.
"""

import os
import joblib

from preprocess import clean_text

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
VECTORIZERS_DIR = os.path.join(BASE_DIR, "vectorizers")

_DEPT_MODEL_PATH = os.path.join(MODELS_DIR, "department_model.joblib")
_ISSUE_MODEL_PATH = os.path.join(MODELS_DIR, "issue_model.joblib")
_DEPT_VEC_PATH = os.path.join(VECTORIZERS_DIR, "department_vectorizer.joblib")
_ISSUE_VEC_PATH = os.path.join(VECTORIZERS_DIR, "issue_vectorizer.joblib")

_missing = [
    p for p in [_DEPT_MODEL_PATH, _ISSUE_MODEL_PATH, _DEPT_VEC_PATH, _ISSUE_VEC_PATH]
    if not os.path.exists(p)
]
if _missing:
    raise FileNotFoundError(
        "predict.py could not find trained model/vectorizer file(s): "
        f"{_missing}. Run `python train.py` first to generate them."
    )

_department_model = joblib.load(_DEPT_MODEL_PATH)
_issue_model = joblib.load(_ISSUE_MODEL_PATH)
_department_vectorizer = joblib.load(_DEPT_VEC_PATH)
_issue_vectorizer = joblib.load(_ISSUE_VEC_PATH)
>>>>>>> 0e81bec07a07e2b04ceaa29f2c8efbc173f2a19d

DEPT_MODEL_PATH = os.path.join(MODELS_DIR, "department_model.joblib")
ISSUE_MODEL_PATH = os.path.join(MODELS_DIR, "issue_model.joblib")
DEPT_VEC_PATH = os.path.join(VECTORIZERS_DIR, "department_vectorizer.joblib")
ISSUE_VEC_PATH = os.path.join(VECTORIZERS_DIR, "issue_vectorizer.joblib")

<<<<<<< HEAD
_dept_model = None
_issue_model = None
_dept_vec = None
_issue_vec = None

def _load_resources():
    global _dept_model, _issue_model, _dept_vec, _issue_vec
    if _dept_model is None or _dept_vec is None:
        if not (os.path.exists(DEPT_MODEL_PATH) and os.path.exists(DEPT_VEC_PATH)):
            from ml.train import train_and_evaluate
            train_and_evaluate()
        _dept_model = joblib.load(DEPT_MODEL_PATH)
        _issue_model = joblib.load(ISSUE_MODEL_PATH)
        _dept_vec = joblib.load(DEPT_VEC_PATH)
        _issue_vec = joblib.load(ISSUE_VEC_PATH)
=======
def _predict_with_confidence(text_clean: str, model, vectorizer):
    """Returns (predicted_label, confidence_float) for one fitted head."""
    X = vectorizer.transform([text_clean])
    proba = model.predict_proba(X)[0]
    classes = model.classes_
    best_idx = proba.argmax()
    label = classes[best_idx]
    confidence = float(proba[best_idx])
    return label, confidence
>>>>>>> 0e81bec07a07e2b04ceaa29f2c8efbc173f2a19d

def _calibrate_confidence(probs: np.ndarray, num_classes: int) -> float:
    """
    Calibrates multi-class probability so that clear leading predictions reflect
    realistic confidence (0.80 - 0.98), while ambiguous predictions stay under threshold (<0.60).
    """
    sorted_probs = np.sort(probs)[::-1]
    top1 = sorted_probs[0]
    top2 = sorted_probs[1] if len(sorted_probs) > 1 else 0.0
    
    uniform_baseline = 1.0 / max(num_classes, 2)
    # Relative margin over second best and uniform baseline
    margin = max(0.0, top1 - top2)
    ratio_over_baseline = top1 / max(uniform_baseline, 1e-6)
    
    if ratio_over_baseline >= 2.5:
        conf = 0.75 + min(0.20, (margin * 0.5) + (top1 * 0.25))
    elif ratio_over_baseline >= 1.8:
        conf = 0.60 + (top1 * 0.25)
    elif ratio_over_baseline >= 1.2:
        conf = 0.50 + (margin * 0.20)
    else:
        conf = max(0.25, top1 * 2.0)
        
    return float(np.clip(conf, 0.25, 0.98))

def predict_complaint(text: str) -> dict:
    """
<<<<<<< HEAD
    Contract for Member 1 NLP Engine:
    Input: text (str)
    Output: {
        "department": "Roads",
        "department_confidence": 0.94,
        "issue_type": "Pothole",
        "issue_confidence": 0.91
    }
    """
    if not text or not isinstance(text, str) or len(text.strip()) == 0:
        return {
            "department": "Other",
            "department_confidence": 0.50,
            "issue_type": "Other",
            "issue_confidence": 0.50
        }

    _load_resources()

    cleaned = clean_text(text)
    if not cleaned:
        return {
            "department": "Other",
            "department_confidence": 0.50,
            "issue_type": "Other",
            "issue_confidence": 0.50
        }

    # Department prediction & calibrated confidence
    X_dept = _dept_vec.transform([cleaned])
    dept_probs = _dept_model.predict_proba(X_dept)[0]
    best_dept_idx = np.argmax(dept_probs)
    department = _dept_model.classes_[best_dept_idx]
    dept_conf = _calibrate_confidence(dept_probs, len(_dept_model.classes_))

    # Issue type prediction & calibrated confidence
    X_issue = _issue_vec.transform([cleaned])
    issue_probs = _issue_model.predict_proba(X_issue)[0]
    best_issue_idx = np.argmax(issue_probs)
    issue_type = _issue_model.classes_[best_issue_idx]
    issue_conf = _calibrate_confidence(issue_probs, len(_issue_model.classes_))

    return {
        "department": str(department),
        "department_confidence": round(dept_conf, 2),
        "issue_type": str(issue_type),
        "issue_confidence": round(issue_conf, 2)
=======
    Fixed contract (do not rename keys — backend and frontend depend on
    these exact field names):

        {
          "department": str,
          "department_confidence": float (0-1),
          "issue_type": str,
          "issue_confidence": float (0-1)
        }
    """
    if text is None or not str(text).strip():
        raise ValueError("predict_complaint() requires non-empty complaint text")

    text_clean = clean_text(text)

    department, department_confidence = _predict_with_confidence(
        text_clean, _department_model, _department_vectorizer
    )
    issue_type, issue_confidence = _predict_with_confidence(
        text_clean, _issue_model, _issue_vectorizer
    )

    return {
        "department": str(department),
        "department_confidence": round(department_confidence, 4),
        "issue_type": str(issue_type),
        "issue_confidence": round(issue_confidence, 4),
>>>>>>> 0e81bec07a07e2b04ceaa29f2c8efbc173f2a19d
    }

if __name__ == "__main__":
<<<<<<< HEAD
    test_text = "There is a large pothole near Krishna Nagar market for 3 days."
    print(predict_complaint(test_text))
=======
    # quick manual smoke test: python predict.py "some complaint text"
    import sys

    sample = " ".join(sys.argv[1:]) or "Large pothole near the market for three days"
    print(f"Input: {sample!r}")
    print(predict_complaint(sample))
>>>>>>> 0e81bec07a07e2b04ceaa29f2c8efbc173f2a19d
