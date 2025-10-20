import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { CloudinaryService } from './CloudinaryService';
import { signInWithGoogle, signOutFromGoogle } from './GoogleSignIn';
import MarrfaApi from './MarrfaApi';

export class AuthService {
  // Google Sign-In (Sign in only - do NOT post to external API)
  static async signInWithGoogle() {
    try {
      const res = await signInWithGoogle();
      // After sign-in, ensure profile exists in Firestore
      try {
        const userRef = doc(db, 'users', res.firebaseUser.uid);
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          await this.createUserProfile(res.firebaseUser, {});
        }
        // Do NOT post user on sign-in.
        console.log('[AuthService] Google sign-in completed. Skipping external post on sign-in.');
      } catch (ensureErr) {
        console.warn('Profile ensure after Google sign-in failed:', ensureErr?.message);
      }
      return res.firebaseUser;
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  }

  // Google Sign-Up: sign in with Google, then post user to external API (photoURL present)
  static async signUpWithGoogle() {
    try {
      const res = await signInWithGoogle();
      // Ensure profile exists in Firestore
      try {
        const userRef = doc(db, 'users', res.firebaseUser.uid);
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          await this.createUserProfile(res.firebaseUser, {});
        }
      } catch (ensureErr) {
        console.warn('Profile ensure after Google sign-up failed:', ensureErr?.message);
      }

      // Post to external API with strict Google payload
      const user = res.firebaseUser;
      const payload = {
        email: String(user.email).trim().toLowerCase(),
        name: user.displayName,
        photo: user.photoURL,
      };
      console.log('[AuthService] Google sign-up: posting user to external API');
      const response = await MarrfaApi.postUser(payload, payload.email);
      console.log('[AuthService] Google sign-up user post response:', response);

      return res.firebaseUser;
    } catch (error) {
      console.error('Google Sign-Up Error:', error);
      throw error;
    }
  }

  // Email/Password Sign Up
  static async signUpWithEmail(email, password, userData) {
    try {
      const normalizedEmail = String(email).trim().toLowerCase();
      const result = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      // create user profile in Firestore
      await this.createUserProfile(result.user, userData);
      // IMPORTANT: Do NOT post on sign-up yet. We must wait for photo upload.
      console.log('[AuthService] Email sign-up complete. Deferring external post until photo upload.');
      return result.user;
    } catch (error) {
      console.error('Email Sign-Up Error:', error);
      // Map common Firebase Auth errors to friendly messages
      const code = error?.code || error?.message || '';
      let message = 'Sign up failed. Please try again.';
      if (code.includes('auth/email-already-in-use')) {
        message = 'This email is already in use. Try logging in instead.';
      } else if (code.includes('auth/invalid-email')) {
        message = 'The email address is invalid.';
      } else if (code.includes('auth/weak-password')) {
        message = 'The password is too weak. Use at least 6 characters.';
      }

      const err = new Error(message);
      err.original = error;
      throw err;
    }
  }

  // Email/Password Sign In
  static async signInWithEmail(email, password) {
    try {
      // Use the email exactly as provided (no trim/lowercase)
      const result = await signInWithEmailAndPassword(auth, email, password);
      // Ensure profile exists (in case deleted or created elsewhere)
      try {
        const userRef = doc(db, 'users', result.user.uid);
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          await this.createUserProfile(result.user, {});
        }
        // Do NOT post user on sign-in.
        console.log('[AuthService] Email sign-in completed. Skipping external post on sign-in.');
      } catch (ensureErr) {
        console.warn('Profile ensure after sign-in failed:', ensureErr?.message);
      }
      return result.user;
    } catch (error) {
      console.error('Email Sign-In Error:', error);
      const code = error?.code || '';
      let message = 'Sign in failed. Please try again.';
      if (code.includes('auth/wrong-password')) {
        message = 'Incorrect password. Please try again.';
      } else if (code.includes('auth/user-not-found')) {
        message = 'No account found for this email.';
      } else if (code.includes('auth/invalid-email')) {
        message = 'The email address is invalid.';
      } else if (code.includes('auth/too-many-requests')) {
        message = 'Too many attempts. Try again later.';
      }

      const err = new Error(message);
      err.original = error;
      throw err;
    }
  }

  // Create/Update User Profile
  static async createUserProfile(user, additionalData = {}) {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const { displayName, email, photoURL } = user;
      const createdAt = new Date();

      try {
        await setDoc(userRef, {
          displayName: displayName || additionalData.name || '',
          email,
          photoURL: photoURL || '',
          createdAt,
          isProfileComplete: false,
          ...additionalData
        });
      } catch (error) {
        console.error('Error creating user profile:', error);
      }
    }

    return userRef;
  }

  // Upload Profile Photo using Cloudinary
  static async uploadProfilePhoto(userId, imageUri) {
    try {
      // Upload to Cloudinary
      const uploadResult = await CloudinaryService.uploadImage(imageUri, 'profile_photos');

      const photoURL = uploadResult?.secure_url || uploadResult?.url;
      const publicId = uploadResult?.public_id;

      if (!photoURL) throw new Error('Cloudinary did not return a secure_url');

      // Update user profile with photo URL and store public_id for later management
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        photoURL: photoURL,
        photoPublicId: publicId || '',
        isProfileComplete: true
      }, { merge: true });

      // After saving photo, fetch the user profile to get name and phoneDetails for external API post
      const updatedSnap = await getDoc(userRef);
      const profile = updatedSnap.exists() ? updatedSnap.data() : {};

      // Current authenticated user email
      const currentUser = auth.currentUser;
      const email = String(currentUser?.email || '').trim().toLowerCase();
      if (!email) {
        console.warn('[AuthService] uploadProfilePhoto: No authenticated user email found; skipping external post');
        return photoURL;
      }

      // Build strict credentials registration payload
      const payload = {
        email,
        name: profile?.displayName || profile?.name || currentUser?.displayName,
        phoneDetails: profile?.phoneDetails,
        photo: photoURL,
      };
      console.log('[AuthService] Upload photo complete. Posting credentials user to external API...');
      try {
        const response = await MarrfaApi.postUser(payload, email);
        console.log('[AuthService] Credentials user post response after photo upload:', response);
      } catch (apiErr) {
        console.error('[AuthService] External post after photo upload failed:', apiErr?.message);
      }

      return photoURL;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  }

  // Update User Profile
  static async updateUserProfile(userId, updates) {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, updates, { merge: true });
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  // Get User Profile
  static async getUserProfile(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return userSnap.data();
      } else {
        console.log('No user profile found!');
        return null;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  // Sign Out
  static async signOut() {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  // Send Password Reset Email
  static async sendPasswordResetEmail(email) {
    try {
      const normalizedEmail = String(email).trim().toLowerCase();
      await sendPasswordResetEmail(auth, normalizedEmail);
      console.log('[AuthService] Password reset email sent to:', normalizedEmail);
      return { success: true, message: 'Password reset email sent successfully' };
    } catch (error) {
      console.error('Send Password Reset Email Error:', error);
      const code = error?.code || '';
      let message = 'Failed to send password reset email';
      
      if (code.includes('auth/user-not-found')) {
        message = 'No account found with this email address';
      } else if (code.includes('auth/invalid-email')) {
        message = 'The email address is invalid';
      } else if (code.includes('auth/too-many-requests')) {
        message = 'Too many requests. Please try again later';
      }

      const err = new Error(message);
      err.original = error;
      throw err;
    }
  }

  // Verify Password Reset Code (optional - to validate the reset code before password change)
  static async verifyPasswordResetCode(code) {
    try {
      const email = await verifyPasswordResetCode(auth, code);
      console.log('[AuthService] Password reset code verified for email:', email);
      return { success: true, email };
    } catch (error) {
      console.error('Verify Password Reset Code Error:', error);
      const code_error = error?.code || '';
      let message = 'Invalid or expired password reset link';
      
      if (code_error.includes('auth/expired-action-code')) {
        message = 'This password reset link has expired. Please request a new one';
      } else if (code_error.includes('auth/invalid-action-code')) {
        message = 'This password reset link is invalid';
      }

      const err = new Error(message);
      err.original = error;
      throw err;
    }
  }

  // Confirm Password Reset (Complete the password reset with new password)
  static async confirmPasswordReset(code, newPassword) {
    try {
      if (!newPassword || newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      await confirmPasswordReset(auth, code, newPassword);
      console.log('[AuthService] Password reset completed successfully');
      return { success: true, message: 'Password reset successfully' };
    } catch (error) {
      console.error('Confirm Password Reset Error:', error);
      const code_error = error?.code || '';
      let message = 'Failed to reset password';
      
      if (code_error.includes('auth/expired-action-code')) {
        message = 'This password reset link has expired. Please request a new one';
      } else if (code_error.includes('auth/invalid-action-code')) {
        message = 'This password reset link is invalid';
      } else if (code_error.includes('auth/weak-password')) {
        message = 'Password is too weak. Use at least 6 characters with a mix of letters and numbers';
      }

      const err = new Error(message);
      err.original = error;
      throw err;
    }
  }
}