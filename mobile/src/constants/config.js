// Update per environment. Android emulator can't reach "localhost" on the
// host machine — use 10.0.2.2 there; iOS simulator can use localhost directly;
// a physical device needs your machine's LAN IP.
// Port 5001: macOS reserves 5000 for the AirPlay Receiver.
export const API_BASE_URL = 'http://localhost:5001/api/v1';

// Google Sign-In OAuth client IDs (Google Cloud Console → Credentials).
// webClientId is the *Web* client ID — Google Sign-In on both Android and iOS
// uses it as the token audience so the backend can verify the ID token.
// iosClientId is the iOS OAuth client ID (needed on iOS only).
export const GOOGLE_WEB_CLIENT_ID = 'your-web-client-id.apps.googleusercontent.com';
export const GOOGLE_IOS_CLIENT_ID = 'your-ios-client-id.apps.googleusercontent.com';
