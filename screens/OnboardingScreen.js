import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  SafeAreaView
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { wp, hp, rs } from '../utils/responsive';

export default function OnboardingScreen({ navigation }) {
  return (
    <ImageBackground
      source={require('../assets/authBackgroundImage.png')}
      style={styles.container}
    >
      <View style={styles.overlay}>
        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>Real Estate Investment in Dubai with Marrfa</Text>
          <Text style={styles.subtitle}>
            Discover premium investment opportunities in Dubai's thriving real estate market
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.signUpButton} 
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          </TouchableOpacity>

          {/* Social Login Options */}
          
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    paddingTop: hp(10),
    paddingBottom: hp(5),
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: rs(28),
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: hp(2),
    lineHeight: rs(36),
  },
  subtitle: {
    fontSize: rs(15),
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    paddingHorizontal: wp(5),
    lineHeight: rs(22),
  },
  buttonContainer: {
    alignItems: 'center',
    gap: hp(1),
  },
  loginButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'white',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(15),
    borderRadius: rs(25),
    marginBottom: hp(1),
    minWidth: wp(60),
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: rs(16),
    fontWeight: '700',
    textAlign: 'center',
  },
  signUpButton: {
    backgroundColor: 'white',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(15),
    borderRadius: rs(25),
    marginBottom: hp(2.5),
    minWidth: wp(60),
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpButtonText: {
    color: '#1A1A1A',
    fontSize: rs(16),
    fontWeight: '700',
    textAlign: 'center',
  },
  continueText: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: hp(2),
    fontSize: rs(14),
    fontWeight: '500',
  },
  socialContainer: {
    flexDirection: 'row',
    gap: wp(4),
  },
  socialButton: {
    width: rs(50),
    height: rs(50),
    borderRadius: rs(25),
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIcon: {
    width: rs(24),
    height: rs(24),
    resizeMode: 'contain',
  },
});