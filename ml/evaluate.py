import os
import json
from ml.train import train_and_evaluate, METRICS_PATH

def evaluate_models():
    """Evaluate and output the performance metrics."""
    metrics = train_and_evaluate()
    print("\n--- MODEL EVALUATION SUMMARY ---")
    print(json.dumps(metrics, indent=2))
    return metrics

if __name__ == "__main__":
    evaluate_models()
