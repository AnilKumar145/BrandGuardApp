from typing import Dict, Any, List, Optional, Tuple

def calculate_risk_score(
    name_sim: float,
    logo_sim: float,
    desc_sim: float,
    lookalike_bonus: float,
    publisher_mismatch: Optional[Dict[str, Any]] = None,
    lookalike_evidence: Optional[List[str]] = None
) -> Tuple[float, str, Dict[str, Any], List[str]]:
    """
    Computes weighted risk score (0-100), risk level (high, medium, low),
    raw signals breakdown, and forensic evidence findings.
    """
    evidence: List[str] = []
    
    # Base weighted sum
    # Name: 40%, Logo: 30%, Description: 15%
    base_score = (name_sim * 0.40) + (logo_sim * 0.30) + (desc_sim * 0.15)
    
    if name_sim >= 85.0:
        evidence.append(f"High name similarity detected ({name_sim:.1f}%) matching brand trademarks.")
    
    if logo_sim >= 80.0:
        evidence.append(f"Visual logo similarity ({logo_sim:.1f}%) indicates reproduction of official brand mark.")

    # Apply lookalike bonus
    total_score = base_score + lookalike_bonus
    if lookalike_evidence:
        evidence.extend(lookalike_evidence)

    # Apply publisher mismatch penalty for app stores
    publisher_penalty = 0.0
    if publisher_mismatch and publisher_mismatch.get("is_mismatch"):
        penalty = float(publisher_mismatch.get("penalty", 20.0))
        publisher_penalty = penalty
        total_score += penalty
        expected = publisher_mismatch.get("expected", "Official Brand")
        detected = publisher_mismatch.get("detected", "Third Party")
        evidence.append(
            f"CRITICAL Publisher Mismatch: Expected '{expected}', but app is published by unauthorized developer '{detected}'."
        )

    # Clamping
    final_score = round(float(min(100.0, max(0.0, total_score))), 2)

    # Determine risk level
    if final_score >= 80.0:
        risk_level = "high"
    elif final_score >= 50.0:
        risk_level = "medium"
    else:
        risk_level = "low"

    raw_signals = {
        "name_similarity": round(name_sim, 2),
        "logo_similarity": round(logo_sim, 2),
        "description_similarity": round(desc_sim, 2),
        "lookalike_bonus": round(lookalike_bonus, 2),
        "publisher_mismatch": publisher_mismatch,
    }

    return final_score, risk_level, raw_signals, evidence
