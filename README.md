# Veggie Delivery Platform

Monorepo: `backend/` (Node/Express/MongoDB REST API) + `mobile/` (React Native app, JavaScript only, role-based CUSTOMER/ADMIN navigation).

Architecture, DB schema, API contract, navigation/redux design and the phase-by-phase roadmap are in the approved plan:
`C:\Users\DELL\.claude\plans\clever-fluttering-lark.md`

## Prerequisites (not yet installed on this machine)

1. **Node.js 18+ LTS** — required for everything below.
2. **MongoDB** (local install or a free Atlas cluster) — for the backend.
3. **React Native environment** — Android Studio (Android SDK + emulator) and/or Xcode (macOS only, for iOS). See the official RN "Environment Setup" guide for your OS once Node is installed.

## Backend setup

```powershell
cd backend
npm install
copy .env.example .env      # then edit MONGO_URI / JWT secrets
npm run dev                  # starts on http://localhost:5000, health check at /api/v1/health
```

## Mobile setup

The `mobile/src` folder (screens, navigation, redux, theme, components) is already written. What's **not** present yet are the generated native `android/` and `ios/` project folders — those are boilerplate that must come from the React Native CLI, not be hand-authored. Generate them once Node + the RN environment are set up:

```powershell
# 1. Scaffold a throwaway RN project of the same version to harvest android/ + ios/
cd C:\Users\DELL\Projects\veggie-delivery
npx @react-native-community/cli init VeggieDeliveryTemp --version 0.75.4 --skip-install

# 2. Copy the native folders into our real mobile project
Move-Item VeggieDeliveryTemp\android mobile\android
Move-Item VeggieDeliveryTemp\ios mobile\ios
Remove-Item -Recurse -Force VeggieDeliveryTemp

# 3. Install dependencies for the real project
cd mobile
npm install

# 4. Run it
npm run android    # or: npm run ios (macOS only)
```

In the copied `android/app/src/main/res/values/strings.xml` and `android/settings.gradle` / `ios/*.xcodeproj`, the app name should already read `VeggieDelivery` since we passed matching values in `app.json` — double check it matches before your first build.

## Creating your first admin account

There is no admin sign-up endpoint by design — this is a single-vendor app, not a marketplace, so every phone number that goes through `/auth/send-otp` → `/auth/verify-otp` is auto-created as a plain `CUSTOMER`. To get an `ADMIN` account:

1. Verify your own phone number once through the normal app flow (Login → OTP → Profile Setup) so the `User` document exists.
2. Open the `users` collection in Compass and edit that document's `role` field from `CUSTOMER` to `ADMIN`.
3. Log out and back in (or just restart the app) — the root navigator reads `role` fresh from `/auth/me` on launch and will switch you into the Admin tab navigator.

## Project structure

See the plan document for the full annotated tree. High level:

```
backend/src/{config,models,controllers,routes,services,middlewares,validators,utils,jobs}
mobile/src/{api,components,constants,hooks,navigation,redux,screens,services,theme,utils}
```

## Status

Phase 0 (scaffolding) complete: Express app skeleton with health check, error handling, and env config; RN app with theme, shared component kit, Redux store (auth + ui slices, persisted), and a fully wired navigation shell (Root → Auth/Customer/Admin) using placeholder screens.

Phase 1 (auth end-to-end) code complete, **not yet live-verified against a running MongoDB** (none installed on this machine yet):
- Backend: `User` model; `smsProvider` interface + console/log stub; `otpService` (generate/hash/verify, resend cooldown, attempt limit); `tokenService` (JWT access+refresh); `verifyJWT`/`requireRole` middlewares; `POST /auth/send-otp`, `POST /auth/verify-otp`, `POST /auth/refresh-token`, `GET /auth/me`, `GET|PUT /customers/me`.
- Mobile: real Login (phone) → OtpVerify → ProfileSetup (name only for now — building/wing/flat picker comes in Phase 2) screens; `authSlice` thunks wired to the API; `RootNavigator` now gates on `isAuthenticated && isProfileComplete` before mounting the role's tab navigator.
- `node ./src/app.js` require-time check passes (no syntax/import errors); full request/response smoke test is pending a local MongoDB — once it's running, ask to verify Phase 1 and it'll be exercised end-to-end (send-otp → verify-otp → me → profile update → refresh-token, plus the auth-guard rejection cases).

A code-review pass on 2026-07-12 fixed real gaps across both the auth flow and the Phase 0 shared component kit:
- `verifyJWT` no longer leaks a raw Mongoose `CastError` as a 400 for a malformed token `sub` (now a clean 401).
- The mobile "Resend OTP" button now surfaces failures instead of failing silently; added a "Change number" link on OtpVerify that was missing its wiring (`resetOtpFlow` existed but nothing dispatched it).
- App launch now dispatches `fetchMe()` to revalidate a persisted session (catches an in-the-meantime disabled account or expired token).
- `ListItem` was passing a Pressable-only style *function* to a plain `View` whenever `onPress` was omitted — `View` doesn't support that form, so every non-interactive row was silently losing all its layout/padding styling. Not yet triggered (nothing consumes `ListItem` until Phase 2+), but a real bug in existing Phase 0 code.
- `Header` only compensated for Android's status bar (`StatusBar.currentHeight`); on iOS it had no top inset at all, so content would render under the notch/dynamic island. Now uses `useSafeAreaInsets()` on iOS. Also not yet triggered (`Header` isn't consumed by any screen yet).
- `User.phone` had both `unique: true` and `index: true` — `unique` already builds an index, so the pair triggers Mongoose's "Duplicate schema index" warning at connect time. Removed the redundant `index: true`.

One intentional deviation from the plan doc's literal wording: the API contract says verify-otp "auto-creates User ... if not exists," but the `User` document is actually created at **send-otp** time (unverified, so the OTP hash has somewhere to live) — verify-otp only flips `isPhoneVerified`. Observable API behavior is unchanged; flag if you'd rather it matched the doc literally.

Next: install MongoDB locally, then live-verify Phase 1, then start Phase 2 — Buildings/Wings/Flats.
