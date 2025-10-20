import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import { configureGoogleSignIn } from './services/GoogleSignIn';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './contexts/AuthContext';
import TabNavigator from './navigation/TabNavigator';

// Import Screens
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import PhotoUploadScreen from './screens/PhotoUploadScreen';
import SuccessScreen from './screens/SuccessScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import AllDevelopersScreen from './screens/AllDevelopersScreen';
import AllCityPropertiesScreen from './screens/AllCityPropertiesScreen';
import PropertyDetailsScreen from './screens/PropertyDetailsScreen';
import DeveloperPropertiesScreen from './screens/DeveloperPropertiesScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import RecommendedPropertiesScreen from './screens/RecommendedPropertiesScreen';
import ScheduleCallScreen from './screens/ScheduleCallScreen';
import AboutMarrfaScreen from './screens/AboutMarrfaScreen';
import ContactMarrfaScreen from './screens/ContactMarrfaScreen';
import YourProfileScreen from './screens/YourProfileScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';

const Stack = createStackNavigator();

// Configure Google Sign-In once at app startup
// Configure Google Sign-In once at app startup
// Client IDs must be provided via environment variables before publishing the repo publicly.
configureGoogleSignIn({
  webClientId: process.env.GOOGLE_WEB_CLIENT_ID || 'GOOGLE_WEB_CLIENT_ID',
  androidClientId: process.env.GOOGLE_ANDROID_CLIENT_ID || 'GOOGLE_ANDROID_CLIENT_ID',
  iosClientId: process.env.GOOGLE_IOS_CLIENT_ID || 'GOOGLE_IOS_CLIENT_ID',
});

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return null; // You can add a loading screen here
  }

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator 
            initialRouteName={user ? "Home" : "Onboarding"}
            screenOptions={{ headerShown: false }}
          >
            {user ? (
              // Authenticated screens: use TabNavigator as main entry
              <>
                <Stack.Screen name="Home" component={TabNavigator} />
                <Stack.Screen name="PhotoUpload" component={PhotoUploadScreen} />
                <Stack.Screen name="Success" component={SuccessScreen} />
                <Stack.Screen name="AllDevelopers" component={AllDevelopersScreen} />
                <Stack.Screen name="DeveloperProperties" component={DeveloperPropertiesScreen} />
                <Stack.Screen name="AllCityProperties" component={AllCityPropertiesScreen} />
                <Stack.Screen name="PropertyDetails" component={PropertyDetailsScreen} />
                <Stack.Screen name="ScheduleCall" component={ScheduleCallScreen} />
                <Stack.Screen name="Notifications" component={NotificationsScreen} />
                <Stack.Screen name="RecommendedProperties" component={RecommendedPropertiesScreen} />
                <Stack.Screen name="AboutMarrfa" component={AboutMarrfaScreen} />
                <Stack.Screen name="ContactMarrfa" component={ContactMarrfaScreen} />
                <Stack.Screen name="YourProfile" component={YourProfileScreen} />
                <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
              </>
            ) : (
              // Unauthenticated screens
              <>
                <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                <Stack.Screen name="SignUp" component={SignUpScreen} />
                <Stack.Screen name="PhotoUpload" component={PhotoUploadScreen} />
                <Stack.Screen name="Success" component={SuccessScreen} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
