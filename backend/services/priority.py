"""Explainable Priority Scoring Engine (Member 4 ownership).
Calculates transparent 100-point operational priority score with human-readable reasons.
"""
from typing import Dict, List, Optional
import re

SEVERITY_KEYWORDS = {
    # High severity (30-40 pts)
    "open manhole": 40, "sparking": 38, "live wire": 40, "burst pipeline": 36,
    "sewage overflow": 36, "collapsed": 38, "fatal": 40, "crater": 32, "flooding": 35,
    "fire hazard": 40, "gas leak": 40, "falling tree": 36, "contaminated water": 37,
    # Medium severity (15-28 pts)
    "pothole": 25, "garbage dump": 24, "power outage": 26, "traffic jam": 20,
    "signal broken": 25, "no water": 28, "blocked drain": 25, "street light": 18,
    "dead animal": 22, "damaged road": 22
}

PUBLIC_IMPACT_KEYWORDS = [
    "school", "hospital", "market", "main road", "highway", "bus stop",
    "metro station", "railway station", "pedestrian", "residential area",
    "public park", "junction", "intersection", "temple", "clinic", "college"
]

def calculate_priority(
    text: str,
    issue_type: str,
    duration_text: Optional[str] = None,
    locality: Optional[str] = None
) -> Dict:
    """
    Contract for Member 4:
    Input: text (str), issue_type (str), duration_text (str|None), locality (str|None)
    Output: {
        "priority_score": 82,
        "priority_level": "High",
        "priority_reasons": [
            "Safety-related infrastructure issue",
            "Reported duration exceeds 48 hours",
            "Public location detected"
        ]
    }
    """
    text_lower = (text or "").lower()
    issue_lower = (issue_type or "").lower()
    reasons: List[str] = []

    # 1. Severity Score (0 - 40)
    severity_score = 15  # baseline
    matched_severity = False
    for kw, pts in SEVERITY_KEYWORDS.items():
        if kw in text_lower or kw in issue_lower:
            severity_score = max(severity_score, pts)
            matched_severity = True

    if severity_score >= 35:
        reasons.append("Critical hazard or high-severity public infrastructure failure")
    elif severity_score >= 25:
        reasons.append("Moderate infrastructure disruption requiring department intervention")

    # 2. Duration Score (0 - 20)
    duration_score = 5
    if duration_text:
        d_lower = duration_text.lower()
        if any(w in d_lower for w in ["week", "month", "5 days", "6 days", "7 days", "several days"]):
            duration_score = 20
            reasons.append(f"Prolonged unresolved duration reported: '{duration_text}'")
        elif any(w in d_lower for w in ["2 days", "3 days", "4 days", "48 hours", "72 hours"]):
            duration_score = 15
            reasons.append(f"Reported duration exceeds 48 hours: '{duration_text}'")
        elif any(w in d_lower for w in ["1 day", "24 hours", "yesterday", "since morning"]):
            duration_score = 10
            reasons.append(f"Active unresolved issue reported: '{duration_text}'")
    else:
        # Check text for duration clues if duration_text wasn't explicitly isolated
        if re.search(r'\b(?:3|4|5|6|7|\d{2,})\s*days?\b', text_lower):
            duration_score = 15
            reasons.append("Multi-day persistent incident detected in report text")

    # 3. Public Impact Score (0 - 20)
    impact_score = 5
    matched_impacts = [kw for kw in PUBLIC_IMPACT_KEYWORDS if kw in text_lower]
    if matched_impacts:
        impact_score = 20
        reasons.append(f"High footfall/sensitive public zone impacted: {', '.join(matched_impacts[:2])}")
    elif locality:
        impact_score = 12
        reasons.append(f"Identified locality impact: {locality}")

    # 4. Safety Risk Score (0 - 20)
    safety_score = 5
    safety_cues = ["danger", "accident", "child", "children", "women", "night", "injury", "sick", "dark", "hazard", "fatal"]
    found_safety = [cue for cue in safety_cues if cue in text_lower]
    if found_safety:
        safety_score = 20
        reasons.append(f"Direct safety hazard flagged: {', '.join(found_safety[:2])}")
    elif "wire" in text_lower or "manhole" in text_lower or "spark" in text_lower:
        safety_score = 18
        reasons.append("High risk of physical injury or electrocution")

    # Calculate Total
    total_score = severity_score + duration_score + impact_score + safety_score
    total_score = max(0, min(100, total_score))

    # Priority Level Mapping
    if total_score >= 61:
        priority_level = "High"
    elif total_score >= 31:
        priority_level = "Medium"
    else:
        priority_level = "Low"

    if not reasons:
        reasons.append("Standard priority calculation based on routine maintenance baseline")

    return {
        "priority_score": int(total_score),
        "priority_level": priority_level,
        "priority_reasons": reasons
    }
