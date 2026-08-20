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

## 2024-08-08 - [Input Field Memory Exhaustion DoS]
**Vulnerability:** Input fields lacked `maxlength` attributes, allowing potential client-side memory exhaustion DoS when excessively long strings are processed.
**Learning:** To prevent client-side memory exhaustion DoS when strings are processed or sent to backend APIs, always define explicit and sensible `maxlength` attributes for HTML `<input>` elements.
**Prevention:** Always define explicit and sensible `maxlength` attributes for HTML `<input>` elements (e.g., 100 for emails/names, 128 for passwords).

## 2024-08-08 - [Missing File Upload MIME Type Validation]
**Vulnerability:** Client-side file uploads (`FileReader`) only validated file size but not MIME type, allowing users to potentially upload non-image files (e.g., executable scripts or malicious documents) if they bypassed the HTML `accept` attribute.
**Learning:** Relying solely on the HTML `accept` attribute is insufficient for security as it can be easily bypassed by the client. Files read into Data URLs without type validation could be mishandled by the application or stored as invalid payloads.
**Prevention:** Always validate the `type` property of `File` objects (e.g., `file.type.startsWith('image/')`) in JavaScript before reading them with `FileReader` or sending them to a backend.

## 2026-08-11 - [False Positive API Key]
**Vulnerability:** A hardcoded Firebase API key was identified in client-side configuration.
**Learning:** Unlike server-side secret keys, Firebase web client API keys are public by design to identify the Firebase project. This is a false positive vulnerability.
**Prevention:** Add explicit clarifying comments (e.g., `// NOTE: This key is intentionally public`) near such keys in the code to prevent future developers or automated tools from misidentifying them.

## 2026-08-11 - [Missing API Timeouts]
**Vulnerability:** Client-side DoS via indefinite network hanging on Firebase Auth calls.
**Learning:** External network calls without timeouts can hang indefinitely in offline scenarios.
**Prevention:** Wrap all network-dependent API calls with a timeout mechanism like withTimeout(call, 10000).
## 2026-08-20 - Fix XSS via innerHTML in togglePass
**Vulnerability:** Use of innerHTML for static SVG injection in togglePass function.
**Learning:** Even for static strings, innerHTML is considered insecure by SAST tools and sets a bad precedent for future dynamic inputs.
**Prevention:** Always use secure DOM manipulation methods (createElementNS, setAttribute, appendChild) to dynamically generate and insert SVG or HTML elements.
