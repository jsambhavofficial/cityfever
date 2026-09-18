<<<<<<< HEAD
import os
=======
"""
train.py
Member 1 — ML Classification

Trains two independent classification heads on the complaint dataset:
  1. department      (Roads / Water / Sanitation / Electrical / Sewage /
                       Traffic / Parks / Other)
  2. issue_type       (free-form label column in the dataset)

Per PRD:
  - Baseline: TF-IDF + Logistic Regression.
  - Comparison model: Linear SVM.
  - No hard-coded accuracy/F1 — metrics.json is written from the ACTUAL
    evaluation run below.
  - Preprocessing must be identical to predict.py -> both import
    preprocess.clean_text.

Usage:
    python train.py --data path/to/civicflow_complaints.csv
    python train.py                      # uses the bundled placeholder set

Expected CSV columns: complaint_text, department, issue_type
(extra columns such as id/locality/duration are ignored if present).
"""

import argparse
>>>>>>> 0e81bec07a07e2b04ceaa29f2c8efbc173f2a19d
import json
import os
import time

import joblib
import pandas as pd
<<<<<<< HEAD
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score
from ml.preprocess import clean_text
=======
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    classification_report,
)

from preprocess import clean_text

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
VECTORIZERS_DIR = os.path.join(BASE_DIR, "vectorizers")
METRICS_PATH = os.path.join(BASE_DIR, "metrics.json")
DEFAULT_DATA = os.path.join(BASE_DIR, "data", "civicflow_complaints_placeholder.csv")

# Real team dataset (data/generated/, provided 2026-09-18). Already split by
# the team's generate_dataset.py — stratified 80/20 by department, seed=42.
REAL_TRAIN = os.path.join(BASE_DIR, "data", "real", "civicflow_train.csv")
REAL_TEST = os.path.join(BASE_DIR, "data", "real", "civicflow_test.csv")

CANONICAL_DEPARTMENTS = [
    "Roads", "Water", "Sanitation", "Electrical",
    "Sewage", "Traffic", "Parks", "Other",
]
>>>>>>> 0e81bec07a07e2b04ceaa29f2c8efbc173f2a19d

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)
MODELS_DIR = os.path.join(BASE_DIR, "models")
VECTORIZERS_DIR = os.path.join(BASE_DIR, "vectorizers")
METRICS_PATH = os.path.join(BASE_DIR, "metrics.json")
TRAIN_CSV = os.path.join(ROOT_DIR, "data", "generated", "civicflow_train.csv")
TEST_CSV = os.path.join(ROOT_DIR, "data", "generated", "civicflow_test.csv")

<<<<<<< HEAD
def train_and_evaluate():
    os.makedirs(MODELS_DIR, exist_ok=True)
    os.makedirs(VECTORIZERS_DIR, exist_ok=True)
=======
def load_dataset(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    required = {"complaint_text", "department", "issue_type"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(
            f"Dataset at {path} is missing required column(s): {sorted(missing)}. "
            f"Expected at least: {sorted(required)}"
        )
    df = df.dropna(subset=["complaint_text", "department", "issue_type"]).copy()
    df["complaint_text_clean"] = df["complaint_text"].apply(clean_text)
    df = df[df["complaint_text_clean"].str.len() > 0].reset_index(drop=True)
    return df


def train_head(label_name, X_train, X_test, y_train, y_test):
    """
    Trains BOTH a Logistic Regression baseline and a Linear SVM comparison
    model for one label column (department OR issue_type). Returns the
    fitted vectorizer, the chosen production model, and a metrics dict
    containing honest numbers for both candidates.
    """
    vectorizer = TfidfVectorizer(
        max_features=5000,
        ngram_range=(1, 2),
        min_df=1,
    )
    Xtr = vectorizer.fit_transform(X_train)
    Xte = vectorizer.transform(X_test)

    # --- Baseline: Logistic Regression (kept as production model because it
    # exposes predict_proba, which the PRD contract requires for
    # department_confidence / issue_confidence) ---
    logreg = LogisticRegression(max_iter=2000)
    logreg.fit(Xtr, y_train)
    logreg_pred = logreg.predict(Xte)
    logreg_acc = accuracy_score(y_test, logreg_pred)
    logreg_p, logreg_r, logreg_f1, _ = precision_recall_fscore_support(
        y_test, logreg_pred, average="macro", zero_division=0
    )

    # --- Comparison model: Linear SVM ---
    svm = LinearSVC(max_iter=5000)
    svm.fit(Xtr, y_train)
    svm_pred = svm.predict(Xte)
    svm_acc = accuracy_score(y_test, svm_pred)
    svm_p, svm_r, svm_f1, _ = precision_recall_fscore_support(
        y_test, svm_pred, average="macro", zero_division=0
    )

    report = classification_report(y_test, logreg_pred, zero_division=0, output_dict=True)

    metrics = {
        "logistic_regression": {
            "accuracy": round(float(logreg_acc), 4),
            "precision_macro": round(float(logreg_p), 4),
            "recall_macro": round(float(logreg_r), 4),
            "f1_macro": round(float(logreg_f1), 4),
        },
        "linear_svm_comparison": {
            "accuracy": round(float(svm_acc), 4),
            "precision_macro": round(float(svm_p), 4),
            "recall_macro": round(float(svm_r), 4),
            "f1_macro": round(float(svm_f1), 4),
        },
        "per_class_report_logreg": report,
        "production_model": "logistic_regression",
        "production_model_reason": (
            "LogisticRegression is saved as the production model because it "
            "exposes calibrated predict_proba() scores, which are required "
            "by the ML contract's *_confidence fields. LinearSVC decision "
            "scores are not directly comparable probabilities."
        ),
    }

    return vectorizer, logreg, metrics
>>>>>>> 0e81bec07a07e2b04ceaa29f2c8efbc173f2a19d

    if not (os.path.exists(TRAIN_CSV) and os.path.exists(TEST_CSV)):
        from data.generated.generate_dataset import generate_dataset
        generate_dataset()

<<<<<<< HEAD
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
=======
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", default=None,
                         help="Single CSV to load and internally split "
                              "(ignored if --train/--test are used).")
    parser.add_argument("--train", default=None, help="Pre-split training CSV")
    parser.add_argument("--test", default=None, help="Pre-split test CSV")
    parser.add_argument("--test-size", type=float, default=0.2,
                         help="Only used in single-file (--data) mode.")
    parser.add_argument("--random-state", type=int, default=42)
    args = parser.parse_args()

    os.makedirs(MODELS_DIR, exist_ok=True)
    os.makedirs(VECTORIZERS_DIR, exist_ok=True)

    # Resolve data source, in priority order:
    #   1. explicit --train/--test
    #   2. explicit --data (internal random split)
    #   3. the team's real dataset (data/real/), if present, pre-split
    #   4. the synthetic placeholder set (internal random split)
    using_presplit = False
    if args.train and args.test:
        train_path, test_path = args.train, args.test
        using_presplit = True
    elif args.data:
        data_path = args.data
    elif os.path.exists(REAL_TRAIN) and os.path.exists(REAL_TEST):
        train_path, test_path = REAL_TRAIN, REAL_TEST
        using_presplit = True
    else:
        data_path = DEFAULT_DATA

    if using_presplit:
        print(f"Loading pre-split dataset:\n  train: {train_path}\n  test:  {test_path}")
        df_train = load_dataset(train_path)
        df_test = load_dataset(test_path)
        df = pd.concat([df_train, df_test], ignore_index=True)  # for label-coverage check only
        print(f"Loaded {len(df_train)} train rows, {len(df_test)} test rows.")

        X_train = df_train["complaint_text_clean"]
        ydept_train = df_train["department"]
        yissue_train = df_train["issue_type"]
        X_test = df_test["complaint_text_clean"]
        ydept_test = df_test["department"]
        yissue_test = df_test["issue_type"]
        active_data_path = train_path
    else:
        print(f"Loading dataset: {data_path}")
        df = load_dataset(data_path)
        print(f"Loaded {len(df)} usable rows after cleaning.")

        X = df["complaint_text_clean"]
        y_dept = df["department"]
        y_issue = df["issue_type"]

        X_train, X_test, ydept_train, ydept_test, yissue_train, yissue_test = train_test_split(
            X, y_dept, y_issue,
            test_size=args.test_size,
            random_state=args.random_state,
            stratify=y_dept,
        )
        active_data_path = data_path

    unseen_depts = sorted(set(df["department"].unique()) - set(CANONICAL_DEPARTMENTS))
    if unseen_depts:
        print(
            "WARNING: dataset contains department labels outside the "
            f"canonical PRD list: {unseen_depts}. Training will proceed, "
            "but downstream consumers expect only the canonical set."
        )

    print("\n--- Training department model ---")
    dept_vectorizer, dept_model, dept_metrics = train_head(
        "department", X_train, X_test, ydept_train, ydept_test
    )

    print("--- Training issue_type model ---")
    issue_vectorizer, issue_model, issue_metrics = train_head(
        "issue_type", X_train, X_test, yissue_train, yissue_test
    )

    joblib.dump(dept_model, os.path.join(MODELS_DIR, "department_model.joblib"))
    joblib.dump(issue_model, os.path.join(MODELS_DIR, "issue_model.joblib"))
    joblib.dump(dept_vectorizer, os.path.join(VECTORIZERS_DIR, "department_vectorizer.joblib"))
    joblib.dump(issue_vectorizer, os.path.join(VECTORIZERS_DIR, "issue_vectorizer.joblib"))

    metrics_out = {
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "dataset_path": os.path.abspath(active_data_path),
        "split_mode": "pre_split_train_test_files" if using_presplit else "internal_random_split",
        "dataset_rows": int(len(df)),
        "train_rows": int(len(X_train)),
        "test_rows": int(len(X_test)),
        "test_size": args.test_size if not using_presplit else round(len(X_test) / len(df), 4),
        "random_state": args.random_state,
        "department": dept_metrics,
        "issue_type": issue_metrics,
        "confidence_note": (
            "department_confidence / issue_confidence returned by "
            "predict_complaint() are the maximum class probability from "
            "LogisticRegression.predict_proba() for the respective head. "
            "This is NOT the same as accuracy — it reflects the model's "
            "own certainty on a single input at inference time."
        ),
        "is_placeholder_dataset": "placeholder" in os.path.basename(active_data_path).lower(),
    }

    with open(METRICS_PATH, "w") as f:
        json.dump(metrics_out, f, indent=2)

    print(f"\nSaved models to:       {MODELS_DIR}")
    print(f"Saved vectorizers to:  {VECTORIZERS_DIR}")
    print(f"Saved metrics to:      {METRICS_PATH}")
    print(
        f"\ndepartment: acc={dept_metrics['logistic_regression']['accuracy']} "
        f"f1_macro={dept_metrics['logistic_regression']['f1_macro']}"
    )
    print(
        f"issue_type: acc={issue_metrics['logistic_regression']['accuracy']} "
        f"f1_macro={issue_metrics['logistic_regression']['f1_macro']}"
    )
    if metrics_out["is_placeholder_dataset"]:
        print(
            "\nNOTE: trained on the PLACEHOLDER synthetic dataset. "
            "Re-run with --data <real_csv> once the team's real dataset "
            "is available, then re-run evaluate.py."
        )
>>>>>>> 0e81bec07a07e2b04ceaa29f2c8efbc173f2a19d

    print("ML Training completed successfully.")
    print(f"Department Accuracy: {dept_acc:.2%}, Issue Accuracy: {issue_acc:.2%}")
    return metrics

if __name__ == "__main__":
<<<<<<< HEAD
    train_and_evaluate()
=======
    main()
>>>>>>> 0e81bec07a07e2b04ceaa29f2c8efbc173f2a19d
