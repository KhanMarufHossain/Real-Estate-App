import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import ApiClient from '../services/ApiClient';
import { wp, hp, rs } from '../utils/responsive';
import { useFavorites } from '../hooks/useFavorites';

export default function DeveloperPropertiesScreen({ route, navigation }) {
  const { developerId, developerName } = route.params;
  
  // Favorites hook
  const { isFavorited, toggleFavorite } = useFavorites();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadProperties(1);
  }, [developerId]);

  const loadProperties = async (page) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await ApiClient.get('/properties', {
        params: {
          developer: developerId,
          page: page,
          per_page: 12
        }
      });

      if (response?.data) {
        const newProperties = response.data.items || [];
        
        if (page === 1) {
          setProperties(newProperties);
        } else {
          setProperties(prev => [...prev, ...newProperties]);
        }

        setTotalPages(response.data.pagination?.pages || 1);
        setTotal(response.data.pagination?.total || newProperties.length);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error('Error loading developer properties:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !loading && !loadingMore) {
      loadProperties(currentPage + 1);
    }
  };

  const handlePropertyPress = (property) => {
    navigation.navigate('PropertyDetails', { propertyId: property.id });
  };

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

  const renderPropertyCard = ({ item }) => {
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
              {item?.name || item?.project_name || item?.projectName || item?.title || 'Property'}
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
          
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText} numberOfLines={1}>
              {item?.area || item?.location || 'Location'}
            </Text>
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
                {item?.min_price_per_area_unit || item?.per_sqft_price || item?.pricePerSqft || item?.price_per_sqft || 'N/A'}
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
                {formatCompletionDate(item?.completion_datetime) || item?.completionDate || item?.completion || 'TBA'}
              </Text>
            </View>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.registerButton}>
              <Text style={styles.registerButtonText}>⚡ Register</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.whatsappButton}>
              <Text style={styles.whatsappButtonText}>💬 WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.callButton}>
              <Text style={styles.callButtonText}>📞 Call</Text>
            </TouchableOpacity>
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
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No properties found for this developer</Text>
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
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {developerName || 'Developer Properties'}
          </Text>
          {total > 0 && (
            <Text style={styles.headerSubtitle}>
              {total} {total === 1 ? 'Property' : 'Properties'}
            </Text>
          )}
        </View>
        <View style={styles.backButton} />
      </View>

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

      {/* Pagination Info */}
      {total > 0 && !loading && (
        <View style={styles.paginationInfo}>
          <Text style={styles.paginationText}>
            Showing {properties.length} of {total} properties
          </Text>
          {totalPages > 1 && (
            <Text style={styles.paginationText}>
              Page {currentPage} of {totalPages}
            </Text>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: wp(3),
    backgroundColor: '#F5F5F5',
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
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: wp(2),
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
  listContainer: {
    padding: wp(5),
    paddingBottom: hp(10),
  },
  propertyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: rs(16),
    marginBottom: hp(2),
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
  favoriteIconText: {
    fontSize: rs(24),
    color: '#FFFFFF',
  },
  favoriteIconTextActive: {
    color: '#FF3B30',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1.2),
  },
  locationIcon: {
    fontSize: rs(12),
    marginRight: wp(1),
  },
  locationText: {
    fontSize: rs(12),
    color: '#757575',
    flex: 1,
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
  },
  callButtonText: {
    fontSize: rs(11),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footerLoader: {
    paddingVertical: hp(2),
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: hp(10),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: rs(14),
    color: '#757575',
  },
  paginationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.5),
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  paginationText: {
    fontSize: rs(12),
    color: '#757575',
  },
});
