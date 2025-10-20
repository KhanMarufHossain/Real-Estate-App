import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { wp, hp, rs } from '../utils/responsive';
import ApiClient from '../services/ApiClient';
import { useFavorites } from '../hooks/useFavorites';

// City area IDs configuration (same as FeedScreen)
const CITY_AREAS = {
  dubai: [49, 19, 294, 208, 255, 8, 91, 157, 29, 6, 20, 2, 50, 34, 79, 23, 93, 77, 195, 47, 279, 229, 36, 45, 60, 70, 115],
  rasAlKhaimah: [209, 234, 117, 169, 118, 141, 114, 245, 163, 199],
  abuDhabi: [96, 228, 271, 198, 201, 139, 112, 281, 177, 251, 176, 136, 120, 292, 230, 288, 100],
  sharjah: [268, 273, 248, 250, 109, 116, 260, 205, 287, 121, 202, 240, 263, 272, 286, 266, 98, 137],
  ajman: [97, 264, 135],
  ummAlQuwain: [283, 254]
};

// City coordinates for initial regions
const CITY_REGIONS = {
  dubai: {
    latitude: 25.2048,
    longitude: 55.2708,
    latitudeDelta: 0.4,
    longitudeDelta: 0.4,
  },
  rasAlKhaimah: {
    latitude: 25.6747,
    longitude: 55.9800,
    latitudeDelta: 0.3,
    longitudeDelta: 0.3,
  },
  abuDhabi: {
    latitude: 24.4539,
    longitude: 54.3773,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  },
  sharjah: {
    latitude: 25.3463,
    longitude: 55.4209,
    latitudeDelta: 0.3,
    longitudeDelta: 0.3,
  },
  ajman: {
    latitude: 25.4052,
    longitude: 55.5136,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  },
  ummAlQuwain: {
    latitude: 25.5647,
    longitude: 55.5553,
    latitudeDelta: 0.2,
    longitudeDelta: 0.2,
  },
};

export default function MapScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const topInset = insets.top || (Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0);
  const mapRef = useRef(null);
  
  // Favorites hook
  const { isFavorited, toggleFavorite } = useFavorites();

  const [selectedCity, setSelectedCity] = useState('dubai');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  useEffect(() => {
    loadCityProperties(selectedCity);
  }, [selectedCity]);

  const loadCityProperties = async (city) => {
    try {
      setLoading(true);
      setSelectedProperty(null);
      
      const response = await ApiClient.get('/properties', {
        params: {
          areas: CITY_AREAS[city].join(','),
          per_page: 50, // Load more for map view
          page: 1
        }
      });

      const items = response?.data?.items || [];
      
      // Filter properties with valid coordinates
      const validProperties = items.filter(item => {
        if (!item.coordinates) return false;
        const coords = item.coordinates.split(',').map(c => parseFloat(c.trim()));
        return coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1]);
      });

      setProperties(validProperties);
    } catch (error) {
      console.error('Error loading city properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    
    // Animate map to city region
    if (mapRef.current) {
      mapRef.current.animateToRegion(CITY_REGIONS[city], 1000);
    }
  };

  const handleMarkerPress = (property) => {
    setSelectedProperty(property);
  };

  const handlePropertyCardPress = () => {
    if (selectedProperty) {
      navigation.navigate('PropertyDetails', { propertyId: selectedProperty.id });
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return String(price).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const parseCoordinates = (coordString) => {
    if (!coordString) return null;
    const coords = coordString.split(',').map(c => parseFloat(c.trim()));
    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
      return {
        latitude: coords[0],
        longitude: coords[1],
      };
    }
    return null;
  };

  const renderPropertyCard = () => {
    if (!selectedProperty) return null;

    let imageUrl = 'https://via.placeholder.com/300x180';
    try {
      if (selectedProperty.cover_image_url) {
        if (typeof selectedProperty.cover_image_url === 'string') {
          const parsed = JSON.parse(selectedProperty.cover_image_url);
          imageUrl = parsed?.url || imageUrl;
        } else if (typeof selectedProperty.cover_image_url === 'object') {
          imageUrl = selectedProperty.cover_image_url?.url || imageUrl;
        }
      }
    } catch (error) {
      console.log('Error parsing image URL:', error);
    }

    return (
      <TouchableOpacity
        style={styles.propertyCard}
        onPress={handlePropertyCardPress}
        activeOpacity={0.9}
      >
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setSelectedProperty(null)}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>

        <Image
          source={{ uri: imageUrl }}
          style={styles.cardImage}
          resizeMode="cover"
        />

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {selectedProperty.name}
            </Text>
            <TouchableOpacity 
              style={styles.cardFavoriteButton}
              onPress={(e) => {
                e.stopPropagation();
                toggleFavorite(selectedProperty);
              }}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.cardFavoriteIcon,
                isFavorited(selectedProperty.id) && styles.cardFavoriteIconActive
              ]}>
                {isFavorited(selectedProperty.id) ? '♥' : '🤍'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.cardLocation} numberOfLines={1}>
            📍 {selectedProperty.area}
          </Text>
          <Text style={styles.cardPrice}>
            AED {formatPrice(selectedProperty.min_price)}
          </Text>
          <Text style={styles.cardDeveloper} numberOfLines={1}>
            {selectedProperty.developer}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const cities = [
    { key: 'dubai', label: 'Dubai' },
    { key: 'rasAlKhaimah', label: 'Ras Al Khaimah' },
    { key: 'abuDhabi', label: 'Abu Dhabi' },
    { key: 'sharjah', label: 'Sharjah' },
    { key: 'ajman', label: 'Ajman' },
    { key: 'ummAlQuwain', label: 'Umm Al Quwain' },
  ];

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      {/* City Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {cities.map((city) => (
            <TouchableOpacity
              key={city.key}
              style={[
                styles.cityTab,
                selectedCity === city.key && styles.cityTabActive,
              ]}
              onPress={() => handleCitySelect(city.key)}
            >
              <Text
                style={[
                  styles.cityTabText,
                  selectedCity === city.key && styles.cityTabTextActive,
                ]}
              >
                {city.label}
              </Text>
              {selectedCity === city.key && (
                <View style={styles.cityTabIndicator} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={CITY_REGIONS.dubai}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={true}
        toolbarEnabled={false}
      >
        {properties.map((property) => {
          const coords = parseCoordinates(property.coordinates);
          if (!coords) return null;

          return (
            <Marker
              key={property.id}
              coordinate={coords}
              onPress={() => handleMarkerPress(property)}
              pinColor={selectedProperty?.id === property.id ? '#2EBFA5' : '#FF6B6B'}
            >
              <View
                style={[
                  styles.customMarker,
                  selectedProperty?.id === property.id && styles.customMarkerActive,
                ]}
              >
                <Text style={styles.markerText}>🏢</Text>
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2EBFA5" />
          <Text style={styles.loadingText}>Loading properties...</Text>
        </View>
      )}

     

      {/* Selected Property Card */}
      {renderPropertyCard()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    marginTop: wp(5),
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: hp(1.5),
  },
  filterScroll: {
    paddingHorizontal: wp(5),
    gap: wp(2),
  },
  cityTab: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: rs(20),
    backgroundColor: '#F5F5F5',
    marginRight: wp(2),
  },
  cityTabActive: {
    backgroundColor: '#2EBFA5',
  },
  cityTabText: {
    fontSize: rs(13),
    fontWeight: '600',
    color: '#757575',
  },
  cityTabTextActive: {
    color: '#FFFFFF',
  },
  cityTabIndicator: {
    position: 'absolute',
    bottom: -hp(1.5),
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#2EBFA5',
  },
  map: {
    flex: 1,
  },
  customMarker: {
    backgroundColor: '#FFFFFF',
    padding: wp(2),
    borderRadius: rs(25),
    borderWidth: 2,
    borderColor: '#FF6B6B',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  customMarkerActive: {
    borderColor: '#2EBFA5',
    transform: [{ scale: 1.2 }],
  },
  markerText: {
    fontSize: rs(20),
  },
  propertyCard: {
    position: 'absolute',
    bottom: hp(2),
    left: wp(5),
    right: wp(5),
    backgroundColor: '#FFFFFF',
    borderRadius: rs(16),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: hp(1),
    right: wp(3),
    zIndex: 10,
    width: rs(30),
    height: rs(30),
    borderRadius: rs(15),
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: rs(18),
    fontWeight: '600',
  },
  cardImage: {
    width: '100%',
    height: hp(18),
    backgroundColor: '#E0E0E0',
  },
  cardContent: {
    padding: wp(4),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: hp(0.5),
  },
  cardTitle: {
    fontSize: rs(16),
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
    paddingRight: wp(2),
  },
  cardFavoriteButton: {
    width: rs(32),
    height: rs(32),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardFavoriteIcon: {
    fontSize: rs(22),
    color: '#FFFFFF',
  },
  cardFavoriteIconActive: {
    color: '#FF3B30',
  },
  cardLocation: {
    fontSize: rs(12),
    color: '#757575',
    marginBottom: hp(0.8),
  },
  cardPrice: {
    fontSize: rs(18),
    fontWeight: '700',
    color: '#2EBFA5',
    marginBottom: hp(0.5),
  },
  cardDeveloper: {
    fontSize: rs(12),
    color: '#757575',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: hp(2),
    fontSize: rs(14),
    color: '#757575',
  },
  propertyCountBadge: {
    position: 'absolute',
    top: hp(2),
    right: wp(5),
    backgroundColor: '#2EBFA5',
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    borderRadius: rs(20),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  propertyCountText: {
    color: '#FFFFFF',
    fontSize: rs(12),
    fontWeight: '600',
  },
});
