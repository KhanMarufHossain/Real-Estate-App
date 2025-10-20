import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  StatusBar,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { wp, hp, rs } from '../utils/responsive';
import FilterModal from '../components/FilterModal';
import ApiClient from '../services/ApiClient';
import { useFavorites } from '../hooks/useFavorites';

export default function ExploreScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const topInset = insets.top || (Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0);
  
  // Favorites hook
  const { isFavorited, toggleFavorite } = useFavorites();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currentParams, setCurrentParams] = useState({});

  useEffect(() => {
    // Load properties on mount with no filters
    fetchProperties(1, '', {});
  }, []);

  const buildQueryParams = (searchText = '', appliedFilters = {}) => {
    const params = {
      per_page: 12,
    };

    if (searchText) {
      params.search_query = searchText;
    }

    if (appliedFilters.unit_types) {
      params.unit_types = appliedFilters.unit_types;
    }

    if (appliedFilters.unit_bedrooms) {
      params.unit_bedrooms = appliedFilters.unit_bedrooms;
    }

    if (appliedFilters.status) {
      params.status = appliedFilters.status;
    }

    if (appliedFilters.sale_status) {
      params.sale_status = appliedFilters.sale_status;
    }

    if (appliedFilters.priceRange) {
      if (appliedFilters.priceRange.min !== null) {
        params.unit_price_from = appliedFilters.priceRange.min;
      }
      if (appliedFilters.priceRange.max !== null) {
        params.unit_price_to = appliedFilters.priceRange.max;
      }
    }

    if (appliedFilters.areaRange) {
      if (appliedFilters.areaRange.min !== null) {
        params.unit_area_from = appliedFilters.areaRange.min;
      }
      if (appliedFilters.areaRange.max !== null) {
        params.unit_area_to = appliedFilters.areaRange.max;
      }
    }

    return params;
  };

  const fetchProperties = async (page = 1, searchText = '', appliedFilters = {}, isLoadMore = false) => {
    try {
      if (page === 1) {
        setLoading(true);
        setProperties([]);
      } else {
        setLoadingMore(true);
      }

      const params = buildQueryParams(searchText, appliedFilters);
      setCurrentParams(params);

      const response = await ApiClient.get('/properties', {
        params: { ...params, page }
      });

      if (response?.data?.items) {
        const newProperties = response.data.items;
        
        if (page === 1) {
          setProperties(newProperties);
        } else {
          setProperties(prev => [...prev, ...newProperties]);
        }

        setCurrentPage(page);
        setHasMore(response.data.pagination?.has_next || false);
        setTotalCount(response.data.pagination?.total || newProperties.length);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loading && !loadingMore) {
      fetchProperties(currentPage + 1, searchQuery, filters, true);
    }
  };

  const handleSearch = () => {
    fetchProperties(1, searchQuery, filters);
  };

  const handleApplyFilters = (appliedFilters) => {
    setFilters(appliedFilters);
    fetchProperties(1, searchQuery, appliedFilters);
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
                {formatPrice(item?.min_price_per_area_unit) || item?.per_sqft_price || item?.pricePerSqft || item?.price_per_sqft || 'N/A'}
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

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No properties found</Text>
        <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
      </View>
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

  const hasActiveFilters = () => {
    return (
      filters.unit_types ||
      filters.unit_bedrooms ||
      filters.status ||
      filters.sale_status ||
      (filters.priceRange && filters.priceRange.label !== 'Any Price') ||
      (filters.areaRange && filters.areaRange.label !== 'Any Area')
    );
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      {/* Header with Search */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search properties..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => {
                setSearchQuery('');
                fetchProperties(1, '', filters);
              }}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          
          <TouchableOpacity 
            style={[styles.filterButton, hasActiveFilters() && styles.filterButtonActive]}
            onPress={() => setShowFilters(true)}
          >
            <Text style={styles.filterIcon}>⚙</Text>
            {hasActiveFilters() && <View style={styles.filterBadge} />}
          </TouchableOpacity>
        </View>
        
        {/* Results Count */}
        {!loading && (
          <Text style={styles.resultsCount}>
            {totalCount} {totalCount === 1 ? 'Property' : 'Properties'} Found
          </Text>
        )}
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

      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleApplyFilters}
        initialFilters={filters}
      />
    </View>
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
    paddingBottom: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchContainer: {
    flexDirection: 'row',
    gap: wp(2),
    marginTop: hp(2),
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: rs(12),
    paddingHorizontal: wp(4),
    height: hp(6),
  },
  searchIcon: {
    fontSize: rs(16),
    marginRight: wp(2),
  },
  searchInput: {
    flex: 1,
    fontSize: rs(14),
    color: '#1A1A1A',
  },
  clearIcon: {
    fontSize: rs(16),
    color: '#999',
    padding: wp(1),
  },
  filterButton: {
    width: rs(48),
    height: hp(6),
    backgroundColor: '#F5F5F5',
    borderRadius: rs(12),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: '#E8F8F5',
  },
  filterIcon: {
    fontSize: rs(20),
  },
  filterBadge: {
    position: 'absolute',
    top: hp(1),
    right: wp(2),
    width: rs(8),
    height: rs(8),
    borderRadius: rs(4),
    backgroundColor: '#2EBFA5',
  },
  resultsCount: {
    fontSize: rs(13),
    color: '#757575',
    marginTop: hp(1.5),
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
  emptyContainer: {
    paddingVertical: hp(10),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: rs(16),
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: hp(1),
  },
  emptySubtext: {
    fontSize: rs(14),
    color: '#757575',
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
