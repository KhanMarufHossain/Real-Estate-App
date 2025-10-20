import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { wp, hp, rs } from '../utils/responsive';
import { useAuth } from '../contexts/AuthContext';
import { AuthService } from '../services/AuthService';

export default function YourProfileScreen({ navigation }) {
  const { user, userProfile } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [editingField, setEditingField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tempValue, setTempValue] = useState('');

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setName(user.displayName || userProfile?.displayName || '');
    }
  }, [user, userProfile]);

  const handleEditPassword = () => {
    setEditingField('password');
    // Navigate to password reset screen
    navigation.navigate('ForgotPassword');
  };

  const handleCancel = () => {
    setEditingField(null);
    setTempValue('');
  };

  const renderEditableField = (label, value, field) => {
    const isEditing = editingField === field;

    if (isEditing) {
      return (
        <View style={styles.editableFieldContainer}>
          <View style={styles.editFieldHeader}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <TouchableOpacity onPress={handleCancel}>
              <Icon name="close" size={rs(20)} color="#757575" />
            </TouchableOpacity>
          </View>
          
          {field === 'password' ? (
            <View style={styles.passwordInfoContainer}>
              <Icon name="information-outline" size={rs(20)} color="#2EBFA5" />
              <Text style={styles.passwordInfoText}>
                Click below to reset your password. A reset link will be sent to your email.
              </Text>
            </View>
          ) : (
            <TextInput
              style={styles.editInput}
              value={tempValue}
              onChangeText={setTempValue}
              placeholder={`Enter ${label.toLowerCase()}`}
              editable={!loading}
              keyboardType={field === 'email' ? 'email-address' : 'default'}
              autoCapitalize={field === 'email' ? 'none' : 'words'}
            />
          )}

          <View style={styles.editActionButtons}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            {field !== 'password' && (
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={field === 'name' ? handleSaveName : handleSaveEmail}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    }

    // If field is name or email, show as read-only
    if (field === 'name' || field === 'email') {
      return (
        <View style={styles.fieldContainer}>
          <View style={styles.fieldHeader}>
            <View style={styles.fieldLabelContainer}>
              {field === 'name' && <Icon name="account" size={rs(24)} color="#2EBFA5" />}
              {field === 'email' && <Icon name="email-outline" size={rs(24)} color="#2EBFA5" />}
              
              <View style={styles.fieldTextContainer}>
                <Text style={styles.fieldLabel}>{label}</Text>
                <Text style={styles.fieldValue}>{value || 'Not set'}</Text>
              </View>
            </View>
          </View>
        </View>
      );
    }

    // Password field is editable
    return (
      <View style={styles.fieldContainer}>
        <View style={styles.fieldHeader}>
          <View style={styles.fieldLabelContainer}>
            {field === 'password' && <Icon name="lock" size={rs(24)} color="#2EBFA5" />}
            
            <View style={styles.fieldTextContainer}>
              <Text style={styles.fieldLabel}>{label}</Text>
              {field === 'password' ? (
                <Text style={styles.fieldValue}>••••••••</Text>
              ) : (
                <Text style={styles.fieldValue}>{value || 'Not set'}</Text>
              )}
            </View>
          </View>

          <TouchableOpacity 
            style={styles.editButton}
            onPress={handleEditPassword}
          >
            <Icon name="pencil" size={rs(18)} color="#2EBFA5" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={rs(24)} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Profile</Text>
        <View style={styles.spacerHeader} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Banner */}
        <View style={styles.bannerContainer}>
          <View style={styles.banner} />
          <View style={styles.profilePictureContainer}>
            <Image
              source={{
                uri: userProfile?.photoURL || user?.photoURL || 'https://via.placeholder.com/150'
              }}
              style={styles.profilePicture}
            />
          </View>
        </View>

        {/* Profile Name */}
        <View style={styles.profileNameContainer}>
          <Text style={styles.profileName}>{name || 'User'}</Text>
          <Text style={styles.profileSubtitle}>{email}</Text>
        </View>

        {/* Personal Information Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          {renderEditableField('Name', name, 'name')}
          {renderEditableField('Email', email, 'email')}
          {renderEditableField('Password', '', 'password')}
        </View>

        {/* Account Security Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoCardContent}>
            <Icon name="shield-check" size={rs(24)} color="#2EBFA5" />
            <View style={styles.infoCardText}>
              <Text style={styles.infoCardTitle}>Account Security</Text>
              <Text style={styles.infoCardDescription}>
                Keep your account secure by using a strong password and enabling two-factor authentication.
              </Text>
            </View>
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
    backgroundColor: '#FFFFFF',
    marginTop: hp(2)
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
  bannerContainer: {
    alignItems: 'center',
  },
  banner: {
    width: '100%',
    height: hp(20),
    backgroundColor: '#2EBFA5',
  },
  profilePictureContainer: {
    marginTop: -hp(6),
    alignItems: 'center',
    marginBottom: hp(2),
  },
  profilePicture: {
    width: rs(120),
    height: rs(120),
    borderRadius: rs(60),
    backgroundColor: '#FFFFFF',
    borderWidth: rs(4),
    borderColor: '#2EBFA5',
  },
  profileNameContainer: {
    alignItems: 'center',
    marginBottom: hp(3),
  },
  profileName: {
    fontSize: rs(20),
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: hp(0.3),
  },
  profileSubtitle: {
    fontSize: rs(13),
    color: '#757575',
  },
  sectionContainer: {
    paddingHorizontal: wp(5),
    marginBottom: hp(2),
  },
  sectionTitle: {
    fontSize: rs(18),
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: hp(1.5),
  },
  fieldContainer: {
    marginBottom: hp(1.5),
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    backgroundColor: '#F5F5F5',
    borderRadius: rs(12),
  },
  fieldLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3),
    flex: 1,
  },
  fieldTextContainer: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: rs(12),
    fontWeight: '600',
    color: '#757575',
    marginBottom: hp(0.3),
  },
  fieldValue: {
    fontSize: rs(15),
    fontWeight: '600',
    color: '#1A1A1A',
  },
  editButton: {
    width: rs(36),
    height: rs(36),
    borderRadius: rs(18),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: rs(1.5),
    borderColor: '#2EBFA5',
  },
  editableFieldContainer: {
    marginBottom: hp(2),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    backgroundColor: '#F5F5F5',
    borderRadius: rs(12),
    borderWidth: rs(1.5),
    borderColor: '#2EBFA5',
  },
  editFieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1.2),
  },
  editInput: {
    borderWidth: rs(1),
    borderColor: '#E0E0E0',
    borderRadius: rs(8),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.2),
    fontSize: rs(14),
    color: '#1A1A1A',
    marginBottom: hp(1.5),
    backgroundColor: '#FFFFFF',
  },
  passwordInfoContainer: {
    flexDirection: 'row',
    gap: wp(3),
    marginBottom: hp(1.5),
    padding: wp(3),
    backgroundColor: '#E0F7F4',
    borderRadius: rs(8),
    alignItems: 'flex-start',
  },
  passwordInfoText: {
    fontSize: rs(12),
    color: '#1A1A1A',
    flex: 1,
    lineHeight: rs(18),
  },
  editActionButtons: {
    flexDirection: 'row',
    gap: wp(2),
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(1),
    borderRadius: rs(8),
    backgroundColor: '#E0E0E0',
  },
  cancelButtonText: {
    fontSize: rs(13),
    fontWeight: '600',
    color: '#1A1A1A',
  },
  saveButton: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(1),
    borderRadius: rs(8),
    backgroundColor: '#2EBFA5',
  },
  saveButtonText: {
    fontSize: rs(13),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoCard: {
    marginHorizontal: wp(5),
    marginBottom: hp(2),
    padding: wp(4),
    backgroundColor: '#F5F5F5',
    borderRadius: rs(12),
    borderLeftWidth: rs(4),
    borderLeftColor: '#2EBFA5',
  },
  infoCardContent: {
    flexDirection: 'row',
    gap: wp(3),
    alignItems: 'flex-start',
  },
  infoCardText: {
    flex: 1,
    gap: hp(0.5),
  },
  infoCardTitle: {
    fontSize: rs(14),
    fontWeight: '700',
    color: '#1A1A1A',
  },
  infoCardDescription: {
    fontSize: rs(12),
    color: '#757575',
    lineHeight: rs(18),
  },
  spacer: {
    height: hp(4),
  },
});
