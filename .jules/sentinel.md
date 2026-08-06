## 2024-05-24 - [Error Message Leakage]
**Vulnerability:** Raw error details (`e.message` or `e.code` from exceptions) were being directly exposed to the user interface via `showMsg` alerts in Firebase authentication and database interactions.
**Learning:** Returning unhandled or detailed error messages to the client exposes underlying application logic and potentially sensitive information. It violates the "Fail securely" principle where error details shouldn't leak internals.
**Prevention:** Catch errors gracefully. Log the detailed error object to a secure destination (like `console.error` during dev/monitoring) and provide a generic, safe error message to the user UI.

## 2024-05-24 - [File Upload Memory Exhaustion DoS]
**Vulnerability:** Client-side `FileReader` loading arbitrary large files completely into memory as Data URLs.
**Learning:** Processing user-uploaded files on the client side without size limits can cause memory exhaustion and crash the browser (Client-side DoS).
**Prevention:** Always validate `file.size` against a sensible maximum limit (e.g. 2MB) before attempting to read the file into memory using `FileReader`.

## 2025-02-24 - Add CSP for Firebase Apps
**Vulnerability:** Missing Content Security Policy (CSP) increases risk of XSS attacks.
**Learning:** When adding a CSP to a Firebase web app, specific domains (`https://*.googleapis.com`, `https://*.firebaseio.com`, `wss://*.firebaseio.com`, `https://*.firebaseapp.com`) must be allowed in `connect-src` and `frame-src` to avoid breaking Firebase Auth and Realtime DB.
**Prevention:** Always include Firebase domains in CSP configurations when securing Firebase applications.
