import { initializeApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorage } from 'firebase/storage';
import { getFirestore, initializeFirestore } from 'firebase/firestore';

// Your Firebase config object. Use environment variables in CI / public repos.
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || 'FIREBASE_API_KEY',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'FIREBASE_AUTH_DOMAIN',
  projectId: process.env.FIREBASE_PROJECT_ID || 'FIREBASE_PROJECT_ID',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'FIREBASE_STORAGE_BUCKET',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || 'FIREBASE_MESSAGING_SENDER_ID',
  appId: process.env.FIREBASE_APP_ID || 'FIREBASE_APP_ID',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistent storage for React Native.
// In Expo/React Native, the conditional export in 'firebase/auth' exposes getReactNativePersistence.
// Avoid re-initializing if Hot Reload triggers this module twice.
let authInstance;
try {
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (e) {
  // If already initialized (fast refresh), fallback to existing instance
  authInstance = getAuth(app);
}

export const auth = authInstance;
export const storage = getStorage(app);
// On React Native the default Firestore networking can have issues because
// the SDK expects browser networking (gRPC/websockets). For React Native
// we enable long polling and disable fetch streams which is a recommended
// workaround to avoid "Failed to get document because the client is offline."
// See: https://firebase.google.com/docs/firestore/solutions/react-native
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
});

export default app;