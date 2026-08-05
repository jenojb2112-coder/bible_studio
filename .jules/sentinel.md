## 2024-05-24 - [Error Message Leakage]
**Vulnerability:** Raw error details (`e.message` or `e.code` from exceptions) were being directly exposed to the user interface via `showMsg` alerts in Firebase authentication and database interactions.
**Learning:** Returning unhandled or detailed error messages to the client exposes underlying application logic and potentially sensitive information. It violates the "Fail securely" principle where error details shouldn't leak internals.
**Prevention:** Catch errors gracefully. Log the detailed error object to a secure destination (like `console.error` during dev/monitoring) and provide a generic, safe error message to the user UI.

## 2026-08-05 - [Missing Security Headers]
**Vulnerability:** The application was missing Content-Security-Policy (CSP) headers, which increases the risk of Cross-Site Scripting (XSS) and other code injection attacks.
**Learning:** Even static HTML frontends without a traditional backend server should explicitly restrict allowed resources using CSP meta tags to provide defense-in-depth.
**Prevention:** Always include a strict Content-Security-Policy using either HTTP response headers or a `<meta>` tag in HTML files.
