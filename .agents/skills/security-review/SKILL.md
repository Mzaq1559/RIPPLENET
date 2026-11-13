---
name: security-review
description: Review a hackathon application for practical security risks before demo or deployment, including auth, secrets, input validation, APIs, and dependency risks.
---

# Security Review

1. Map trust boundaries, user roles, sensitive data, and external integrations.
2. Search for committed credentials, unsafe defaults, exposed debug endpoints, and secrets in logs.
3. Verify authentication and authorization on every protected operation; hiding a UI control is not authorization.
4. Validate and normalize untrusted input on the server. Use parameterized database queries and safe output encoding.
5. Check file uploads, URL fetching, shell commands, path traversal, CORS, rate limits, and webhook verification where relevant.
6. Review dependency additions, package scripts, licenses, and known vulnerabilities.
7. Confirm error responses do not leak secrets, stack traces, or personal data.
8. Report findings with severity, evidence, affected files, and a practical fix.

Do not claim a system is secure after a superficial scan. State what was and was not checked.
