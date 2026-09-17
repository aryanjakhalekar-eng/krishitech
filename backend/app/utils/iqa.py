import cv2
import numpy as np

class ImageQualityAnalyzer:
    """
    Image Quality Assessment (IQA) module using Laplacian Variance for Blur Detection,
    intensity histogram analysis for Brightness assessment, and resolution check.
    """
    def __init__(self, blur_threshold=20.0, low_bright_threshold=40.0, high_bright_threshold=220.0):
        self.blur_threshold = blur_threshold
        self.low_bright_threshold = low_bright_threshold
        self.high_bright_threshold = high_bright_threshold

    def analyze_image_bytes(self, image_bytes: bytes) -> dict:
        np_arr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        
        if img is None:
            return {
                "is_usable": False,
                "status": "INVALID_IMAGE",
                "iqa_score": 0.0,
                "blur_variance": 0.0,
                "brightness": 0.0,
                "message": "Unreadable image format."
            }
            
        height, width, _ = img.shape
        if height < 150 or width < 150:
            return {
                "is_usable": False,
                "status": "LOW_RESOLUTION",
                "iqa_score": 0.2,
                "blur_variance": 0.0,
                "brightness": 0.0,
                "message": "Image resolution is too low. Please capture closer to the crop leaf."
            }

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # 1. Blur Detection using Laplacian Variance
        blur_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        
        # 2. Brightness Check
        brightness = float(np.mean(gray))

        is_usable = True
        status = "GOOD"
        message = "Image quality is good for AI inference."

        if blur_var < self.blur_threshold:
            is_usable = False
            status = "BLURRY"
            message = "Image is too blurry. Please hold camera steady and retake."
            normalized_score = max(0.0, (blur_var / self.blur_threshold) * 0.45)
        elif brightness < self.low_bright_threshold:
            is_usable = False
            status = "TOO_DARK"
            message = "Image is too dark. Please ensure sufficient light."
            normalized_score = 0.20
        elif brightness > self.high_bright_threshold:
            is_usable = False
            status = "TOO_BRIGHT"
            message = "Image is overexposed/too bright. Avoid direct harsh glare."
            normalized_score = 0.20
        else:
            # Scale score between 0.50 and 1.0 for usable images
            normalized_score = min(1.0, 0.50 + ((blur_var - self.blur_threshold) / 200.0) * 0.50)

        return {
            "is_usable": is_usable,
            "status": status,
            "iqa_score": round(normalized_score, 3),
            "blur_variance": round(blur_var, 2),
            "brightness": round(brightness, 2),
            "message": message
        }
