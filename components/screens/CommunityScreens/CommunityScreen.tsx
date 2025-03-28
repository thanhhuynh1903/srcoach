import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {theme} from '../../contants/theme';
import {useNavigation} from '@react-navigation/native';
import { usePostStore } from '../../utils/usePostStore';

// Interface cho dữ liệu tin tức
interface NewsItem {
  id: string;
  title: string;
  content: string;
  news_type_id: string;
  created_at: string;
}

// Interface cho User
interface User {
  id: string;
  username: string;
  user_level: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

// Interface cho Tag
interface Tag {
  tag_name: string;
}

// Interface cho Post từ API
interface Post {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string | null;
  exercise_session_record_id: string | null;
  User: User;
  postTags: Tag[];
  PostVote: any[];
  PostComment: any[];
  images: string[];
  upvote_count: number;
  downvote_count: number;
  comment_count: number;
  is_upvoted: boolean;
  is_downvoted: boolean;
}

const CommunityScreen = () => {
  const navigation = useNavigation();
  const { post: posts, isLoading, error, getAll } = usePostStore();
  
  useEffect(() => {
    getAll();
  }, []);

  // Static news data
  const news = [
    {
      id: '1',
      title: 'New Gym Equipment Arrived',
      content:
        'We have added new state-of-the-art equipment to our fitness center. Come check it out!',
      news_type_id: '1',
      created_at: '2023-06-15T10:00:00Z',
    },
    {
      id: '2',
      title: 'Summer Fitness Challenge',
      content:
        'Join our 30-day summer fitness challenge starting next week. Prizes for top performers!',
      news_type_id: '2',
      created_at: '2023-06-10T09:30:00Z',
    },
    {
      id: '3',
      title: 'Nutrition Workshop',
      content:
        'Free nutrition workshop this Saturday. Learn about meal planning and healthy eating habits.',
      news_type_id: '1',
      created_at: '2023-06-05T14:15:00Z',
    },
  ];

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffMs = now.getTime() - postDate.getTime();
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else if (diffMins > 0) {
      return `${diffMins}m ago`;
    } else {
      return 'Just now';
    }
  };

  const renderNewsItem = ({item}: {item: NewsItem}) => (
    <TouchableOpacity
      style={styles.newsItem}
      onPress={() => {
        navigation.navigate('CommunityNewsDetailScreen', {
          id: item.id,
          newsItem: item,
        });
      }}>
      <View style={styles.newsImageContainer}>
        <View style={[styles.newsImage, styles.newsImagePlaceholder]} />
      </View>
      <View style={styles.newsContent}>
        <Text style={styles.newsTitle}>{item.title}</Text>
        <Text style={styles.newsDescription} numberOfLines={2}>
          {item.content.length > 100
            ? `${item.content.substring(0, 100)}...`
            : item.content}
        </Text>
        <View style={styles.newsFooter}>
          <Text style={styles.newsTime}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
          <TouchableOpacity
            style={styles.readMoreButton}
            onPress={() => {
              navigation.navigate('CommunityNewsDetailScreen', {
                id: item.id,
                newsItem: item,
              });
            }}>
            <Text style={styles.readMoreText}>Read more</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPostItem = ({item}: {item: Post}) => (
    <TouchableOpacity
      style={styles.postItem}
      onPress={() =>
        navigation.navigate('CommunityPostDetailScreen', {
          id: item.id
        })
      }>
      <View style={styles.postHeader}>
        <View style={[styles.avatar, styles.avatarPlaceholder]} />
        <View>
          <Text style={styles.name}>{item.User.username}</Text>
          <Text style={styles.postTime}>{formatTimeAgo(item.created_at)}</Text>
        </View>
      </View>
      {item.title && <Text style={styles.postTitle}>{item.title}</Text>}
      <Text style={styles.postText}>{item.content}</Text>
      {item.images && item.images.length > 0 && (
        <Image 
          source={{ uri: item.images[0] }} 
          style={styles.postImage} 
          resizeMode="cover"
        />
      )}
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.postActionButton}>
          <Icon 
            name="arrow-up-outline" 
            size={20} 
            color={item.is_upvoted ? theme.colors.primary : undefined} 
          />
          <Text style={styles.postActionText}>{item.upvote_count}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.postActionButton}>
          <Icon 
            name="arrow-down-outline" 
            size={20} 
            color={item.is_downvoted ? theme.colors.primary : undefined} 
          />
          <Text style={styles.postActionText}>{item.downvote_count}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.postActionButton}
          onPress={() =>
            navigation.navigate('CommunityPostDetailScreen', {
              id: item.id,
            })
          }>
          <Icon name="chatbubble-outline" size={20} />
          <Text style={styles.postActionText}>{item.comment_count}</Text>
        </TouchableOpacity>
        {item.postTags && item.postTags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.postTags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag.tag_name}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderPostsContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading posts...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={48} color="red" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={getAll}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!posts || posts.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="document-text-outline" size={48} color="#999" />
          <Text style={styles.emptyText}>No posts available</Text>
        </View>
      );
    }

    return (
      <FlatList
        style={styles.postList}
        data={posts}
        renderItem={renderPostItem}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item.id}
        scrollEnabled={false}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Community</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('SearchScreen' as never)}>
            <Icon name="search" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icon
              name="notifications-outline"
              size={24}
              color={theme.colors.primary}
            />
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
            onPress={() =>
              navigation.navigate('CommunityCreatePostScreen' as never)
            }>
            <Text style={{color: '#999'}}>Search posts, people, or topics</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Official News</Text>
        <FlatList
          data={news}
          renderItem={renderNewsItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
        />

        <Text style={styles.sectionTitle}>Community Posts</Text>
        {renderPostsContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  scrollContainer: {padding: 16, paddingTop: 80},
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
  title: {fontSize: 24, fontWeight: 'bold'},
  headerIcons: {flexDirection: 'row', alignItems: 'center'},
  iconButton: {marginLeft: 16},
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {width: 40, height: 40, borderRadius: 20, marginRight: 8},
  avatarPlaceholder: {backgroundColor: '#e0e0e0'},
  postCreateInput: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 20,
    flex: 1,
  },
  sectionTitle: {marginVertical: 16, fontSize: 18, fontWeight: 'bold'},
  newsItem: {
    width: 200,
    marginRight: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 12,
  },
  newsImageContainer: {marginBottom: 8},
  newsImage: {width: '100%', height: 80, borderRadius: 10},
  newsImagePlaceholder: {backgroundColor: '#e0e0e0'},
  newsContent: {flex: 1},
  newsTitle: {fontSize: 16, fontWeight: 'bold', marginBottom: 4},
  newsDescription: {color: '#666', fontSize: 14, marginBottom: 8},
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsTime: {color: '#999', fontSize: 12},
  readMoreButton: {padding: 6},
  readMoreText: {
    color: theme.colors.primaryDark,
    fontSize: 12,
    fontWeight: 'bold',
  },
  postItem: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 12,
  },
  postHeader: {flexDirection: 'row', alignItems: 'center'},
  name: {fontWeight: 'bold'},
  postList: {marginBottom: 100},
  postTime: {color: '#999', fontSize: 12},
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  postText: {marginVertical: 10},
  postImage: {width: '100%', height: 200, borderRadius: 10, marginBottom: 10},
  postImagePlaceholder: {backgroundColor: '#e0e0e0'},
  postActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  postActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  postActionText: {marginLeft: 4, fontSize: 14},
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
    marginTop: 5,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: 10,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 15,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 10,
    color: '#666',
  },
});

export default CommunityScreen;
