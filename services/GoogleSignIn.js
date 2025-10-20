// services/GoogleSignIn.js
// Uses @react-native-google-signin/google-signin to obtain an idToken
// and exchanges it for a Firebase credential.

import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../config/firebase';

// Configure Google Sign-In. Call this early in app startup (e.g. App.js)
export function configureGoogleSignIn({ webClientId, iosClientId, androidClientId }) {
  // webClientId is required to get an idToken that Firebase accepts.
  // androidClientId / iosClientId are optional native client IDs if you created them.
  GoogleSignin.configure({
    webClientId: webClientId || process.env.GOOGLE_WEB_CLIENT_ID || 'GOOGLE_WEB_CLIENT_ID',
    iosClientId: iosClientId || process.env.GOOGLE_IOS_CLIENT_ID || 'GOOGLE_IOS_CLIENT_ID',
    androidClientId: androidClientId || process.env.GOOGLE_ANDROID_CLIENT_ID || 'GOOGLE_ANDROID_CLIENT_ID',
    offlineAccess: true,
    forceCodeForRefreshToken: true,
  });
}

// Sign in with Google and return the Firebase user
export async function signInWithGoogle() {
  try {
    // Ensure Google Play services available (Android)
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // Trigger the native sign in UI
    const userInfo = await GoogleSignin.signIn();
    // userInfo contains idToken which we will exchange for a Firebase credential
    const { idToken } = userInfo;
    if (!idToken) throw new Error('No idToken returned from Google Sign-In');

    const credential = GoogleAuthProvider.credential(idToken);
    const firebaseResult = await signInWithCredential(auth, credential);

    // firebaseResult.user is the authenticated Firebase user
    return { firebaseUser: firebaseResult.user, raw: firebaseResult };
  } catch (error) {
    // Re-throw after logging
    console.error('GoogleSignIn.signInWithGoogle error:', error);
    throw error;
  }
}

export async function signOutFromGoogle() {
  try {
    // Sign out from Firebase
    await auth.signOut();
  } catch (e) {
    // ignore
  }

  try {
    await GoogleSignin.signOut();
  } catch (error) {
    console.warn('GoogleSignIn signOut native error:', error?.message || error);
  }
}
