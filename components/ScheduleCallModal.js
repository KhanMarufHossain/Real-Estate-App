import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useAuth } from '../contexts/AuthContext';
import MarrfaApi from '../services/MarrfaApi';
import { wp, hp, rs } from '../utils/responsive';

// Time slots for scheduling (30-min intervals from 1 PM to 5:30 PM)
const TIME_SLOTS = [
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30',
];

export default function ScheduleCallModal({ 
  visible, 
  onClose, 
  propertyId,
  propertyName,
}) {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [dates, setDates] = useState([]);

  // Generate next 30 days (excluding weekends and past dates)
  useEffect(() => {
    if (visible) {
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
      setSelectedDate(newDates[0]); // Pre-select first available date
      setSelectedTime(null);
    }
  }, [visible]);

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

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please select both date and time');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: user.displayName || userProfile?.displayName || '',
        email: user.email || '',
        phone: userProfile?.phoneDetails?.phone || '',
        propertyId,
        date: formatDateForSubmit(selectedDate),
        time: selectedTime,
        message: `Schedule call for ${propertyName}`,
        source: 'Schedule Call App',
      };

      console.log('[ScheduleCall] Submitting:', payload);
      
      const response = await MarrfaApi.scheduleCall(payload, user?.email);
      
      console.log('[ScheduleCall] Success:', response);
      
      Alert.alert(
        'Success!',
        `Your call has been scheduled for ${formatDate(selectedDate)} at ${selectedTime}. Our team will call you soon.`,
        [{ text: 'OK', onPress: () => onClose() }]
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

  const renderDateItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.dateItem,
        selectedDate && 
          item.toDateString() === selectedDate.toDateString() &&
          styles.dateItemSelected,
      ]}
      onPress={() => setSelectedDate(item)}
      disabled={loading}
    >
      <Text style={styles.dateItemText}>{formatDate(item)}</Text>
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
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Schedule a Call</Text>
          <Text style={styles.headerSubtitle}>Choose your preferred date and time</Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onClose}
            disabled={loading}
          >
            <Icon name="close" size={rs(24)} color="#1A1A1A" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Property Name */}
          <View style={styles.propertySection}>
            <Text style={styles.propertyName}>{propertyName}</Text>
          </View>

          {/* Date Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Date</Text>
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
            <FlatList
              data={TIME_SLOTS}
              renderItem={renderTimeItem}
              keyExtractor={(item) => item}
              numColumns={5}
              scrollEnabled={false}
              style={styles.timeList}
              columnWrapperStyle={styles.timeListRow}
            />
          </View>

          {/* Confirmation */}
          {selectedDate && selectedTime && (
            <View style={styles.confirmation}>
              <Icon name="check-circle" size={rs(24)} color="#2EBFA5" />
              <Text style={styles.confirmationText}>
                Call scheduled for {formatDate(selectedDate)} at {selectedTime}
              </Text>
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
                <Icon name="phone" size={rs(18)} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>CONFIRM CALL</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.spacer} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: hp(0.3),
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
  content: {
    flex: 1,
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
  },
  propertySection: {
    backgroundColor: '#E8F8F5',
    borderRadius: rs(8),
    paddingVertical: hp(1),
    paddingHorizontal: wp(3),
    marginBottom: hp(2),
    borderLeftWidth: 3,
    borderLeftColor: '#2EBFA5',
  },
  propertyName: {
    fontSize: rs(14),
    fontWeight: '600',
    color: '#1A1A1A',
  },
  section: {
    marginBottom: hp(2.5),
  },
  sectionTitle: {
    fontSize: rs(13),
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: hp(1),
  },
  dateList: {
    flexGrow: 0,
  },
  dateListContent: {
    paddingRight: wp(2),
  },
  dateItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: rs(8),
    paddingVertical: hp(1),
    paddingHorizontal: wp(3),
    marginRight: wp(2),
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  dateItemSelected: {
    backgroundColor: '#2EBFA5',
    borderColor: '#2EBFA5',
  },
  dateItemText: {
    fontSize: rs(11),
    fontWeight: '500',
    color: '#1A1A1A',
  },
  timeList: {
    flexGrow: 0,
  },
  timeListRow: {
    justifyContent: 'space-between',
    gap: wp(2),
    marginBottom: hp(1),
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
    fontSize: rs(12),
    fontWeight: '600',
    color: '#1A1A1A',
  },
  timeItemTextSelected: {
    color: '#FFFFFF',
  },
  confirmation: {
    backgroundColor: '#E8F8F5',
    borderRadius: rs(8),
    padding: wp(4),
    marginVertical: hp(2),
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3),
  },
  confirmationText: {
    flex: 1,
    fontSize: rs(13),
    fontWeight: '600',
    color: '#2EBFA5',
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
  spacer: {
    height: hp(2),
  },
});
