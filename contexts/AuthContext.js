import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import MarrfaApi from '../services/MarrfaApi';
import { AuthService } from '../services/AuthService';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [externalUserReady, setExternalUserReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Load user profile from Firestore
        try {
          const profile = await AuthService.getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error loading user profile:', error);
        }

        // Do not auto-post user here. Posting happens:
        // - For Google sign-up: immediately after Google sign-up with photoURL
        // - For email sign-up: after photo upload in PhotoUploadScreen
        // We keep externalUserReady based on feature usage elsewhere.
        setExternalUserReady(true);
      } else {
  setUserProfile(null);
  setExternalUserReady(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    userProfile,
    loading,
    externalUserReady,
    signInWithGoogle: AuthService.signInWithGoogle,
    signInWithEmail: AuthService.signInWithEmail,
    signUpWithEmail: AuthService.signUpWithEmail,
    signOut: AuthService.signOut,
    uploadProfilePhoto: AuthService.uploadProfilePhoto,
    updateUserProfile: AuthService.updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};