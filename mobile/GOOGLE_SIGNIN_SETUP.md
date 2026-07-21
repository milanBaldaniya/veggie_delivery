# Google Sign-In setup

The app now logs customers in with Google instead of phone/OTP. The code is
wired up, but Google Sign-In needs native config and real OAuth credentials
before it will run. Follow these steps once.

## 1. Create OAuth clients (Google Cloud Console)

In **Google Cloud Console → APIs & Services → Credentials**, on the project that
owns your Firebase/OAuth consent screen, create these OAuth 2.0 client IDs:

| Client type | Needed for | Notes |
|-------------|------------|-------|
| **Web application** | Backend token verification + the app's `webClientId` | This is the audience the backend checks. Required on both platforms. |
| **Android** | Android app | Provide the package name (`applicationId` in `android/app/build.gradle`) and the app's **SHA-1** fingerprint. |
| **iOS** | iOS app | Provide the iOS bundle identifier. |

Get the debug SHA-1:

```bash
cd mobile/android && ./gradlew signingReport
# copy the SHA1 under Variant: debug
```

Add the release SHA-1 too before shipping.

## 2. Backend env

Set every client ID whose tokens the backend should accept (comma-separated —
the Web client ID and the iOS client ID at minimum):

```
# backend/.env
GOOGLE_CLIENT_IDS=<web-client-id>.apps.googleusercontent.com,<ios-client-id>.apps.googleusercontent.com
```

Then install the new dependency:

```bash
cd backend && npm install
```

## 3. Mobile config

Put the Web and iOS client IDs in [src/constants/config.js](src/constants/config.js):

```js
export const GOOGLE_WEB_CLIENT_ID = '<web-client-id>.apps.googleusercontent.com';
export const GOOGLE_IOS_CLIENT_ID = '<ios-client-id>.apps.googleusercontent.com';
```

Install the native module:

```bash
cd mobile && npm install
```

### Android

1. Download `google-services.json` from Firebase (or configure the Google
   Sign-In plugin) and place it at `mobile/android/app/google-services.json`.
2. Ensure the Google Services Gradle plugin is applied (needed for
   `google-services.json`):
   - `android/build.gradle` → `dependencies { classpath 'com.google.gms:google-services:4.4.2' }`
   - `android/app/build.gradle` → add `apply plugin: 'com.google.gms.google-services'` at the bottom.

### iOS

1. Add the **iOS URL scheme** (the reversed iOS client ID) to
   `ios/<App>/Info.plist` under `CFBundleURLTypes`, e.g.
   `com.googleusercontent.apps.<ios-client-id>`.
2. Install pods:

   ```bash
   cd mobile/ios && pod install
   ```

## 4. Run

```bash
# terminal 1
cd backend && npm run dev
# terminal 2
cd mobile && npm run android   # or: npm run ios
```

Tap **Continue with Google**, pick an account, and you'll land on the profile
setup screen (name, **phone**, delivery address) the first time — Google doesn't
give us a phone number, so it's collected there for delivery.

## What changed in the code

- **Backend**: `POST /auth/google` (was `/auth/send-otp` + `/auth/verify-otp`)
  verifies the Google ID token via `google-auth-library`, then finds/creates a
  user by `googleId`/email and issues the same JWT pair. OTP service, SMS
  provider, and OTP model fields were removed. `updateMe` now accepts a `phone`,
  and a profile is "complete" only with name + phone + address.
- **Mobile**: `LoginScreen` is a single **Continue with Google** button; the OTP
  verify screen/route is gone. `ProfileSetupScreen` gained a phone field. Login
  state lives under `auth.loginStatus` / `auth.loginError`.
