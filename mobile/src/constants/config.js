import { Platform } from 'react-native';

// Release builds always hit the live backend. In debug builds, Android
// emulator can't reach "localhost" on the host machine — use 10.0.2.2 there;
// iOS simulator can use localhost directly. A physical device needs your
// machine's LAN IP instead of either. Port 5001: macOS reserves 5000 for the
// AirPlay Receiver.
const LIVE_API_BASE_URL = 'https://veggie-delivery-rs0y.onrender.com/api/v1';
const LOCAL_API_BASE_URL = `http://${Platform.OS === 'android' ? '10.0.2.2' : 'localhost'}:5001/api/v1`;

export const API_BASE_URL = __DEV__ ? LOCAL_API_BASE_URL : LIVE_API_BASE_URL;

// Google Sign-In OAuth client IDs (Google Cloud Console → Credentials).
// webClientId is the *Web* client ID — Google Sign-In on both Android and iOS
// uses it as the token audience so the backend can verify the ID token.
// iosClientId is the iOS OAuth client ID (needed on iOS only).
export const GOOGLE_WEB_CLIENT_ID = '587202000045-5750gd6ncqknr8ksluqm2kbajb736df7.apps.googleusercontent.com';
export const GOOGLE_IOS_CLIENT_ID = 'your-ios-client-id.apps.googleusercontent.com';
