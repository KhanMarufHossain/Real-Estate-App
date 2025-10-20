import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useAuth } from '../contexts/AuthContext';
import MarrfaApi from '../services/MarrfaApi';
import { wp, hp, rs } from '../utils/responsive';

const buyerTypes = [
  { label: 'Individual', value: 'Individual' },
  { label: 'Company', value: 'Company' },
  { label: 'Investor', value: 'Investor' },
];

export default function RegisterInterestModal({ 
  visible, 
  onClose, 
  propertyId, 
  propertyName,
  propertyLocation 
}) {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showBuyerTypeDropdown, setShowBuyerTypeDropdown] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    buyerType: '',
    country: '',
  });

  // Pre-fill form with user data on mount
  useEffect(() => {
    if (user && visible) {
      setFormData({
        name: user.displayName || userProfile?.displayName || '',
        email: user.email || '',
        phone: userProfile?.phoneDetails?.phone || '',
        buyerType: '',
        country: userProfile?.phoneDetails?.country || '',
      });
    }
  }, [user, userProfile, visible]);

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation', 'Please enter your name');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      Alert.alert('Validation', 'Please enter a valid email');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Validation', 'Please enter your phone number');
      return false;
    }
    if (!formData.buyerType) {
      Alert.alert('Validation', 'Please select buyer type');
      return false;
    }
    if (!formData.country.trim()) {
      Alert.alert('Validation', 'Please enter your country');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        buyerType: formData.buyerType,
        country: formData.country,
        propertyId,
        purpose: '-',
        source: 'Register Interest App',
      };

      console.log('[RegisterInterest] Submitting:', payload);
      
      const response = await MarrfaApi.registerInterest(payload, user?.email);
      
      console.log('[RegisterInterest] Success:', response);
      
      Alert.alert(
        'Success!',
        'Your interest has been registered. Our team will contact you soon.',
        [{ text: 'OK', onPress: () => onClose() }]
      );
    } catch (error) {
      console.error('[RegisterInterest] Error:', error);
      Alert.alert(
        'Error',
        error?.message || 'Failed to register interest. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Register Your Interest</Text>
          <Text style={styles.headerSubtitle}>
            Fill in your details and get complete project details
          </Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onClose}
            disabled={loading}
          >
            <Icon name="close" size={rs(24)} color="#1A1A1A" />
          </TouchableOpacity>
        </View>

        {/* Form */}
        <ScrollView 
          style={styles.formContainer}
          showsVerticalScrollIndicator={false}
          scrollEnabled={true}
        >
          {/* Property Info */}
          <View style={styles.propertyInfo}>
            <Text style={styles.propertyName}>{propertyName}</Text>
            <View style={styles.locationRow}>
              <Icon name="map-marker" size={rs(14)} color="#2EBFA5" />
              <Text style={styles.propertyLocation}>{propertyLocation}</Text>
            </View>
          </View>

          {/* Name Field */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Your Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#999"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              editable={!loading}
            />
          </View>

          {/* Email Field */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Your Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              editable={!loading}
            />
          </View>

          {/* Phone Field */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. +971501234567"
              placeholderTextColor="#999"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
              editable={!loading}
            />
          </View>

          {/* Buyer Type Dropdown */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Buyer Type</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowBuyerTypeDropdown(!showBuyerTypeDropdown)}
              disabled={loading}
            >
              <Text style={[styles.dropdownText, !formData.buyerType && { color: '#999' }]}>
                {formData.buyerType || 'Select buyer type'}
              </Text>
              <Icon 
                name={showBuyerTypeDropdown ? 'chevron-up' : 'chevron-down'} 
                size={rs(20)} 
                color="#2EBFA5"
              />
            </TouchableOpacity>

            {showBuyerTypeDropdown && (
              <View style={styles.dropdownMenu}>
                {buyerTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setFormData({ ...formData, buyerType: type.value });
                      setShowBuyerTypeDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{type.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Country Field */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Country</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your country"
              placeholderTextColor="#999"
              value={formData.country}
              onChangeText={(text) => setFormData({ ...formData, country: text })}
              editable={!loading}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size={rs(20)} />
            ) : (
              <>
                <Icon name="lightning-bolt" size={rs(18)} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>ENQUIRE NOW!</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Alternative Actions */}
          <View style={styles.alternativeActions}>
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => {
                const phoneNumber = '+971563282700';
                Linking.openURL(`tel:${phoneNumber}`).catch(() => {
                  Alert.alert('Call', 'Unable to make a call from your device');
                });
              }}
            >
              <Icon name="phone" size={rs(16)} color="#FFFFFF" />
              <Text style={styles.alternativeButtonText}>Call Us Today</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.whatsappButton}
              onPress={() => {
                const phoneNumber = '+971507338357';
                const message = encodeURIComponent('Hi, I am interested in your properties.');
                const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${message}`;
                Linking.openURL(whatsappUrl).catch(() => {
                  Alert.alert('WhatsApp', 'WhatsApp is not installed on your device');
                });
              }}
            >
              <Icon name="whatsapp" size={rs(16)} color="#FFFFFF" />
              <Text style={styles.alternativeButtonText}>Chat Now</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.spacer} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: hp(3),
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    paddingTop: hp(3),
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: rs(18),
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: hp(0.5),
  },
  headerSubtitle: {
    fontSize: rs(12),
    color: '#757575',
  },
  closeButton: {
    position: 'absolute',
    right: wp(5),
    top: hp(2.5),
    padding: wp(2),
  },
  formContainer: {
    flex: 1,
    padding: wp(5),
  },
  propertyInfo: {
    backgroundColor: '#E8F8F5',
    borderRadius: rs(12),
    padding: wp(4),
    marginBottom: hp(2),
    borderLeftWidth: 4,
    borderLeftColor: '#2EBFA5',
  },
  propertyName: {
    fontSize: rs(15),
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: hp(0.5),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1),
  },
  propertyLocation: {
    fontSize: rs(12),
    color: '#757575',
  },
  formGroup: {
    marginBottom: hp(2),
  },
  label: {
    fontSize: rs(12),
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: hp(0.8),
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: rs(8),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    fontSize: rs(14),
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dropdown: {
    backgroundColor: '#F5F5F5',
    borderRadius: rs(8),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dropdownText: {
    fontSize: rs(14),
    color: '#1A1A1A',
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: rs(8),
    marginTop: hp(0.5),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemText: {
    fontSize: rs(13),
    color: '#1A1A1A',
  },
  submitButton: {
    backgroundColor: '#2EBFA5',
    borderRadius: rs(8),
    paddingVertical: hp(1.8),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: wp(2),
    marginBottom: hp(2),
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: rs(15),
    fontWeight: '700',
  },
  alternativeActions: {
    flexDirection: 'row',
    gap: wp(2),
    marginBottom: hp(2),
  },
  callButton: {
    flex: 1,
    backgroundColor: '#5B7FFF',
    borderRadius: rs(8),
    paddingVertical: hp(1.5),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: wp(1),
  },
  whatsappButton: {
    flex: 1,
    backgroundColor: '#25D366',
    borderRadius: rs(8),
    paddingVertical: hp(1.5),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: wp(1),
  },
  alternativeButtonText: {
    color: '#FFFFFF',
    fontSize: rs(12),
    fontWeight: '600',
  },
  spacer: {
    height: hp(2),
  },
});
