import React, { useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Platform, 
  StatusBar, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { rs, wp, hp } from '../utils/responsive';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../contexts/AuthContext';

export default function FavoritesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const topInset = insets.top || (Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0);
  
  const { user } = useAuth();
  const { favorites, favoritesLoading, isFavorited, removeFavorite, loadFavorites } = useFavorites();
  
  const [refreshing, setRefreshing] = React.useState(false);

  // Debug logging
  useEffect(() => {
    console.log('[FavoritesScreen] Mounted with user:', user?.email);
    console.log('[FavoritesScreen] Favorites from hook:', favorites.length, 'items');
    console.log('[FavoritesScreen] Loading state:', favoritesLoading);
  }, [user?.email, favorites, favoritesLoading]);

  // Reload favorites every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user?.email) {
        console.log('[FavoritesScreen] Screen focused - Reloading favorites');
        loadFavorites();
      }
    }, [user?.email, loadFavorites])
  );

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    if (!user?.email) return;
    console.log('[FavoritesScreen] Pull to refresh triggered');
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  }, [user?.email, loadFavorites]);

  const handlePropertyPress = (item) => {
    navigation.navigate('PropertyDetails', { propertyId: item.id });
  };

  const handleRemoveFavorite = (propertyId) => {
    removeFavorite(propertyId);
  };

  const renderPropertyCard = ({ item }) => {
    // Parse cover image URL if it's a string
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

    // Format price
    const minPrice = item?.min_price_aed || item?.min_price || item?.priceFrom || item?.startingPrice;
    const formattedPrice = minPrice ? new Intl.NumberFormat().format(minPrice) : 'Price on request';

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
        
        {item?.status && (
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        )}
        
        <View style={styles.propertyInfo}>
          <View style={styles.propertyHeader}>
            <Text style={styles.propertyName} numberOfLines={1}>
              {item?.name || item?.project_name || item?.projectName || item?.title || 'Property'}
            </Text>
            <TouchableOpacity 
              style={styles.favoriteButton}
              onPress={(e) => {
                e.stopPropagation();
                handleRemoveFavorite(item.id);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.favoriteIconTextActive}>♥</Text>
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
              <Text style={styles.priceLabel}>From</Text>
              <Text style={styles.priceValue}>AED {formattedPrice}</Text>
            </View>
          </View>

          {item?.developer && (
            <Text style={styles.developerText} numberOfLines={1}>
              👷 {item.developer}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: topInset }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Favorites</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Please log in to view your favorites</Text>
        </View>
      </View>
    );
  }

  if (favoritesLoading && favorites.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: topInset }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Favorites</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2EBFA5" />
          <Text style={styles.loadingText}>Loading favorites...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Favorites</Text>
        <Text style={styles.subtitle}>
          {favorites.length} {favorites.length === 1 ? 'property' : 'properties'}
        </Text>
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🏠</Text>
          <Text style={styles.emptyText}>No favorites yet</Text>
          <Text style={styles.emptySubtext}>
            Browse properties and tap the heart icon to save your favorites
          </Text>
          <TouchableOpacity 
            style={styles.browseButton}
            onPress={() => navigation.navigate('Explore')}
          >
            <Text style={styles.browseButtonText}>Browse Properties</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          renderItem={renderPropertyCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: rs(24),
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: hp(0.5),
  },
  subtitle: {
    fontSize: rs(14),
    color: '#757575',
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
  emptyIcon: {
    fontSize: rs(64),
    marginBottom: hp(2),
  },
  emptyText: {
    fontSize: rs(18),
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: hp(1),
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: rs(14),
    color: '#757575',
    textAlign: 'center',
    marginBottom: hp(3),
  },
  browseButton: {
    backgroundColor: '#2EBFA5',
    paddingHorizontal: wp(8),
    paddingVertical: hp(1.5),
    borderRadius: rs(8),
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontSize: rs(16),
    fontWeight: '600',
  },
  listContainer: {
    padding: wp(5),
    paddingBottom: hp(10),
  },
  propertyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: rs(12),
    marginBottom: hp(2.5),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  propertyImage: {
    width: '100%',
    height: hp(22),
    backgroundColor: '#E0E0E0',
  },
  statusBadge: {
    position: 'absolute',
    top: hp(2),
    left: wp(3),
    backgroundColor: 'rgba(46, 191, 165, 0.95)',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.6),
    borderRadius: rs(6),
  },
  statusText: {
    fontSize: rs(11),
    fontWeight: '600',
    color: '#FFFFFF',
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
    width: rs(32),
    height: rs(32),
    borderRadius: rs(16),
    backgroundColor: '#2EBFA5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIconTextActive: {
    fontSize: rs(16),
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
    marginBottom: hp(1),
  },
  priceBox: {
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
    fontSize: rs(14),
    fontWeight: '700',
    color: '#1A1A1A',
  },
  developerText: {
    fontSize: rs(12),
    color: '#757575',
    marginTop: hp(0.5),
  },
});
