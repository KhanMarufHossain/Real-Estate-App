import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Linking,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { wp, hp, rs } from '../utils/responsive';
import { AuthService } from '../services/AuthService';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSendResetEmail = async () => {
    const trimmedEmail = email.trim();
    
    if (!trimmedEmail) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    const emailRegex = /[^@\s]+@[^@\s]+\.[^@\s]+/;
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert('Error', 'Invalid email format');
      return;
    }

    setLoading(true);
    try {
      await AuthService.sendPasswordResetEmail(trimmedEmail);
      setEmailSent(true);
      Alert.alert(
        'Success',
        `Password reset link sent to ${trimmedEmail}. Check your email to continue.`
      );
    } catch (error) {
      console.error('Password reset error:', error);
      Alert.alert('Error', error.message || 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  const handleCallUs = () => {
    const phoneNumber = '+971507338357';
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      Alert.alert('Call', 'Unable to make a call from your device');
    });
  };

  const handleEmailUs = () => {
    const email = 'sales@marrfa.com';
    Linking.openURL(`mailto:${email}`).catch(() => {
      Alert.alert('Email', 'Unable to open email app');
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackToLogin}
        >
          <Icon name="arrow-left" size={rs(24)} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reset Password</Text>
        <View style={styles.spacerHeader} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {emailSent ? (
          // Success state
          <View style={styles.successContainer}>
            <View style={styles.successIconContainer}>
              <Icon name="email-check" size={rs(80)} color="#2EBFA5" />
            </View>

            <Text style={styles.successTitle}>Email Sent!</Text>
            <Text style={styles.successDescription}>
              We've sent a password reset link to your email address. Please check your inbox and click the link to reset your password.
            </Text>

            <View style={styles.infoCard}>
              <Icon name="information-outline" size={rs(20)} color="#2EBFA5" />
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>Didn't receive the email?</Text>
                <Text style={styles.infoDescription}>
                  Check your spam/junk folder or try sending the link again.
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.resendButton}
              onPress={() => {
                setEmailSent(false);
                setEmail('');
              }}
            >
              <Text style={styles.resendButtonText}>Send Another Email</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.backToLoginButton}
              onPress={handleBackToLogin}
            >
              <Text style={styles.backToLoginButtonText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Email input state
          <View style={styles.formContainer}>
            <View style={styles.iconContainer}>
              <Icon name="lock-reset" size={rs(80)} color="#2EBFA5" />
            </View>

            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.description}>
              No worries! Enter your email address and we'll send you a link to reset your password.
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.securityInfoCard}>
              <Icon name="shield-check" size={rs(20)} color="#2EBFA5" />
              <View style={styles.securityInfo}>
                <Text style={styles.securityTitle}>Your Account is Safe</Text>
                <Text style={styles.securityDescription}>
                  We'll never share your information with anyone.
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.sendButton}
              onPress={handleSendResetEmail}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Icon name="email-send" size={rs(18)} color="#FFFFFF" />
                  <Text style={styles.sendButtonText}>Send Reset Link</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleBackToLogin}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Additional Help Section */}
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Need More Help?</Text>
          <View style={styles.helpCardContainer}>
            <TouchableOpacity 
              style={styles.helpCard}
              onPress={handleCallUs}
            >
              <Icon name="phone" size={rs(24)} color="#2EBFA5" />
              <Text style={styles.helpCardTitle}>Call Us</Text>
              <Text style={styles.helpCardText}>+971 507 338 357</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.helpCard}
              onPress={handleEmailUs}
            >
              <Icon name="email" size={rs(24)} color="#2EBFA5" />
              <Text style={styles.helpCardTitle}>Email Us</Text>
              <Text style={styles.helpCardText}>sales@marrfa.com</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: hp(3),
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: wp(2),
  },
  headerTitle: {
    fontSize: rs(20),
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
    textAlign: 'center',
  },
  spacerHeader: {
    width: wp(10),
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
  },
  formContainer: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: hp(2),
    marginTop: hp(1),
  },
  title: {
    fontSize: rs(24),
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: hp(1),
    textAlign: 'center',
  },
  description: {
    fontSize: rs(14),
    color: '#757575',
    textAlign: 'center',
    lineHeight: rs(22),
    marginBottom: hp(3),
  },
  formGroup: {
    width: '100%',
    marginBottom: hp(2),
  },
  label: {
    fontSize: rs(13),
    color: '#1A1A1A',
    marginBottom: hp(1),
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
  securityInfoCard: {
    width: '100%',
    flexDirection: 'row',
    gap: wp(3),
    padding: wp(4),
    backgroundColor: '#F5F5F5',
    borderRadius: rs(12),
    marginBottom: hp(2),
    borderLeftWidth: rs(4),
    borderLeftColor: '#2EBFA5',
  },
  securityInfo: {
    flex: 1,
  },
  securityTitle: {
    fontSize: rs(13),
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: hp(0.3),
  },
  securityDescription: {
    fontSize: rs(12),
    color: '#757575',
    lineHeight: rs(18),
  },
  sendButton: {
    width: '100%',
    backgroundColor: '#2EBFA5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(2),
    paddingVertical: hp(1.8),
    borderRadius: rs(10),
    marginBottom: hp(1.5),
  },
  sendButtonText: {
    fontSize: rs(16),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cancelButton: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    paddingVertical: hp(1.8),
    borderRadius: rs(10),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    fontSize: rs(16),
    fontWeight: '600',
    color: '#1A1A1A',
  },
  // Success state styles
  successContainer: {
    alignItems: 'center',
    paddingVertical: hp(2),
  },
  successIconContainer: {
    marginBottom: hp(2),
    marginTop: hp(1),
  },
  successTitle: {
    fontSize: rs(24),
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: hp(1),
    textAlign: 'center',
  },
  successDescription: {
    fontSize: rs(14),
    color: '#757575',
    textAlign: 'center',
    lineHeight: rs(22),
    marginBottom: hp(2),
  },
  infoCard: {
    width: '100%',
    flexDirection: 'row',
    gap: wp(3),
    padding: wp(4),
    backgroundColor: '#FFF9E6',
    borderRadius: rs(12),
    marginBottom: hp(2),
    borderLeftWidth: rs(4),
    borderLeftColor: '#FFB800',
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: rs(13),
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: hp(0.3),
  },
  infoDescription: {
    fontSize: rs(12),
    color: '#757575',
    lineHeight: rs(18),
  },
  resendButton: {
    width: '100%',
    backgroundColor: '#2EBFA5',
    paddingVertical: hp(1.8),
    borderRadius: rs(10),
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  resendButtonText: {
    fontSize: rs(16),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  backToLoginButton: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    paddingVertical: hp(1.8),
    borderRadius: rs(10),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  backToLoginButtonText: {
    fontSize: rs(16),
    fontWeight: '600',
    color: '#1A1A1A',
  },
  helpSection: {
    marginTop: hp(3),
  },
  helpTitle: {
    fontSize: rs(16),
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: hp(1.5),
    textAlign: 'center',
  },
  helpCardContainer: {
    flexDirection: 'row',
    gap: wp(3),
  },
  helpCard: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: rs(12),
    padding: wp(3),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: hp(1.5),
  },
  helpCardTitle: {
    fontSize: rs(12),
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: hp(1),
    marginBottom: hp(0.5),
  },
  helpCardText: {
    fontSize: rs(11),
    color: '#757575',
    textAlign: 'center',
  },
  spacer: {
    height: hp(2),
  },
});
