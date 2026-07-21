import { GOOGLE_WEB_CLIENT_ID, GOOGLE_IOS_CLIENT_ID } from '../constants/config';

// The native Google Sign-In module only exists once the app has been rebuilt
// after adding @react-native-google-signin/google-signin. If the running binary
// predates it, touching the module throws `RNGoogleSignin could not be found`.
// So we load and configure it *lazily and defensively* — importing this file
// must never crash the JS bundle, and logout must never throw.

let _module = null;
let _configured = false;

function loadModule() {
  if (_module) return _module;
  // eslint-disable-next-line global-require
  _module = require('@react-native-google-signin/google-signin');
  return _module;
}

function ensureConfigured() {
  const mod = loadModule();
  if (!_configured) {
    // `webClientId` is what makes Google mint an ID token the backend can
    // verify; `iosClientId` is required on iOS.
    mod.GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      iosClientId: GOOGLE_IOS_CLIENT_ID,
      offlineAccess: false,
    });
    _configured = true;
  }
  return mod;
}

/**
 * Launches the native Google account picker and returns the ID token for the
 * backend. Returns `null` if the user cancels. Throws a friendly error if the
 * native module isn't in the build yet (rebuild the app to fix).
 */
export async function signInWithGoogle() {
  let GoogleSignin;
  let statusCodes;
  try {
    ({ GoogleSignin, statusCodes } = ensureConfigured());
  } catch {
    throw new Error(
      'Google Sign-In is not available in this build. Rebuild the app after installing the Google module.'
    );
  }

  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  try {
    const response = await GoogleSignin.signIn();
    // v13 returns { type: 'success' | 'cancelled', data }; older shapes put the
    // token at the top level, so fall back to that.
    if (response?.type === 'cancelled') return null;
    const idToken = response?.data?.idToken ?? response?.idToken;
    if (!idToken) throw new Error('Google sign-in did not return an ID token');
    return idToken;
  } catch (err) {
    if (err?.code === statusCodes?.SIGN_IN_CANCELLED) return null;
    if (err?.code === statusCodes?.IN_PROGRESS) return null;
    throw err;
  }
}

/** Clears the cached Google session. A no-op if the native module is absent. */
export async function signOutFromGoogle() {
  try {
    const mod = ensureConfigured();
    await mod.GoogleSignin.signOut();
  } catch {
    // Native module missing, or no active session — nothing to clean up.
  }
}
