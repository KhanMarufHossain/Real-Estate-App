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
  TextInput,
  Platform,
} from 'react-native';
import { useProperties } from '../hooks/useProperties';
import { wp, hp, rs } from '../utils/responsive';

export default function AllDevelopersScreen({ navigation }) {
  const { 
    fetchDevelopers
  } = useProperties();

  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadDevelopers(1, '');
  }, []);

  const loadDevelopers = async (page, search) => {
    try {
      setLoading(true);
      const response = await fetchDevelopers(search, page);
      
      if (response?.data) {
        setDevelopers(response.data);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotal(response.pagination?.total || response.data.length);
      } else {
        setDevelopers(response || []);
        setTotal(response?.length || 0);
      }
    } catch (err) {
      console.error('Error loading developers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadDevelopers(1, searchQuery);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !loading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadDevelopers(nextPage, searchQuery);
    }
  };

  const renderDeveloperCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.developerCard}
      activeOpacity={0.8}
      onPress={() => {
        // Navigate to developer properties
        navigation.navigate('DeveloperProperties', { 
          developerId: item.developerId || item._id, 
          developerName: item.developerName || item.name || 'Developer'
        });
      }}
    >
      <View style={styles.cardContent}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item?.developerLogo || item?.developerImage || 'https://via.placeholder.com/100' }}
            style={styles.developerImage}
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.developerInfo}>
          <Text style={styles.developerName} numberOfLines={2}>
            {item?.developerName || 'Developer'}
          </Text>
          {item?.description && (
            <Text style={styles.developerDescription} numberOfLines={3}>
              {item.description}
            </Text>
          )}
        </View>

        <View style={styles.arrowContainer}>
          <Text style={styles.arrowText}>→</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loading) return null;
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
        <Text style={styles.emptyText}>No developers found</Text>
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
        <Text style={styles.headerTitle}>All Developers</Text>
        <View style={styles.backButton} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search developers..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={handleSearch}
        >
          <Text style={styles.searchButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Developers List */}
      <FlatList
        data={developers}
        renderItem={renderDeveloperCard}
        keyExtractor={(item, index) => item?._id || item?.developerId?.toString() || index.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'}
        updateCellsBatchingPeriod={50}
      />

      {/* Pagination Info */}
      {total > 0 && (
        <View style={styles.paginationInfo}>
          <Text style={styles.paginationText}>
            Showing {developers.length} of {total} developers
          </Text>
          <Text style={styles.paginationText}>
            Page {currentPage} of {totalPages}
          </Text>
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
  headerTitle: {
    fontSize: rs(20),
    fontWeight: '700',
    color: '#1A1A1A',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    backgroundColor: '#FFFFFF',
    gap: wp(2),
  },
  searchInput: {
    flex: 1,
    height: hp(6),
    backgroundColor: '#F5F5F5',
    borderRadius: rs(8),
    paddingHorizontal: wp(4),
    fontSize: rs(14),
  },
  searchButton: {
    width: rs(50),
    height: hp(6),
    backgroundColor: '#2EBFA5',
    borderRadius: rs(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: rs(20),
  },
  listContainer: {
    padding: wp(5),
    paddingBottom: hp(10),
  },
  developerCard: {
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
  },
  cardContent: {
    flexDirection: 'row',
    padding: wp(4),
    alignItems: 'center',
  },
  imageContainer: {
    width: rs(80),
    height: rs(80),
    borderRadius: rs(8),
    backgroundColor: '#F5F5F5',
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
  developerInfo: {
    flex: 1,
    marginLeft: wp(4),
  },
  developerName: {
    fontSize: rs(16),
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: hp(0.5),
  },
  developerDescription: {
    fontSize: rs(12),
    color: '#757575',
    lineHeight: rs(16),
  },
  arrowContainer: {
    marginLeft: wp(2),
  },
  arrowText: {
    fontSize: rs(24),
    color: '#2EBFA5',
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
