import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { theme } from '../../contants/theme';
import { useNavigation } from '@react-navigation/native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import useNewsApi from '../../utils/useNewsStore';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  news_type_id: string;
  created_at: string;
}

const CommunityScreen = () => {
  const navigation = useNavigation();
  const { news, isLoading, error, getAll, getDetail } = useNewsApi();

  useEffect(() => {
    console.log("Fetching news...");
    getAll();
  }, []);

  const renderNewsItem = ({ item }: { item: NewsItem }) => (
    <TouchableOpacity
      style={styles.newsItem}
      onPress={() => {
        getDetail(item.id);
        navigation.navigate('CommunityNewsDetailScreen', { 
          id: item.id,
          newsItem: item 
        });
      }}
    >
      <View style={styles.newsImageContainer}>
        <View style={[styles.newsImage, styles.newsImagePlaceholder]} />
      </View>
      <View style={styles.newsContent}>
        <Text style={styles.newsTitle}>{item.title}</Text>
        <Text style={styles.newsDescription} numberOfLines={2}>
          {item.content.length > 100 ? `${item.content.substring(0, 100)}...` : item.content}
        </Text>
        <View style={styles.newsFooter}>
          <Text style={styles.newsTime}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
          <TouchableOpacity
            style={styles.readMoreButton}
            onPress={() => {
              getDetail(item.id);
              navigation.navigate('CommunityNewsDetailScreen', { 
                id: item.id, 
                newsItem: item 
              });
            }}
          >
            <Text style={styles.readMoreText}>Read more</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPostItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.postItem}
      onPress={() => navigation.navigate('CommunityPostDetailScreen', {
        id: item.id,
      })}
    >
      <View style={styles.postHeader}>
        <View style={[styles.avatar, styles.avatarPlaceholder]} />
        <View>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.postTime}>{item.time}</Text>
        </View>
      </View>
      <Text style={styles.postText}>{item.post}</Text>
      <View style={[styles.postImage, styles.postImagePlaceholder]} />
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.postActionButton}>
          <Icon name="arrow-up-outline" size={20} />
          <Text style={styles.postActionText}>{item.upvotes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.postActionButton}>
          <Icon name="arrow-down-outline" size={20} />
          <Text style={styles.postActionText}>{item.downvotes}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.postActionButton}
          onPress={() => navigation.navigate('CommunityPostDetailScreen', {
            id: item.id,
          })}
        >
          <Icon name="chatbubble-outline" size={20} />
          <Text style={styles.postActionText}>{item.comments}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderNewsSkeleton = () => (
    <SkeletonPlaceholder>
      <View style={{ flexDirection: 'row', marginBottom: 20 }}>
        {[1, 2, 3].map((item) => (
          <View key={item} style={{ width: 200, marginRight: 16 }}>
            <View style={{ width: '100%', height: 80, borderRadius: 10 }} />
            <View style={{ marginTop: 8, width: '80%', height: 20 }} />
            <View style={{ marginTop: 8, width: '100%', height: 40 }} />
            <View style={{ marginTop: 8, width: '40%', height: 15 }} />
          </View>
        ))}
      </View>
    </SkeletonPlaceholder>
  );

  const renderPostsSkeleton = () => (
    <SkeletonPlaceholder>
      <View style={{ marginBottom: 20 }}>
        {[1, 2, 3].map((item) => (
          <View key={item} style={{ marginBottom: 20, padding: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 40, height: 40, borderRadius: 20 }} />
              <View style={{ marginLeft: 10 }}>
                <View style={{ width: 120, height: 15 }} />
                <View style={{ marginTop: 5, width: 80, height: 12 }} />
              </View>
            </View>
            <View style={{ marginTop: 10, width: '100%', height: 60 }} />
            <View style={{ marginTop: 10, width: '100%', height: 200 }} />
            <View style={{ marginTop: 10, flexDirection: 'row' }}>
              <View style={{ width: 60, height: 20, marginRight: 16 }} />
              <View style={{ width: 60, height: 20, marginRight: 16 }} />
              <View style={{ width: 60, height: 20 }} />
            </View>
          </View>
        ))}
      </View>
    </SkeletonPlaceholder>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Community</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => navigation.navigate('SearchScreen')}
          >
            <Icon name="search" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="notifications-outline" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.searchContainer}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.avatar} 
          />
          <TouchableOpacity
            style={styles.postCreateInput}
            onPress={() => navigation.navigate('CommunityPostCreateScreen')}
          >
            <Text style={{ color: '#999' }}>Search posts, people, or topics</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Official News</Text>
        {isLoading ? (
          renderNewsSkeleton()
        ) : error ? (
          <Text style={{ color: 'red', padding: 16 }}>Error loading news: {error}</Text>
        ) : (
          <FlatList
            data={news}
            renderItem={renderNewsItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.newsListContainer}
          />
        )}

        <Text style={styles.sectionTitle}>Community Posts</Text>
        {false ? ( // Replace with your posts loading state
          renderPostsSkeleton()
        ) : (
          <FlatList
            style={styles.postList}
            data={communityPosts}
            renderItem={renderPostItem}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.postListContainer}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { padding: 16, paddingTop: 80 },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    zIndex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: { fontSize: 24, fontWeight: 'bold' },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { marginLeft: 16 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 8 },
  avatarPlaceholder: { backgroundColor: '#e0e0e0' },
  postCreateInput: { backgroundColor: '#f0f0f0', padding: 10, borderRadius: 20, flex: 1 },
  sectionTitle: { marginVertical: 16, fontSize: 18, fontWeight: 'bold' },
  newsItem: { width: 200, marginRight: 16, backgroundColor: '#f9f9f9', borderRadius: 10, padding: 12 },
  newsImageContainer: { marginBottom: 8 },
  newsImage: { width: '100%', height: 80, borderRadius: 10 },
  newsImagePlaceholder: { backgroundColor: '#e0e0e0' },
  newsContent: { flex: 1 },
  newsTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  newsDescription: { color: '#666', fontSize: 14, marginBottom: 8 },
  newsFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  newsTime: { color: '#999', fontSize: 12 },
  readMoreButton: { padding: 6 },
  readMoreText: { color: theme.colors.primaryDark, fontSize: 12, fontWeight: 'bold' },
  postItem: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 12,
  },
  postHeader: { flexDirection: 'row', alignItems: 'center' },
  name: { fontWeight: 'bold' },
  postList: { marginBottom: 100 },
  postTime: { color: '#999', fontSize: 12 },
  postText: { marginVertical: 10 },
  postImage: { width: '100%', height: 200, borderRadius: 10, marginBottom: 10 },
  postImagePlaceholder: { backgroundColor: '#e0e0e0' },
  postActions: { flexDirection: 'row', justifyContent: 'flex-start' },
  postActionButton: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  postActionText: { marginLeft: 4, fontSize: 14 },
});

const communityPosts = [
  {
    id: '1',
    name: 'Sarah Miller',
    time: '1h ago',
    post: 'Just completed a 5x5 strength program! Feeling stronger than ever.',
    avatar: null,
    image: null,
    upvotes: 128,
    downvotes: 5,
    comments: 24,
  },
  {
    id: '2',
    name: 'Mike Chen',
    time: '2h ago',
    post: 'New PR on deadlifts today! 315lbs × 5 reps',
    avatar: null,
    image: null,
    upvotes: 256,
    downvotes: 10,
    comments: 42,
  },
  {
    id: '3',
    name: 'Emma Wilson',
    time: '3h ago',
    post: 'Morning yoga session to start the day right! Who else loves morning workouts?',
    avatar: null,
    image: null,
    upvotes: 180,
    downvotes: 8,
    comments: 30,
  },
];

export default CommunityScreen;