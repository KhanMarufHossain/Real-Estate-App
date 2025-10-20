import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { AuthService } from '../services/AuthService';
import { wp, hp, rs } from '../utils/responsive';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleEmailLogin = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const emailRegex = /[^@\s]+@[^@\s]+\.[^@\s]+/;
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert('Error', 'Invalid email format');
      return;
    }

    setLoading(true);
    try {
  await AuthService.signInWithEmail(trimmedEmail, password);
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Login Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await AuthService.signInWithGoogle();
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Google Sign-In Error', error.message || 'An error occurred during Google Sign-In');
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

        {/* Welcome Text */}
        <Text style={styles.welcomeText}>Welcome Back!</Text>
        <Text style={styles.welcomeSubText}>Please Log In</Text>
        
        {/* Social Login Buttons */}
        <Text style={styles.continueText}>Or continue with</Text>
        
        <View style={styles.socialContainer}>
          <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin}>
            <Text style={styles.socialButtonText}>G</Text>
          </TouchableOpacity>
        </View>

        {/* Email Input */}
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

        {/* Password Input */}
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#999"
        />

        {/* Remember Me & Forgot Password */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity 
            style={styles.rememberContainer}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]} />
            <Text style={styles.rememberText}>Remember me</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handleEmailLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>

        {/* Sign Up Link */}
        <View style={styles.signUpContainer}>
          <Text style={styles.noAccountText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.signUpText}>Sign Up</Text>
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
    marginBottom: hp(3),
    marginTop: hp(1),
  },
  logoText: {
    fontSize: rs(28),
    fontWeight: '700',
    color: '#2EBFA5',
  },
  welcomeText: {
    fontSize: rs(22),
    fontWeight: '700',
    textAlign: 'center',
    color: '#1A1A1A',
  },
  welcomeSubText: {
    fontSize: rs(16),
    fontWeight: '500',
    textAlign: 'center',
    color: '#757575',
    marginBottom: hp(3),
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
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: hp(1.5),
    marginBottom: hp(2.5),
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: rs(18),
    height: rs(18),
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: rs(3),
    marginRight: wp(2),
  },
  checkboxChecked: {
    backgroundColor: '#2EBFA5',
    borderColor: '#2EBFA5',
  },
  rememberText: {
    color: '#1A1A1A',
    fontSize: rs(13),
    fontWeight: '500',
  },
  forgotText: {
    color: '#2EBFA5',
    fontSize: rs(13),
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#2EBFA5',
    padding: hp(1.8),
    borderRadius: rs(10),
    alignItems: 'center',
    marginBottom: hp(2.5),
    minHeight: rs(48),
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: rs(16),
    fontWeight: '700',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: hp(2),
  },
  noAccountText: {
    color: '#757575',
    fontSize: rs(14),
  },
  signUpText: {
    color: '#2EBFA5',
    fontWeight: '700',
    fontSize: rs(14),
  },
});