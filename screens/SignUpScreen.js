import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { AuthService } from '../services/AuthService';
import { wp, hp, rs } from '../utils/responsive';

export default function SignUpScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [phoneCode, setPhoneCode] = useState('ae');
  const [country, setCountry] = useState('United Arab Emirates');

  const handleEmailSignUp = async () => {
    const trimmedEmail = email.trim();
    if (!name || !trimmedEmail || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const emailRegex = /[^@\s]+@[^@\s]+\.[^@\s]+/;
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      // Basic phone validation when provided
      const phoneDetails = phone
        ? { phone, code: phoneCode || 'ae', country: country || 'United Arab Emirates' }
        : undefined;

      const user = await AuthService.signUpWithEmail(trimmedEmail, password, { name, phoneDetails });
      // Navigate to photo upload screen to complete profile
      navigation.navigate('PhotoUpload', { userId: user.uid });
    } catch (error) {
      Alert.alert('Sign Up Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      // Google sign-up: signs in with Google and then posts user to external API
      const user = await AuthService.signUpWithGoogle();
      // Navigate to photo upload to complete profile
      navigation.navigate('PhotoUpload', { userId: user.uid });
    } catch (error) {
      Alert.alert('Google Sign-Up Error', error.message || 'An error occurred during Google Sign-Up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>MARRFA</Text>
        </View>

        {/* Title */}
        <Text style={styles.titleText}>Create Your Account</Text>
        
        {/* Social Sign Up */}
        <Text style={styles.continueText}>Or continue with</Text>
        
        <View style={styles.socialContainer}>
          <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignUp}>
            <Text style={styles.socialButtonText}>G</Text>
          </TouchableOpacity>
          
        </View>

        {/* Form Fields */}
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Your Name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholderTextColor="#999"
        />

        {/* Phone Details (for email/password registration) */}
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="+971..."
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Phone Code (ISO)</Text>
        <TextInput
          style={styles.input}
          placeholder="ae"
          value={phoneCode}
          onChangeText={setPhoneCode}
          autoCapitalize="none"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Country</Text>
        <TextInput
          style={styles.input}
          placeholder="United Arab Emirates"
          value={country}
          onChangeText={setCountry}
          placeholderTextColor="#999"
        />

        {/* Sign Up Button */}
        <TouchableOpacity 
          style={styles.signUpButton} 
          onPress={handleEmailSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.signUpButtonText}>Sign up</Text>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.haveAccountText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    paddingBottom: hp(4),
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: hp(2),
    marginTop: hp(2),
  },
  logoText: {
    fontSize: rs(28),
    fontWeight: '700',
    color: '#2EBFA5',
  },
  titleText: {
    fontSize: rs(22),
    fontWeight: '600',
    textAlign: 'center',
    color: '#1A1A1A',
    marginBottom: hp(2),
  },
  continueText: {
    textAlign: 'center',
    color: '#757575',
    marginBottom: hp(2),
    fontSize: rs(14),
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: hp(3),
    gap: wp(4),
  },
  socialButton: {
    width: rs(50),
    height: rs(50),
    borderRadius: rs(25),
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  socialButtonText: {
    fontSize: rs(18),
    fontWeight: '700',
    color: '#1A1A1A',
  },
  label: {
    fontSize: rs(13),
    color: '#1A1A1A',
    marginBottom: hp(1),
    marginTop: hp(1.5),
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: rs(10),
    padding: hp(1.5),
    paddingHorizontal: wp(4),
    fontSize: rs(14),
    backgroundColor: '#F9F9F9',
    color: '#1A1A1A',
    minHeight: rs(45),
  },
  signUpButton: {
    backgroundColor: '#2EBFA5',
    padding: hp(1.8),
    borderRadius: rs(10),
    alignItems: 'center',
    marginTop: hp(2.5),
    marginBottom: hp(2),
    minHeight: rs(48),
    justifyContent: 'center',
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: rs(16),
    fontWeight: '700',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: hp(2),
  },
  haveAccountText: {
    color: '#757575',
    fontSize: rs(14),
  },
  loginText: {
    color: '#2EBFA5',
    fontWeight: '700',
    fontSize: rs(14),
  },
});