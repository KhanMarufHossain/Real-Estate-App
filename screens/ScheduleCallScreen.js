import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  FlatList,
  SafeAreaView,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useAuth } from '../contexts/AuthContext';
import MarrfaApi from '../services/MarrfaApi';
import { wp, hp, rs } from '../utils/responsive';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Time slots from 9:00 AM to 5:30 PM in 30-min intervals
const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
];

export default function ScheduleCallScreen({ route, navigation }) {
  const { propertyId, propertyName } = route.params || {};
  const { user, userProfile } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [dates, setDates] = useState([]);
  const [showMessage, setShowMessage] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  // Generate next 30 days (excluding weekends and past dates)
  useEffect(() => {
    const newDates = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        newDates.push(new Date(date));
      }
    }
    
    setDates(newDates);
    if (newDates.length > 0) {
      setSelectedDate(newDates[0]); // Pre-select first available date
    }
  }, []);

  // Pre-fill form with user data
  useEffect(() => {
    setFormData({
      name: user?.displayName || userProfile?.displayName || '',
      email: user?.email || '',
      phone: userProfile?.phoneDetails?.phone || '',
      message: `Schedule call for ${propertyName}`,
    });
  }, [user, userProfile, propertyName]);

  const formatDate = (date) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const formatDateForSubmit = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDayOfWeek = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Validation Error', 'Please select both date and time');
      return;
    }

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        propertyId,
        date: formatDateForSubmit(selectedDate),
        time: selectedTime,
        message: formData.message,
        source: 'Schedule Call App',
      };

      console.log('[ScheduleCall] Submitting:', payload);
      
      const response = await MarrfaApi.scheduleCall(payload, user?.email);
      
      console.log('[ScheduleCall] Success:', response);
      
      Alert.alert(
        'Success! 🎉',
        `Your call has been scheduled for ${formatDate(selectedDate)} at ${selectedTime}.\n\nOur team will call you soon!`,
        [{ 
          text: 'OK', 
          onPress: () => navigation.goBack() 
        }]
      );
    } catch (error) {
      console.error('[ScheduleCall] Error:', error);
      Alert.alert(
        'Error',
        error?.message || 'Failed to schedule call. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderDateItem = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.dateItem,
        selectedDate && item.toDateString() === selectedDate.toDateString() && styles.dateItemSelected,
      ]}
      onPress={() => setSelectedDate(item)}
      disabled={loading}
    >
      <Text style={[styles.dateDay, selectedDate && item.toDateString() === selectedDate.toDateString() && styles.dateTextSelected]}>
        {getDayOfWeek(item)}
      </Text>
      <Text style={[styles.dateNumber, selectedDate && item.toDateString() === selectedDate.toDateString() && styles.dateTextSelected]}>
        {item.getDate()}
      </Text>
      <Text style={[styles.dateMonth, selectedDate && item.toDateString() === selectedDate.toDateString() && styles.dateTextSelected]}>
        {item.toLocaleDateString('en-US', { month: 'short' })}
      </Text>
    </TouchableOpacity>
  );

  const renderTimeItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.timeItem,
        selectedTime === item && styles.timeItemSelected,
      ]}
      onPress={() => setSelectedTime(item)}
      disabled={loading}
    >
      <Text style={[
        styles.timeItemText,
        selectedTime === item && styles.timeItemTextSelected,
      ]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Icon name="arrow-left" size={rs(24)} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Schedule a Call</Text>
          <Text style={styles.headerSubtitle}>Select a convenient date and time</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!showMessage}
      >
        {/* Property Info */}
        <View style={styles.propertyInfo}>
          <Icon name="home" size={rs(16)} color="#2EBFA5" />
          <Text style={styles.propertyName}>{propertyName}</Text>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <Text style={styles.sectionSubtitle}>Choose from available business days</Text>
          
          <FlatList
            data={dates}
            renderItem={renderDateItem}
            keyExtractor={(item) => item.toDateString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEnabled={true}
            style={styles.dateList}
            contentContainerStyle={styles.dateListContent}
          />
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Time</Text>
          <Text style={styles.sectionSubtitle}>Available time slots (UTC+4)</Text>
          
          <FlatList
            data={TIME_SLOTS}
            renderItem={renderTimeItem}
            keyExtractor={(item) => item}
            numColumns={3}
            scrollEnabled={false}
            style={styles.timeList}
            columnWrapperStyle={styles.timeListRow}
          />
        </View>

        {/* Form Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Information</Text>
          
          {/* Name Field */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Full Name</Text>
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
            <Text style={styles.label}>Email</Text>
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

          {/* Message Field */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Message (Optional)</Text>
            <TextInput
              style={[styles.input, styles.messageInput]}
              placeholder="Any specific questions?"
              placeholderTextColor="#999"
              value={formData.message}
              onChangeText={(text) => setFormData({ ...formData, message: text })}
              multiline
              numberOfLines={3}
              editable={!loading}
              onFocus={() => setShowMessage(true)}
              onBlur={() => setShowMessage(false)}
            />
          </View>
        </View>

        {/* Confirmation */}
        {selectedDate && selectedTime && (
          <View style={styles.confirmation}>
            <View style={styles.confirmationContent}>
              <Icon name="check-circle" size={rs(24)} color="#2EBFA5" />
              <View style={styles.confirmationText}>
                <Text style={styles.confirmationDate}>{formatDate(selectedDate)}</Text>
                <Text style={styles.confirmationTime}>{selectedTime}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!selectedDate || !selectedTime || loading) && { opacity: 0.6 },
          ]}
          onPress={handleSubmit}
          disabled={!selectedDate || !selectedTime || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size={rs(20)} />
          ) : (
            <>
              <Icon name="phone-check" size={rs(18)} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>CONFIRM CALL</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Alternative Contact */}
        <View style={styles.alternativeSection}>
          <Text style={styles.alternativeTitle}>Need immediate assistance?</Text>
          <View style={styles.alternativeButtons}>
            <TouchableOpacity style={styles.altCallButton}>
              <Icon name="phone" size={rs(14)} color="#FFFFFF" />
              <Text style={styles.altButtonText}>+971 56 328 2700</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.altWhatsappButton}>
              <Icon name="whatsapp" size={rs(14)} color="#FFFFFF" />
              <Text style={styles.altButtonText}>+971 50 733 8357</Text>
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
    marginTop: hp(2), 
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: wp(2),
    marginRight: wp(2),
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: rs(18),
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerSubtitle: {
    fontSize: rs(12),
    color: '#757575',
    marginTop: hp(0.3),
  },
  content: {
    flex: 1,
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
  },
  propertyInfo: {
    backgroundColor: '#E8F8F5',
    borderRadius: rs(8),
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(3),
    marginBottom: hp(2),
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    borderLeftWidth: 3,
    borderLeftColor: '#2EBFA5',
  },
  propertyName: {
    fontSize: rs(14),
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
  },
  section: {
    marginBottom: hp(2.5),
  },
  sectionTitle: {
    fontSize: rs(15),
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: hp(0.5),
  },
  sectionSubtitle: {
    fontSize: rs(11),
    color: '#757575',
    marginBottom: hp(1.2),
  },
  dateList: {
    marginHorizontal: -wp(5),
    paddingHorizontal: wp(5),
  },
  dateListContent: {
    gap: wp(2),
    paddingRight: wp(3),
  },
  dateItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: rs(8),
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(3),
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    minWidth: wp(16),
  },
  dateItemSelected: {
    backgroundColor: '#2EBFA5',
    borderColor: '#2EBFA5',
  },
  dateDay: {
    fontSize: rs(10),
    fontWeight: '600',
    color: '#757575',
    marginBottom: hp(0.3),
  },
  dateNumber: {
    fontSize: rs(16),
    fontWeight: '700',
    color: '#1A1A1A',
  },
  dateMonth: {
    fontSize: rs(10),
    fontWeight: '500',
    color: '#757575',
    marginTop: hp(0.3),
  },
  dateTextSelected: {
    color: '#FFFFFF',
  },
  timeList: {
    marginHorizontal: -wp(5),
    paddingHorizontal: wp(5),
  },
  timeListRow: {
    gap: wp(2),
    marginBottom: hp(1.5),
    justifyContent: 'space-between',
  },
  timeItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: rs(8),
    paddingVertical: hp(1.2),
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  timeItemSelected: {
    backgroundColor: '#2EBFA5',
    borderColor: '#2EBFA5',
  },
  timeItemText: {
    fontSize: rs(13),
    fontWeight: '600',
    color: '#1A1A1A',
  },
  timeItemTextSelected: {
    color: '#FFFFFF',
  },
  formGroup: {
    marginBottom: hp(1.8),
  },
  label: {
    fontSize: rs(12),
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: hp(0.7),
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: rs(8),
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(1.2),
    fontSize: rs(13),
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  messageInput: {
    paddingTop: hp(1),
    paddingBottom: hp(1),
    textAlignVertical: 'top',
  },
  confirmation: {
    backgroundColor: '#E8F8F5',
    borderRadius: rs(8),
    padding: wp(4),
    marginVertical: hp(2),
    borderLeftWidth: 4,
    borderLeftColor: '#2EBFA5',
  },
  confirmationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3),
  },
  confirmationText: {
    flex: 1,
  },
  confirmationDate: {
    fontSize: rs(13),
    fontWeight: '600',
    color: '#1A1A1A',
  },
  confirmationTime: {
    fontSize: rs(16),
    fontWeight: '700',
    color: '#2EBFA5',
    marginTop: hp(0.3),
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
  alternativeSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: rs(8),
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(4),
    marginBottom: hp(2),
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  alternativeTitle: {
    fontSize: rs(12),
    fontWeight: '600',
    color: '#757575',
    marginBottom: hp(1),
    textAlign: 'center',
  },
  alternativeButtons: {
    flexDirection: 'row',
    gap: wp(2),
  },
  altCallButton: {
    flex: 1,
    backgroundColor: '#5B7FFF',
    borderRadius: rs(8),
    paddingVertical: hp(1),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: wp(1),
  },
  altWhatsappButton: {
    flex: 1,
    backgroundColor: '#25D366',
    borderRadius: rs(8),
    paddingVertical: hp(1),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: wp(1),
  },
  altButtonText: {
    color: '#FFFFFF',
    fontSize: rs(11),
    fontWeight: '600',
  },
  spacer: {
    height: hp(3),
  },
});
