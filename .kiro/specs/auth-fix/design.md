# auth-fix Bugfix Design

## Overview

Five distinct bugs break the authentication system end-to-end. The fixes are surgical and minimal:

1. **CORS misconfiguration** — `cors()` in `backend/src/app.js` is called with no options, so credentialed cross-origin requests are rejected.
2. **OTP_EXPIRY NaN** — an inline comment in `backend/.env` makes `process.env.OTP_EXPIRY` equal `"5 # Minutes"`, causing `NaN` date arithmetic in the OTP controller.
3. **Admin `isActive` not checked** — `adminLogin` in `auth.controller.js` issues tokens to deactivated admin accounts.
4. **`jwt.verify` throws 500 on refresh** — the `refreshToken` controller calls `jwt.verify` outside a try/catch, so an expired JWT propagates as a 500 instead of a 401.
5. **Hardcoded API base URL** — `frontend/src/core/api.js` hardcodes `http://localhost:5000/api/v1` instead of reading `import.meta.env.VITE_API_URL`.

Each fix is isolated to a single file and does not alter any surrounding logic.

---

## Glossary

- **Bug_Condition (C)**: The specific input state that triggers each defect.
- **Property (P)**: The correct observable behaviour that must hold after the fix.
- **Preservation**: All existing correct behaviours that must remain unchanged.
- **`cors()`**: The `cors` npm middleware applied in `app.js`.
- **`OTP_EXPIRY`**: The env variable holding OTP lifetime in minutes.
- **`adminLogin`**: The `exports.adminLogin` handler in `auth.controller.js`.
- **`refreshToken`**: The `exports.refreshToken` handler in `auth.controller.js`.
- **`api`**: The axios instance exported from `frontend/src/core/api.js`.

---

## Bug Details

### Bug 1 — CORS Misconfiguration

The bug manifests when the frontend (running on a different origin) sends any request — especially those with `Authorization` headers — to the backend. `cors()` with no arguments defaults to `origin: "*"` and `credentials: false`, which causes browsers to reject credentialed requests.

**Formal Specification:**
```
FUNCTION isBugCondition_CORS(request)
  INPUT: HTTP request with an Origin header
  OUTPUT: boolean

  RETURN request.origin IS NOT NULL
     AND cors_config.credentials = false
     AND (cors_config.origin = "*" OR cors_config.origin IS UNDEFINED)
END FUNCTION
```

**Examples:**
- Frontend at `http://localhost:5173` sends `GET /api/v1/admin/dashboard` with `Authorization: Bearer <token>` → browser blocks with CORS error.
- Frontend sends `POST /api/v1/auth/refresh` → preflight fails, request never reaches the server.
- Any request from a deployed frontend domain → rejected.

---

### Bug 2 — OTP_EXPIRY NaN

`process.env.OTP_EXPIRY` is `"5 # Minutes"` because `.env` allows inline comments only in some parsers. `Number("5 # Minutes")` is `NaN`, so `Date.now() + NaN * 60 * 1000` produces `NaN`, and `new Date(NaN)` is `Invalid Date`.

**Formal Specification:**
```
FUNCTION isBugCondition_OTPExpiry(envValue)
  INPUT: envValue = process.env.OTP_EXPIRY as string
  OUTPUT: boolean

  RETURN isNaN(Number(envValue))
END FUNCTION
```

**Examples:**
- `OTP_EXPIRY = "5 # Minutes"` → `expiresAt = Invalid Date` → OTP never expires, TTL index broken.
- `OTP_EXPIRY = "5"` (no comment) → `expiresAt = valid future Date` → works correctly.

---

### Bug 3 — Admin `isActive` Not Checked

`adminLogin` verifies role and password but never checks `user.isActive`. A deactivated admin receives valid tokens and can call protected routes until the `protect` middleware rejects them — but the tokens are already issued.

**Formal Specification:**
```
FUNCTION isBugCondition_AdminActive(user, credentials)
  INPUT: user record from DB, submitted credentials
  OUTPUT: boolean

  RETURN user.role = "admin"
     AND user.isActive = false
     AND passwordMatches(credentials.password, user.password)
END FUNCTION
```

**Examples:**
- Admin with `isActive: false` submits correct password → currently receives 200 + tokens (wrong).
- Admin with `isActive: true` submits correct password → receives 200 + tokens (correct, must be preserved).

---

### Bug 4 — `jwt.verify` Throws 500 on Refresh

After the DB token lookup succeeds, `jwt.verify(refreshToken, secret)` is called without a try/catch. If the JWT is expired (`TokenExpiredError`) or tampered (`JsonWebTokenError`), the exception propagates to the generic error handler, which returns 500.

**Formal Specification:**
```
FUNCTION isBugCondition_RefreshJWT(refreshToken)
  INPUT: refreshToken string
  OUTPUT: boolean

  tokenInDB ← Token.findOne({ token: refreshToken })
  RETURN tokenInDB IS NOT NULL
     AND jwt.verify(refreshToken, JWT_REFRESH_SECRET) THROWS Error
END FUNCTION
```

**Examples:**
- Token exists in DB but JWT is expired → `jwt.verify` throws `TokenExpiredError` → 500 (wrong, should be 401).
- Token exists in DB and JWT is valid → `jwt.verify` succeeds → 200 (correct, must be preserved).

---

### Bug 5 — Hardcoded API Base URL

`api.js` hardcodes `http://localhost:5000/api/v1` in two places: the axios `baseURL` and the inline `axios.post` call for token refresh. Deploying to staging or production silently points all requests to localhost.

**Formal Specification:**
```
FUNCTION isBugCondition_HardcodedURL(env)
  INPUT: runtime environment
  OUTPUT: boolean

  RETURN import.meta.env.VITE_API_URL IS DEFINED
     AND axios_baseURL = "http://localhost:5000/api/v1"
END FUNCTION
```

**Examples:**
- `VITE_API_URL=https://api.prod.example.com` set in `.env.production` → axios still calls `localhost:5000` (wrong).
- `VITE_API_URL` not set → fallback to `http://localhost:5000/api/v1` is acceptable for local dev.

---

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Active admin login with correct credentials continues to return 200 + tokens (Req 3.1).
- OTP request for distributors/retailers continues to generate, persist, and email a 6-digit OTP (Req 3.2).
- Valid OTP verification continues to return 200 + tokens (Req 3.3).
- Customer auto-creation on first OTP verify continues to work (Req 3.4).
- Valid, non-expired refresh token continues to rotate and return new tokens (Req 3.5).
- Protected routes with valid Bearer tokens continue to authenticate correctly (Req 3.6).
- Logout continues to delete the token record and return 200 (Req 3.7).
- Frontend 401 interceptor continues to attempt refresh and retry (Req 3.8).

**Scope:**
All inputs that do NOT match any of the five bug conditions above must be completely unaffected by these fixes.

---

## Hypothesized Root Cause

1. **Bug 1 — CORS**: Developer called `app.use(cors())` without reading the `cors` package docs on credentialed requests. No `.env` variable for allowed origins was wired up.

2. **Bug 2 — OTP_EXPIRY**: The `.env` file uses an inline comment (`5 # Minutes`) which `dotenv` does not strip. The value is used directly in arithmetic without `parseInt()`.

3. **Bug 3 — isActive**: The `protect` middleware checks `isActive`, giving a false sense of security. The `adminLogin` handler was written assuming the middleware would catch it, but the middleware only runs on subsequent requests — not on the login endpoint itself.

4. **Bug 4 — jwt.verify 500**: The outer `try/catch` in `refreshToken` catches DB errors but `jwt.verify` is a synchronous throw that is not separately handled. The developer likely assumed the DB expiry check (`tokenDoc.expiresAt < Date.now()`) would always catch expired tokens, but the JWT can expire independently of the DB record's `expiresAt`.

5. **Bug 5 — Hardcoded URL**: The axios instance was set up during initial development pointing to localhost and was never updated to use the Vite env variable pattern.

---

## Correctness Properties

Property 1: Bug Condition — CORS Headers on Credentialed Requests

_For any_ cross-origin request where the bug condition holds (Origin header present, credentials required), the fixed backend SHALL respond with `Access-Control-Allow-Origin` matching the request origin and `Access-Control-Allow-Credentials: true`.

**Validates: Requirements 2.1**

Property 2: Bug Condition — OTP Expiry Date is Valid

_For any_ call to `requestOTP` where `process.env.OTP_EXPIRY` contains a non-numeric suffix (isBugCondition_OTPExpiry returns true), the fixed controller SHALL store a valid future `Date` as `expiresAt` by using `parseInt(process.env.OTP_EXPIRY)`.

**Validates: Requirements 2.2, 2.3**

Property 3: Bug Condition — Deactivated Admin Denied

_For any_ admin login attempt where `user.isActive === false` and credentials are correct (isBugCondition_AdminActive returns true), the fixed handler SHALL return 403 and SHALL NOT issue any tokens.

**Validates: Requirements 2.4**

Property 4: Bug Condition — Expired JWT on Refresh Returns 401

_For any_ refresh request where the token exists in the DB but `jwt.verify` throws (isBugCondition_RefreshJWT returns true), the fixed handler SHALL return 401 and SHALL NOT return 500.

**Validates: Requirements 2.5**

Property 5: Bug Condition — API Base URL Reads from Environment

_For any_ frontend environment where `import.meta.env.VITE_API_URL` is defined, the fixed `api.js` SHALL use that value as the axios `baseURL` instead of the hardcoded localhost string.

**Validates: Requirements 2.6**

Property 6: Preservation — All Correct Auth Flows Unchanged

_For any_ input where none of the five bug conditions hold (valid CORS origin, numeric OTP_EXPIRY, active admin, valid JWT on refresh, correct env var), the fixed code SHALL produce exactly the same behaviour as the original code.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8**

---

## Fix Implementation

### Bug 1 — `backend/src/app.js`

**Function**: `app.use(cors())`

**Change**: Replace the bare `cors()` call with a configured options object.

```js
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
```

Also add `CORS_ORIGIN` to `backend/.env` for production use.

---

### Bug 2 — `backend/src/modules/auth/controllers/auth.controller.js`

**Function**: `exports.requestOTP`

**Change**: Wrap `process.env.OTP_EXPIRY` with `parseInt()` wherever it is used in arithmetic.

```js
// Before
const expiresAt = new Date(Date.now() + process.env.OTP_EXPIRY * 60 * 1000);

// After
const expiresAt = new Date(Date.now() + parseInt(process.env.OTP_EXPIRY) * 60 * 1000);
```

The email template string reference `${process.env.OTP_EXPIRY}` should also use `parseInt()` to display the clean number, but this is cosmetic.

---

### Bug 3 — `backend/src/modules/auth/controllers/auth.controller.js`

**Function**: `exports.adminLogin`

**Change**: Add an `isActive` check after the role/password validation.

```js
if (!user.isActive) {
  return ApiResponse.error(res, "This account has been deactivated", 403);
}
```

Insert this block after the `isMatch` check and before `signTokens`.

---

### Bug 4 — `backend/src/modules/auth/controllers/auth.controller.js`

**Function**: `exports.refreshToken`

**Change**: Wrap `jwt.verify` in its own try/catch returning 401.

```js
let decoded;
try {
  decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
} catch (err) {
  await Token.deleteOne({ _id: tokenDoc._id });
  return ApiResponse.error(res, "Invalid or expired refresh token", 401);
}
```

---

### Bug 5 — `frontend/src/core/api.js`

**Change**: Replace both hardcoded `http://localhost:5000/api/v1` strings with `import.meta.env.VITE_API_URL`.

```js
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  ...
});

// and in the refresh interceptor:
const response = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
```

---

## Testing Strategy

### Validation Approach

Two-phase: first run exploratory tests against the unfixed code to confirm the bug manifests as described, then verify the fix and run preservation checks.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples on unfixed code to confirm root cause analysis.

**Test Cases**:
1. **CORS preflight** — send an `OPTIONS` request with `Origin: http://localhost:5173` and `Access-Control-Request-Headers: Authorization`; assert the response lacks `Access-Control-Allow-Credentials: true` (will fail on unfixed code).
2. **OTP expiry arithmetic** — call `requestOTP` with `OTP_EXPIRY="5 # Minutes"` and inspect the saved `expiresAt`; assert it is `Invalid Date` (will fail on unfixed code).
3. **Deactivated admin login** — call `adminLogin` with a deactivated admin's valid credentials; assert the response is NOT 200 (will fail on unfixed code — currently returns 200).
4. **Expired JWT refresh** — insert a token record with a valid DB entry but an expired JWT; call `refreshToken`; assert status is 401 not 500 (will fail on unfixed code).
5. **Hardcoded URL** — inspect `api.js` source; assert `baseURL` is not a literal string (will fail on unfixed code).

**Expected Counterexamples**:
- CORS: missing `Access-Control-Allow-Credentials` header.
- OTP: `expiresAt` field is `Invalid Date`.
- Admin: 200 response with tokens for deactivated account.
- Refresh: 500 response body from generic error handler.
- URL: literal `http://localhost:5000` in source.

### Fix Checking

```
FOR ALL request WHERE isBugCondition_CORS(request) DO
  response ← backend'(request)
  ASSERT response.headers["Access-Control-Allow-Credentials"] = "true"
END FOR

FOR ALL envValue WHERE isBugCondition_OTPExpiry(envValue) DO
  expiresAt ← requestOTP'(envValue)
  ASSERT isValidDate(expiresAt) AND expiresAt > Date.now()
END FOR

FOR ALL (user, creds) WHERE isBugCondition_AdminActive(user, creds) DO
  response ← adminLogin'(creds)
  ASSERT response.statusCode = 403
END FOR

FOR ALL token WHERE isBugCondition_RefreshJWT(token) DO
  response ← refreshToken'(token)
  ASSERT response.statusCode = 401
END FOR
```

### Preservation Checking

```
FOR ALL request WHERE NOT isBugCondition_CORS(request) DO
  ASSERT backend(request) = backend'(request)
END FOR

FOR ALL (user, creds) WHERE NOT isBugCondition_AdminActive(user, creds) DO
  ASSERT adminLogin(creds) = adminLogin'(creds)
END FOR

FOR ALL token WHERE NOT isBugCondition_RefreshJWT(token) DO
  ASSERT refreshToken(token) = refreshToken'(token)
END FOR
```

### Unit Tests

- Test `cors` config: verify `credentials: true` and correct `origin` in response headers.
- Test `parseInt(OTP_EXPIRY)` with `"5 # Minutes"` → `5`; verify `expiresAt` is a valid future date.
- Test `adminLogin` with `isActive: false` → 403; with `isActive: true` → 200.
- Test `refreshToken` with expired JWT → 401; with valid JWT → 200.
- Test `api.js` `BASE_URL` resolves from `import.meta.env.VITE_API_URL`.

### Property-Based Tests

- Generate random `OTP_EXPIRY` strings with arbitrary suffixes; assert `parseInt` always yields a valid number and `expiresAt` is always a valid future date.
- Generate random admin user states (`isActive: true/false`) and credential pairs; assert deactivated admins always get 403.
- Generate random JWT payloads (expired, tampered, valid); assert `refreshToken` endpoint never returns 500.

### Integration Tests

- Full OTP login flow (request → verify → protected route) succeeds end-to-end.
- Active admin login → protected admin route succeeds.
- Deactivated admin login → 403, no token issued.
- Expired refresh token → 401, frontend redirects to login.
- Frontend deployed with `VITE_API_URL` set → all requests go to the configured URL.
