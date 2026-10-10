# Security Policy 🛡️

The Oit team takes security vulnerabilities seriously. We appreciate your efforts to responsibly disclose any issues you find.

## Supported Versions

| Version | Supported          |
| :---    | :---               |
| `main`  | :white_check_mark: |
| `< 1.0` | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in Oit, **please do NOT report it via public GitHub issues or public discussions**.

Instead, please report the vulnerability privately through:
1. **GitHub Security Advisory**: Open a private advisory on GitHub via the [Security Advisories tab](https://github.com/felixpalingan/Oit/security/advisories/new).
2. **Direct Contact**: Reach out to the repository maintainer directly via GitHub ([@felixpalingan](https://github.com/felixpalingan)).

### What to Include in Your Report
To help us triage and resolve the issue quickly, please provide:
- A clear description of the vulnerability and its potential impact.
- Step-by-step reproduction instructions or a minimal Proof of Concept (PoC).
- Any affected endpoints, database tables, or environment components (e.g. Supabase RLS, LiveKit token generation, or storage policies).
- Recommended fixes or mitigations, if known.

## Response Timeline
- **Initial Acknowledgment**: Within 48 hours of receipt.
- **Triage & Status Update**: Within 5 business days detailing validation results and target remediation timeline.
- **Resolution**: A coordinated security patch will be prepared and deployed before any public disclosure.

## Security Best Practices in Oit
- All Supabase tables must have `ROW LEVEL SECURITY` enabled.
- Never commit active secrets, service role keys, or production API tokens into version control.
- LiveKit access tokens are strictly scoped to authenticated user IDs and validated via server-side session checks.
- Keep-alive endpoints and internal crons are secured with `CRON_SECRET` authorization bearer headers.
