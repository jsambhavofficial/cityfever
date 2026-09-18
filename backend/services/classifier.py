"""Classifier Service Adapter connecting Member 1's ML engine to backend."""
import logging
import sys
import os

# Ensure root path is in sys.path
root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

logger = logging.getLogger("civicflow.classifier")

def classify_complaint(text: str) -> dict:
    """
    Calls Member 1's ML model to predict department, issue_type and confidences.
    Returns:
    {
        "department": "Roads",
        "department_confidence": 0.94,
        "issue_type": "Pothole",
        "issue_confidence": 0.91
    }
    """
    try:
        from ml.predict import predict_complaint
        return predict_complaint(text)
    except Exception as e:
        logger.warning(f"ML engine direct invocation fallback triggered: {e}")
        # Rule-based fallback if ML models are being retrained
        lower = text.lower()
        if any(w in lower for w in ["pothole", "crater", "asphalt", "tar", "flyover", "footpath", "speed breaker", "road"]):
            return {"department": "Roads", "department_confidence": 0.88, "issue_type": "Pothole" if "pothole" in lower else "Damaged Road", "issue_confidence": 0.85}
        elif any(w in lower for w in ["pipeline", "water supply", "drinking water", "tap water", "pipe burst", "tank"]):
            return {"department": "Water", "department_confidence": 0.90, "issue_type": "Water Leakage" if "leak" in lower or "burst" in lower else "No Water Supply", "issue_confidence": 0.87}
        elif any(w in lower for w in ["garbage", "trash", "debris", "dustbin", "waste", "sanitation", "dead animal", "litter"]):
            return {"department": "Sanitation", "department_confidence": 0.92, "issue_type": "Garbage Dump", "issue_confidence": 0.89}
        elif any(w in lower for w in ["street light", "wire", "transformer", "electricity", "sparking", "power outage", "pole"]):
            return {"department": "Electrical", "department_confidence": 0.91, "issue_type": "Street Light" if "light" in lower else "Open Wire / Sparking", "issue_confidence": 0.88}
        elif any(w in lower for w in ["sewage", "gutter", "drain", "manhole", "sewer", "overflow", "stench"]):
            return {"department": "Sewage", "department_confidence": 0.93, "issue_type": "Sewage Overflow" if "overflow" in lower else "Open Manhole", "issue_confidence": 0.90}
        elif any(w in lower for w in ["traffic", "jam", "signal", "parking", "bottleneck", "vehicle"]):
            return {"department": "Traffic", "department_confidence": 0.89, "issue_type": "Traffic Signal Issue" if "signal" in lower else "Traffic Congestion", "issue_confidence": 0.86}
        elif any(w in lower for w in ["park", "tree", "garden", "bench", "grass", "swing"]):
            return {"department": "Parks", "department_confidence": 0.87, "issue_type": "Tree Falling" if "tree" in lower else "Park Maintenance", "issue_confidence": 0.84}
        else:
            return {"department": "Other", "department_confidence": 0.50, "issue_type": "Other", "issue_confidence": 0.50}
