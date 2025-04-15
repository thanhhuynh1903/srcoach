import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert,
  RefreshControl,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {theme} from '../../contants/theme';
import {useNavigation} from '@react-navigation/native';
import {usePostStore} from '../../utils/usePostStore';
import {useLoginStore} from '../../utils/useLoginStore';
import {useFocusEffect} from '@react-navigation/native';

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
  const {isLoading, status, getAll, clearCurrent, deletePost, likePost} =
    usePostStore();
  const posts = usePostStore(state => state.posts);

  const [localPosts, setLocalPosts] = useState<Post[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const {profile} = useLoginStore();
  // Lấy currentUserId từ profile
  const currentUserId = profile?.id;

  // Cập nhật localPosts khi posts từ store thay đổi
  useEffect(() => {
    console.log('posts ', posts);
    console.log('localPosts : ', localPosts);

    if (posts && posts.length > 0) {
      setLocalPosts(posts);
    }
  }, [posts]);

  useEffect(() => {
    getAll();
    clearCurrent();
  }, []);

  const news: NewsItem[] = [
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

  const formatTimeAgo = (dateString: string) => {
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
      onPress={() =>
        navigation.navigate('CommunityNewsDetailScreen', {
          id: item.id,
          newsItem: item,
        })
      }>
      {/* <View style={styles.newsImageContainer}>
        <View style={[styles.newsImage, styles.newsImagePlaceholder]} />
      </View> */}
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
            onPress={() =>
              navigation.navigate('CommunityNewsDetailScreen', {
                id: item.id,
                newsItem: item,
              })
            }>
            <Text style={styles.readMoreText}>Read more</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Khi nhấn icon ellipsis, mở modal và lưu post được chọn
  const handleMorePress = (post: Post) => {
    setSelectedPost(post);
    setModalVisible(true);
  };

  const handleDelete = async () => {
    if (!selectedPost) return;

    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Hiển thị loading nếu cần
              const postId = selectedPost.id;
              console.log('Deleting post with id:', postId);

              // Cập nhật UI trước khi gọi API để UX mượt mà hơn
              setLocalPosts(prevPosts =>
                prevPosts.filter(post => post.id !== postId),
              );
              setModalVisible(false);

              // Gọi API xóa bài viết
              const success = await deletePost(postId);

              if (success) {
                // Thông báo thành công
                Alert.alert('Success', 'Post deleted successfully');
              } else {
                // Nếu xóa thất bại, khôi phục lại danh sách
                Alert.alert('Error', 'Failed to delete post');
                getAll(); // Tải lại danh sách từ API
              }
            } catch (error) {
              console.error('Error deleting post:', error);
              Alert.alert('Error', 'An error occurred while deleting the post');
              getAll(); // Tải lại danh sách từ API
            }
          },
        },
      ],
      {cancelable: true},
    );
  };

  const handleHide = () => {
    if (selectedPost) {
      // Chỉ ẩn bài viết khỏi danh sách hiển thị cục bộ
      setLocalPosts(prevPosts =>
        prevPosts.filter(post => post.id !== selectedPost.id),
      );
      console.log('Hiding post with id:', selectedPost.id);
    }
    setModalVisible(false);
  };

  const handleUpdate = () => {
    setModalVisible(false);
    if (selectedPost) {
      navigation.navigate('CommunityUpdatePostScreen', {
        postId: selectedPost.id,
      });
    }
  };

  // Hàm render tags với chỉ hiển thị 2 tags đầu tiên + số lượng tags còn lại
  const renderTags = (tags: Tag[]) => {
    if (!tags || tags.length === 0) {
      return null;
    }

    // Nếu có 1-2 tags, hiển thị tất cả
    if (tags.length <= 4) {
      return (
        <View style={styles.tagsContainer}>
          {tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag.tag_name}</Text>
            </View>
          ))}
        </View>
      );
    }

    // Nếu có nhiều hơn 2 tags, hiển thị 2 đầu tiên + "+n"
    return (
      <View style={styles.tagsContainer}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{tags[0].tag_name}</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{tags[1].tag_name}</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{tags[2].tag_name}</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{tags[3].tag_name}</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>+{tags.length - 4}</Text>
        </View>
      </View>
    );
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getAll()
      .then(() => {
        setRefreshing(false);
      })
      .catch(() => {
        setRefreshing(false);
      });
  }, []);

  useFocusEffect(
    useCallback(() => {
      const focusHandler = () => {
        onRefresh();
      };
      return () => {};
    }, [onRefresh]),
  );

  const renderPostItem = ({item}: {item: Post}) => (
    <TouchableOpacity
      style={styles.postItem}
      onPress={() =>
        navigation.navigate('CommunityPostDetailScreen', {id: item.id})
      }>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <View style={styles.postHeader}>
          <View style={[styles.avatar, styles.avatarPlaceholder]} />
          <View>
            <Text style={styles.name}>{item.User.username}</Text>
            <Text style={styles.postTime}>
              {formatTimeAgo(item.created_at)}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => handleMorePress(item)}>
          <Icon name="ellipsis-horizontal" size={20} color="#000" />
        </TouchableOpacity>
      </View>
      {item.title && <Text style={styles.postTitle}>{item.title}</Text>}
      <Text style={styles.postText}>{item.content}</Text>
      {item.images && item.images.length > 0 && (
        <View style={styles.postImageContainer}>
          <Image
            source={{uri: item.images[0]}}
            style={styles.postImage}
            resizeMode="cover"
          />
          {item.images.length > 1 && (
            <View style={styles.remainingImagesIndicator}>
              <Icon
                name="images-outline"
                size={14}
                color="#FFFFFF"
                style={styles.imageIcon}
              />
              <Text style={styles.remainingImagesText}>
                +{item.images.length - 1}
              </Text>
            </View>
          )}
        </View>
      )}
      <View style={styles.postActions}>
        <TouchableOpacity
          style={styles.postActionButton}
          onPress={() => handleLikePost(item.id, !item.is_upvoted)}>
          <Icon
            name={item.is_upvoted ? 'heart' : 'heart-outline'}
            size={20}
            color={item.is_upvoted ? theme.colors.primary : '#666'}
          />
          <Text style={styles.postActionText}>{item.upvote_count}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.postActionButton}
          onPress={() =>
            navigation.navigate('CommunityPostDetailScreen', {id: item.id})
          }>
          <Icon name="chatbubble-outline" size={20} />
          <Text style={styles.postActionText}>{item?.comment_count}</Text>
        </TouchableOpacity>
        {/* Sử dụng hàm renderTags thay vì render trực tiếp */}
        {renderTags(item.postTags)}
      </View>
    </TouchableOpacity>
  );

  const renderPostsContent = () => {
    if ((isLoading && localPosts.length === 0) || refreshing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading posts...</Text>
        </View>
      );
    }
    if (status === 'error' && localPosts.length === 0) {
      return (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={48} color="red" />
          <Text style={styles.errorText}>{status}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={getAll}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (!localPosts || localPosts.length === 0) {
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
        data={localPosts}
        renderItem={renderPostItem}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item.id}
        scrollEnabled={false}
      />
    );
  };

  const handleLikePost = async (id: string, isLike: boolean) => {
    if (!profile) {
      // Kiểm tra người dùng đã đăng nhập chưa
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để thích bài viết', [
        {text: 'Đóng', style: 'cancel'},
      ]);
      return;
    }

    // Gọi API để like/unlike bài viết
    const success = await likePost(id, isLike);

    if (success) {
      // Cập nhật localPosts nếu API thành công
      const updatedLocalPosts = localPosts.map(post => {
        if (post.id === id) {
          return {
            ...post,
            is_upvoted: isLike,
            upvote_count: isLike
              ? post.is_upvoted
                ? post.upvote_count
                : post.upvote_count + 1
              : post.is_upvoted
              ? post.upvote_count - 1
              : post.upvote_count,
          };
        }
        return post;
      });

      setLocalPosts(updatedLocalPosts);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
        <Icon name="fitness" size={24} color={theme.colors.primaryDark} />
        <Text style={styles.title}>Community</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('SearchScreen' as never)}>
            <Icon name="search" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() =>
              navigation.navigate('ManageNotificationsScreen' as never)
            }>
            <Icon
              name="notifications-outline"
              size={24}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('LeaderBoardScreen' as never)}>
            <Icon
              name="rocket-outline"
              size={24}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1E3A8A']}
            tintColor="#1E3A8A"
          />
        }>
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
            <Text style={{color: '#999'}}>Create posts</Text>
          </TouchableOpacity>
        </View>
        {/* <Text style={styles.sectionTitle}>Official News</Text>
        <FlatList
          data={news}
          renderItem={renderNewsItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
        /> */}
        <Text style={styles.sectionTitle}>Community Posts</Text>
        {renderPostsContent()}
      </ScrollView>

      {/* Modal hiển thị các tùy chọn */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            {selectedPost && selectedPost.user_id === currentUserId ? (
              <TouchableOpacity
                style={styles.modalOption}
                onPress={handleUpdate}>
                <Icon
                  name="create-outline"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text style={styles.modalOptionText}>Update</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.modalOption}>
                <Icon
                  name="bookmark-outline"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text style={styles.modalOptionText}>Save draft</Text>
              </TouchableOpacity>
            )}
            <View style={styles.modalDivider} />

            {selectedPost && selectedPost?.user?.id === currentUserId ? (
              <TouchableOpacity
                style={styles.modalOption}
                onPress={handleDelete}>
                <Icon name="trash-outline" size={24} color="red" />
                <Text style={[styles.modalOptionText, {color: 'red'}]}>
                  Delete
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.modalOption} onPress={handleHide}>
                <Icon name="eye-off-outline" size={24} color="#666" />
                <Text style={styles.modalOptionText}>Hide</Text>
              </TouchableOpacity>
            )}

            <View style={styles.modalDivider} />

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  title: {fontSize: 24, fontWeight: 'bold',marginHorizontal: 10},
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
  moreButton: {padding: 8},
  postHeader: {flexDirection: 'row', alignItems: 'center'},
  name: {fontWeight: 'bold'},
  postList: {marginBottom: 100},
  postTime: {color: '#999', fontSize: 12},
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  postImageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 8,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  remainingImagesIndicator: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  imageIcon: {
    marginRight: 4,
  },
  remainingImagesText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  postText: {marginVertical: 10},
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
    justifyContent: 'flex-start',
    alignContent: 'flex-start',
    alignItems: 'flex-start',
    width: '56%',
  },
  tag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
    marginTop: 5,
  },
  tagText: {fontSize: 12, color: '#666'},
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {marginTop: 10, color: '#666'},
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
  retryButtonText: {color: 'white'},
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {marginTop: 10, color: '#666'},
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  modalOptionText: {
    fontSize: 16,
    marginLeft: 12,
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  modalCancelButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
});

export default CommunityScreen;
