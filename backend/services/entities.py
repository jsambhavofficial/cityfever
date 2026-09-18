"""Entity Extraction Service for CivicFlow (Member 4 ownership).
Extracts locality and duration from complaint text.
"""
import re
from typing import Dict, Optional

# Predefined common locality keywords and markers
PREPOSITION_PATTERNS = [
    r'(?:in|at|near|around|opposite|opp|behind|beside|across|close to|next to|outside)\s+([A-Z0-9][A-Za-z0-9\s\.\-]{2,30}?(?:Nagar|Colony|Enclave|Vihar|Sector\s*\d+|Block\s*[A-Za-z0-9]+|Road|Street|Avenue|Market|Gate\s*\d+|Chowk|Crossing|Flyover|Circle|Junction|Phase\s*\d+|Apartment|Society|Layout|Bagh|Ganj|Puram|Pur))',
    r'(?:in|at|near|around|opposite|opp|behind|beside|across|close to|next to|outside)\s+([A-Z0-9][A-Za-z0-9\s\.\-]{2,25})',
]

# Duration patterns
DURATION_PATTERNS = [
    r'(\b\d+\s*(?:days?|hours?|hrs?|weeks?|months?|minutes?|mins?)\b)',
    r'(\bfor\s+(?:the\s+)?(?:past|last)?\s*\d+\s*(?:days?|hours?|weeks?|months?)\b)',
    r'(\bfor\s+(?:three|four|five|two|one|several|a\s+few)\s+(?:days?|weeks?|hours?|months?)\b)',
    r'(\bsince\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|yesterday|morning|last\s+week|last\s+month|\d+\s+[a-zA-Z]+)\b)',
    r'(\bfrom\s+(?:the\s+)?(?:past|last)\s*\d+\s*(?:days?|hours?|weeks?)\b)',
    r'(\bpast\s*\d+\s*(?:days?|hours?|weeks?)\b)',
    r'(\blast\s*\d+\s*(?:days?|hours?|weeks?)\b)'
]

COMMON_LANDMARKS = [
    "Krishna Nagar", "Civil Lines", "Sector 62", "MG Road", "Connaught Place",
    "Indiranagar", "Koramangala", "HSR Layout", "Salt Lake", "Jubilee Hills",
    "Bandra West", "Andheri East", "Lajpat Nagar", "Karol Bagh", "Dwarka Sector 10",
    "Rohini Sector 15", "Janakpuri", "Vasant Kunj", "Saket", "Noida Sector 18",
    "DLF Phase 3", "Cyber City", "Powai", "BTM Layout", "Whitefield"
]

def extract_duration(text: str) -> Optional[str]:
    """Extracts reported duration or timeframe from text."""
    if not text:
        return None
    for pattern in DURATION_PATTERNS:
        match = re.search(pattern, text, flags=re.IGNORECASE)
        if match:
            return match.group(1).strip()
    return None

def extract_locality(text: str, hint: Optional[str] = None) -> Optional[str]:
    """Extracts locality or landmark from text, with fallback to manual hint."""
    if hint and hint.strip():
        return hint.strip()
    if not text:
        return None

    # Check for known landmarks first
    for landmark in COMMON_LANDMARKS:
        if re.search(r'\b' + re.escape(landmark) + r'\b', text, flags=re.IGNORECASE):
            return landmark

    # Check regex patterns
    for pattern in PREPOSITION_PATTERNS:
        match = re.search(pattern, text, flags=re.IGNORECASE)
        if match:
            loc = match.group(1).strip()
            # Filter out false positive verbs or short fragments
            if len(loc) >= 3 and loc.lower() not in ["the", "this", "that", "there", "my", "our", "a", "an"]:
                return loc.title()

    return None

def extract_entities(text: str, hint: Optional[str] = None) -> Dict[str, Optional[str]]:
    """
    Contract for Member 4:
    Input: text (str), hint (optional str)
    Output: {
        "locality": "Krishna Nagar",
        "duration_text": "3 days"
    }
    """
    return {
        "locality": extract_locality(text, hint),
        "duration_text": extract_duration(text)
    }
