## 2026-08-04 - [MEDIUM] Secure error handling and prevent information leakage
**Vulnerability:** Error details (e.message and e.code) from Firebase API calls were directly passed to the user via UI messages.
**Learning:** Exposing internal error messages and codes to users can leak sensitive information about the backend architecture and state.
**Prevention:** Always log detailed error information to the console or an internal logger, and present only generic, safe error messages to the end-user.
