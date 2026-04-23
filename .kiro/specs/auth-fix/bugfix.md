# Bugfix Requirements Document

## Introduction

The authentication system in this full-stack app (React + Node.js/Express) is broken across multiple failure points. Users cannot log in via OTP (distributors, retailers, customers) or via password (admins). The failures stem from four distinct bugs: a CORS misconfiguration that blocks credentialed cross-origin requests, an inline comment in the `.env` file that corrupts the `OTP_EXPIRY` value causing `NaN`-based date arithmetic, a missing `isActive` check in the admin password login flow, and an unhandled `jwt.verify` exception in the token refresh endpoint that returns a 500 instead of a clean 401. Additionally, the frontend `api.js` hardcodes the API base URL instead of reading from the environment variable, making the config unmanageable across environments.

---

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the frontend sends any authenticated or cross-origin request to the backend THEN the system rejects the request with a CORS error because `cors()` is called with no configuration, providing no `origin` allowlist and no `credentials: true` support

1.2 WHEN a user requests an OTP THEN the system stores `Invalid Date` as `expiresAt` in the OTP record because `process.env.OTP_EXPIRY` resolves to `"5 # Minutes"` (due to an inline comment in `.env`), making the multiplication `NaN`

1.3 WHEN the OTP expiry check runs against an OTP record with `Invalid Date` as `expiresAt` THEN the system evaluates `Invalid Date < Date.now()` as `false` (NaN comparison), meaning OTPs never expire and the TTL index receives an invalid date

1.4 WHEN an admin with `isActive: false` submits valid credentials to `POST /api/v1/auth/admin/login` THEN the system grants them an access token and refresh token, bypassing the active-account check that the `protect` middleware enforces on every subsequent request

1.5 WHEN a client sends an expired or invalid refresh token to `POST /api/v1/auth/refresh` and the token exists in the database but the JWT itself is expired THEN the system returns a 500 Internal Server Error because `jwt.verify()` throws inside the controller and the error propagates to the generic error handler instead of returning a 401

1.6 WHEN the frontend `api.js` is deployed to a non-local environment THEN the system always points to `http://localhost:5000/api/v1` because the base URL is hardcoded and `VITE_API_URL` from the environment is never read

---

### Expected Behavior (Correct)

2.1 WHEN the frontend sends any cross-origin request (including those with `Authorization` headers) to the backend THEN the system SHALL respond with the correct CORS headers by configuring `cors()` with an explicit `origin` allowlist and `credentials: true`

2.2 WHEN a user requests an OTP THEN the system SHALL store a valid `Date` object as `expiresAt` by parsing only the numeric portion of `OTP_EXPIRY` (e.g., `parseInt(process.env.OTP_EXPIRY)`) so that `Date.now() + 5 * 60 * 1000` evaluates correctly

2.3 WHEN the OTP expiry check runs THEN the system SHALL correctly evaluate whether the OTP has expired and SHALL reject expired OTPs with a 400 response

2.4 WHEN an admin with `isActive: false` submits valid credentials to `POST /api/v1/auth/admin/login` THEN the system SHALL return a 403 Forbidden response and SHALL NOT issue any tokens

2.5 WHEN a client sends a refresh token whose JWT signature is valid but the token is expired THEN the system SHALL return a 401 Unauthorized response with a clear message, not a 500 error

2.6 WHEN the frontend `api.js` initialises the axios instance THEN the system SHALL read the base URL from `import.meta.env.VITE_API_URL` so that the API endpoint is configurable per environment

---

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a valid admin submits correct email and password to `POST /api/v1/auth/admin/login` and their account is active THEN the system SHALL CONTINUE TO return a 200 response with `accessToken`, `refreshToken`, and user data

3.2 WHEN a distributor or retailer submits a valid email to `POST /api/v1/auth/request-otp` THEN the system SHALL CONTINUE TO generate a 6-digit OTP, persist it, and send it via email

3.3 WHEN a user submits a correct, non-expired OTP to `POST /api/v1/auth/verify-otp` THEN the system SHALL CONTINUE TO return a 200 response with `accessToken`, `refreshToken`, and user data

3.4 WHEN a customer submits a valid OTP for the first time THEN the system SHALL CONTINUE TO auto-create a new customer user record and return tokens

3.5 WHEN a valid, non-expired refresh token is submitted to `POST /api/v1/auth/refresh` THEN the system SHALL CONTINUE TO rotate the refresh token and return a new `accessToken` and `refreshToken`

3.6 WHEN a request with a valid `Bearer` access token hits a protected route THEN the system SHALL CONTINUE TO authenticate the user and allow access

3.7 WHEN a user calls `POST /api/v1/auth/logout` with a refresh token THEN the system SHALL CONTINUE TO delete the token record and return a 200 success response

3.8 WHEN the frontend detects a 401 response on a protected API call THEN the system SHALL CONTINUE TO attempt a token refresh and retry the original request before redirecting to login

---

## Bug Condition Pseudocode

### Bug 1 — CORS Misconfiguration

```pascal
FUNCTION isBugCondition_CORS(request)
  INPUT: request with Origin header from frontend domain
  OUTPUT: boolean

  RETURN request.origin IS NOT NULL
     AND cors_config.credentials = false
     AND cors_config.origin = "*" OR cors_config.origin IS UNDEFINED
END FUNCTION

// Property: Fix Checking
FOR ALL request WHERE isBugCondition_CORS(request) DO
  response ← backend'(request)
  ASSERT response.headers["Access-Control-Allow-Origin"] = request.origin
  ASSERT response.headers["Access-Control-Allow-Credentials"] = "true"
END FOR

// Property: Preservation Checking
FOR ALL request WHERE NOT isBugCondition_CORS(request) DO
  ASSERT backend(request) = backend'(request)
END FOR
```

### Bug 2 — OTP_EXPIRY NaN

```pascal
FUNCTION isBugCondition_OTPExpiry(envValue)
  INPUT: envValue = process.env.OTP_EXPIRY as string
  OUTPUT: boolean

  RETURN isNaN(Number(envValue))  // e.g. "5 # Minutes" → NaN
END FUNCTION

// Property: Fix Checking
FOR ALL envValue WHERE isBugCondition_OTPExpiry(envValue) DO
  parsed ← parseInt(envValue)
  expiresAt ← Date.now() + parsed * 60 * 1000
  ASSERT isValidDate(expiresAt)
  ASSERT expiresAt > Date.now()
END FOR
```

### Bug 3 — Admin isActive Not Checked

```pascal
FUNCTION isBugCondition_AdminActive(user, credentials)
  INPUT: user record, submitted credentials
  OUTPUT: boolean

  RETURN user.role = "admin"
     AND user.isActive = false
     AND passwordMatches(credentials.password, user.password)
END FUNCTION

// Property: Fix Checking
FOR ALL (user, credentials) WHERE isBugCondition_AdminActive(user, credentials) DO
  response ← adminLogin'(credentials)
  ASSERT response.statusCode = 403
  ASSERT response.data.accessToken IS NULL
END FOR
```

### Bug 4 — jwt.verify Throws 500 on Refresh

```pascal
FUNCTION isBugCondition_RefreshJWT(refreshToken)
  INPUT: refreshToken string
  OUTPUT: boolean

  tokenInDB ← Token.findOne({ token: refreshToken })
  RETURN tokenInDB IS NOT NULL
     AND jwt.verify(refreshToken, JWT_REFRESH_SECRET) THROWS TokenExpiredError
END FUNCTION

// Property: Fix Checking
FOR ALL refreshToken WHERE isBugCondition_RefreshJWT(refreshToken) DO
  response ← refreshTokenEndpoint'(refreshToken)
  ASSERT response.statusCode = 401
  ASSERT response.statusCode ≠ 500
END FOR
```
