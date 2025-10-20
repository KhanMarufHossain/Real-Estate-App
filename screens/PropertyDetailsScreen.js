import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  FlatList,
  Linking,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { wp, hp, rs } from '../utils/responsive';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useFavorites } from '../hooks/useFavorites';
import RegisterInterestModal from '../components/RegisterInterestModal';
import { useAuth } from '../contexts/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PropertyDetailsScreen({ route, navigation }) {
  const { propertyId } = route.params || {};
  
  // Favorites hook
  const { isFavorited, toggleFavorite } = useFavorites();
  const { user, userProfile } = useAuth();
  
  const [propertyDetails, setPropertyDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedTab, setSelectedTab] = useState('Architecture');
  const [selectedUnitTab, setSelectedUnitTab] = useState('sqft');
  const scrollViewRef = useRef(null);

  // Modal state management
  const [registerInterestModalVisible, setRegisterInterestModalVisible] = useState(false);

  useEffect(() => {
    loadPropertyDetails();
  }, [propertyId]);

  const loadPropertyDetails = async () => {
    if (!propertyId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('[PropertyDetailsScreen] Loading property:', propertyId);
      
      const ApiClient = require('../services/ApiClient').default;
      const response = await ApiClient.get('/single', {
        params: { id: propertyId }
      });
      
      console.log('[PropertyDetailsScreen] Property loaded successfully');
      setPropertyDetails(response?.data || response);
    } catch (error) {
      console.error('[PropertyDetailsScreen] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2EBFA5" />
          <Text style={styles.loadingText}>Loading property details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!propertyDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Property not found</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Parse cover image
  let coverImageUrl = 'https://via.placeholder.com/400x300';
  try {
    if (propertyDetails?.cover?.url) {
      coverImageUrl = propertyDetails.cover.url;
    } else if (propertyDetails?.cover_image_url) {
      if (typeof propertyDetails.cover_image_url === 'string' && propertyDetails.cover_image_url.startsWith('{')) {
        const parsed = JSON.parse(propertyDetails.cover_image_url);
        coverImageUrl = parsed?.url || coverImageUrl;
      }
    }
  } catch (error) {
    console.log('Error parsing cover image:', error);
  }

  // Get visualization images based on selected tab
  const getVisualizationImages = () => {
    const tab = selectedTab.toLowerCase();
    if (tab === 'architecture' && propertyDetails?.architecture) {
      return propertyDetails.architecture;
    } else if (tab === 'lobby' && propertyDetails?.lobby) {
      return propertyDetails.lobby;
    } else if (tab === 'interior' && propertyDetails?.interior) {
      return propertyDetails.interior;
    }
    return [];
  };

  const visualizationImages = getVisualizationImages();

  // Parse coordinates for map
  let mapRegion = null;
  if (propertyDetails?.coordinates) {
    const [lat, lng] = propertyDetails.coordinates.split(',').map(coord => parseFloat(coord.trim()));
    console.log('[PropertyDetailsScreen] Map coordinates:', { lat, lng, coordinates: propertyDetails.coordinates });
    if (!isNaN(lat) && !isNaN(lng)) {
      mapRegion = {
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      };
      console.log('[PropertyDetailsScreen] Map region created:', mapRegion);
    }
  }

  const renderDeveloperInfo = () => (
    <View style={styles.developerSection}>
      <View style={styles.developerHeader}>
        {propertyDetails?.developer_data?.logo_image?.[0]?.url && (
          <Image
            source={{ uri: propertyDetails.developer_data.logo_image[0].url }}
            style={styles.developerLogo}
            resizeMode="contain"
          />
        )}
        <Text style={styles.developerName}>
          {propertyDetails?.developer || 'Developer'}
        </Text>
      </View>
      <Text style={styles.developerTitle}>Developments</Text>
    </View>
  );

  const renderPrice = () => {
    let priceText = 'Price on request';
    if (propertyDetails?.min_price && propertyDetails?.price_currency) {
      priceText = `${propertyDetails.price_currency} ${Math.floor(propertyDetails.min_price).toLocaleString()}`;
    } else if (propertyDetails?.min_price_aed) {
      priceText = `AED ${Math.floor(propertyDetails.min_price_aed).toLocaleString()}`;
    }
    return priceText;
  };

  const renderDescription = () => {
    if (!propertyDetails?.overview) return null;
    
    // Remove markdown formatting for simple display
    const cleanText = propertyDetails.overview
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .trim();

    return (
      <View style={styles.descriptionSection}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.descriptionText} numberOfLines={6}>
          {cleanText}
        </Text>
        <TouchableOpacity>
          <Text style={styles.readAllText}>Read All</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderVisualizations = () => (
    <View style={styles.visualizationsSection}>
      <Text style={[styles.sectionTitle, {marginLeft: wp(4)}]}>Visualisations</Text>
      
      {/* Tabs */}
      <View style={styles.visualizationTabs}>
        {['Architecture', 'Lobby', 'Interior'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.visualizationTab,
              selectedTab === tab && styles.visualizationTabActive
            ]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[
              styles.visualizationTabText,
              selectedTab === tab && styles.visualizationTabTextActive
            ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Images */}
      {visualizationImages.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.visualizationImages}>
          {visualizationImages.map((img, index) => (
            <TouchableOpacity key={index} style={styles.visualizationImageContainer}>
              <Image
                source={{ uri: img?.url || img }}
                style={styles.visualizationImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.registerButton}
          onPress={() => setRegisterInterestModalVisible(true)}
        >
          <Icon name="lightning-bolt" size={rs(16)} color="#FFFFFF" />
          <Text style={styles.registerButtonText}>Register Interest</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.callButton}
          onPress={() => {
            navigation.navigate('ScheduleCall', {
              propertyId: propertyDetails?.id,
              propertyName: propertyDetails?.name || 'Property',
            });
          }}
        >
          <Icon name="phone" size={rs(16)} color="#FFFFFF" />
          <Text style={styles.callButtonText}>Schedule Call</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFacilities = () => {
    if (!propertyDetails?.facilities || propertyDetails.facilities.length === 0) return null;

    return (
      <View style={styles.facilitiesSection}>
        <View style={styles.facilitiesHeader}>
          <Text style={styles.sectionTitle}>Facilities</Text>
          <View style={styles.facilitiesBadge}>
            <Text style={styles.facilitiesBadgeText}>{propertyDetails.facilities.length} Facilities</Text>
          </View>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {propertyDetails.facilities.map((facility, index) => (
            <View key={index} style={styles.facilityCard}>
              <Image
                source={{ uri: facility?.image?.url }}
                style={styles.facilityImage}
                resizeMode="cover"
              />
              <View style={styles.facilityOverlay}>
                <Text style={styles.facilityName}>{facility?.name}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderAvailableUnits = () => {
    if (!propertyDetails?.unit_blocks || propertyDetails.unit_blocks.length === 0) return null;

    return (
      <View style={styles.availableUnitsSection}>
        <View style={styles.unitsHeader}>
          <Text style={styles.sectionTitle}>Available Units</Text>
          <View style={styles.unitTabs}>
            <TouchableOpacity
              style={[styles.unitTab, selectedUnitTab === 'sqft' && styles.unitTabActive]}
              onPress={() => setSelectedUnitTab('sqft')}
            >
              <Text style={[styles.unitTabText, selectedUnitTab === 'sqft' && styles.unitTabTextActive]}>sqft</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.unitTab, selectedUnitTab === 'm²' && styles.unitTabActive]}
              onPress={() => setSelectedUnitTab('m²')}
            >
              <Text style={[styles.unitTabText, selectedUnitTab === 'm²' && styles.unitTabTextActive]}>m²</Text>
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={propertyDetails.unit_blocks}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => {
            // Parse typical unit image
            let unitImageUrl = 'https://via.placeholder.com/150';
            try {
              if (item?.typical_unit_image_url) {
                if (typeof item.typical_unit_image_url === 'string' && item.typical_unit_image_url.startsWith('[')) {
                  const parsed = JSON.parse(item.typical_unit_image_url);
                  unitImageUrl = parsed[0]?.url || unitImageUrl;
                }
              }
            } catch (error) {
              console.log('Error parsing unit image:', error);
            }

            const areaFrom = selectedUnitTab === 'sqft' 
              ? item?.units_area_from 
              : item?.units_area_from_m2;
            const areaTo = selectedUnitTab === 'sqft'
              ? item?.units_area_to
              : item?.units_area_to_m2;

            return (
              <View style={styles.unitCard}>
                <Image
                  source={{ uri: unitImageUrl }}
                  style={styles.unitImage}
                  resizeMode="contain"
                />
                <View style={styles.unitInfo}>
                  <Text style={styles.unitType}>{item?.unit_type || 'Apartments'}</Text>
                  <Text style={styles.unitBedrooms}>
                    🛏️ {item?.unit_bedrooms || item?.bedrooms_amount}
                  </Text>
                  {areaFrom && areaTo && (
                    <Text style={styles.unitPrice}>
                      {item?.price_currency || 'AED'} {parseFloat(areaFrom).toFixed(0)} - {parseFloat(areaTo).toFixed(0)}
                    </Text>
                  )}
                  <Text style={styles.unitArea}>
                    From {areaFrom ? parseFloat(areaFrom).toFixed(0) : '0'} {selectedUnitTab}
                  </Text>
                </View>
              </View>
            );
          }}
        />

        {(propertyDetails?.brochure_url || propertyDetails?.layouts_pdf) && (
          <View style={styles.brochureButtons}>
            {propertyDetails?.brochure_url && (
              <TouchableOpacity 
                style={styles.brochureButton}
                onPress={() => {
                  if (propertyDetails.brochure_url) {
                    Linking.openURL(propertyDetails.brochure_url).catch(err => 
                      console.error('Error opening brochure:', err)
                    );
                  }
                }}
              >
                <Text style={styles.brochureButtonText}>View Brochure</Text>
              </TouchableOpacity>
            )}
            {propertyDetails?.layouts_pdf && (
              <TouchableOpacity 
                style={styles.brochureButton}
                onPress={() => {
                  if (propertyDetails.layouts_pdf) {
                    Linking.openURL(propertyDetails.layouts_pdf).catch(err => 
                      console.error('Error opening layout:', err)
                    );
                  }
                }}
              >
                <Text style={styles.brochureButtonText}>View Layout</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderPaymentPlans = () => {
    if (!propertyDetails?.payment_plans || propertyDetails.payment_plans.length === 0) return null;

    return (
      <View style={styles.paymentPlansSection}>
        <Text style={styles.sectionTitle}>Payment Plans</Text>
        
        {propertyDetails.payment_plans.map((plan, planIndex) => (
          <View key={planIndex} style={styles.paymentPlanBlock}>
            <Text style={styles.paymentPlanName}>{plan?.Plan_name || 'Payment Plan'}</Text>
            
            <View style={styles.paymentTable}>
              <View style={styles.paymentTableHeader}>
                <Text style={[styles.paymentTableHeaderText, { flex: 1 }]}>Installment</Text>
                <Text style={[styles.paymentTableHeaderText, { flex: 2 }]}>Payment Time</Text>
                <Text style={[styles.paymentTableHeaderText, { flex: 1 }]}>Percentage</Text>
              </View>

              {plan?.Payments && plan.Payments.map((paymentGroup, groupIndex) => 
                paymentGroup.map((payment, paymentIndex) => (
                  <View key={`${groupIndex}-${paymentIndex}`} style={styles.paymentTableRow}>
                    <Text style={[styles.paymentTableCell, { flex: 1 }]}>{payment?.Order || groupIndex + 1}</Text>
                    <Text style={[styles.paymentTableCell, { flex: 2 }]}>{payment?.Payment_time || '-'}</Text>
                    <Text style={[styles.paymentTableCell, { flex: 1 }]}>{payment?.Percent_of_payment || 0}%</Text>
                  </View>
                ))
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderLocation = () => {
    if (!mapRegion) return null;

    return (
      <View style={styles.locationSection}>
        <Text style={styles.sectionTitle}>Location</Text>
        
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={mapRegion}
            zoomEnabled={true}
            scrollEnabled={true}
            rotateEnabled={false}
            pitchEnabled={false}
          >
            <Marker
              coordinate={{
                latitude: mapRegion.latitude,
                longitude: mapRegion.longitude,
              }}
              title={propertyDetails?.name}
              description={propertyDetails?.area}
             
            />
           
          </MapView>
          <TouchableOpacity 
            style={styles.mapFullscreenButton}
            onPress={() => {
              const url = `https://www.google.com/maps/search/?api=1&query=${mapRegion.latitude},${mapRegion.longitude}`;
              Linking.openURL(url);
            }}
          >
            <Text style={styles.mapFullscreenIcon}>⛶</Text>
          </TouchableOpacity>
        </View>

        {/* Nearby Points */}
        {propertyDetails?.map_points && propertyDetails.map_points.length > 0 && (
          <View style={styles.nearbySection}>
            <Text style={styles.nearbyTitle}>Nearby Points of Interest</Text>
            {propertyDetails.map_points.map((point, index) => (
              <View key={index} style={styles.nearbyItem}>
                <View style={styles.nearbyIcon}>
                  <Text style={styles.nearbyIconText}>📍</Text>
                </View>
                <View style={styles.nearbyInfo}>
                  <Text style={styles.nearbyName}>{point?.name}</Text>
                  <Text style={styles.nearbyDistance}>{point?.distance_km} km away</Text>
                </View>
                <Text style={styles.nearbyBadge}>Nearby</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.headerButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Details</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => propertyDetails && toggleFavorite(propertyDetails)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.headerButtonText,
              propertyDetails && isFavorited(propertyDetails.id) && styles.headerFavoriteActive
            ]}>
              {propertyDetails && isFavorited(propertyDetails.id) ? '♥' : '🤍'}
            </Text>
          </TouchableOpacity>
          
        </View>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: coverImageUrl }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          {renderDeveloperInfo()}
        </View>

        {/* Price and Basic Info */}
        <View style={styles.priceSection}>
          <Text style={styles.price}>${renderPrice()}</Text>
          <View style={styles.completionDate}>
            <Text style={styles.completionDateIcon}>📅</Text>
            <Text style={styles.completionDateText}>
              {propertyDetails?.completion_datetime 
                ? new Date(propertyDetails.completion_datetime).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                : 'TBA'}
            </Text>
          </View>
        </View>

        <View style={styles.propertyInfoSection}>
          <Text style={styles.propertyName}>{propertyDetails?.name || 'Property Name'}</Text>
          <Text style={styles.propertyLocation}>
            📍 {propertyDetails?.area || 'Location'}, {propertyDetails?.country || 'United Arab Emirates'}
          </Text>
          <Text style={styles.lastUpdate}>
            Last Update: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </Text>
        </View>

        {/* Description */}
        {renderDescription()}

        {/* Visualizations */}
        {renderVisualizations()}

        {/* Facilities */}
        {renderFacilities()}

        {/* Available Units */}
        {renderAvailableUnits()}

        {/* Payment Plans */}
        {renderPaymentPlans()}

        {/* Location & Map */}
        {renderLocation()}

        {/* Bottom Action Buttons */}
        <View style={styles.bottomActions}>
          <TouchableOpacity 
            style={styles.bottomRegisterButton}
            onPress={() => {
              // TODO: Navigate to Register Interest screen
              console.log('Register Interest for property:', propertyDetails?.id);
            }}
          >
            <Text style={styles.bottomRegisterButtonText}>📝 Register Interest</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.bottomCallButton}
            onPress={() => {
              // TODO: Navigate to Schedule Call screen
              console.log('Schedule Call for property:', propertyDetails?.id);
            }}
          >
            <Text style={styles.bottomCallButtonText}>📞 Schedule a Call</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: hp(5) }} />
      </ScrollView>

      {/* Register Interest Modal */}
      <RegisterInterestModal
        visible={registerInterestModalVisible}
        onClose={() => setRegisterInterestModalVisible(false)}
        propertyId={propertyDetails?.id}
        propertyName={propertyDetails?.name || 'Property'}
        propertyLocation={propertyDetails?.area || 'Location'}
      />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerButton: {
    width: rs(40),
    height: rs(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
    fontSize: rs(24),
    color: '#1A1A1A',
  },
  headerFavoriteActive: {
    color: '#FF3B30',
  },
  headerTitle: {
    fontSize: rs(18),
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerRight: {
    flexDirection: 'row',
    gap: wp(2),
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: hp(2),
    fontSize: rs(14),
    color: '#757575',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(5),
  },
  errorText: {
    fontSize: rs(16),
    color: '#757575',
    marginBottom: hp(2),
  },
  backButton: {
    paddingHorizontal: wp(6),
    paddingVertical: hp(1.5),
    backgroundColor: '#2EBFA5',
    borderRadius: rs(8),
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: rs(14),
    fontWeight: '600',
  },
  heroContainer: {
    height: hp(35),
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  developerSection: {
    position: 'absolute',
    bottom: hp(2),
    left: wp(5),
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: wp(3),
    borderRadius: rs(12),
  },
  developerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  developerLogo: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(8),
  },
  developerName: {
    fontSize: rs(14),
    fontWeight: '700',
    color: '#1A1A1A',
  },
  developerTitle: {
    fontSize: rs(11),
    color: '#757575',
    marginTop: hp(0.5),
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    backgroundColor: '#FFFFFF',
  },
  price: {
    fontSize: rs(24),
    fontWeight: '700',
    color: '#1A1A1A',
  },
  completionDate: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5F3',
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    borderRadius: rs(8),
    gap: wp(1),
  },
  completionDateIcon: {
    fontSize: rs(14),
  },
  completionDateText: {
    fontSize: rs(12),
    color: '#2EBFA5',
    fontWeight: '600',
  },
  propertyInfoSection: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  propertyName: {
    fontSize: rs(22),
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: hp(1),
  },
  propertyLocation: {
    fontSize: rs(14),
    color: '#757575',
    marginBottom: hp(0.5),
  },
  lastUpdate: {
    fontSize: rs(12),
    color: '#9E9E9E',
  },
  descriptionSection: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    backgroundColor: '#FFFFFF',
    marginTop: hp(1),
  },
  sectionTitle: {
    fontSize: rs(18),
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: hp(1.5),
  },
  descriptionText: {
    fontSize: rs(14),
    color: '#555',
    lineHeight: rs(20),
    marginBottom: hp(1),
  },
  readAllText: {
    fontSize: rs(14),
    color: '#2EBFA5',
    fontWeight: '600',
  },
  visualizationsSection: {
    paddingTop: hp(2),
    backgroundColor: '#FFFFFF',
    marginTop: hp(1),
  },
  visualizationTabs: {
    flexDirection: 'row',
    paddingHorizontal: wp(5),
    gap: wp(2),
    marginBottom: hp(2),
  },
  visualizationTab: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: rs(20),
    backgroundColor: '#F5F5F5',
  },
  visualizationTabActive: {
    backgroundColor: '#2EBFA5',
  },
  visualizationTabText: {
    fontSize: rs(13),
    color: '#757575',
    fontWeight: '600',
  },
  visualizationTabTextActive: {
    color: '#FFFFFF',
  },
  visualizationImages: {
    paddingLeft: wp(5),
    marginBottom: hp(2),
  },
  visualizationImageContainer: {
    marginRight: wp(3),
  },
  visualizationImage: {
    width: wp(70),
    height: hp(20),
    borderRadius: rs(12),
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: wp(5),
    paddingBottom: hp(2),
    gap: wp(3),
  },
  registerButton: {
    flex: 1,
    backgroundColor: '#2EBFA5',
    paddingVertical: hp(1.5),
    borderRadius: rs(12),
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: rs(14),
    fontWeight: '600',
  },
  callButton: {
    flex: 1,
    backgroundColor: '#2EBFA5',
    paddingVertical: hp(1.5),
    borderRadius: rs(12),
    alignItems: 'center',
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: rs(14),
    fontWeight: '600',
  },
  facilitiesSection: {
    paddingTop: hp(2),
    backgroundColor: '#FFFFFF',
    marginTop: hp(1),
  },
  facilitiesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    marginBottom: hp(2),
  },
  facilitiesBadge: {
    backgroundColor: '#2EBFA5',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    borderRadius: rs(15),
  },
  facilitiesBadgeText: {
    color: '#FFFFFF',
    fontSize: rs(12),
    fontWeight: '600',
  },
  facilityCard: {
    width: wp(45),
    height: hp(20),
    marginLeft: wp(5),
    borderRadius: rs(12),
    overflow: 'hidden',
    position: 'relative',
  },
  facilityImage: {
    width: '100%',
    height: '100%',
  },
  facilityOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: wp(3),
  },
  facilityName: {
    color: '#FFFFFF',
    fontSize: rs(14),
    fontWeight: '600',
  },
  availableUnitsSection: {
    paddingTop: hp(2),
    backgroundColor: '#FFFFFF',
    marginTop: hp(1),
  },
  unitsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    marginBottom: hp(2),
  },
  unitTabs: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: rs(8),
    padding: rs(2),
  },
  unitTab: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.8),
    borderRadius: rs(6),
  },
  unitTabActive: {
    backgroundColor: '#2EBFA5',
  },
  unitTabText: {
    fontSize: rs(12),
    color: '#757575',
    fontWeight: '600',
  },
  unitTabTextActive: {
    color: '#FFFFFF',
  },
  unitCard: {
    width: wp(45),
    marginLeft: wp(5),
    backgroundColor: '#F9F9F9',
    borderRadius: rs(12),
    padding: wp(3),
    marginBottom: hp(2),
  },
  unitImage: {
    width: '100%',
    height: hp(18),
    marginBottom: hp(1),
  },
  unitInfo: {
    gap: hp(0.5),
  },
  unitType: {
    fontSize: rs(12),
    color: '#757575',
  },
  unitBedrooms: {
    fontSize: rs(14),
    fontWeight: '600',
    color: '#1A1A1A',
  },
  unitPrice: {
    fontSize: rs(16),
    fontWeight: '700',
    color: '#2EBFA5',
  },
  unitArea: {
    fontSize: rs(12),
    color: '#757575',
  },
  brochureButtons: {
    flexDirection: 'row',
    paddingHorizontal: wp(5),
    paddingBottom: hp(2),
    gap: wp(3),
  },
  brochureButton: {
    flex: 1,
    backgroundColor: '#2EBFA5',
    paddingVertical: hp(1.5),
    borderRadius: rs(12),
    alignItems: 'center',
  },
  brochureButtonText: {
    color: '#FFFFFF',
    fontSize: rs(13),
    fontWeight: '600',
  },
  paymentPlansSection: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    backgroundColor: '#FFFFFF',
    marginTop: hp(1),
  },
  paymentPlanBlock: {
    marginBottom: hp(2),
  },
  paymentPlanName: {
    fontSize: rs(16),
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: hp(1),
  },
  paymentTable: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: rs(8),
    overflow: 'hidden',
  },
  paymentTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(3),
  },
  paymentTableHeaderText: {
    fontSize: rs(12),
    fontWeight: '700',
    color: '#1A1A1A',
  },
  paymentTableRow: {
    flexDirection: 'row',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(3),
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  paymentTableCell: {
    fontSize: rs(12),
    color: '#555',
  },
  locationSection: {
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    backgroundColor: '#FFFFFF',
    marginTop: hp(1),
  },
  mapContainer: {
    height: hp(25),
    borderRadius: rs(12),
    overflow: 'hidden',
    marginBottom: hp(2),
    position: 'relative',
    backgroundColor: '#E0E0E0',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapFullscreenButton: {
    position: 'absolute',
    top: rs(10),
    right: rs(10),
    width: rs(40),
    height: rs(40),
    backgroundColor: '#FFFFFF',
    borderRadius: rs(8),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mapFullscreenIcon: {
    fontSize: rs(20),
    color: '#1A1A1A',
  },
  nearbySection: {
    marginTop: hp(1),
  },
  nearbyTitle: {
    fontSize: rs(16),
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: hp(1.5),
  },
  nearbyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  nearbyIcon: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(20),
    backgroundColor: '#E8F5F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  nearbyIconText: {
    fontSize: rs(18),
  },
  nearbyInfo: {
    flex: 1,
  },
  nearbyName: {
    fontSize: rs(14),
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: hp(0.3),
  },
  nearbyDistance: {
    fontSize: rs(12),
    color: '#757575',
  },
  nearbyBadge: {
    fontSize: rs(12),
    color: '#2EBFA5',
    fontWeight: '600',
  },
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    gap: wp(3),
    backgroundColor: '#FFFFFF',
    marginTop: hp(1),
  },
  bottomRegisterButton: {
    flex: 1,
    backgroundColor: '#2EBFA5',
    paddingVertical: hp(2),
    borderRadius: rs(12),
    alignItems: 'center',
  },
  bottomRegisterButtonText: {
    color: '#FFFFFF',
    fontSize: rs(14),
    fontWeight: '700',
  },
  bottomCallButton: {
    flex: 1,
    backgroundColor: '#2EBFA5',
    paddingVertical: hp(2),
    borderRadius: rs(12),
    alignItems: 'center',
  },
  bottomCallButtonText: {
    color: '#FFFFFF',
    fontSize: rs(14),
    fontWeight: '700',
  },
});
