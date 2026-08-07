## 2024-05-24 - [Error Message Leakage]
**Vulnerability:** Raw error details (`e.message` or `e.code` from exceptions) were being directly exposed to the user interface via `showMsg` alerts in Firebase authentication and database interactions.
**Learning:** Returning unhandled or detailed error messages to the client exposes underlying application logic and potentially sensitive information. It violates the "Fail securely" principle where error details shouldn't leak internals.
**Prevention:** Catch errors gracefully. Log the detailed error object to a secure destination (like `console.error` during dev/monitoring) and provide a generic, safe error message to the user UI.

## 2024-05-24 - [File Upload Memory Exhaustion DoS]
**Vulnerability:** Client-side `FileReader` loading arbitrary large files completely into memory as Data URLs.
**Learning:** Processing user-uploaded files on the client side without size limits can cause memory exhaustion and crash the browser (Client-side DoS).
**Prevention:** Always validate `file.size` against a sensible maximum limit (e.g. 2MB) before attempting to read the file into memory using `FileReader`.
## 2024-05-20 - [Add Content Security Policy]
**Vulnerability:** Missing Content Security Policy (CSP) headers.
**Learning:** Firebase requires specific external domains for auth and websockets, which must be explicitly whitelisted in the CSP `connect-src` and `frame-src` to avoid blocking its functionality.
**Prevention:** Always include `https://*.googleapis.com`, `https://*.firebaseio.com`, `wss://*.firebaseio.com`, and `https://*.firebaseapp.com` in `connect-src`, and `https://*.firebaseapp.com` in `frame-src` when configuring CSP for Firebase projects.

## 2024-05-24 - [User Enumeration via Password Reset]
**Vulnerability:** The password reset endpoint explicitly leaked whether an email address was registered or not, allowing attackers to enumerate the user base.
**Learning:** Conditional error responses for auth flows (like password resets) can leak PII and expose users to targeted phishing or credential stuffing.
**Prevention:** Fail securely by displaying a uniform success message regardless of whether the email exists in the system or not.
