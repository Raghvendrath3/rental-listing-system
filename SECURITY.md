# 🛡️ Security Policy

We take the security of **Rental Hub** seriously. Whether you are an open-source contributor or a professional audit team, we appreciate your help in keeping our platform secure.

Please review this document to understand our supported versions, scope of security audits, and how to report vulnerabilities responsibly.

---

## 📅 Supported Versions

Only the latest active major and minor releases receive security patches. If a vulnerability is found in an older version, please upgrade to a supported release.

| Version | Supported | Status | Security Patches |
| :--- | :---: | :--- | :--- |
| **v1.x** | ✅ | Active / Maintained | Yes (Primary focus) |
| **v0.x** | ❌ | Deprecated | No |

---

## ✉️ Reporting a Vulnerability

**DO NOT open a public GitHub issue for security-related bugs or vulnerabilities.**

If you discover a security vulnerability, please report it via our dedicated channels:

* **Primary Security Contact:** [security@rentalhub.dev](mailto:security@rentalhub.dev) *(Please replace this with your actual security contact address in production).*
* **Expected Response Window:** You will receive an initial response and acknowledgment of your report within **24–48 hours**.
* **Coordinated Disclosure:** We ask that you follow coordinated disclosure guidelines and give us up to **14 days** to address, test, and deploy a patch before making the vulnerability public.

### Please include the following in your report:
1. **Description:** A detailed explanation of the vulnerability and its potential impact.
2. **Steps to Reproduce:** A step-by-step proof of concept (PoC) or script showing how to trigger the vulnerability.
3. **Suggested Mitigation (Optional):** Any code-level recommendations or architectural advice on resolving the issue.

---

## 🔍 Security Audit & Assessment Scope

We have clearly defined what layers of the application are subject to security audits and patches.

### In Scope
Our security attention is primarily focused on the following directories and vectors:

* **Authentication & JWT Lifecycles:** Verify signature algorithms, key strengths, token expiration (1 hour, no long-lived refresh tokens), and cookie/header extraction inside:
  * [`backend/src/middlewares/auth.js`](file:///c:/Users/AC/Desktop/Workplace/Projects/rental_hub/backend/src/middlewares/)
  * [`backend/src/services/users.service.js`](file:///c:/Users/AC/Desktop/Workplace/Projects/rental_hub/backend/src/services/users.service.js)
* **Authorization & RBAC Enforcement:** Confirm that standard Users and Property Owners cannot bypass service-layer guards to modify/delete assets owned by other entities:
  * [`backend/src/middlewares/requireRole.js`](file:///c:/Users/AC/Desktop/Workplace/Projects/rental_hub/backend/src/middlewares/requireRole.js)
  * [`backend/src/services/authorization.js`](file:///c:/Users/AC/Desktop/Workplace/Projects/rental_hub/backend/src/services/authorization.js)
* **SQL Injection & Data Layer Isolation:** Ensure all interactions with the database are fully parameterized and use no dynamic string concatenation:
  * [`backend/src/repositories/`](file:///c:/Users/AC/Desktop/Workplace/Projects/rental_hub/backend/src/repositories/)
* **PII & Sensitive Contact Disclosure:** Verify that contact endpoints securely restrict disclosure of phone numbers, emails, and full names unless ownership or authorization checks are cleared:
  * [`backend/src/services/contact.service.js`](file:///c:/Users/AC/Desktop/Workplace/Projects/rental_hub/backend/src/services/contact.service.js)

### Out of Scope
* **Rate Limiting & DDoS Prevention:** Currently out of scope at the application layer. These should be managed at the infrastructure layer (e.g., Nginx, Cloudflare, or AWS WAF).
* **HTTPS Enforcement:** Transport layer security (TLS) is handled at the reverse proxy/ingress layer (e.g., Caddy, Nginx, or ALB) during deployment.

---

## 🔒 Hardened Production Principles

Rental Hub maintains the following default security configurations in production environments:

1. **Password Hashing:** Client passwords must never be stored in plain text. They are hashed using **`bcrypt`** with **12 salt rounds** to defend against brute-force attacks.
2. **JWT Configuration:** JSON Web Tokens are signed using `HS256`. The secret key must be at least **64 characters** long and generated using cryptographically strong pseudo-random generators (e.g., `crypto.randomBytes(64)`).
3. **Relational Constraints:** Cascading deletions and foreign keys are explicitly defined in the SQL layer to avoid orphaned records or data leaks.
4. **Conditional Contact Audit Trails:** Accessing owner contact details triggers access logging (`/contact/:listingId`), preventing bulk scraping of private listing details.
