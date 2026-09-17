export type Role = 'FARMER' | 'OFFICER' | 'ADMIN';

export interface User {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  role: Role;
  district?: string;
  taluka?: string;
  created_at: string;
}

export interface Farm {
  id: number;
  owner_id: number;
  farm_name: string;
  district: string;
  taluka: string;
  crop: string;
  variety?: string;
  soil_type?: string;
  area_acres: number;
  latitude: number;
  longitude: number;
  created_at: string;
}

export interface IQAResult {
  is_usable: boolean;
  status: string;
  iqa_score: number;
  blur_variance: number;
  brightness: number;
  message: string;
}

export interface OODResult {
  mahalanobis_distance: number;
  ood_threshold: number;
  is_ood: boolean;
  status: string;
  message: string;
}

export interface SeverityResult {
  affected_area_percent: number;
  severity_level: 'LOW' | 'MEDIUM' | 'HIGH';
  message: string;
}

export interface SafetyGateResult {
  action: 'AUTOMATED_ADVISORY' | 'HUMAN_ESCALATION' | 'RETRY_PHOTO';
  gate_passed: boolean;
  badge_status: 'PASSED' | 'HUMAN_VERIFICATION_REQUIRED' | 'POOR_IMAGE_QUALITY';
  display_title: string;
  display_message: string;
  escalate_to_officer: boolean;
  reason: string;
}

export interface IPMAdvisory {
  crop: string;
  disease_name: string;
  cultural_control: string;
  biological_control: string;
  approved_chemical_control: string;
  safety_warning: string;
}

export interface ScanAnalysisResponse {
  scan_id: number;
  crop_mismatch?: boolean;
  mismatch_message?: string;
  selected_crop?: string;
  detected_crop?: string;
  crop: string;
  predicted_disease?: string;
  confidence?: number;
  confidence_percentage?: number;
  domain_status?: string;
  advisory_status?: string;
  iqa: IQAResult;
  ood?: OODResult;
  severity?: SeverityResult;
  safety_gate?: SafetyGateResult;
  advisory?: IPMAdvisory;
  escalated_case_id?: number;
  inference_note: string;
  crop_classifier_confidence?: number;
}

export interface CropScan {
  id: number;
  farmer_id: number;
  farm_id?: number;
  image_url: string;
  iqa_status: string;
  iqa_score: number;
  crop: string;
  predicted_disease: string;
  confidence: number;
  ood_distance: number;
  is_ood: boolean;
  safety_gate_action: string;
  severity: string;
  affected_area_percent: number;
  created_at: string;
}

export interface DiseaseCase {
  id: number;
  scan_id: number;
  farmer_id: number;
  officer_id?: number;
  district: string;
  taluka: string;
  crop: string;
  predicted_disease: string;
  verified_disease?: string;
  severity: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'RESOLVED';
  escalation_reason?: string;
  officer_notes?: string;
  image_url?: string;
  scan?: CropScan;
  created_at: string;
  updated_at: string;
}

export interface WeatherInfo {
  district: string;
  taluka: string;
  temp_c: number;
  humidity_percent: number;
  rainfall_mm: number;
  wind_speed_kmph: number;
  weather_condition: string;
  contextual_risk_level?: string;
}

export interface OutbreakHotspot {
  district: string;
  taluka: string;
  crop: string;
  disease: string;
  severity: string;
  cases_count: number;
  lat: number;
  lng: number;
  risk_level: string;
}

export interface AppNotification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  is_read: boolean;
  type: string;
  case_id?: number;
  created_at: string;
}
