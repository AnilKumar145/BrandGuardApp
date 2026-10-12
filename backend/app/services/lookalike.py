import re
from typing import Tuple, List, Dict

# Character substitution map (leetspeak & homoglyphs)
HOMOGLYPH_MAP: Dict[str, List[str]] = {
    'i': ['1', 'l', '!', '|', 'ı', 'í', 'ì', 'î', 'ï'],
    'l': ['1', 'i', '|', 'I'],
    'o': ['0', 'O', 'ö', 'ó', 'ò', 'ô', 'ø'],
    'e': ['3', '€', 'é', 'è', 'ê', 'ë'],
    'a': ['4', '@', 'ä', 'á', 'à', 'â'],
    's': ['5', '$', 'z', '§'],
    't': ['7', '+', '†'],
    'b': ['8', '6', 'ß'],
    'g': ['9', 'q'],
    'w': ['vv', 'v/'],
    'm': ['rn', 'nn'],
}

# High-risk scam / phishing intent keywords
SUSPICIOUS_AFFIXES: List[str] = [
    'support', 'help', 'desk', 'official', 'service', 'care', 'center',
    'direct', 'security', 'refund', 'claims', 'team', 'hub', 'verify',
    'vip', 'club', 'clearance', 'outlet', 'exclusive', 'store', 'shop'
]

def generate_lookalike_variants(brand_name: str) -> List[str]:
    """Generates synthetic look-alike names for proactive monitoring queries."""
    variants = set()
    base = brand_name.lower()
    variants.add(base)

    # 1. Homoglyph / leet substitutions
    for char, subs in HOMOGLYPH_MAP.items():
        if char in base:
            for sub in subs[:3]:
                variants.add(base.replace(char, sub))

    # 2. Affixes
    for affix in ['support', 'help', 'official', 'outlet']:
        variants.add(f"{base} {affix}")
        variants.add(f"{base}-{affix}")
        variants.add(f"{base}_{affix}")
        variants.add(f"{affix} {base}")

    return list(variants)

def evaluate_lookalike(brand_name: str, candidate_text: str) -> Tuple[float, List[str]]:
    """
    Evaluates whether candidate_text contains look-alike patterns targeting brand_name.
    Returns: (bonus_points [0-20], list of detected evidence strings)
    """
    evidence: List[str] = []
    bonus = 0.0

    b_clean = brand_name.lower().strip()
    c_clean = candidate_text.lower().strip()

    # Exact equality isn't look-alike (it's either official or full replica)
    if b_clean == c_clean:
        return 0.0, evidence

    # Check for homoglyph / leetspeak character swap
    # E.g. "n1ke" vs "nike"
    for char, subs in HOMOGLYPH_MAP.items():
        if char in b_clean:
            for sub in subs:
                variant = b_clean.replace(char, sub)
                if variant in c_clean and variant != b_clean:
                    bonus += 14.0
                    evidence.append(
                        f"Character substitution detected: '{sub}' replacing '{char}' targeting brand token '{brand_name}'"
                    )
                    break

    # Check for high-risk affixes targeting the brand
    # E.g. "Nike-Help", "Nike Support Direct", "Nike Official Store"
    for affix in SUSPICIOUS_AFFIXES:
        pattern = rf"(^|[_\s\-\.]){b_clean}[_\s\-\.]{affix}($|[_\s\-\.])"
        if re.search(pattern, c_clean) or f"{b_clean}{affix}" in c_clean or f"{b_clean}-{affix}" in c_clean:
            bonus += 6.0
            evidence.append(
                f"High-risk impersonation affix pattern detected: '{brand_name}' combined with '{affix}'"
            )
            break

    # Punctuation / hyphen injection
    if f"{b_clean}-" in c_clean or f"-{b_clean}" in c_clean:
        bonus += 3.0
        evidence.append("Hyphenated look-alike boundary detected in title/handle")

    # Cap bonus at 20.0 pts
    bonus = min(20.0, bonus)
    return bonus, evidence
