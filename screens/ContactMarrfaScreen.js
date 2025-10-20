import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { wp, hp, rs } from '../utils/responsive';

export default function ContactMarrfaScreen({ navigation }) {
  const offices = [
    {
      id: 1,
      city: 'New Delhi',
      country: 'India',
      address: 'Office 1803-1804, RG Trade Tower, Sector 7, Kalkaji, New Delhi 110019, India',
      phone: '+919876543210',
      email: 'delhi@marrfa.com',
    },
    {
      id: 2,
      city: 'Business Bay',
      country: 'Dubai',
      address: 'Office number 1201, Tower B, Opus by Omniyat, Business Bay, Dubai, UAE',
      phone: '+971563282700',
      email: 'sales@marrfa.com',
    },
  ];

  const handleDirectCall = (phone) => {
    Linking.openURL(`tel:${phone}`).catch(() => {});
  };

  const handleChatNow = (phone) => {
    const message = `Hello, I'm interested in learning more about Marrfa's services. Can you help me?`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `whatsapp://send?phone=${phone}&text=${encodedMessage}`;
    
    Linking.openURL(whatsappUrl).catch(() => {
      // Fallback if WhatsApp is not installed
      Linking.openURL(`https://wa.me/${phone}?text=${encodedMessage}`);
    });
  };

  const renderOfficeCard = (office) => (
    <View key={office.id} style={styles.officeCard}>
      <Text style={styles.officeCity}>{office.city}</Text>
      <Text style={styles.officeCountry}>{office.country}</Text>

      <View style={styles.officeDetails}>
        <View style={styles.detailRow}>
          <Icon name="map-marker" size={rs(20)} color="#2EBFA5" />
          <Text style={styles.detailText}>{office.address}</Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="phone" size={rs(20)} color="#2EBFA5" />
          <Text style={styles.detailText}>{office.phone}</Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="email-outline" size={rs(20)} color="#2EBFA5" />
          <Text style={styles.detailText}>{office.email}</Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.callButton]}
          onPress={() => handleDirectCall(office.phone.replace(/\D/g, ''))}
        >
          <Icon name="phone" size={rs(18)} color="#FFFFFF" />
          <Text style={styles.callButtonText}>Direct Call</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.chatButton]}
          onPress={() => handleChatNow(office.phone.replace(/\D/g, ''))}
        >
          <Icon name="whatsapp" size={rs(18)} color="#FFFFFF" />
          <Text style={styles.chatButtonText}>Chat Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
        <Text style={styles.headerTitle}>Contact Us</Text>
        <View style={styles.spacerHeader} />
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.introText}>
          Get in touch with our team across multiple locations. We're here to help you with any questions or inquiries.
        </Text>

        <View style={styles.officesContainer}>
          {offices.map((office) => renderOfficeCard(office))}
        </View>

        {/* Additional contact section */}
        <View style={styles.additionalContactSection}>
          <Text style={styles.additionalTitle}>Have Questions?</Text>
          <Text style={styles.additionalText}>
            Our dedicated support team is available to assist you with any inquiries. Whether you're looking for investment opportunities, need more information about properties, or have general questions about Marrfa, we're here to help.
          </Text>

          <TouchableOpacity 
            style={styles.emailContactButton}
            onPress={() => Linking.openURL('mailto:sales@marrfa.com')}
          >
            <Icon name="email-send" size={rs(20)} color="#FFFFFF" />
            <Text style={styles.emailContactButtonText}>Send Email</Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: wp(5),
  },
  introText: {
    fontSize: rs(14),
    color: '#1A1A1A',
    lineHeight: rs(22),
    marginTop: hp(2),
    marginBottom: hp(2),
    textAlign: 'justify',
  },
  officesContainer: {
    marginBottom: hp(2),
  },
  officeCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: rs(16),
    padding: wp(5),
    marginBottom: hp(2),
    borderLeftWidth: rs(5),
    borderLeftColor: '#2EBFA5',
  },
  officeCity: {
    fontSize: rs(20),
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: hp(0.3),
  },
  officeCountry: {
    fontSize: rs(12),
    color: '#757575',
    marginBottom: hp(1.5),
  },
  officeDetails: {
    marginBottom: hp(2),
    gap: hp(1),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: wp(3),
  },
  detailText: {
    fontSize: rs(12),
    color: '#1A1A1A',
    flex: 1,
    lineHeight: rs(18),
  },
  actionButtons: {
    flexDirection: 'row',
    gap: wp(2),
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: rs(10),
    paddingVertical: hp(1.2),
    gap: wp(1.5),
  },
  callButton: {
    backgroundColor: '#5B7FFF',
  },
  chatButton: {
    backgroundColor: '#25D366',
  },
  callButtonText: {
    fontSize: rs(12),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chatButtonText: {
    fontSize: rs(12),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  additionalContactSection: {
    backgroundColor: '#F5F5F5',
    borderRadius: rs(16),
    padding: wp(5),
    marginBottom: hp(3),
  },
  additionalTitle: {
    fontSize: rs(18),
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: hp(1),
  },
  additionalText: {
    fontSize: rs(13),
    color: '#1A1A1A',
    lineHeight: rs(20),
    marginBottom: hp(2),
    textAlign: 'justify',
  },
  emailContactButton: {
    backgroundColor: '#2EBFA5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: rs(10),
    paddingVertical: hp(1.3),
    gap: wp(2),
  },
  emailContactButtonText: {
    fontSize: rs(13),
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
