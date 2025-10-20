import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Platform,
  StatusBar,
  Linking,
  Alert
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useMarrfaApi } from '../hooks/useMarrfaApi';
import MarrfaApi from '../services/MarrfaApi';
import { useProperties } from '../hooks/useProperties';
import { useFavorites } from '../hooks/useFavorites';
import { wp, hp, rs } from '../utils/responsive';
import BackendConnectionModal from '../components/BackendConnectionModal';
import RegisterInterestModal from '../components/RegisterInterestModal';
import ScheduleCallModal from '../components/ScheduleCallModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// City area IDs configuration
const CITY_AREAS = {
  dubai: [49, 19, 294, 208, 255, 8, 91, 157, 29, 6, 20, 2, 50, 34, 79, 23, 93, 77, 195, 47, 279, 229, 36, 45, 60, 70, 115],
  rasAlKhaimah: [209, 234, 117, 169, 118, 141, 114, 245, 163, 199],
  abuDhabi: [96, 228, 271, 198, 201, 139, 112, 281, 177, 251, 176, 136, 120, 292, 230, 288, 100],
  sharjah: [268, 273, 248, 250, 109, 116, 260, 205, 287, 121, 202, 240, 263, 272, 286, 266, 98, 137],
  ajman: [97, 264, 135],
  ummAlQuwain: [283, 254]
};

export default function FeedScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const topInset = insets.top || (Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0);
  
  const { user, userProfile, externalUserReady } = useAuth();
  const { 
    recommendations, 
    recommendationsLoading, 
    fetchRecommendations,
    lastRecommendationsPayload,
  } = useMarrfaApi();
  const { 
    developers, 
    developersLoading, 
    fetchDevelopers
  } = useProperties();
  
  // Favorites hook
  const { isFavorited, toggleFavorite } = useFavorites();

  const [currency, setCurrency] = useState('USD');
  const [showBackendModal, setShowBackendModal] = useState(false);
  const [retryLoading, setRetryLoading] = useState(false);
  
  // Modal states for contact features
  const [registerInterestModalVisible, setRegisterInterestModalVisible] = useState(false);
  const [scheduleCallModalVisible, setScheduleCallModalVisible] = useState(false);
  const [selectedPropertyForModal, setSelectedPropertyForModal] = useState(null);
  
  // City-based properties state
  const [dubaiProperties, setDubaiProperties] = useState([]);
  const [rasAlKhaimahProperties, setRasAlKhaimahProperties] = useState([]);
  const [abuDhabiProperties, setAbuDhabiProperties] = useState([]);
  const [sharjahProperties, setSharjahProperties] = useState([]);
  const [ajmanProperties, setAjmanProperties] = useState([]);
  const [ummAlQuwainProperties, setUmmAlQuwainProperties] = useState([]);
  const [cityPropertiesLoading, setCityPropertiesLoading] = useState(false);

  // Recommended properties from each area (one from each)
  const [recommendedPropertiesFromAreas, setRecommendedPropertiesFromAreas] = useState([]);
  const [recommendedPropertiesLoading, setRecommendedPropertiesLoading] = useState(false);

  useEffect(() => {
    if (user?.email) {
      const email = String(user.email).trim().toLowerCase();
      console.log('Ensuring JWT & fetching recommendations for:', email);
      MarrfaApi.fetchJwt(email).catch(e => console.log('JWT fetch error:', e?.message));
      fetchRecommendations().catch(err => {
        console.log('Recommendations error:', err.message);
      });
      fetchDevelopers('', 1).catch(err => {
        console.log('Developers error:', err.message);
      });
      fetchAllCityProperties();
      fetchRecommendedPropertiesFromAreas();
    }
  }, [user]);

  const fetchAllCityProperties = async () => {
    setCityPropertiesLoading(true);
    try {
      // Import the API client
      const ApiClient = require('../services/ApiClient').default;
      
      // Fetch only Dubai initially (most popular), lazy load others
      const dubai = await ApiClient.get('/properties', { 
        params: { areas: CITY_AREAS.dubai.join(','), per_page: 10, page: 1 } 
      });
      
      setDubaiProperties(dubai?.data?.items || []);
      
      // Lazy load other cities after Dubai is displayed
      setTimeout(async () => {
        try {
          const [rasAlKhaimah, abuDhabi, sharjah, ajman, ummAlQuwain] = await Promise.all([
            ApiClient.get('/properties', { params: { areas: CITY_AREAS.rasAlKhaimah.join(','), per_page: 10, page: 1 } }),
            ApiClient.get('/properties', { params: { areas: CITY_AREAS.abuDhabi.join(','), per_page: 10, page: 1 } }),
            ApiClient.get('/properties', { params: { areas: CITY_AREAS.sharjah.join(','), per_page: 10, page: 1 } }),
            ApiClient.get('/properties', { params: { areas: CITY_AREAS.ajman.join(','), per_page: 10, page: 1 } }),
            ApiClient.get('/properties', { params: { areas: CITY_AREAS.ummAlQuwain.join(','), per_page: 10, page: 1 } })
          ]);

          setRasAlKhaimahProperties(rasAlKhaimah?.data?.items || []);
          setAbuDhabiProperties(abuDhabi?.data?.items || []);
          setSharjahProperties(sharjah?.data?.items || []);
          setAjmanProperties(ajman?.data?.items || []);
          setUmmAlQuwainProperties(ummAlQuwain?.data?.items || []);
        } catch (error) {
          console.error('Error fetching remaining city properties:', error);
        }
      }, 500); // Load other cities after 500ms
      
    } catch (error) {
      console.error('Error fetching city properties:', error);
    } finally {
      setCityPropertiesLoading(false);
    }
  };

  const fetchRecommendedPropertiesFromAreas = async () => {
    setRecommendedPropertiesLoading(true);
    try {
      const ApiClient = require('../services/ApiClient').default;
      
      // Fetch first property from each area using direct API calls
      const [dubai, rasAlKhaimah, abuDhabi, sharjah, ajman] = await Promise.all([
        ApiClient.get('/properties', { params: { areas: CITY_AREAS.dubai[0] } }),
        ApiClient.get('/properties', { params: { areas: CITY_AREAS.rasAlKhaimah[0] } }),
        ApiClient.get('/properties', { params: { areas: CITY_AREAS.abuDhabi[0] } }),
        ApiClient.get('/properties', { params: { areas: CITY_AREAS.sharjah[0] } }),
        ApiClient.get('/properties', { params: { areas: CITY_AREAS.ajman[0] } }),
      ]);

      // Combine into array of 5 properties
      const properties = [
        dubai?.data?.items?.[0],
        rasAlKhaimah?.data?.items?.[0],
        abuDhabi?.data?.items?.[0],
        sharjah?.data?.items?.[0],
        ajman?.data?.items?.[0],
      ].filter(Boolean);

      console.log('[FeedScreen] Recommended properties loaded:', properties.length);
      setRecommendedPropertiesFromAreas(properties);
    } catch (error) {
      console.error('Error fetching recommended properties from areas:', error);
    } finally {
      setRecommendedPropertiesLoading(false);
    }
  };

  // If backend responds with a message object (e.g., no data), ensure external user and retry once
  useEffect(() => {
    const tryEnsureAndRefetch = async () => {
      if (!user?.email) return;
      const email = String(user.email).trim().toLowerCase();
      try {
        await MarrfaApi.postUser({ email }, email);
        await MarrfaApi.fetchJwt(email);
        console.log('[Recommendations] Retrying after ensuring user...');
        await fetchRecommendations();
      } catch (e) {
        console.log('[Recommendations] Retry failed:', e?.message);
      }
    };
    if (
      !recommendationsLoading &&
      Array.isArray(recommendations) &&
      recommendations.length === 0 &&
      lastRecommendationsPayload &&
      typeof lastRecommendationsPayload === 'object' &&
      lastRecommendationsPayload.message
    ) {
      console.log('[Recommendations] Empty list. Raw payload shape:', {
        hasArray: Array.isArray(lastRecommendationsPayload),
        hasPropsArray: Array.isArray(lastRecommendationsPayload?.properties),
        keys: Object.keys(lastRecommendationsPayload || {}),
        message: lastRecommendationsPayload.message,
      });
      tryEnsureAndRefetch();
    }
  }, [recommendationsLoading, recommendations, lastRecommendationsPayload, user]);

  // Show backend connection modal if user is authenticated but external user is not ready
  useEffect(() => {
    if (user && externalUserReady === false) {
      setShowBackendModal(true);
    } else {
      setShowBackendModal(false);
    }
  }, [user, externalUserReady]);

  const handleRetryConnection = async () => {
    if (!user?.email) return;
    
    setRetryLoading(true);
    try {
      const payload = {
        email: String(user.email).trim().toLowerCase(),
        name: user.displayName || userProfile?.displayName || 'User',
        photo: user.photoURL || userProfile?.photoURL || 'https://via.placeholder.com/150',
      };
      await MarrfaApi.postUser(payload, payload.email);
      await MarrfaApi.fetchJwt(payload.email);
      setShowBackendModal(false);
      // Refresh recommendations after successful connection
      fetchRecommendations();
    } catch (error) {
      console.error('Retry connection failed:', error.message);
    } finally {
      setRetryLoading(false);
    }
  };

  const handlePropertyPress = async (property) => {
    // Navigate to property details
    navigation.navigate('PropertyDetails', { propertyId: property.id });
  };

  const handleDeveloperPress = (developer) => {
    // Navigate to developer properties
    navigation.navigate('DeveloperProperties', { 
      developerId: developer.developerId || developer._id, 
      developerName: developer.developerName || developer.name || 'Developer'
    });
  };

  const renderPropertyCard = ({ item }) => {
    const formatCompletionDate = (datetime) => {
      if (!datetime) return 'TBA';
      try {
        const date = new Date(datetime);
        const month = date.toLocaleString('en', { month: 'short' });
        const year = date.getFullYear();
        return `${month} ${year}`;
      } catch {
        return datetime;
      }
    };
    const formatPrice = (price) => {
      if (!price) return 'N/A';
      return String(price).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };
    
    // Parse cover_image_url which is a JSON string
    let imageUrl = 'https://via.placeholder.com/300x180';
    try {
      if (item?.cover_image_url) {
        if (typeof item.cover_image_url === 'string') {
          const parsed = JSON.parse(item.cover_image_url);
          imageUrl = parsed?.url || imageUrl;
        } else if (typeof item.cover_image_url === 'object' && item.cover_image_url?.url) {
          imageUrl = item.cover_image_url.url;
        }
      } else if (item?.coverImageUrl) {
        imageUrl = item.coverImageUrl;
      } else if (item?.images?.[0]) {
        imageUrl = item.images[0];
      } else if (item?.image) {
        imageUrl = item.image;
      } else if (item?.mainImage) {
        imageUrl = item.mainImage;
      }
    } catch (error) {
      console.log('Error parsing image URL:', error);
      // Fallback to placeholder
    }

    return (
      <TouchableOpacity 
        style={styles.propertyCard}
        onPress={() => handlePropertyPress(item)}
        activeOpacity={0.9}
      >
        <Image 
          source={{ uri: imageUrl }}
          style={styles.propertyImage}
          resizeMode="cover"
        />
        <View style={styles.availableBadge}>
          <Text style={styles.availableBadgeText}>Available</Text>
        </View>
        
        <View style={styles.propertyInfo}>
          <View style={styles.propertyHeader}>
            <Text style={styles.propertyName} numberOfLines={1}>
              {item?.project_name || item?.projectName || item?.name || item?.title || 'IRIDIAN Park 2'}
            </Text>
            <TouchableOpacity 
              style={styles.favoriteButton}
              onPress={(e) => {
                e.stopPropagation();
                toggleFavorite(item);
              }}
              activeOpacity={0.7}
            >
              <Icon 
                name={isFavorited(item.id) ? "heart" : "heart-outline"}
                size={rs(24)}
                color={isFavorited(item.id) ? "#FF3B30" : "#FFFFFF"}
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.priceRow}>
            <View style={styles.priceBox}>
              <Text style={styles.priceLabel}>Starting from</Text>
              <Text style={styles.priceValue}>
                AED {formatPrice(item?.min_price || item?.priceFrom || item?.startingPrice || item?.minPrice)}
              </Text>
            </View>
            <View style={styles.areaBox}>
              <Text style={styles.areaLabel}>AED/{item?.area_unit || item?.areaUnit || 'sqft'}</Text>
              <Text style={styles.areaValue}>
                {item?.per_sqft_price || item?.pricePerSqft || item?.price_per_sqft || 'N/A'}
              </Text>
            </View>
          </View>
          
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Developer</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {item?.developer || 'Developer'}
              </Text>
            </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Completion</Text>
            <Text style={styles.detailValue}>
                {formatCompletionDate(item?.completion_datetime) || item?.completionDate || item?.completion || 'Jun 2027'}
            </Text>
          </View>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.registerButton}
              onPress={() => {
                setSelectedPropertyForModal({
                  id: item?.id,
                  name: item?.project_name || item?.projectName || item?.name || item?.title,
                  location: item?.area || item?.location
                });
                setRegisterInterestModalVisible(true);
              }}
            >
              <Icon name="lightning-bolt" size={rs(11)} color="#FFFFFF" />
              <Text style={styles.registerButtonText}> Register</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.whatsappButton}
              onPress={() => {
                const phoneNumber = '+971507338357';
                const message = encodeURIComponent(`Hi, I'm interested in ${item?.project_name || 'a property'} in ${item?.area || 'Dubai'}.`);
                const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${message}`;
                Linking.openURL(whatsappUrl).catch(() => {
                  Alert.alert('WhatsApp', 'WhatsApp is not installed on your device');
                });
              }}
            >
              <Icon name="whatsapp" size={rs(11)} color="#FFFFFF" />
              <Text style={styles.whatsappButtonText}> WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.callButton}
              onPress={() => {
                const phoneNumber = '+971563282700';
                Linking.openURL(`tel:${phoneNumber}`).catch(() => {
                  Alert.alert('Call', 'Unable to make a call');
                });
              }}
            >
              <Icon name="phone" size={rs(11)} color="#FFFFFF" />
              <Text style={styles.callButtonText}> Call</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDeveloperItem = ({ item, index }) => (
    <TouchableOpacity 
      style={styles.developerItem}
      onPress={() => handleDeveloperPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.developerImageContainer}>
        <Image
          source={{ uri: item?.developerLogo || item?.developerImage || 'https://via.placeholder.com/100' }}
          style={styles.developerImage}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.developerName} numberOfLines={1}>
        {item?.developerName || `Developer ${index + 1}`}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { }]}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* User Header */}
        <View style={styles.userHeader}>
          <View style={styles.userInfo}>
            <Image
              source={{ 
                uri: userProfile?.photoURL || user?.photoURL || 'https://via.placeholder.com/50'
              }}
              style={styles.userAvatar}
            />
            <View style={styles.userTextContainer}>
              <Text style={styles.greeting}>
                Hello,{userProfile?.displayName || user?.displayName?.split(' ')[0] || ''}
              </Text>
             
            </View>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Icon name="bell-outline" size={rs(20)} color="#1A1A1A" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Recommended Properties Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommend for Marrfa</Text>
            <TouchableOpacity onPress={() => navigation.navigate('RecommendedProperties')}>
              <Text style={[styles.seeAllText, {alignSelf: 'flex-end', marginRight: 20, marginBottom: 20}]}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {recommendedPropertiesLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2EBFA5" />
            </View>
          ) : recommendedPropertiesFromAreas.length > 0 ? (
            <FlatList
              horizontal
              data={recommendedPropertiesFromAreas}
              renderItem={renderPropertyCard}
              keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.propertiesList}
              snapToInterval={wp(85) + 12}
              decelerationRate="fast"
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No recommendations yet</Text>
            </View>
          )}
        </View>

        {/* Developers Section */}
        <View style={styles.developersSection}>
          <View style={styles.developersSectionHeader}>
            <Text style={styles.developersTitle}>Developers</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllDevelopers')}>
              <Text style={styles.seeAllText}>
                See All ({developers.length || 55})
              </Text>
            </TouchableOpacity>
          </View>
          
          {developersLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2EBFA5" />
            </View>
          ) : (
            <FlatList
              data={developers.slice(0, 12)}
              renderItem={renderDeveloperItem}
              keyExtractor={(item, index) => item?._id || item?.developerId?.toString() || index.toString()}
              numColumns={3}
              scrollEnabled={false}
              contentContainerStyle={styles.developersGrid}
              columnWrapperStyle={styles.developersRow}
            />
          )}
        </View>

        {/* City-Based Properties Sections */}
        {cityPropertiesLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2EBFA5" />
          </View>
        ) : (
          <>
            {/* Dubai Properties */}
            {dubaiProperties.length > 0 && (
              <View style={[styles.citySection, rasAlKhaimahProperties.length === 0 && abuDhabiProperties.length === 0 && sharjahProperties.length === 0 && ajmanProperties.length === 0 && ummAlQuwainProperties.length === 0 && { paddingBottom: hp(10) }]}>
                <View style={styles.citySectionHeader}>
                  <Text style={styles.cityTitle}>Projects in Dubai</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('AllCityProperties', { cityName: 'Dubai', areaIds: CITY_AREAS.dubai })}>
                    <Text style={styles.seeAllText}>See All ({dubaiProperties.length})</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  horizontal
                  data={dubaiProperties}
                  renderItem={renderPropertyCard}
                  keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.propertiesList}
                  snapToInterval={wp(85) + 12}
                  decelerationRate="fast"
                />
              </View>
            )}

            {/* Ras Al Khaimah Properties */}
            {rasAlKhaimahProperties.length > 0 && (
              <View style={[styles.citySection, abuDhabiProperties.length === 0 && sharjahProperties.length === 0 && ajmanProperties.length === 0 && ummAlQuwainProperties.length === 0 && { paddingBottom: hp(10) }]}>
                <View style={styles.citySectionHeader}>
                  <Text style={styles.cityTitle}>Projects in Ras Al Khaimah</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('AllCityProperties', { cityName: 'Ras Al Khaimah', areaIds: CITY_AREAS.rasAlKhaimah })}>
                    <Text style={styles.seeAllText}>See All ({rasAlKhaimahProperties.length})</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  horizontal
                  data={rasAlKhaimahProperties}
                  renderItem={renderPropertyCard}
                  keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.propertiesList}
                  snapToInterval={wp(85) + 12}
                  decelerationRate="fast"
                />
              </View>
            )}

            {/* Abu Dhabi Properties */}
            {abuDhabiProperties.length > 0 && (
              <View style={[styles.citySection, sharjahProperties.length === 0 && ajmanProperties.length === 0 && ummAlQuwainProperties.length === 0 && { paddingBottom: hp(10) }]}>
                <View style={styles.citySectionHeader}>
                  <Text style={styles.cityTitle}>Projects in Abu Dhabi</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('AllCityProperties', { cityName: 'Abu Dhabi', areaIds: CITY_AREAS.abuDhabi })}>
                    <Text style={styles.seeAllText}>See All ({abuDhabiProperties.length})</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  horizontal
                  data={abuDhabiProperties}
                  renderItem={renderPropertyCard}
                  keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.propertiesList}
                  snapToInterval={wp(85) + 12}
                  decelerationRate="fast"
                />
              </View>
            )}

            {/* Sharjah Properties */}
            {sharjahProperties.length > 0 && (
              <View style={[styles.citySection, ajmanProperties.length === 0 && ummAlQuwainProperties.length === 0 && { paddingBottom: hp(10) }]}>
                <View style={styles.citySectionHeader}>
                  <Text style={styles.cityTitle}>Projects in Sharjah</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('AllCityProperties', { cityName: 'Sharjah', areaIds: CITY_AREAS.sharjah })}>
                    <Text style={styles.seeAllText}>See All ({sharjahProperties.length})</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  horizontal
                  data={sharjahProperties}
                  renderItem={renderPropertyCard}
                  keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.propertiesList}
                  snapToInterval={wp(85) + 12}
                  decelerationRate="fast"
                />
              </View>
            )}

            {/* Ajman Properties */}
            {ajmanProperties.length > 0 && (
              <View style={[styles.citySection, ummAlQuwainProperties.length === 0 && { paddingBottom: hp(10) }]}>
                <View style={styles.citySectionHeader}>
                  <Text style={styles.cityTitle}>Projects in Ajman</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('AllCityProperties', { cityName: 'Ajman', areaIds: CITY_AREAS.ajman })}>
                    <Text style={styles.seeAllText}>See All ({ajmanProperties.length})</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  horizontal
                  data={ajmanProperties}
                  renderItem={renderPropertyCard}
                  keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.propertiesList}
                  snapToInterval={wp(85) + 12}
                  decelerationRate="fast"
                />
              </View>
            )}

            {/* Umm Al Quwain Properties */}
            {ummAlQuwainProperties.length > 0 && (
              <View style={[styles.citySection, { paddingBottom: hp(10) }]}>
                <View style={styles.citySectionHeader}>
                  <Text style={styles.cityTitle}>Projects in Umm Al Quwain</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('AllCityProperties', { cityName: 'Umm Al Quwain', areaIds: CITY_AREAS.ummAlQuwain })}>
                    <Text style={styles.seeAllText}>See All ({ummAlQuwainProperties.length})</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  horizontal
                  data={ummAlQuwainProperties}
                  renderItem={renderPropertyCard}
                  keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.propertiesList}
                  snapToInterval={wp(85) + 12}
                  decelerationRate="fast"
                />
              </View>
            )}
          </>
        )}
      </ScrollView>
      
      <BackendConnectionModal
        visible={showBackendModal}
        onRetry={handleRetryConnection}
        loading={retryLoading}
      />

      {/* Register Interest Modal */}
      <RegisterInterestModal
        visible={registerInterestModalVisible}
        onClose={() => {
          setRegisterInterestModalVisible(false);
          setSelectedPropertyForModal(null);
        }}
        propertyId={selectedPropertyForModal?.id}
        propertyName={selectedPropertyForModal?.name}
        propertyLocation={selectedPropertyForModal?.location}
      />

      {/* Schedule Call Modal */}
      <ScheduleCallModal
        visible={scheduleCallModalVisible}
        onClose={() => {
          setScheduleCallModalVisible(false);
          setSelectedPropertyForModal(null);
        }}
        propertyId={selectedPropertyForModal?.id}
        propertyName={selectedPropertyForModal?.name}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  
  // User Header Styles
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    paddingBottom: hp(2),
    backgroundColor: '#FFFFFF',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: rs(50),
    height: rs(50),
    borderRadius: rs(25),
    backgroundColor: '#E0E0E0',
  },
  userTextContainer: {
    marginLeft: wp(3),
    flex: 1,
  },
  greeting: {
    fontSize: rs(16),
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: hp(0.5),
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1),
  },
  locationPin: {
    fontSize: rs(12),
    marginRight: wp(1),
  },
  locationText2: {
    fontSize: rs(13),
    color: '#757575',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3),
  },
  notificationButton: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(20),
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Section Container
  sectionContainer: {
    marginTop: hp(2),
  },
  sectionTitle: {
    fontSize: rs(20),
    fontWeight: '700',
    color: '#1A1A1A',
    paddingHorizontal: wp(5),
    marginBottom: hp(1.5),
  },
  
  // Property Card Styles
  propertiesList: {
    paddingLeft: wp(5),
    paddingRight: wp(2),
  },
  propertyCard: {
    width: wp(85),
    backgroundColor: '#FFFFFF',
    borderRadius: rs(16),
    marginRight: wp(3),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  propertyImage: {
    width: '100%',
    height: hp(22),
    backgroundColor: '#E0E0E0',
  },
  availableBadge: {
    position: 'absolute',
    top: hp(1.5),
    right: wp(3),
    backgroundColor: '#FFFFFF',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.6),
    borderRadius: rs(12),
  },
  availableBadgeText: {
    fontSize: rs(11),
    fontWeight: '600',
    color: '#2EBFA5',
  },
  propertyInfo: {
    padding: wp(4),
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: hp(0.8),
  },
  propertyName: {
    fontSize: rs(16),
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
    marginRight: wp(2),
  },
  favoriteButton: {
    width: rs(36),
    height: rs(36),
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationText: {
    fontSize: rs(12),
    color: '#757575',
    flex: 1,
    marginLeft: wp(1),
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(1.5),
    gap: wp(2),
  },
  priceBox: {
    flex: 1,
    backgroundColor: '#E8F8F5',
    padding: wp(3),
    borderRadius: rs(8),
  },
  priceLabel: {
    fontSize: rs(10),
    color: '#757575',
    marginBottom: hp(0.3),
  },
  priceValue: {
    fontSize: rs(13),
    fontWeight: '700',
    color: '#1A1A1A',
  },
  areaBox: {
    flex: 0.6,
    backgroundColor: '#F5F5F5',
    padding: wp(3),
    borderRadius: rs(8),
    alignItems: 'center',
  },
  areaLabel: {
    fontSize: rs(10),
    color: '#757575',
    marginBottom: hp(0.3),
  },
  areaValue: {
    fontSize: rs(12),
    fontWeight: '700',
    color: '#1A1A1A',
  },
  detailsRow: {
    flexDirection: 'row',
    gap: wp(3),
    marginBottom: hp(1.5),
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: rs(10),
    color: '#757575',
    marginBottom: hp(0.3),
  },
  detailValue: {
    fontSize: rs(12),
    fontWeight: '600',
    color: '#1A1A1A',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: wp(2),
  },
  registerButton: {
    flex: 1,
    backgroundColor: '#2EBFA5',
    paddingVertical: hp(1.2),
    borderRadius: rs(8),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  registerButtonText: {
    fontSize: rs(11),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  whatsappButton: {
    flex: 1,
    backgroundColor: '#25D366',
    paddingVertical: hp(1.2),
    borderRadius: rs(8),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  whatsappButtonText: {
    fontSize: rs(11),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  callButton: {
    flex: 1,
    backgroundColor: '#5B7FFF',
    paddingVertical: hp(1.2),
    borderRadius: rs(8),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  callButtonText: {
    fontSize: rs(11),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // City-Based Properties Sections
  citySection: {
    marginTop: hp(3),
    paddingBottom: hp(2),
  },
  citySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    marginBottom: hp(1.5),
  },
  cityTitle: {
    fontSize: rs(20),
    fontWeight: '700',
    color: '#1A1A1A',
  },

  // Developers Section
  developersSection: {
    marginTop: hp(3),
    paddingHorizontal: wp(5),
    paddingBottom: hp(2),
  },
  developersSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  developersTitle: {
    fontSize: rs(20),
    fontWeight: '700',
    color: '#1A1A1A',
  },
  seeAllText: {
    fontSize: rs(14),
    fontWeight: '600',
    color: '#2EBFA5',
  },
  developersGrid: {
    paddingBottom: hp(2),
  },
  developersRow: {
    justifyContent: 'space-between',
    marginBottom: hp(2.5),
  },
  developerItem: {
    width: (SCREEN_WIDTH - wp(10) - wp(4)) / 3,
    alignItems: 'center',
    paddingHorizontal: wp(1),
  },
  developerImageContainer: {
    width: (SCREEN_WIDTH - wp(10) - wp(4)) / 3 - wp(2),
    height: hp(10),
    borderRadius: rs(8),
    backgroundColor: '#FFFFFF',
    marginBottom: hp(1),
    padding: wp(2),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  developerImage: {
    width: '100%',
    height: '100%',
  },
  developerName: {
    fontSize: rs(11),
    color: '#1A1A1A',
    textAlign: 'center',
    fontWeight: '500',
    width: '100%',
  },
  
  // Loading & Empty States
  loadingContainer: {
    paddingVertical: hp(5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    paddingVertical: hp(5),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: rs(14),
    color: '#757575',
  },
});
