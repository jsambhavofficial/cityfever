import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score
from ml.preprocess import clean_text

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)
MODELS_DIR = os.path.join(BASE_DIR, "models")
VECTORIZERS_DIR = os.path.join(BASE_DIR, "vectorizers")
METRICS_PATH = os.path.join(BASE_DIR, "metrics.json")
TRAIN_CSV = os.path.join(ROOT_DIR, "data", "generated", "civicflow_train.csv")
TEST_CSV = os.path.join(ROOT_DIR, "data", "generated", "civicflow_test.csv")

def train_and_evaluate():
    os.makedirs(MODELS_DIR, exist_ok=True)
    os.makedirs(VECTORIZERS_DIR, exist_ok=True)

    if not (os.path.exists(TRAIN_CSV) and os.path.exists(TEST_CSV)):
        from data.generated.generate_dataset import generate_dataset
        generate_dataset()

    train_df = pd.read_csv(TRAIN_CSV)
    test_df = pd.read_csv(TEST_CSV)

    train_texts = [clean_text(t) for t in train_df["complaint_text"]]
    test_texts = [clean_text(t) for t in test_df["complaint_text"]]

    # 1. Department Model
    dept_vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=1, sublinear_tf=True)
    X_train_dept = dept_vectorizer.fit_transform(train_texts)
    X_test_dept = dept_vectorizer.transform(test_texts)

    dept_model = LogisticRegression(C=2.0, max_iter=500)
    dept_model.fit(X_train_dept, train_df["department"])

    dept_preds = dept_model.predict(X_test_dept)
    dept_acc = float(accuracy_score(test_df["department"], dept_preds))
    dept_f1 = float(f1_score(test_df["department"], dept_preds, average="weighted", zero_division=0))

    # 2. Issue Type Model
    issue_vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=1, sublinear_tf=True)
    X_train_issue = issue_vectorizer.fit_transform(train_texts)
    X_test_issue = issue_vectorizer.transform(test_texts)

    issue_model = LogisticRegression(C=2.0, max_iter=500)
    issue_model.fit(X_train_issue, train_df["issue_type"])

    issue_preds = issue_model.predict(X_test_issue)
    issue_acc = float(accuracy_score(test_df["issue_type"], issue_preds))
    issue_f1 = float(f1_score(test_df["issue_type"], issue_preds, average="weighted", zero_division=0))

    # Save to disk
    joblib.dump(dept_model, os.path.join(MODELS_DIR, "department_model.joblib"))
    joblib.dump(issue_model, os.path.join(MODELS_DIR, "issue_model.joblib"))
    joblib.dump(dept_vectorizer, os.path.join(VECTORIZERS_DIR, "department_vectorizer.joblib"))
    joblib.dump(issue_vectorizer, os.path.join(VECTORIZERS_DIR, "issue_vectorizer.joblib"))

    metrics = {
        "model_architecture": "TF-IDF (1,2 n-grams) + LogisticRegression",
        "training_samples": len(train_df),
        "test_samples": len(test_df),
        "department_accuracy": round(dept_acc, 4),
        "department_f1_weighted": round(dept_f1, 4),
        "issue_type_accuracy": round(issue_acc, 4),
        "issue_type_f1_weighted": round(issue_f1, 4),
        "confidence_mechanism": "Softmax probability distribution via predict_proba",
        "canonical_departments": sorted(list(train_df["department"].unique()))
    }

    with open(METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=2)

    print("ML Training completed successfully.")
    print(f"Department Accuracy: {dept_acc:.2%}, Issue Accuracy: {issue_acc:.2%}")
    return metrics

if __name__ == "__main__":
    train_and_evaluate()
