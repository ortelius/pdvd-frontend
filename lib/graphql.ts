// lib/graphql.ts

// We use a variable instead of a const so we can update it dynamically
let activeGraphqlEndpoint: string | null = null

// Helper to get the endpoint.
// It fetches from /api/config only if we haven't done so yet.
async function getGraphqlEndpoint (): Promise<string> {
  // Fix: Explicitly check for null
  if (activeGraphqlEndpoint !== null) {
    return activeGraphqlEndpoint
  }

  try {
    // Fetch the configuration from the Next.js API route
    const res = await fetch('/api/config')

    if (!res.ok) {
      console.warn(`Failed to fetch /api/config (Status: ${res.status}). Falling back to default.`)
      return '/api/v1/graphql'
    }

    const data = await res.json()

    // Validate the response contains the expected key
    // Fix: Explicitly check type to avoid 'Unexpected any value' error
    if (typeof data.graphqlEndpoint === 'string') {
      activeGraphqlEndpoint = data.graphqlEndpoint
      return activeGraphqlEndpoint as string
    }
  } catch (error) {
    console.error('Error fetching GraphQL config:', error)
  }

  // Fallback if the config endpoint fails
  return '/api/v1/graphql'
}

export async function graphqlQuery<T> (query: string, variables?: Record<string, any>): Promise<T> {
  // 1. Resolve the endpoint URL dynamically
  const endpoint = await getGraphqlEndpoint()

  // 2. Use the resolved endpoint for the request
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query,
      variables
    })
  })

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.statusText}`)
  }

  const json = await response.json()

  if ((json.errors != null) && json.errors.length > 0) {
    throw new Error((json.errors[0]?.message != null) ? json.errors[0].message : 'GraphQL query failed')
  }

  return json.data
}

// ------------------ QUERIES ------------------

// Fetch a single release with full fields including OpenSSF Scorecard
export const GET_RELEASE = `
  query GetRelease($name: String!, $version: String!) {
    release(name: $name, version: $version) {
      key
      name
      version
      project_type
      content_sha
      git_commit
      git_branch
      git_tag
      git_repo
      git_org
      git_url
      git_repo_project
      git_verify_commit
      git_signed_off_by
      git_commit_timestamp
      git_commit_authors
      git_committerscnt
      git_total_committerscnt
      git_contrib_percentage
      git_lines_added
      git_lines_deleted
      git_lines_total
      git_prev_comp_commit
      docker_repo
      docker_tag
      docker_sha
      basename
      build_date
      build_id
      build_num
      build_url
      dependency_count
      sbom {
        key
        contentsha
        objtype
        content
      }
      vulnerabilities {
        cve_id
        summary
        details
        severity_score
        severity_rating
        cvss_v3_score
        published
        modified
        aliases
        package
        affected_version
        full_purl
        fixed_in
      }
      openssf_scorecard_score
      synced_endpoint_count
      synced_endpoints {
        endpoint_name
        endpoint_url
        endpoint_type
        environment
        last_sync
        status
      }
      scorecard_result {
        Date
        Repo {
          Name
          Commit
        }
        Scorecard {
          Version
          Commit
        }
        Score
        Checks {
          Name
          Score
          Reason
          Details
          Documentation {
            Short
            URL
          }
        }
        Metadata
      }
    }
  }
`

// Affected releases for vulnerabilities page - UPDATED WITH NEW FIELDS
export const GET_AFFECTED_RELEASES = `
  query GetAffectedReleases($severity: Severity!, $limit: Int) {
    affectedReleases(severity: $severity, limit: $limit) {
      cve_id
      summary
      details
      severity_score
      severity_rating
      published
      modified
      aliases
      package
      affected_version
      full_purl
      fixed_in
      release_name
      release_version
      content_sha
      project_type
      openssf_scorecard_score
      dependency_count
      synced_endpoint_count
      version_count
      vulnerability_count
      vulnerability_count_delta
    }
  }
`

// Synced endpoints query
export const GET_SYNCED_ENDPOINTS = `
  query GetSyncedEndpoints($limit: Int) {
    syncedEndpoints(limit: $limit) {
      endpoint_name
      endpoint_url
      endpoint_type
      environment
      status
      last_sync
      release_count
      total_vulnerabilities {
        critical
        high
        medium
        low
      }
      releases {
        release_name
        release_version
      }
    }
  }
`

// Affected endpoints for a release
export const GET_AFFECTED_ENDPOINTS = `
  query GetAffectedEndpoints($name: String!, $version: String!) {
    affectedEndpoints(name: $name, version: $version) {
      endpoint_name
      endpoint_url
      endpoint_type
      environment
      last_sync
      status
      total_vulnerabilities {
        critical
        high
        medium
        low
      }
    }
  }
`

// Mitigations page query
export const GET_MITIGATIONS = `
  query GetMitigations($limit: Int) {
    mitigations(limit: $limit) {
      cve_id
      summary
      severity_score
      severity_rating
      package
      affected_version
      full_purl
      fixed_in
      affected_releases
      affected_endpoints
    }
  }
`

// Vulnerabilities page query
export const GET_VULNERABILITIES = `
  query GetVulnerabilities($limit: Int) {
    vulnerabilities(limit: $limit) {
      cve_id
      summary
      severity_score
      severity_rating
      package
      affected_version
      full_purl
      fixed_in
      affected_releases
      affected_endpoints
    }
  }
`

// Endpoint details query
export const GET_ENDPOINT_DETAILS = `
  query GetEndpointDetails($name: String!) {
    endpointDetails(name: $name) {
      endpoint_name
      endpoint_url
      endpoint_type
      environment
      status
      last_sync
      total_vulnerabilities {
        critical
        high
        medium
        low
      }
      vulnerability_count_delta
      releases {
        release_name
        release_version
        openssf_scorecard_score
        dependency_count
        last_sync
        vulnerability_count
        vulnerability_count_delta
        vulnerabilities {
          cve_id
          summary
          severity_score
          severity_rating
          package
          affected_version
          full_purl
          fixed_in
        }
      }
    }
  }
`

// Dashboard Trend Query - Updated
export const GET_DASHBOARD_VULNERABILITY_TREND = `
  query GetDashboardVulnerabilityTrend($days: Int) {
    dashboardVulnerabilityTrend(days: $days) {
      date
      critical
      high
      medium
      low
    }
  }
`

// Dashboard Global Status Query
export const GET_DASHBOARD_GLOBAL_STATUS = `
  query DashboardGlobalStatus($limit: Int) {
    dashboardGlobalStatus(limit: $limit) {
      critical { count delta }
      high { count delta }
      medium { count delta }
      low { count delta }
      total_count
      total_delta
    }
  }
`

// MTTR Analysis Query
export const GET_MTTR_ANALYSIS = `
  query MTTRAnalysis($days: Int!) {
    dashboardMTTR(days: $days) {
      by_severity {
        severity
        mean_days
        median_days
        min_days
        max_days
        sample_size
      }
      overall_mean_days
      analysis_period
      total_remediated
    }
  }
`

// MTTR Trend Query
export const GET_MTTR_TREND = `
  query MTTRTrend($days: Int!) {
    dashboardMTTRTrend(days: $days) {
      month
      avg_mttr
      count
    }
  }
`

// MTTR By Endpoint Query
export const GET_MTTR_BY_ENDPOINT = `
  query MTTRByEndpoint($days: Int!, $limit: Int) {
    dashboardMTTRByEndpoint(days: $days, limit: $limit) {
      endpoint_name
      avg_mttr
      count
    }
  }
`

// MTTR By Package Query
export const GET_MTTR_BY_PACKAGE = `
  query MTTRByPackage($days: Int!, $limit: Int) {
    dashboardMTTRByPackage(days: $days, limit: $limit) {
      package
      avg_mttr
      count
    }
  }
`

// MTTR By Disclosure Query
export const GET_MTTR_BY_DISCLOSURE = `
  query MTTRByDisclosure($days: Int!) {
    dashboardMTTRByDisclosureType(days: $days) {
      known_at_deployment {
        count
        mean_mttr
        median_mttr
      }
      disclosed_after_deployment {
        count
        mean_mttr
        median_mttr
      }
    }
  }
`