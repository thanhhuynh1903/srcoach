'use client';

import {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import BackButton from '../BackButton';
const SearchResultsScreen = ({route, navigation}) => {
  // In a real app, you would get the query from route.params
  const [searchQuery, setSearchQuery] = useState('UI/UX Design');
  const [activeTab, setActiveTab] = useState('Posts');

  // Sample data for posts
  const posts = [
    {
      id: 1,
      author: 'Sarah Johnson',
      authorImage: 'https://randomuser.me/api/portraits/women/32.jpg',
      title: 'Essential UI/UX Design Tips for 2023',
      excerpt:
        'Learn the latest trends and techniques in UI/UX design that will help your products stand out...',
      likes: 245,
      comments: 37,
      time: '2 hours ago',
      tags: ['UI/UX', 'Design', 'Tips'],
    },
    {
      id: 2,
      author: 'Michael Chen',
      authorImage: 'https://randomuser.me/api/portraits/men/44.jpg',
      title: 'How to Create User-Centered Design Systems',
      excerpt:
        'A comprehensive guide to building design systems that prioritize user experience and accessibility...',
      likes: 189,
      comments: 24,
      time: '5 hours ago',
      tags: ['Design Systems', 'UX', 'Accessibility'],
    },
  ];

  // Sample data for experts
  const experts = [
    {
      id: 1,
      name: 'Sarah Johnson',
      image: 'https://randomuser.me/api/portraits/women/32.jpg',
      specialty: 'UI/UX Designer',
      rating: 4.8,
      reviews: 128,
      verified: true,
    },
    {
      id: 2,
      name: 'Michael Chen',
      image: 'https://randomuser.me/api/portraits/men/44.jpg',
      specialty: 'Product Designer',
      rating: 4.9,
      reviews: 93,
      verified: true,
    },
    {
      id: 3,
      name: 'Emma Wilson',
      image: 'https://randomuser.me/api/portraits/women/65.jpg',
      specialty: 'UX Researcher',
      rating: 4.7,
      reviews: 156,
      verified: false,
    },
  ];

  const renderStars = rating => {
    return [...Array(5)].map((_, index) => (
      <Icon
        key={index}
        name={index < Math.floor(rating) ? 'star' : 'star-outline'}
        size={16}
        color={index < Math.floor(rating) ? '#FFB800' : '#E2E8F0'}
        style={{marginRight: 2}}
      />
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header with Search Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <BackButton size={24} />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Icon
            name="search"
            size={20}
            color="#94A3B8"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search posts, users, or experts"
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabsContainer}>
        {['All', 'People', 'Posts', 'Experts'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}>
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'Posts' || activeTab === 'All' ? (
          <>
            {activeTab === 'All' && (
              <Text style={styles.sectionTitle}>Posts</Text>
            )}
            {posts.map(post => (
              <TouchableOpacity key={post.id} style={styles.postCard}>
                <View style={styles.postHeader}>
                  <Image
                    source={{uri: post.authorImage}}
                    style={styles.authorImage}
                  />
                  <View>
                    <Text style={styles.authorName}>{post.author}</Text>
                    <Text style={styles.postTime}>{post.time}</Text>
                  </View>
                </View>
                <Text style={styles.postTitle}>{post.title}</Text>
                <Text style={styles.postExcerpt}>{post.excerpt}</Text>
                <Image
                  source={{
                    uri: 'https://images.unsplash.com/photo-1612838320302-3b3b3f1b3b3b',
                  }}
                  style={styles.postImage}
                  resizeMode="cover"
                />
                <View style={styles.tagsContainer}>
                  {post.tags.map(tag => (
                    <View key={tag} style={styles.tagChip}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.postStats}>
                  <View style={styles.statItem}>
                    <Icon name="arrow-up-outline" size={18} color="#000" />
                    <Text style={styles.statText}>{post.likes}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Icon name="arrow-down-outline" size={18} color="#000" />
                    <Text style={styles.statText}>{post.comments}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Icon name="chatbubble-outline" size={18} color="#000" />
                    <Text style={styles.statText}>{post.comments}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        ) : null}

        {activeTab === 'Experts' || activeTab === 'All' ? (
          <>
            {activeTab === 'All' && (
              <Text style={styles.sectionTitle}>Experts</Text>
            )}
            {experts.map(expert => (
              <TouchableOpacity key={expert.id} style={styles.expertCard}>
                <Image
                  source={{uri: expert.image}}
                  style={styles.expertImage}
                />
                <View style={styles.expertInfo}>
                  <View style={styles.expertNameRow}>
                    <Text style={styles.expertName}>{expert.name}</Text>
                    {expert.verified && (
                      <Icon name="checkmark-circle" size={16} color="#3B82F6" />
                    )}
                  </View>
                  <Text style={styles.expertSpecialty}>{expert.specialty}</Text>
                  <View style={styles.ratingContainer}>
                    {renderStars(expert.rating)}
                    <Text style={styles.ratingText}>
                      {expert.rating} ({expert.reviews})
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.followButton}>
                  <Text style={styles.followButtonText}>Follow</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </>
        ) : null}
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
  },
  postImage: {width: '100%', height: 200, borderRadius: 10, marginBottom: 10},
  postImagePlaceholder: {backgroundColor: '#e0e0e0'},

  backButton: {
    marginRight: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    padding: 0,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  activeTab: {
    backgroundColor: '#0F2B5B',
  },
  tabText: {
    fontSize: 14,
    color: '#64748B',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 16,
    marginTop: 8,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  postTime: {
    fontSize: 14,
    color: '#64748B',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  postExcerpt: {
    fontSize: 16,
    color: '#334155',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#64748B',
  },
  postStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 4,
  },
  expertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  expertImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
  },
  expertInfo: {
    flex: 1,
  },
  expertNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expertName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginRight: 4,
  },
  expertSpecialty: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 4,
  },
  followButton: {
    backgroundColor: '#0F2B5B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SearchResultsScreen;
