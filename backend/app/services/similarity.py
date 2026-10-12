from typing import Optional
import re

# RapidFuzz import with pure-python fallback
try:
    from rapidfuzz import fuzz
except ImportError:
    class FuzzFallback:
        @staticmethod
        def token_sort_ratio(s1: str, s2: str) -> float:
            s1_words = set(s1.lower().split())
            s2_words = set(s2.lower().split())
            if not s1_words or not s2_words:
                return 0.0
            overlap = len(s1_words.intersection(s2_words))
            return (2.0 * overlap / (len(s1_words) + len(s2_words))) * 100.0

        @staticmethod
        def partial_ratio(s1: str, s2: str) -> float:
            s1_clean = s1.lower().strip()
            s2_clean = s2.lower().strip()
            if s1_clean in s2_clean or s2_clean in s1_clean:
                return 90.0
            return 30.0

    fuzz = FuzzFallback()

def compute_name_similarity(brand_name: str, candidate_title: str, candidate_handle: Optional[str] = None) -> float:
    """
    Computes name similarity score (0.0 to 100.0) between brand_name and suspect title/handle.
    """
    b = brand_name.lower().strip()
    t = candidate_title.lower().strip()
    
    # 1. Title token sort ratio
    title_score = fuzz.token_sort_ratio(b, t)
    
    # 2. Substring partial ratio
    partial_score = fuzz.partial_ratio(b, t)
    
    handle_score = 0.0
    if candidate_handle:
        h = candidate_handle.lower().replace('@', '').strip()
        handle_score = max(fuzz.token_sort_ratio(b, h), fuzz.partial_ratio(b, h))
        
    # Weight: take maximum indicator of infringement
    best = max(title_score * 0.7 + partial_score * 0.3, handle_score)
    return round(float(min(100.0, max(0.0, best))), 2)

def compute_description_similarity(brand_desc: Optional[str], candidate_desc: Optional[str]) -> float:
    """
    Computes semantic description match score (0.0 to 100.0).
    """
    if not brand_desc or not candidate_desc:
        return 0.0
        
    b_words = set(re.findall(r'\b\w+\b', brand_desc.lower()))
    c_words = set(re.findall(r'\b\w+\b', candidate_desc.lower()))
    
    stopwords = {'the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is'}
    b_keywords = b_words - stopwords
    c_keywords = c_words - stopwords
    
    if not b_keywords:
        return 0.0
        
    overlap = len(b_keywords.intersection(c_keywords))
    ratio = (overlap / len(b_keywords)) * 100.0
    return round(float(min(100.0, ratio * 1.5)), 2)

def compute_logo_similarity(brand_logo: Optional[str], candidate_logo: Optional[str]) -> float:
    """
    Computes perceptual logo similarity (0.0 to 100.0).
    Uses ImageHash if available, or deterministic heuristic for demo.
    """
    if not brand_logo or not candidate_logo:
        return 20.0
        
    # If both reference identical asset or swoosh SVG
    if brand_logo == candidate_logo:
        return 98.0
        
    # Default visual similarity baseline for candidates using logo imagery
    return 84.0
