import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { wp, hp, rs } from '../utils/responsive';

export default function AboutMarrfaScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Company');

  const tabs = ['Company', 'Our Team', 'History', 'Contact Us'];

  // Team data
  const teamMembers = [
    { id: 1, name: 'Jamil Ahmed', title: 'Founder & CEO', image: require('../assets/JamilAhmed.png') },
    { id: 2, name: 'Mallika Boobna', title: 'Director- Singapore', image: require('../assets/MallikaBoobna.png') },
    { id: 3, name: 'Grace Nwosu', title: 'Investment Country\nDirectorAfrica', image: require('../assets/GraceNwosu.png') },
    { id: 4, name: 'Nabil Peerally', title: 'Investment Country\nDirector Mauritius', image: require('../assets/NabilPeerally.png') },
    { id: 5, name: 'Sarah Mangulamas', title: 'Investment Country\nDirector Malaysia', image: require('../assets/SarahManulamas.png') },
    { id: 6, name: 'Arman Manukyan', title: 'Investment Country\nDirector Armenia', image: require('../assets/ArmanManukyan.png') },
    { id: 7, name: 'Eliza Mae Edquiban', title: 'HR ManagerUAE', image: require('../assets/ElizaMaeEdquiban.png') },
  ];

  // History timeline data
  const timeline = [
    {
      year: '2024',
      title: 'Partnerships and Growth',
      description: 'Marrfa formed strategic partnerships with key real estate developers and expanded its offerings to include exclusive investment opportunities and enhanced market insights.',
    },
    {
      year: '2023',
      title: 'Platform Launch',
      description: 'Marrfa launched its online platform, offering a data-driven approach to discovering and comparing international real estate properties.',
    },
    {
      year: '2022',
      title: 'Foundation Stone',
      description: 'Marrfa was established to address the challenges in cross-border real estate investments, focusing on creating a more transparent and streamlined process for investors worldwide.',
    },
  ];

  const renderCompanyTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Company</Text>
        
        <Text style={styles.descriptionText}>
          Marrfa was founded with a singular vision: to democratize access to global real estate investments. In a world where technology has opened up so many opportunities, the freedom to invest in properties across borders remains limited. Many investors face a fragmented and opaque real estate market, with challenges such as lack of transparency, complex processes, and insufficient data to make informed decisions. Our mission is to break down these barriers and provide investors with the last freedom—the freedom to invest confidently in real estate anywhere in the world.
        </Text>

        <Text style={styles.descriptionText}>
          For many, the journey to finding the right investment property is daunting. Traditional methods involve dealing with countless agents, navigating through unclear regulations, and facing a lack of reliable information. This cumbersome process often leaves investors feeling overwhelmed and uncertain. Marrfa is here to change that.
        </Text>
      </View>
    </ScrollView>
  );

  const renderTeamTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={[styles.subSectionTitle, { marginTop: hp(2), marginBottom: hp(1.5) }]}>Exclusive</Text>
      <FlatList
        data={teamMembers}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={styles.teamCard}>
            <Image source={item.image} style={styles.teamAvatar} />
            <Text style={styles.teamName}>{item.name}</Text>
            <Text style={styles.teamTitle}>{item.title}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled={false}
        columnWrapperStyle={styles.teamRow}
        contentContainerStyle={styles.teamGrid}
      />
    </ScrollView>
  );

  const renderHistoryTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.subSectionTitle}>History</Text>
      <View style={styles.timelineContainer}>
        {timeline.map((event, index) => (
          <View key={index} style={styles.timelineItem}>
            <View style={styles.timelineLeft}>
              <Text style={styles.timelineYear}>{event.year}</Text>
              <View style={[styles.timelineDot, index === 0 && styles.timelineDotActive]} />
              {index < timeline.length - 1 && <View style={styles.timelineLine} />}
            </View>
            <View style={styles.timelineRight}>
              <Text style={styles.timelineTitle}>{event.title}</Text>
              <Text style={styles.timelineDescription}>{event.description}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderContactTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.contactCard}>
        <View style={styles.contactRow}>
          <Icon name="phone" size={rs(24)} color="#2EBFA5" />
          <Text style={styles.contactText}>+971563282700</Text>
        </View>

        <View style={styles.contactRow}>
          <Icon name="email-outline" size={rs(24)} color="#2EBFA5" />
          <Text style={styles.contactText}>sales@marrfa.com</Text>
        </View>

        <View style={styles.contactRow}>
          <Icon name="map-marker" size={rs(24)} color="#2EBFA5" />
          <Text style={styles.contactText}>
            Office number 1201, Tower B, Opus by Omniyat, Business Bay, Dubai.
          </Text>
        </View>
      </View>

     
    </ScrollView>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'Company':
        return renderCompanyTab();
      case 'Our Team':
        return renderTeamTab();
      case 'History':
        return renderHistoryTab();
      case 'Contact Us':
        return renderContactTab();
      default:
        return renderCompanyTab();
    }
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
        <Text style={styles.headerTitle}>About Marrfa</Text>
        <View style={styles.spacerHeader} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
          scrollEventThrottle={16}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && styles.tabActive,
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: hp(2),
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
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
  },
  tabsContent: {
    paddingHorizontal: wp(3),
    gap: wp(2),
    paddingVertical: hp(1),
  },
  tab: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: rs(20),
    backgroundColor: '#E0E0E0',
  },
  tabActive: {
    backgroundColor: '#2EBFA5',
  },
  tabText: {
    fontSize: rs(13),
    fontWeight: '600',
    color: '#1A1A1A',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  tabContent: {
    flex: 1,
  },
  sectionContainer: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
  },
  subSectionTitle: {
    fontSize: rs(24),
    fontWeight: '700',
    color: '#1A1A1A',
    paddingHorizontal: wp(5),
  },
  sectionTitle: {
    fontSize: rs(24),
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: hp(2),
  },
  descriptionText: {
    fontSize: rs(14),
    color: '#1A1A1A',
    lineHeight: rs(22),
    marginBottom: hp(2),
    textAlign: 'justify',
  },
  // Team styles
  teamGrid: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(2),
  },
  teamRow: {
    gap: wp(2),
    justifyContent: 'space-between',
    marginBottom: hp(1.5),
  },
  teamCard: {
    flex: 0.5,
    backgroundColor: '#F5F5F5',
    borderRadius: rs(12),
    padding: wp(4),
    alignItems: 'center',
  },
  teamAvatar: {
    width: rs(80),
    height: rs(80),
    borderRadius: rs(40),
    marginBottom: hp(1.5),
  },
  teamAvatarPlaceholder: {
    width: rs(80),
    height: rs(80),
    borderRadius: rs(40),
    backgroundColor: '#E0E0E0',
    marginBottom: hp(1.5),
  },
  teamName: {
    fontSize: rs(14),
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: hp(0.5),
  },
  teamTitle: {
    fontSize: rs(11),
    color: '#757575',
    textAlign: 'center',
    lineHeight: rs(16),
  },
  // Timeline styles
  timelineContainer: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: hp(2.5),
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: wp(3),
  },
  timelineYear: {
    fontSize: rs(16),
    fontWeight: '700',
    color: '#2EBFA5',
    marginBottom: hp(1),
  },
  timelineDot: {
    width: rs(12),
    height: rs(12),
    borderRadius: rs(6),
    backgroundColor: '#E0E0E0',
    marginBottom: hp(0.5),
  },
  timelineDotActive: {
    backgroundColor: '#2EBFA5',
  },
  timelineLine: {
    width: rs(3),
    height: hp(8),
    backgroundColor: '#2EBFA5',
    marginTop: hp(0.5),
  },
  timelineRight: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: rs(16),
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: hp(0.5),
  },
  timelineDescription: {
    fontSize: rs(13),
    color: '#1A1A1A',
    lineHeight: rs(20),
  },
  // Contact styles
  contactCard: {
    marginHorizontal: wp(5),
    marginTop: hp(2),
    marginBottom: hp(2),
    backgroundColor: '#F5F5F5',
    borderRadius: rs(12),
    padding: wp(4),
    gap: hp(1.5),
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: wp(3),
  },
  contactText: {
    fontSize: rs(13),
    color: '#1A1A1A',
    flex: 1,
    lineHeight: rs(20),
  },
  contactFormSection: {
    marginHorizontal: wp(5),
    marginTop: hp(2),
    marginBottom: hp(4),
  },
  contactFormTitle: {
    fontSize: rs(18),
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: hp(1),
  },
  contactFormDescription: {
    fontSize: rs(13),
    color: '#1A1A1A',
    lineHeight: rs(20),
    marginBottom: hp(2),
  },
  formGroup: {
    marginBottom: hp(1.8),
  },
  formLabel: {
    fontSize: rs(12),
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: hp(0.8),
  },
  formInput: {
    backgroundColor: '#E0E0E0',
    borderRadius: rs(8),
    height: hp(5),
  },
  textAreaInput: {
    height: hp(10),
  },
  spacer: {
    height: hp(2),
  },
});
