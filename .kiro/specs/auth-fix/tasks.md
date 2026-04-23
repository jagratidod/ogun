# auth-fix Tasks

## Tasks

- [x] 1. Fix CORS misconfiguration in backend/src/app.js
  - [x] 1.1 Replace bare `cors()` call with configured options (`origin`, `credentials: true`)
  - [x] 1.2 Add `CORS_ORIGIN` variable to `backend/.env`

- [x] 2. Fix OTP_EXPIRY NaN in auth controller
  - [x] 2.1 Wrap `process.env.OTP_EXPIRY` with `parseInt()` in the `expiresAt` calculation in `requestOTP`
  - [x] 2.2 Wrap `process.env.OTP_EXPIRY` with `parseInt()` in the email template string

- [x] 3. Add isActive check to adminLogin handler
  - [x] 3.1 Add `isActive` guard after password verification in `exports.adminLogin`, returning 403 if false

- [x] 4. Wrap jwt.verify in try/catch in refreshToken handler
  - [x] 4.1 Extract `jwt.verify` call into its own try/catch block that returns 401 on any JWT error

- [x] 5. Replace hardcoded API base URL in frontend/src/core/api.js
  - [x] 5.1 Introduce a `BASE_URL` constant reading `import.meta.env.VITE_API_URL` with localhost fallback
  - [x] 5.2 Replace both hardcoded URL strings (axios `baseURL` and inline refresh `axios.post`) with `BASE_URL`
