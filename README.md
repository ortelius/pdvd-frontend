# Ortelius Post-Deployment Vulnerability Dashboard (PDVD)

The Ortelius PDVD provides a production-grade security posture dashboard focused on **post-deployment** vulnerability management. Unlike traditional pre-deployment scanning, this system continuously monitors what's actually running in production environments and tracks remediation effectiveness over time.

---

## Quick Start: GitHub Integration

### Connecting Your Repositories

1. **Sign Up**: Click "Create New Account" on the login page and create an account with your organization details
   
   ![Create New Account Link](./docs/create-account-link.png)
2. **Activate Account**: Check your email for the activation link and set your password
3. **Connect GitHub**: 
   - Go to your Profile page
   - Click "Connect GitHub Account" in the GitHub Integration section
   - Authorize the Ortelius GitHub App
   - Select which repositories to grant access to
4. **Configure Repository Access**:
   - Visit [GitHub Settings > Applications > Installed GitHub Apps](https://github.com/settings/installations)
   - Click "Configure" next to the Ortelius/PDVD app
   - Under "Repository access", select the repositories you want to track
   - Click "Save"
5. **View Your Data**: Your GitHub releases and their security posture will now appear in the Organizations and Dashboard views

### What Gets Tracked

Once connected, the system automatically:
- Monitors your GitHub releases and container deployments
- Scans for vulnerabilities using SBOM (Software Bill of Materials) data
- Tracks OpenSSF Scorecard metrics for repository security health
- Provides post-deployment vulnerability detection and remediation tracking
- Generates compliance-ready reports aligned with NIST frameworks

---

## Filter Capabilities

### Vulnerability Filters
- **Severity**: Critical, High, Medium, Low, Clean
- **OpenSSF Score**: High (8.0+), Medium (6.0-7.9), Low (<6.0)
- **Name/Package**: Text-based search
- **CVE ID**: Direct CVE lookup

### Endpoint Filters
- **Status**: Active, Inactive, Error
- **Environment**: Production, Staging, Development, Test
- **Endpoint Type**: Kubernetes, Docker, VM, Serverless

---

## Key Features

### 🏢 Multi-Organization Support
- Organization-level isolation and access control
- Role-based permissions (admin, viewer)
- Public and private repository tracking

### 🎯 Comprehensive Dashboard
- Executive-level security metrics
- MTTR (Mean Time To Remediate) tracking
- SLA compliance monitoring (Critical: 15d, High: 30d)
- Vulnerability trend analysis (180-day rolling window)
- NIST framework alignment (SP 800-53, 800-137, 800-190, 800-218)

### 🔍 Multi-Dimensional Views
- **Organizations**: Portfolio-level security overview
- **Dashboard**: Detailed posture analysis with compliance metrics
- **Synced Endpoints**: Where software is running (K8s, Docker, VMs)
- **Project Releases**: Vulnerability tracking by release version
- **Vulnerabilities**: CVE database with CVSS scoring

### 🛡️ Security Intelligence
- OpenSSF Scorecard integration
- SBOM-based dependency analysis
- Severity-based prioritization (Critical, High, Medium, Low)
- Post-deployment detection tracking
- Remediation workflow support

### 📊 Export & Reporting
- SVG export for any dashboard component
- Compliance-ready documentation
- Detailed vulnerability breakdowns
- Historical trend visualization

### 🎨 Modern UX
- Dark/Light theme support
- Responsive design (mobile, tablet, desktop)
- Real-time filtering and search
- Breadcrumb navigation
- Collapsible sidebar with filter persistence

---

## Key Metrics Explained

### MTTR (Mean Time To Remediate)
Average time from vulnerability detection to remediation, tracked separately for:
- All endpoint CVEs
- Post-deployment CVEs (detected after deployment)

### SLA Compliance
Percentage of vulnerabilities remediated within severity-based timeframes:
- Critical: 15 days
- High: 30 days
- Medium: 90 days
- Low: 180 days

### Post-Deployment CVEs
Vulnerabilities where the CVE disclosure date occurred **after** the release was deployed to production endpoints.

### Backlog Delta
Net change in open vulnerabilities (New CVEs - Fixed CVEs) over the rolling 180-day window.

---

## Compliance Frameworks

This dashboard is designed to support compliance with:

- **NIST SP 800-53 Rev. 5** - SI-2 (Flaw Remediation)
- **NIST SP 800-137** - Information Security Continuous Monitoring
- **NIST SP 800-190** - Application Container Security Guide
- **NIST SP 800-218** - Secure Software Development Framework (SSDF)
  - RV.1: Identify and Confirm Vulnerabilities
  - RV.2: Assess, Prioritize, and Remediate Vulnerabilities
- **Executive Order 14028** - Improving the Nation's Cybersecurity
- **DoD Continuous ATO** - DevSecOps Requirements

---

## Authentication & Authorization

### User Roles
- **Admin**: Full system access, user management, organization creation
- **Viewer**: Read-only access to assigned organizations

### Authentication Flow
1. User registration with email verification
2. Admin approval and organization assignment
3. Password-based login with session management
4. Optional GitHub OAuth integration for repository access

---

## Data Architecture

### Organization Hierarchy
```
Organization
  └── Releases (from GitHub or manual upload)
      ├── Endpoints (deployment targets)
      ├── Vulnerabilities (CVEs affecting the release)
      ├── SBOM (Software Bill of Materials)
      └── OpenSSF Scorecard
```

### GraphQL Schema
The frontend communicates with the backend via GraphQL queries for:
- Dashboard metrics and trends
- Release and endpoint inventories
- Vulnerability details and relationships
- User authentication and profile data

---

## Community & Contributing

We welcome contributions! Please see:
- GitHub Issues: [https://github.com/ortelius/pdvd-frontend/issues](https://github.com/ortelius/pdvd-frontend/issues)
- Contributing Guide: `CONTRIBUTING.md`
- Code of Conduct: `CODE_OF_CONDUCT.md`

- Website: [https://ortelius.io](https://ortelius.io)
- GitHub: [https://github.com/ortelius](https://github.com/ortelius)
- Discord: [https://discord.gg/ortelius](https://discord.gg/ortelius)

---

## Developer Setup

### Related Repositories

- **Backend API**: [https://github.com/ortelius/pdvd-backend](https://github.com/ortelius/pdvd-backend)
- **Ortelius Platform**: [https://github.com/ortelius/ortelius](https://github.com/ortelius/ortelius)

### Local Development

1. **Clone the repository**:
```bash
git clone https://github.com/ortelius/pdvd-frontend
cd pdvd-frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment**:
```bash
cp .env.example .env.local
# Edit .env.local with your backend endpoints
```

4. **Run development server**:
```bash
npm run dev
```

5. **Open browser**:
```
http://localhost:4000
```

### Environment Variables

```bash
# Backend API Configuration
RUNTIME_GRAPHQL_ENDPOINT=http://localhost:3000/api/v1/graphql
RUNTIME_REST_ENDPOINT=http://localhost:3000/api/v1

# GitHub OAuth (for repository integration)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

---

## License

Apache License 2.0 - See `LICENSE` file for details.

---

## Acknowledgments

Maintained by the Ortelius open-source community with support from:
- Cloud Native Computing Foundation (CNCF)
- Continuous Delivery Foundation (CDF)
- OpenSSF (Open Source Security Foundation)

For security disclosures, please email: security@ortelius.io