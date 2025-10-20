import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { wp, hp, rs } from '../utils/responsive';

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const topInset = insets.top || (Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0);
  
  const { user, userProfile, signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          try {
            setLoading(true);
            await signOut();
          } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Error', 'Failed to logout');
          } finally {
            setLoading(false);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const handleNavigate = (screen) => {
    navigation.navigate(screen);
  };

  const userDisplayName = user?.displayName || userProfile?.displayName || user?.email || 'User';
  const userPhotoURL = user?.photoURL || userProfile?.photoURL || 'https://via.placeholder.com/100';

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Header Card */}
        <View style={styles.profileHeader}>
          <View style={styles.profileContent}>
            <Image
              source={{ uri: userPhotoURL }}
              style={styles.profileImage}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userDisplayName}</Text>
            </View>
          </View>
        </View>

        {/* Account Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleNavigate('YourProfile')}
          >
            <Icon name="account" size={rs(22)} color="#2EBFA5" />
            <Text style={styles.menuText}>Your Profile</Text>
            <Icon name="chevron-right" size={rs(20)} color="#757575" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleNavigate('RecommendedProperties')}
          >
            <Icon name="star" size={rs(22)} color="#2EBFA5" />
            <Text style={styles.menuText}>Recommended Property</Text>
            <Icon name="chevron-right" size={rs(20)} color="#757575" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleNavigate('Favorites')}
          >
            <Icon name="heart" size={rs(22)} color="#2EBFA5" />
            <Text style={styles.menuText}>Saved Property</Text>
            <Icon name="chevron-right" size={rs(20)} color="#757575" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleNavigate('Notifications')}
          >
            <Icon name="bell-outline" size={rs(22)} color="#2EBFA5" />
            <Text style={styles.menuText}>Notifications</Text>
            <Icon name="chevron-right" size={rs(20)} color="#757575" />
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleNavigate('AboutMarrfa')}
          >
            <Icon name="information-outline" size={rs(22)} color="#2EBFA5" />
            <Text style={styles.menuText}>About Marrfa</Text>
            <Icon name="chevron-right" size={rs(20)} color="#757575" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleNavigate('ContactMarrfa')}
          >
            <Icon name="phone" size={rs(22)} color="#2EBFA5" />
            <Text style={styles.menuText}>Contact Us</Text>
            <Icon name="chevron-right" size={rs(20)} color="#757575" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Icon name="file-document" size={rs(22)} color="#2EBFA5" />
            <Text style={styles.menuText}>Blog</Text>
            <Icon name="chevron-right" size={rs(20)} color="#757575" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={loading}
        >
          <Icon name="logout" size={rs(18)} color="#FFFFFF" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: hp(10),
  },
  profileHeader: {
    backgroundColor: '#2EBFA5',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2.5),
    borderBottomLeftRadius: rs(20),
    borderBottomRightRadius: rs(20),
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3),
  },
  profileImage: {
    width: rs(80),
    height: rs(80),
    borderRadius: rs(40),
    backgroundColor: '#E0E0E0',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: rs(18),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: hp(0.3),
  },
  menuText: {
    flex: 1,
    fontSize: rs(15),
    fontWeight: '500',
    color: '#1A1A1A',
  },
  section: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
  },
  sectionTitle: {
    fontSize: rs(16),
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: hp(1.5),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(4),
    backgroundColor: '#F8F8F8',
    borderRadius: rs(12),
    marginBottom: hp(1),
    gap: wp(3),
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: wp(5),
    marginTop: hp(2),
    paddingVertical: hp(1.8),
    backgroundColor: '#f5aeaeff',
    borderRadius: rs(12),
    gap: wp(2),
  },
  logoutText: {
    fontSize: rs(16),
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
