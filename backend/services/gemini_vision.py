"""Gemini Multimodal Vision Service for Civic Incident Image Analysis."""
import os
import re
import json
import base64
import logging
import urllib.request
import urllib.error
from pathlib import Path
from typing import Dict, Any, Optional

logger = logging.getLogger("civicflow.gemini")

# Resolve API Key
def get_gemini_api_key() -> str:
    key = os.getenv("GEMINI_API_KEY")
    if not key:
        # Check .env file
        env_path = Path(__file__).resolve().parent.parent.parent / ".env"
        if env_path.exists():
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    if line.startswith("GEMINI_API_KEY="):
                        key = line.strip().split("=", 1)[1].strip().strip('"').strip("'")
                        break
    return key or "AQ.Ab8RN6J2F7aAVMvz0SwFgtaTzH565CA5dlp19BgIJ3HwCRSzOQ"

GEMINI_MODELS = ["models/gemini-flash-latest", "models/gemini-3.6-flash"]

VISION_SYSTEM_PROMPT = """
You are an expert civic municipal engineer and incident intelligence inspector.
Analyze the provided municipal grievance or civic infrastructure incident photograph.

Extract and determine the following fields accurately:
1. "title": A concise, clear title (e.g., "Deep Pothole with Road Subsidence", "Overflowing Stagnant Sewage onto Pedestrian Walkway", "Dangling Broken Streetlight Wire Hazard", "Uncollected Solid Waste Dump Blocking Road").
2. "description": A detailed, objective paragraph describing exactly what is visible in the photo, the extent of damage, environmental impact, and public inconvenience.
3. "department": Must be exactly one of: ["Roads", "Water", "Sewage", "Electrical", "Sanitation", "Traffic", "Public Safety"].
4. "issue_type": Specific issue (e.g., "Pothole", "Road Damage", "Sewage Overflow", "Water Leakage", "Garbage Dump", "Broken Streetlight", "Traffic Signal Failure", "Open Manhole", "Fallen Tree", "Hazardous Cable").
5. "severity": One of ["Critical", "High", "Medium", "Low"].
6. "priority_score": Integer between 20 and 95 evaluating risk to pedestrians, vehicular traffic, or public health.
7. "priority_reasons": Array of 2-4 explainable justifications for this urgency level (e.g. "Direct risk of vehicular accidents or tire rupture", "Exposed biohazard from overflowing wastewater", "Obstruction of public pedestrian pathway").
8. "visual_hazards": Array of visible hazards (e.g. ["Deep road cavity", "Accumulated stagnant water", "Uncollected rotting refuse"]).
9. "landmark_hints": Visible landmarks, road signs, or locality markers if present (or null).

Return strictly a JSON object matching this structure.
"""

def extract_image_bytes(image_input: str) -> tuple[str, str]:
    """
    Extracts mime_type and base64 string from data URL, URL, or raw base64.
    Returns (mime_type, base64_str).
    """
    if image_input.startswith("data:"):
        # Format: data:image/jpeg;base64,...
        parts = image_input.split(";base64,")
        mime_type = parts[0].replace("data:", "")
        b64_data = parts[1]
        return mime_type, b64_data

    if image_input.startswith("http://") or image_input.startswith("https://"):
        req = urllib.request.Request(
            image_input,
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
        )
        with urllib.request.urlopen(req, timeout=12) as resp:
            raw_bytes = resp.read()
            content_type = resp.headers.get("Content-Type", "image/jpeg").split(";")[0]
            return content_type, base64.b64encode(raw_bytes).decode("utf-8")

    # Raw base64 string
    mime_type = "image/jpeg"
    if image_input.startswith("iVBORw0KGgo"):
        mime_type = "image/png"
    elif image_input.startswith("R0lGOD"):
        mime_type = "image/gif"
    elif image_input.startswith("UklGR"):
        mime_type = "image/webp"

    return mime_type, image_input


def analyze_civic_image(image_input: str, citizen_hint: Optional[str] = None) -> Dict[str, Any]:
    """
    Sends the civic incident image to Gemini 3.6 Flash Multimodal Vision API.
    Returns structured analysis with predicted department, issue type, title, description, and priority.
    """
    api_key = get_gemini_api_key()
    if not api_key:
        logger.warning("No Gemini API Key available. Returning fallback.")
        return _get_fallback_analysis(citizen_hint)

    try:
        mime_type, b64_data = extract_image_bytes(image_input)

        prompt_text = VISION_SYSTEM_PROMPT
        if citizen_hint and citizen_hint.strip():
            prompt_text += f"\nCitizen provided this additional context: \"{citizen_hint.strip()}\""

        payload = {
            "contents": [{
                "parts": [
                    {"text": prompt_text},
                    {
                        "inlineData": {
                            "mimeType": mime_type,
                            "data": b64_data
                        }
                    }
                ]
            }],
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": 0.2
            }
        }

        last_err = None
        for model in GEMINI_MODELS:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/{model}:generateContent?key={api_key}"
                req = urllib.request.Request(
                    url,
                    data=json.dumps(payload).encode("utf-8"),
                    headers={"Content-Type": "application/json"}
                )

                with urllib.request.urlopen(req, timeout=15) as resp:
                    if resp.status == 200:
                        data = json.loads(resp.read().decode("utf-8"))
                        candidates = data.get("candidates", [])
                        if candidates:
                            part_text = candidates[0]["content"]["parts"][0]["text"]
                            analysis = json.loads(part_text)

                            # Ensure canonical departments
                            valid_depts = ["Roads", "Water", "Sewage", "Electrical", "Sanitation", "Traffic", "Public Safety"]
                            dept = analysis.get("department", "Roads")
                            matched_dept = next((d for d in valid_depts if d.lower() == dept.lower()), "Roads")
                            analysis["department"] = matched_dept

                            # Normalize priority score
                            score = analysis.get("priority_score", 70)
                            if not isinstance(score, (int, float)):
                                score = 70
                            analysis["priority_score"] = int(max(10, min(100, score)))

                            analysis["ai_engine"] = f"Gemini Multimodal Vision ({model.split('/')[-1]})"
                            logger.info(f"Gemini Vision successfully analyzed image using {model}: {analysis.get('title')} -> {matched_dept}")
                            return analysis
            except Exception as ex:
                last_err = ex
                logger.warning(f"Failed with {model}: {ex}")
                continue

        if last_err:
            raise last_err
        return _get_fallback_analysis(citizen_hint)

    except Exception as e:
        logger.error(f"Gemini Vision API analysis error: {e}")
        return _get_fallback_analysis(citizen_hint, error=str(e))


def _get_fallback_analysis(citizen_hint: Optional[str] = None, error: Optional[str] = None) -> Dict[str, Any]:
    """Reliable fallback if API call cannot be completed."""
    title = citizen_hint or "Civic Incident Reported via Photo"
    return {
        "title": title[:50],
        "description": f"Civic incident evidence captured via photo. {citizen_hint or 'Automated ingestion awaiting verification.'}",
        "department": "Roads",
        "issue_type": "Road Damage / Obstruction",
        "severity": "Medium",
        "priority_score": 65,
        "priority_reasons": [
            "Visual evidence submitted by citizen",
            "Pending automated field crew dispatch review"
        ],
        "visual_hazards": ["Visual inspection required"],
        "landmark_hints": None,
        "ai_engine": "CivicFlow Fallback Rule Engine",
        "error_detail": error
    }
