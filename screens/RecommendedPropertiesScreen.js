import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../hooks/useFavorites';
import { wp, hp, rs } from '../utils/responsive';

// City area IDs configuration
const CITY_AREAS = {
  dubai: [49, 19, 294, 208, 255, 8, 91, 157, 29, 6, 20, 2, 50, 34, 79, 23, 93, 77, 195, 47, 279, 229, 36, 45, 60, 70, 115],
  rasAlKhaimah: [209, 234, 117, 169, 118, 141, 114, 245, 163, 199],
  abuDhabi: [96, 228, 271, 198, 201, 139, 112, 281, 177, 251, 176, 136, 120, 292, 230, 288, 100],
  sharjah: [268, 273, 248, 250, 109, 116, 260, 205, 287, 121, 202, 240, 263, 272, 286, 266, 98, 137],
  ajman: [97, 264, 135],
};

export default function RecommendedPropertiesScreen({ navigation }) {
  const { user } = useAuth();
  const { isFavorited, toggleFavorite } = useFavorites();
  
  const [recommendedProperties, setRecommendedProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      fetchRecommendedProperties();
    }
  }, [user]);

  const fetchRecommendedProperties = async () => {
    setLoading(true);
    try {
      const ApiClient = require('../services/ApiClient').default;
      
      // Fetch first property from each area
      const [dubai, rasAlKhaimah, abuDhabi, sharjah, ajman] = await Promise.all([
        ApiClient.get('/properties', { params: { areas: CITY_AREAS.dubai[0], per_page: 1 } }),
        ApiClient.get('/properties', { params: { areas: CITY_AREAS.rasAlKhaimah[0], per_page: 1 } }),
        ApiClient.get('/properties', { params: { areas: CITY_AREAS.abuDhabi[0], per_page: 1 } }),
        ApiClient.get('/properties', { params: { areas: CITY_AREAS.sharjah[0], per_page: 1 } }),
        ApiClient.get('/properties', { params: { areas: CITY_AREAS.ajman[0], per_page: 1 } }),
      ]);

      // Combine into array of 5 properties
      const properties = [
        dubai?.data?.items?.[0],
        rasAlKhaimah?.data?.items?.[0],
        abuDhabi?.data?.items?.[0],
        sharjah?.data?.items?.[0],
        ajman?.data?.items?.[0],
      ].filter(Boolean);

      setRecommendedProperties(properties);
    } catch (error) {
      console.error('Error fetching recommended properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyPress = (property) => {
    navigation.navigate('PropertyDetails', { propertyId: property.id });
  };

  const renderPropertyCard = ({ item }) => {
    // Parse cover image URL
    let coverImageUrl = 'https://via.placeholder.com/300x180';
    try {
      if (item?.cover_image_url) {
        const parsed = typeof item.cover_image_url === 'string' 
          ? JSON.parse(item.cover_image_url) 
          : item.cover_image_url;
        coverImageUrl = parsed?.url || coverImageUrl;
      }
    } catch (e) {
      coverImageUrl = item?.cover_image_url || item?.image || item?.mainImage || coverImageUrl;
    }

    // Format completion date
    let completionDate = 'TBA';
    if (item?.completion_datetime) {
      const date = new Date(item.completion_datetime);
      completionDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    }

    // Format price
    const minPrice = item?.min_price_aed || item?.min_price || item?.priceFrom || item?.startingPrice;
    const formattedPrice = minPrice ? new Intl.NumberFormat().format(minPrice) : '827,530';

    return (
      <TouchableOpacity 
        style={styles.propertyCard}
        onPress={() => handlePropertyPress(item)}
        activeOpacity={0.9}
      >
        <Image 
          source={{ uri: coverImageUrl }}
          style={styles.propertyImage}
          resizeMode="cover"
        />
        <View style={styles.availableBadge}>
          <Text style={styles.availableBadgeText}>Available</Text>
        </View>
        
        <View style={styles.propertyInfo}>
          <View style={styles.propertyHeader}>
            <Text style={styles.propertyName} numberOfLines={1}>
              {item?.name || item?.projectName || 'Property Name'}
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
          
          <View style={styles.locationRow}>
            <Icon name="map-marker" size={rs(12)} color="#757575" />
            <Text style={styles.locationText} numberOfLines={1}>
              {item?.area || item?.location || 'Dubai'}
            </Text>
          </View>
          
          <View style={styles.priceRow}>
            <View style={styles.priceBox}>
              <Text style={styles.priceLabel}>Starting from</Text>
              <Text style={styles.priceValue}>
                AED {formattedPrice}
              </Text>
            </View>
            <View style={styles.areaBo}>
              <Text style={styles.areaLabel}>AED/sqFt</Text>
              <Text style={styles.areaValue}>
                {item?.min_price_per_area_unit?.toFixed(0) || item?.pricePerSqft || 'N/A'}
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
                {completionDate}
              </Text>
            </View>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.registerButton}>
              <Icon name="lightning-bolt" size={rs(11)} color="#FFFFFF" />
              <Text style={styles.registerButtonText}> Register</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.whatsappButton}>
              <Icon name="whatsapp" size={rs(11)} color="#FFFFFF" />
              <Text style={styles.whatsappButtonText}> WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.callButton}>
              <Icon name="phone" size={rs(11)} color="#FFFFFF" />
              <Text style={styles.callButtonText}> Call</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Recommended Properties</Text>
        <View style={styles.backButton} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2EBFA5" />
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.propertiesContainer}>
            {recommendedProperties.length > 0 ? (
              <FlatList
                data={recommendedProperties}
                renderItem={renderPropertyCard}
                keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
                scrollEnabled={false}
                contentContainerStyle={styles.propertiesList}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No properties found</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: hp(3),
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: rs(40),
    height: rs(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: rs(20),
    fontWeight: '700',
    color: '#1A1A1A',
  },
  scrollView: {
    flex: 1,
  },
  propertiesContainer: {
    padding: wp(5),
  },
  propertiesList: {
    gap: hp(2),
  },
  propertyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: rs(16),
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
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1.2),
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
  areaBo: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(5),
  },
  emptyText: {
    fontSize: rs(14),
    color: '#757575',
  },
});
