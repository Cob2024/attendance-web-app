# TDD Evidence Report: Password Reset via SMS / Email OTP

**Feature**: Password Reset for Lecturers and Students with Verification Code (SMS or Email)  
**Date**: 2026-10-20  
**Source Plan**: [password-reset.plan.md](file:///c:/Users/hp/Downloads/Attendance%20Management%20System/.claude/plans/password-reset.plan.md)  
**Workflow**: Test-Driven Development (`tdd-workflow`)  
**Status**: PASSED (GREEN)  

---

## 1. User Journeys Covered

- **Journey 1 (Student / Lecturer Request)**:
  *As a student or lecturer who forgot my password, I want to request a 6-digit OTP code sent to my institutional email or mobile phone, so that I can securely verify my identity without administrator intervention.*
- **Journey 2 (Role-Based Access Control)**:
  *As an institutional security administrator, I want admin accounts to be blocked from public password reset, so that critical administrative privileges cannot be compromised via public web forms.*
- **Journey 3 (Tamper-Proof Verification)**:
  *As a user entering a 6-digit verification code, I want the code to be validated against an expiring session token, so that expired or guessing attempts are rejected.*
- **Journey 4 (Credential Update & Instant Login)**:
  *As a verified user, I want to set a new password that immediately invalidates my old credentials and allows me to sign in seamlessly.*

---

## 2. TDD Red/Green Execution Summary

### Step 3: RED Phase (Reproducer Tests Added)
- **Test File**: [`server/src/__tests__/passwordReset.test.ts`](file:///c:/Users/hp/Downloads/Attendance%20Management%20System/server/src/__tests__/passwordReset.test.ts)
- **Validation Command**: `npm --prefix server test -- passwordReset.test.ts`
- **Output Excerpt**:
  ```text
  FAIL src/__tests__/passwordReset.test.ts
    Password Reset API (TDD)
      POST /api/auth/forgot-password
        × should reject request missing required fields (Received: 404, Expected: 400)
        × should reject invalid channel (Received: 404, Expected: 400)
        × should block admin role from public password reset (Received: 404, Expected: 403)
        ...
    Tests: 13 failed, 13 total
  ```
- **Checkpoint Commit**: `a7aed5ec` (*test: add reproducer tests for password reset via SMS and Email OTP (RED phase)*)

### Step 5: GREEN Phase (Implementation Complete)
- **Implementation Files**:
  - [`server/src/services/otpService.ts`](file:///c:/Users/hp/Downloads/Attendance%20Management%20System/server/src/services/otpService.ts)
  - [`server/src/routes/authRoutes.ts`](file:///c:/Users/hp/Downloads/Attendance%20Management%20System/server/src/routes/authRoutes.ts)
- **Validation Command**: `npm --prefix server test -- passwordReset.test.ts`
- **Output Excerpt**:
  ```text
  PASS src/__tests__/passwordReset.test.ts (10.56 s)
    Password Reset API (TDD)
      POST /api/auth/forgot-password
        √ should reject request missing required fields (84 ms)
        √ should reject invalid channel (13 ms)
        √ should block admin role from public password reset (11 ms)
        √ should return 404 for non-existent student or lecturer (1703 ms)
        √ should successfully generate and dispatch OTP code for student via email (316 ms)
        √ should successfully generate and dispatch OTP code for lecturer via sms/email (247 ms)
      POST /api/auth/verify-reset-code
        √ should reject request missing code or resetSessionToken (11 ms)
        √ should reject invalid 6-digit code (327 ms)
        √ should reject tampered or corrupted resetSessionToken (12 ms)
        √ should accept correct 6-digit code and issue verifiedResetToken (358 ms)
      POST /api/auth/reset-password
        √ should reject request missing newPassword or verifiedResetToken (12 ms)
        √ should reject short passwords (< 6 characters) (346 ms)
        √ should successfully update password and permit login with the new password (2962 ms)

  Test Suites: 1 passed, 1 total
  Tests:       13 passed, 13 total
  ```
- **Checkpoint Commit**: `0c2e21c6` (*feat(auth): implement password reset with SMS/Email OTP (GREEN phase)*)

---

## 3. Guarantees & Test Specification

| # | What is Guaranteed | Test Target | Test Type | Result | Evidence |
|---|-------------------|-------------|-----------|--------|----------|
| 1 | Missing fields (identifier/channel/role) rejected with HTTP 400 | `POST /api/auth/forgot-password` | Integration | PASS | Supertest assertion on `res.status === 400` |
| 2 | Invalid delivery channel (not email or sms) rejected with HTTP 400 | `POST /api/auth/forgot-password` | Integration | PASS | Supertest assertion on `error: /channel must be either email or sms/i` |
| 3 | Admin accounts strictly blocked from public self-service reset | `POST /api/auth/forgot-password` | Security | PASS | Supertest assertion on `res.status === 403` |
| 4 | Non-existent accounts return HTTP 404 without leaking user data | `POST /api/auth/forgot-password` | Security | PASS | Supertest assertion on `res.status === 404` |
| 5 | Valid student email generates 6-digit OTP & signs 15-min JWT session token | `POST /api/auth/forgot-password` | Integration | PASS | Supertest assertion on `res.body.resetSessionToken` |
| 6 | Valid lecturer email/phone generates OTP & signs session token | `POST /api/auth/forgot-password` | Integration | PASS | Supertest assertion on `res.body.resetSessionToken` |
| 7 | Verification endpoint requires both code and resetSessionToken | `POST /api/auth/verify-reset-code` | Validation | PASS | Supertest assertion on `res.status === 400` |
| 8 | Wrong 6-digit code rejected with HTTP 400 | `POST /api/auth/verify-reset-code` | Security | PASS | Supertest assertion on `error: /invalid.*code/i` |
| 9 | Corrupted/tampered JWT resetSessionToken rejected | `POST /api/auth/verify-reset-code` | Security | PASS | Supertest assertion on `error: /invalid.*session/i` |
| 10 | Matching 6-digit code issues signed `verifiedResetToken` | `POST /api/auth/verify-reset-code` | Integration | PASS | Supertest assertion on `res.body.verifiedResetToken` |
| 11 | Reset endpoint requires newPassword & verifiedResetToken | `POST /api/auth/reset-password` | Validation | PASS | Supertest assertion on `res.status === 400` |
| 12 | Passwords under 6 characters rejected with HTTP 400 | `POST /api/auth/reset-password` | Validation | PASS | Supertest assertion on `error: /at least 6 characters/i` |
| 13 | Password updated with bcrypt salt 12, allowing immediate login with new credentials | Full Flow (End-to-End API) | Integration | PASS | Supertest login check with new password returns HTTP 200 + JWT |

---

## 4. Frontend Integration & Verification

1. **Frontend API & Offline Mock**:
   - [`src/app/services/apiData.ts`](file:///c:/Users/hp/Downloads/Attendance%20Management%20System/src/app/services/apiData.ts): `requestPasswordResetApi`, `verifyResetCodeApi`, `resetPasswordApi`.
   - [`src/app/services/mockData.ts`](file:///c:/Users/hp/Downloads/Attendance%20Management%20System/src/app/services/mockData.ts): Client-side mock handlers with localStorage password persistence for offline development.
2. **Interactive UI Component**:
   - [`src/app/components/ForgotPasswordModal.tsx`](file:///c:/Users/hp/Downloads/Attendance%20Management%20System/src/app/components/ForgotPasswordModal.tsx): 3-step modal with Motion transitions, countdown timer (15:00), resend OTP action, and password visibility toggles.
   - [`src/app/pages/Login.tsx`](file:///c:/Users/hp/Downloads/Attendance%20Management%20System/src/app/pages/Login.tsx): Sleek "Forgot Password?" trigger on the sign-in form.
3. **Build & Test Verification**:
   - Frontend Production Build: `npm run build` -> **0 errors, 2931 modules transformed**.
   - Backend Production Build: `npm --prefix server run build` (`tsc`) -> **0 errors**.
   - Backend Full Test Suite: `npm --prefix server test` -> **4/4 suites passed, 43/43 tests passed (100%)**.
