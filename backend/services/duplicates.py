"""Duplicate Detection Service for CivicFlow (Member 4 ownership).
Combines TF-IDF text similarity and Haversine spatial proximity.
"""
import math
import uuid
from typing import List, Dict, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from ml.preprocess import clean_text

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great circle distance between two points in meters."""
    R = 6371000  # Radius of Earth in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2))
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def find_similar_complaints(
    complaint_text: str,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    existing_complaints: Optional[List[dict]] = None,
    text_threshold: float = 0.60,
    distance_threshold_meters: float = 400.0
) -> Dict:
    """
    Contract for Member 4:
    Input: complaint_text (str), latitude (float|None), longitude (float|None), existing_complaints (list)
    Output: {
        "is_duplicate": true,
        "duplicate_cluster_id": "CL-017",
        "similarity": 0.86,
        "matched_complaint_ids": ["C1008", "C1012"]
    }
    """
    if not existing_complaints or len(existing_complaints) == 0:
        return {
            "is_duplicate": False,
            "duplicate_cluster_id": None,
            "similarity": 0.0,
            "matched_complaint_ids": []
        }

    target_cleaned = clean_text(complaint_text)
    if not target_cleaned:
        return {
            "is_duplicate": False,
            "duplicate_cluster_id": None,
            "similarity": 0.0,
            "matched_complaint_ids": []
        }

    existing_texts = [clean_text(c.get("complaint_text", "")) for c in existing_complaints]
    all_corpus = [target_cleaned] + existing_texts

    try:
        vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=1)
        tfidf_matrix = vectorizer.fit_transform(all_corpus)
        # Compare target (row 0) with all existing (rows 1..N)
        sim_scores = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])[0]
    except Exception:
        sim_scores = [0.0] * len(existing_complaints)

    matched_ids: List[str] = []
    best_similarity = 0.0
    existing_cluster_id = None

    for idx, comp in enumerate(existing_complaints):
        score = float(sim_scores[idx])
        c_lat = comp.get("latitude")
        c_lon = comp.get("longitude")
        c_id = comp.get("id")
        c_cluster = comp.get("duplicate_cluster_id")

        is_match = False

        # Spatial + Text combination
        if latitude is not None and longitude is not None and c_lat is not None and c_lon is not None:
            dist = haversine_distance(latitude, longitude, c_lat, c_lon)
            if dist <= 100.0 and score >= 0.20:
                is_match = True
            elif dist <= distance_threshold_meters and score >= 0.35:
                is_match = True
            elif score >= 0.70 and dist <= 1500.0:
                is_match = True
        else:
            # Pure text matching
            if score >= text_threshold:
                is_match = True

        if is_match:
            matched_ids.append(c_id)
            if score > best_similarity:
                best_similarity = score
            if c_cluster and not existing_cluster_id:
                existing_cluster_id = c_cluster

    if matched_ids:
        cluster_id = existing_cluster_id if existing_cluster_id else f"CL-{str(uuid.uuid4())[:4].upper()}"
        return {
            "is_duplicate": True,
            "duplicate_cluster_id": cluster_id,
            "similarity": round(best_similarity, 2),
            "matched_complaint_ids": matched_ids
        }
    else:
        return {
            "is_duplicate": False,
            "duplicate_cluster_id": None,
            "similarity": 0.0,
            "matched_complaint_ids": []
        }
