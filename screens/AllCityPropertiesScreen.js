import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
  Platform,
} from 'react-native';
import { wp, hp, rs } from '../utils/responsive';
import { useFavorites } from '../hooks/useFavorites';

export default function AllCityPropertiesScreen({ route, navigation }) {
  const { cityName, areaIds } = route.params || {};
  
  // Favorites hook
  const { isFavorited, toggleFavorite } = useFavorites();
  
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadProperties(1);
  }, [areaIds]);

  const loadProperties = async (page) => {
    if (!areaIds || areaIds.length === 0) {
      setLoading(false);
      return;
    }

    try {
      if (page === 1) {
        setLoading(true);
        setProperties([]);
      } else {
        setLoadingMore(true);
      }
      
      console.log(`[AllCityPropertiesScreen] Loading page ${page} for ${cityName}`);
      
      // Import ApiClient
      const ApiClient = require('../services/ApiClient').default;
      
      const response = await ApiClient.get('/properties', {
        params: {
          areas: areaIds.join(','),
          page: page,
          per_page: 12
        }
      });
      
      const items = response?.data?.items || [];
      const pagination = response?.data?.pagination || {};
      
      console.log(`[AllCityPropertiesScreen] Page ${page}: ${items.length} items, has_next: ${pagination.has_next}`);
      
      if (page === 1) {
        setProperties(items);
      } else {
        setProperties(prev => [...prev, ...items]);
      }
      
      setCurrentPage(page);
      setHasMore(pagination.has_next || false);
      setTotalCount(pagination.total || items.length);
      
    } catch (error) {
      console.error('[AllCityPropertiesScreen] Error loading properties:', error);
      if (page === 1) {
        setProperties([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loading && !loadingMore) {
      loadProperties(currentPage + 1);
    }
  };

  const renderPropertyCard = ({ item }) => {
    let imageUrl = 'https://via.placeholder.com/300x200';
    
    try {
      if (item?.cover_image_url) {
        if (typeof item.cover_image_url === 'string' && item.cover_image_url.startsWith('{')) {
          const parsed = JSON.parse(item.cover_image_url);
          imageUrl = parsed?.url || imageUrl;
        } else if (typeof item.cover_image_url === 'string') {
          imageUrl = item.cover_image_url;
        } else if (typeof item.cover_image_url === 'object') {
          imageUrl = item.cover_image_url?.url || imageUrl;
        }
      }
    } catch (error) {
      console.log('Error parsing image URL:', error);
    }

    // Format price
    let priceText = 'Price on request';
    if (item?.min_price && item?.price_currency) {
      priceText = `${item.price_currency} ${item.min_price.toLocaleString()}`;
    } else if (item?.min_price_aed && item?.min_price_aed > 0) {
      priceText = `AED ${item.min_price_aed.toLocaleString()}`;
    }

    return (
      <TouchableOpacity 
        style={styles.propertyCard}
        activeOpacity={0.8}
        onPress={() => {
          navigation.navigate('PropertyDetails', { propertyId: item.id });
        }}
      >
        <View style={styles.cardRow}>
          {/* Property Image */}
          <View style={styles.propertyImageContainer}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.propertyImage}
              resizeMode="cover"
            />
            {item?.status && (
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            )}
          </View>

          {/* Property Details */}
          <View style={styles.propertyDetails}>
            <View style={styles.propertyHeaderRow}>
              <Text style={styles.propertyName} numberOfLines={2}>
                {item?.name || 'Property Name'}
              </Text>
              <TouchableOpacity 
                style={styles.favoriteButton}
                onPress={(e) => {
                  e.stopPropagation();
                  toggleFavorite(item);
                }}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.favoriteIconText,
                  isFavorited(item.id) && styles.favoriteIconTextActive
                ]}>
                  {isFavorited(item.id) ? '♥' : '🤍'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.propertyLocation} numberOfLines={1}>
              📍 {item?.area || 'Location'}
            </Text>

            <View style={styles.priceContainer}>
              <Text style={styles.propertyPrice}>
                {priceText}
              </Text>
            </View>

            {item?.developer && (
              <View style={styles.developerContainer}>
                <Text style={styles.developerText}>👷 {item.developer}</Text>
              </View>
            )}

            {item?.sale_status && (
              <View style={styles.saleStatusContainer}>
                <Text style={[
                  styles.saleStatusText,
                  item.sale_status === 'Out of stock' && styles.outOfStock,
                  item.sale_status === 'Available' && styles.available
                ]}>
                  {item.sale_status}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#2EBFA5" />
        <Text style={styles.footerLoaderText}>Loading more...</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No properties found in {cityName}</Text>
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
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{cityName || 'Properties'}</Text>
        <View style={styles.backButton} />
      </View>

      {/* Properties Count */}
      {!loading && totalCount > 0 && (
        <View style={styles.countContainer}>
          <Text style={styles.countText}>
            {properties.length} of {totalCount} {totalCount === 1 ? 'Property' : 'Properties'}
          </Text>
        </View>
      )}

      {/* Properties List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2EBFA5" />
          <Text style={styles.loadingText}>Loading properties...</Text>
        </View>
      ) : (
        <FlatList
          data={properties}
          renderItem={renderPropertyCard}
          keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
          updateCellsBatchingPeriod={50}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    marginTop: wp(3),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: rs(40),
    height: rs(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: rs(24),
    color: '#1A1A1A',
  },
  headerTitle: {
    fontSize: rs(20),
    fontWeight: '700',
    color: '#1A1A1A',
  },
  countContainer: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.5),
    backgroundColor: '#FFFFFF',
  },
  countText: {
    fontSize: rs(14),
    color: '#757575',
    fontWeight: '600',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(10),
  },
  emptyText: {
    fontSize: rs(16),
    color: '#757575',
    textAlign: 'center',
  },
  listContainer: {
    padding: wp(5),
    paddingBottom: hp(10),
  },
  propertyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: rs(12),
    marginBottom: hp(2),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardRow: {
    flexDirection: 'row',
    padding: wp(3),
  },
  propertyImageContainer: {
    width: wp(35),
    height: hp(18),
    borderRadius: rs(10),
    overflow: 'hidden',
    position: 'relative',
  },
  propertyImage: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: rs(8),
    left: rs(8),
    backgroundColor: 'rgba(46, 191, 165, 0.9)',
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.5),
    borderRadius: rs(4),
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: rs(10),
    fontWeight: '700',
  },
  propertyDetails: {
    flex: 1,
    marginLeft: wp(3),
    justifyContent: 'space-between',
  },
  propertyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  propertyName: {
    fontSize: rs(15),
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: hp(0.5),
    flex: 1,
    paddingRight: wp(2),
  },
  favoriteButton: {
    width: rs(32),
    height: rs(32),
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIconText: {
    fontSize: rs(22),
    color: '#FFFFFF',
  },
  favoriteIconTextActive: {
    color: '#FF3B30',
  },
  propertyLocation: {
    fontSize: rs(12),
    color: '#757575',
    marginBottom: hp(0.5),
  },
  propertyDescription: {
    fontSize: rs(11),
    color: '#9E9E9E',
    lineHeight: rs(14),
    marginBottom: hp(0.5),
  },
  priceContainer: {
    marginVertical: hp(0.5),
  },
  propertyPrice: {
    fontSize: rs(16),
    fontWeight: '700',
    color: '#2EBFA5',
  },
  developerContainer: {
    marginTop: hp(0.5),
  },
  developerText: {
    fontSize: rs(11),
    color: '#757575',
  },
  saleStatusContainer: {
    marginTop: hp(0.5),
  },
  saleStatusText: {
    fontSize: rs(11),
    fontWeight: '600',
    color: '#757575',
  },
  outOfStock: {
    color: '#F44336',
  },
  available: {
    color: '#4CAF50',
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(2),
    marginTop: hp(0.5),
  },
  amenityText: {
    fontSize: rs(10),
    color: '#757575',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.3),
    borderRadius: rs(4),
  },
  footerLoader: {
    paddingVertical: hp(3),
    alignItems: 'center',
  },
  footerLoaderText: {
    marginTop: hp(1),
    fontSize: rs(12),
    color: '#757575',
  },
});
