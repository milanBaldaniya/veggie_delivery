# Google Sign-In setup (via Firebase Auth)

The app logs customers in with Google, using **Firebase Authentication** as
the identity layer: the native Google account picker still runs on-device,
but the token the backend verifies is a Firebase ID token, verified with the
Firebase Admin SDK — not a raw Google OAuth token checked by hand.

The code is wired up, but it needs a Firebase project, native config, and
real credentials before it will run. Follow these steps once.

## 1. Create a Firebase project

In the [Firebase Console](https://console.firebase.google.com/), create a
project (or reuse an existing one) and add:

- An **Android app** — package name `com.veggiedeliverytemp` (see
  `android/app/build.gradle` → `applicationId`). Add the debug **and** release
  SHA-1 fingerprints under Project Settings → Your apps, since Google Sign-In
  on Android needs them:

  ```bash
  cd mobile/android && ./gradlew signingReport
  # copy the SHA1 under Variant: debug (and release before shipping)
  ```

- An **iOS app** — bundle identifier matching the Xcode project.

Then, in **Authentication → Sign-in method**, enable the **Google** provider.
Enabling it auto-creates a **Web client ID** — that's the one this app uses
as `webClientId` (Google Sign-In on both Android and iOS mints its ID token
against that audience). Note it down; you'll also find the iOS client ID
under the iOS app's config.

## 2. Backend — Firebase Admin SDK

In **Project Settings → Service Accounts**, click **Generate new private
key**. Save the downloaded JSON as `backend/firebase-service-account.json`
(this path is git-ignored — never commit it).

```
# backend/.env
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

Then install the new dependency:

```bash
cd backend && npm install
```

## 3. Mobile config

Put the Web and iOS client IDs (from step 1) in
[src/constants/config.js](src/constants/config.js):

```js
export const GOOGLE_WEB_CLIENT_ID = '<web-client-id>.apps.googleusercontent.com';
export const GOOGLE_IOS_CLIENT_ID = '<ios-client-id>.apps.googleusercontent.com';
```

Install the native modules:

```bash
cd mobile && npm install
```

### Android

1. Download `google-services.json` from the Firebase Console (Android app →
   config file) and place it at `mobile/android/app/google-services.json`.
   The Google Services Gradle plugin that reads it is already applied
   (`android/build.gradle` classpath + `android/app/build.gradle` plugin).

### iOS

1. Download `GoogleService-Info.plist` from the Firebase Console (iOS app →
   config file) and add it to the Xcode project (`ios/<App>/`), making sure
   it's included in the app target.
2. Add the **iOS URL scheme** (the reversed iOS client ID, found inside
   `GoogleService-Info.plist` as `REVERSED_CLIENT_ID`) to
   `ios/<App>/Info.plist` under `CFBundleURLTypes`.
3. Install pods:

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

## How it works

1. Mobile launches the native Google account picker
   (`@react-native-google-signin/google-signin`) and gets back a Google ID
   token.
2. Mobile exchanges that for a Firebase credential
   (`@react-native-firebase/auth`'s `GoogleAuthProvider.credential` +
   `signInWithCredential`), then reads the resulting **Firebase ID token**.
3. Mobile sends the Firebase ID token to `POST /auth/google`.
4. Backend verifies it with the Firebase Admin SDK
   (`admin.auth().verifyIdToken`), finds/creates a `User` by `firebaseUid`/
   email, and issues our own JWT access/refresh pair — the rest of the app's
   auth (middleware, refresh, `/auth/me`) is unchanged.
