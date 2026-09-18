import re
import string

CONTRACTIONS = {
    "can't": "cannot",
    "won't": "will not",
    "n't": " not",
    "'re": " are",
    "'s": " is",
    "'d": " would",
    "'ll": " will",
    "'t": " not",
    "'ve": " have",
    "'m": " am",
}

def expand_contractions(text: str) -> str:
    for pattern, replacement in CONTRACTIONS.items():
        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
    return text

def clean_text(text: str) -> str:
    """
    Standard text cleaner used consistently across training and inference.
    1. Lowers case
    2. Expands common contractions
    3. Removes excess punctuation while keeping alphanumeric and spaces
    4. Normalizes whitespace
    """
    if not text or not isinstance(text, str):
        return ""
    
    # Lowercase
    cleaned = text.lower().strip()
    
    # Expand contractions
    cleaned = expand_contractions(cleaned)
    
    # Replace non-alphanumeric chars (excluding standard spaces and hyphens)
    cleaned = re.sub(r'[^a-zA-Z0-9\s\-]', ' ', cleaned)
    
    # Remove multiple spaces/newlines
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    
    return cleaned
