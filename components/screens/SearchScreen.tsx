import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  SafeAreaView,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import BackButton from '../BackButton';

const filters = ['All', '5km', 'Available Now', '10km'];

const experts = [
  {
    id: 1,
    name: 'Sarah Johnson',
    image: 'https://randomuser.me/api/portraits/women/32.jpg',
    rating: 4.5,
    reviews: 128,
    tags: ['Marathon', 'Beginners'],
    available: true,
  },
  {
    id: 2,
    name: 'Michael Chen',
    image: 'https://randomuser.me/api/portraits/men/44.jpg',
    rating: 4.8,
    reviews: 93,
    tags: ['Sprint', 'HIIT'],
    available: true,
  },
  {
    id: 3,
    name: 'Emma Wilson',
    image: 'https://randomuser.me/api/portraits/women/65.jpg',
    rating: 4.7,
    reviews: 156,
    tags: ['Trail Running', '10km'],
    available: false,
  },
  {
    id: 4,
    name: 'David Martinez',
    image: 'https://randomuser.me/api/portraits/men/33.jpg',
    rating: 4.6,
    reviews: 201,
    tags: ['5km', 'Expert'],
    available: true,
  },
];

const SearchScreen = () => {
  const [activeTab, setActiveTab] = useState('Expert');
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <Icon
        key={index}
        name={index < Math.floor(rating) ? 'star' : 'star'}
        size={16}
        color={index < Math.floor(rating) ? '#FFB800' : '#E2E8F0'}
        style={{marginRight: 2}}
      />
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <BackButton size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search Expert</Text>
      </View>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Icon name="filter-outline" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search posts or experts..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Icon name="search" size={20} color="#64748B" />
        </View>
      </View>

      {/* Tabs */}
      {/* <View style={styles.tabsContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('Post')}
          style={styles.tab}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'Post' && styles.activeTabText,
            ]}>
            Post
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('Expert')}
          style={styles.tab}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'Expert' && styles.activeTabText,
            ]}>
            Expert
          </Text>
        </TouchableOpacity>
      </View> */}

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <Text></Text>
        {filters.map(filter => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterChip,
              activeFilter === filter && styles.activeFilterChip,
            ]}
            onPress={() => setActiveFilter(filter)}>
            <Text
              style={[
                styles.filterText,
                activeFilter === filter && styles.activeFilterText,
              ]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Expert List */}
      <ScrollView style={styles.expertList}>
        {experts.map(expert => (
          <View key={expert.id} style={styles.expertCard}>
            <View style={styles.expertInfo}>
              <Image source={{uri: expert.image}} style={styles.expertImage} />
              <View style={styles.expertDetails}>
                <Text style={styles.expertName}>{expert.name}</Text>
                <View style={styles.ratingContainer}>
                  {renderStars(expert.rating)}
                  <Text style={styles.reviewCount}>({expert.reviews})</Text>
                </View>
                <View style={styles.tagsContainer}>
                  {expert.tags.map(tag => (
                    <Text key={tag} style={styles.tag}>
                      {tag}
                    </Text>
                  ))}
                </View>
                {expert.available && (
                  <View style={styles.availableContainer}>
                    <View style={styles.availableDot} />
                    <Text style={styles.availableText}>Available now</Text>
                  </View>
                )}
              </View>
            </View>
            <TouchableOpacity style={styles.contactButton}>
              <Text style={styles.contactButtonText}>Contact</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    padding: 0,
    marginRight: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  tab: {
    marginRight: 24,
  },
  tabText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#000000',
    fontWeight: '600',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginVertical: 12,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filtersContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: '#1E3A8A',
  },
  filterText: {
    fontSize: 14,
    color: '#64748B',
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  expertList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  expertCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  expertInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  expertImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  expertDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  expertName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  tag: {
    fontSize: 14,
    color: '#64748B',
  },
  availableContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availableDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 4,
  },
  availableText: {
    fontSize: 14,
    color: '#22C55E',
  },
  contactButton: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
});

export default SearchScreen;
