import { GOOGLE_WEB_CLIENT_ID, GOOGLE_IOS_CLIENT_ID } from '../constants/config';

// The native Google Sign-In and Firebase modules only exist once the app has
// been rebuilt after adding @react-native-google-signin/google-signin and
// @react-native-firebase/{app,auth}. If the running binary predates them,
// touching the modules throws. So we load and configure them *lazily and
// defensively* — importing this file must never crash the JS bundle, and
// logout must never throw.

let _googleSignin = null;
let _firebaseAuthApi = null;
let _authInstance = null;
let _configured = false;

function loadModules() {
  if (_googleSignin && _firebaseAuthApi) return { googleSignin: _googleSignin, firebaseAuthApi: _firebaseAuthApi };
  // eslint-disable-next-line global-require
  _googleSignin = require('@react-native-google-signin/google-signin');
  // Modular API (namespaced `firebase.auth()` style is deprecated as of
  // @react-native-firebase v21 and removed in v22).
  // eslint-disable-next-line global-require
  const { getApp } = require('@react-native-firebase/app');
  // eslint-disable-next-line global-require
  _firebaseAuthApi = require('@react-native-firebase/auth');
  _authInstance = _firebaseAuthApi.getAuth(getApp());
  return { googleSignin: _googleSignin, firebaseAuthApi: _firebaseAuthApi };
}

function ensureConfigured() {
  const mods = loadModules();
  if (!_configured) {
    // `webClientId` is what makes Google mint an ID token Firebase can turn
    // into a credential; `iosClientId` is required on iOS.
    mods.googleSignin.GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      iosClientId: GOOGLE_IOS_CLIENT_ID,
      offlineAccess: false,
    });
    _configured = true;
  }
  return mods;
}

/**
 * Launches the native Google account picker, exchanges the resulting Google
 * credential for a Firebase sign-in, and returns the Firebase ID token for
 * the backend to verify. Returns `null` if the user cancels. Throws a
 * friendly error if the native modules aren't in the build yet (rebuild the
 * app to fix).
 */
export async function signInWithGoogle() {
  let googleSignin;
  let firebaseAuthApi;
  try {
    ({ googleSignin, firebaseAuthApi } = ensureConfigured());
  } catch {
    throw new Error(
      'Google Sign-In is not available in this build. Rebuild the app after installing the Google and Firebase modules.'
    );
  }

  const { GoogleSignin, statusCodes } = googleSignin;

  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  let googleIdToken;
  try {
    const response = await GoogleSignin.signIn();
    // v13 returns { type: 'success' | 'cancelled', data }; older shapes put the
    // token at the top level, so fall back to that.
    if (response?.type === 'cancelled') return null;
    googleIdToken = response?.data?.idToken ?? response?.idToken;
    if (!googleIdToken) throw new Error('Google sign-in did not return an ID token');
  } catch (err) {
    if (err?.code === statusCodes?.SIGN_IN_CANCELLED) return null;
    if (err?.code === statusCodes?.IN_PROGRESS) return null;
    throw err;
  }

  // Hand the Google credential to Firebase so it mints our own Firebase user
  // and ID token — that's what the backend verifies, not the raw Google token.
  const credential = firebaseAuthApi.GoogleAuthProvider.credential(googleIdToken);
  const { user } = await firebaseAuthApi.signInWithCredential(_authInstance, credential);
  return user.getIdToken();
}

/** Clears the cached Google + Firebase session. A no-op if native modules are absent. */
export async function signOutFromGoogle() {
  try {
    const { googleSignin, firebaseAuthApi } = ensureConfigured();
    await Promise.all([googleSignin.GoogleSignin.signOut(), firebaseAuthApi.signOut(_authInstance)]);
  } catch {
    // Native modules missing, or no active session — nothing to clean up.
  }
}
