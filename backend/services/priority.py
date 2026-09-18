"""Explainable Priority Scoring Engine (Member 4 ownership).
Calculates transparent 100-point operational priority score with human-readable reasons.
"""
from typing import Dict, List, Optional
import re

<<<<<<< HEAD
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
=======
CONTRACT (do not change):
    score(department: str, issue_type: str, duration_text: str | None,
          text: str) -> {
        "priority_score": int,          # 0-100
        "priority_level": str,          # "Low" | "Medium" | "High"
        "priority_reasons": list[str],  # human-readable justifications
>>>>>>> 0e81bec07a07e2b04ceaa29f2c8efbc173f2a19d
    }
    """
    text_lower = (text or "").lower()
    issue_lower = (issue_type or "").lower()
    reasons: List[str] = []

<<<<<<< HEAD
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
=======
Placeholder implementation: a transparent, rule-based 100-point score
matching the breakdown in Member 4's instructions
(Severity 0-40, Duration 0-20, Public impact 0-20, Safety risk 0-20), with a
plain-English reason recorded for each sub-score that contributed. Replace
the body with Member 4's real logic — keep the same signature and keep
priority_level derived with the same thresholds (0-30 Low, 31-60 Medium,
61-100 High) per docs/API_CONTRACT.md.
"""

_HIGH_SEVERITY_DEPARTMENTS = {"Public Safety", "Electrical", "Drainage"}
_SAFETY_KEYWORDS = ["accident", "unsafe", "exposed wire", "collapse", "fire"]
_PUBLIC_IMPACT_DEPARTMENTS = {"Water", "Sanitation", "Drainage", "Roads"}


def score(department: str, issue_type: str, duration_text: str | None, text: str) -> dict:
    lowered = text.lower()
    reasons = []

    if department in _HIGH_SEVERITY_DEPARTMENTS:
        severity = 30
        reasons.append(f"High-severity department: {department}")
    else:
        severity = 18
        reasons.append(f"Standard-severity issue type: {issue_type}")

    duration_score = 0
    if duration_text:
        lowered_duration = duration_text.lower()
        if "month" in lowered_duration:
            duration_score = 20
        elif "week" in lowered_duration:
            duration_score = 14
        elif "day" in lowered_duration:
            duration_score = 8
        if duration_score:
            reasons.append(f"Reported duration: {duration_text}")

    if department in _PUBLIC_IMPACT_DEPARTMENTS:
        public_impact = 15
        reasons.append(f"Public-facing infrastructure department: {department}")
    else:
        public_impact = 8

    safety_hit = next((kw for kw in _SAFETY_KEYWORDS if kw in lowered), None)
    if safety_hit:
        safety_risk = 20
        reasons.append(f"Safety risk keyword detected: '{safety_hit}'")
    else:
        safety_risk = 5

    total = min(severity + duration_score + public_impact + safety_risk, 100)

    if total <= 30:
        level = "Low"
    elif total <= 60:
        level = "Medium"
>>>>>>> 0e81bec07a07e2b04ceaa29f2c8efbc173f2a19d
    else:
        # Check text for duration clues if duration_text wasn't explicitly isolated
        if re.search(r'\b(?:3|4|5|6|7|\d{2,})\s*days?\b', text_lower):
            duration_score = 15
            reasons.append("Multi-day persistent incident detected in report text")

<<<<<<< HEAD
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
=======
    return {
        "priority_score": total,
        "priority_level": level,
        "priority_reasons": reasons,
>>>>>>> 0e81bec07a07e2b04ceaa29f2c8efbc173f2a19d
    }
