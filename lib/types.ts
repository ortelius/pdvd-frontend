// Updated types for Dashboard with new Security Velocity metrics

export interface DetailedSeverityMetrics {
  severity: string;
  
  // A. Remediation Effectiveness
  mttr: number;
  mttr_post_deployment: number;
  fixed_within_sla_pct: number;
  
  // B. Active Risk Exposure
  mean_open_age: number;
  mean_open_age_post_deploy: number;
  oldest_open_days: number;
  
  // C. SLA Compliance
  open_beyond_sla_pct: number;
  open_beyond_sla_count: number; // NEW FIELD
  
  // D. Volume & Flow
  new_detected: number;
  remediated: number;
  backlog_count: number; // Legacy name
  open_count: number;    // NEW FIELD (same as backlog_count)
}

export interface ExecutiveSummary {
  total_new_cves: number;
  total_fixed_cves: number;
  post_deployment_cves: number;
  mttr_all: number;
  mttr_post_deployment: number;
  mean_open_age_all: number;
  mean_open_age_post_deploy: number;
  open_cves_beyond_sla_pct: number;
  oldest_open_critical_days: number;
  backlog_delta: number;
  fixed_within_sla_pct?: number; // NEW FIELD (optional for backward compatibility)
}

export interface EndpointImpactCount {
  type: string;
  count: number;
}

export interface EndpointImpactMetrics {
  affected_endpoints_count: number;
  post_deployment_cves_by_type: EndpointImpactCount[];
}

export interface MTTRAnalysis {
  executive_summary: ExecutiveSummary;
  by_severity: DetailedSeverityMetrics[];
  endpoint_impact: EndpointImpactMetrics;
}

export interface GetMTTRAnalysisResponse {
  dashboardMTTR: MTTRAnalysis;
}

export interface VulnerabilityTrend {
  date: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface GetVulnerabilityTrendResponse {
  dashboardVulnerabilityTrend: VulnerabilityTrend[];
}