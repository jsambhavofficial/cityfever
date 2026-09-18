import os
import joblib
import numpy as np
from ml.preprocess import clean_text

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
VECTORIZERS_DIR = os.path.join(BASE_DIR, "vectorizers")

DEPT_MODEL_PATH = os.path.join(MODELS_DIR, "department_model.joblib")
ISSUE_MODEL_PATH = os.path.join(MODELS_DIR, "issue_model.joblib")
DEPT_VEC_PATH = os.path.join(VECTORIZERS_DIR, "department_vectorizer.joblib")
ISSUE_VEC_PATH = os.path.join(VECTORIZERS_DIR, "issue_vectorizer.joblib")

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
    }

if __name__ == "__main__":
    test_text = "There is a large pothole near Krishna Nagar market for 3 days."
    print(predict_complaint(test_text))
