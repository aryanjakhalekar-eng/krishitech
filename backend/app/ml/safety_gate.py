import os
from typing import Dict, Any

class AISafetyGate:
    """
    Mathematical AI Safety Gate as defined in KrishiRakshak AI Specification:
    Action =
      - On-Device Retry Prompt, if IQA(x) < tau_IQA
      - Automated On-Device Advice, if IQA(x) >= tau_IQA AND C(x) >= tau_c AND D_M(x) <= tau_OOD
      - Escalate to Extension Officer, if IQA(x) >= tau_IQA AND (C(x) < tau_c OR D_M(x) > tau_OOD)
    """
    def __init__(self, iqa_threshold: float = 0.50, confidence_threshold: float = 0.75, ood_threshold: float = 4.50):
        # Allow threshold configuration via environment variables
        self.iqa_threshold = float(os.getenv("IQA_THRESHOLD", iqa_threshold))
        self.confidence_threshold = float(os.getenv("CONFIDENCE_THRESHOLD", confidence_threshold))
        self.ood_threshold = float(os.getenv("OOD_THRESHOLD", ood_threshold))

    def evaluate(self, iqa_result: Dict[str, Any], ai_result: Dict[str, Any], ood_result: Dict[str, Any]) -> Dict[str, Any]:
        iqa_score = iqa_result.get("iqa_score", 0.0)
        is_usable = iqa_result.get("is_usable", False)
        confidence = ai_result.get("confidence", 0.0)
        d_m = ood_result.get("mahalanobis_distance", 99.0)
        domain_info = ai_result.get("domain_verification", {})
        is_supported_domain = domain_info.get("is_supported_domain", True)

        # Step 1: Check IQA
        if not is_usable or iqa_score < self.iqa_threshold:
            return {
                "action": "RETRY_PHOTO",
                "gate_passed": False,
                "badge_status": "POOR_IMAGE_QUALITY",
                "display_title": "Image Quality: POOR",
                "display_message": iqa_result.get("message", "Image quality is insufficient. Please retake photo."),
                "escalate_to_officer": False,
                "reason": f"IQA score ({iqa_score:.2f}) < Threshold ({self.iqa_threshold:.2f})"
            }

        # Step 2: Check Domain and Crop Support
        if not is_supported_domain:
            domain_reason = domain_info.get("reason", "Input does not match the supported crop domain.")
            return {
                "action": "HUMAN_ESCALATION",
                "gate_passed": False,
                "badge_status": "HUMAN_VERIFICATION_REQUIRED",
                "display_title": "AI Safety Check: HUMAN VERIFICATION REQUIRED",
                "display_message": f"Unsupported crop domain: {domain_reason}. Routed to agricultural extension officer.",
                "escalate_to_officer": True,
                "reason": f"Unsupported Crop Domain: {domain_reason}"
            }

        # Step 3: Check Confidence and OOD Distance
        high_confidence = (confidence >= self.confidence_threshold)
        in_distribution = (d_m <= self.ood_threshold)

        if high_confidence and in_distribution:
            return {
                "action": "AUTOMATED_ADVISORY",
                "gate_passed": True,
                "badge_status": "PASSED",
                "display_title": "AI Safety Check: PASSED",
                "display_message": "Supported crop scan passed all safety checks. Automated local IPM advisory generated.",
                "escalate_to_officer": False,
                "reason": f"Confidence ({confidence:.2f} >= {self.confidence_threshold:.2f}) AND OOD Distance ({d_m:.2f} <= {self.ood_threshold:.2f})"
            }
        else:
            escalation_reasons = []
            if not high_confidence:
                escalation_reasons.append(f"Low AI Confidence ({confidence*100:.1f}% < {self.confidence_threshold*100:.0f}%)")
            if not in_distribution:
                escalation_reasons.append(f"Out-Of-Distribution Distance ({d_m:.2f} > {self.ood_threshold:.2f})")

            reason_str = " & ".join(escalation_reasons)
            return {
                "action": "HUMAN_ESCALATION",
                "gate_passed": False,
                "badge_status": "HUMAN_VERIFICATION_REQUIRED",
                "display_title": "AI Safety Check: HUMAN VERIFICATION REQUIRED",
                "display_message": f"Your scan requires verification by an agricultural extension officer. Reason: {reason_str}.",
                "escalate_to_officer": True,
                "reason": reason_str
            }
