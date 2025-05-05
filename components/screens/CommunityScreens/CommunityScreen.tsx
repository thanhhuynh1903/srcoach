import React, {useEffect, useState, useCallback, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
  Animated,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {theme} from '../../contants/theme';
import {useNavigation} from '@react-navigation/native';
import {usePostStore} from '../../utils/usePostStore';
import {useLoginStore} from '../../utils/useLoginStore';
import {useFocusEffect} from '@react-navigation/native';
import {formatTimeAgo} from '../../utils/utils_format';
import {CommonAvatar} from '../../commons/CommonAvatar';
import {SaveDraftButton} from './SaveDraftButton';
import SkeletonPostList from './SkeletonPostList';
// Interface cho User
interface User {
  id: string;
  username: string;
  user_level: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  image?: {
    url: string;
  };
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
  user: User;
  tags: string[];
  PostVote: any[];
  PostComment: any[];
  images: string[];
  upvote_count: number;
  downvote_count: number;
  comment_count: number;
  is_upvoted: boolean;
  is_saved: boolean;
  is_downvoted: boolean;
}

const PLACEHOLDER_TEXTS = [
  'Sharing your wonderful running record',
  'Share your achievements',
  'Ask the community for advice',
  'Post your running milestones',
  'Share your workout tips',
];

const CommunityScreen = () => {
  const navigation = useNavigation();
  const {isLoading, status, getAll, clearCurrent, deletePost, likePost} =
    usePostStore();
  const {profile} = useLoginStore();
  const currentUserId = profile?.id;

  const [localPosts, setLocalPosts] = useState<Post[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [pageIndex, setPageIndex] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const PAGE_SIZE = 10;
  const loadingRef = useRef(false);

  const loadInitialPosts = async () => {
    if (loadingRef.current) return;
    try {
      loadingRef.current = true;
      setPageIndex(1);
      const newPosts = await getAll(1, PAGE_SIZE);
      if (Array.isArray(newPosts)) {
        setLocalPosts(newPosts);
        setHasMorePosts(newPosts.length >= PAGE_SIZE);
      } else {
        setLocalPosts([]);
        setHasMorePosts(false);
      }
    } catch (error) {
      console.error('Error loading initial posts:', error);
      setLocalPosts([]);
    } finally {
      loadingRef.current = false;
    }
  };

  const loadMorePosts = async () => {
    if (isLoadingMore || !hasMorePosts || loadingRef.current) {
      console.log('Đang tải hoặc không còn bài viết để tải');
      return;
    }

    try {
      console.log('Bắt đầu tải trang tiếp theo:', pageIndex + 1);
      loadingRef.current = true;
      setIsLoadingMore(true);

      const nextPage = pageIndex + 1;

      // Lưu trữ tạm thời giá trị pageIndex hiện tại để tránh race condition
      const currentPageIndex = pageIndex;

      // Gọi API để lấy trang tiếp theo
      const newPosts = await getAll(nextPage, PAGE_SIZE);

      // Log chi tiết kết quả nhận được
      console.log(`Đã nhận được bài viết mới: ${newPosts?.length || 0}`);
      console.log(
        `Dữ liệu bài viết mới: ${JSON.stringify(newPosts?.map(p => p.id))}`,
      );

      if (Array.isArray(newPosts) && newPosts.length > 0) {
        // Cập nhật state với cách đảm bảo state được cập nhật đúng
        setLocalPosts(prevPosts => {
          // Lọc ra các bài viết chưa có trong danh sách hiện tại
          const existingIds = new Set(prevPosts.map(post => post.id));
          const uniqueNewPosts = newPosts.filter(
            post => !existingIds.has(post.id),
          );

          console.log(`Số bài viết mới độc nhất: ${uniqueNewPosts.length}`);

          // Chỉ thêm các bài viết mới vào danh sách
          const updatedPosts = [...prevPosts, ...uniqueNewPosts];
          console.log(
            `Tổng số bài viết sau khi cập nhật: ${updatedPosts.length}`,
          );

          return updatedPosts;
        });

        // Cập nhật pageIndex chỉ khi đã nhận được bài viết mới
        setPageIndex(nextPage);

        // Cập nhật trạng thái hasMorePosts
        setHasMorePosts(newPosts.length >= PAGE_SIZE);
      } else {
        console.log('Không còn bài viết để tải');
        setHasMorePosts(false);
      }
    } catch (error) {
      console.error('Lỗi khi tải thêm bài viết:', error);
    } finally {
      setIsLoadingMore(false);
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    loadInitialPosts();
    clearCurrent();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setCurrentPlaceholderIndex(
          prevIndex => (prevIndex + 1) % PLACEHOLDER_TEXTS.length,
        );
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [fadeAnim]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadInitialPosts().finally(() => setRefreshing(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      onRefresh();
      return () => {};
    }, [onRefresh]),
  );

  const renderHeader = () => (
    <View>
      <View style={styles.searchContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate('RunnerProfileScreen' as never)}>
          <CommonAvatar mode={null} size={40} uri={profile?.image?.url} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.postCreateInput}
          onPress={() =>
            navigation.navigate('CommunityCreatePostScreen' as never)
          }>
          <Animated.Text style={[styles.placeholderText, {opacity: fadeAnim}]}>
            {PLACEHOLDER_TEXTS[currentPlaceholderIndex]}
          </Animated.Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionTitle}>Community Posts</Text>
    </View>
  );

  const renderFooter = () => {
    if (isLoadingMore) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={theme.colors.primaryDark} />
          <Text style={styles.footerText}>Loading more posts...</Text>
        </View>
      );
    }

    return (
      <View style={styles.debugFooter}>
        {hasMorePosts && (
          <TouchableOpacity style={styles.debugButton} onPress={loadMorePosts}>
            <Text style={styles.debugButtonText}>...Loading more posts</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderPostItem = ({item}: {item: Post}) => (
    <TouchableOpacity
      style={styles.postItem}
      activeOpacity={0.8}
      onPress={() =>
        navigation.navigate('CommunityPostDetailScreen', {id: item.id})
      }>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <TouchableOpacity
          onPress={() =>
            profile.id === item.user.id
              ? navigation.navigate('RunnerProfileScreen' as never)
              : navigation.navigate('OtherProfileScreen', {postId: item?.id})
          }>
          <View style={styles.postHeader}>
            <Image
              source={{uri: item?.user?.image?.url || undefined}}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.name}>{item.user.username}</Text>
              <Text style={styles.postTime}>
                {formatTimeAgo(item.created_at)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        {item.user.id !== profile?.id ? (
          <SaveDraftButton
            postId={item.id}
            isSaved={item.is_saved}
            onSave={newSavedState => {
              setLocalPosts(prev =>
                prev.map(p =>
                  p.id === item.id ? {...p, is_saved: newSavedState} : p,
                ),
              );
            }}
          />
        ) : (
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => handleMorePress(item)}>
            <Icon name="ellipsis-horizontal" size={20} color="#000" />
          </TouchableOpacity>
        )}
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
      {item.exercise_session_record_id && (
        <View style={styles.runDataIndicator}>
          <View style={styles.runDataIndicatorContent}>
            <Icon name="walk" size={20} color="#FFFFFF" />
            <Text style={styles.runDataText}>Runner record included</Text>
          </View>
          <Icon
            name="chevron-forward"
            size={20}
            color="#FFFFFF"
            style={{marginLeft: 4}}
          />
        </View>
      )}
      <View style={styles.postActions}>
        <View style={styles.postActionsLeft}>
          <TouchableOpacity
            style={styles.postActionButton}
            onPress={() => handleLikePost(item.id, !item.is_upvoted)}>
            <Icon
              name={item.is_upvoted ? 'heart' : 'heart-outline'}
              size={20}
              color={item.is_upvoted ? theme.colors.primaryDark : '#666'}
            />
            <Text style={styles.postActionText}>{item.upvote_count}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.postActionButton}
            onPress={() =>
              navigation.navigate('CommunityPostDetailScreen', {id: item.id})
            }>
            <Icon name="chatbubble-outline" size={20} color="#666" />
            <Text style={styles.postActionText}>{item?.comment_count}</Text>
          </TouchableOpacity>
        </View>
        {renderTags(item?.tags)}
      </View>
    </TouchableOpacity>
  );

  const renderTags = (tags: string[]) => {
    if (!tags || tags.length === 0) return null;
    if (tags.length <= 3) {
      return (
        <View style={styles.tagsContainer}>
          {tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      );
    }
    return (
      <View style={styles.tagsContainer}>
        {tags.slice(0, 3).map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
        <View style={styles.tag}>
          <Text style={styles.tagText}>more +{tags.length - 3}</Text>
        </View>
      </View>
    );
  };

  const handleMorePress = (post: Post) => {
    setSelectedPost(post);
    setModalVisible(true);
  };

  const handleDelete = async () => {
    if (!selectedPost) return;
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const postId = selectedPost.id;
            setLocalPosts(prevPosts =>
              prevPosts.filter(post => post.id !== postId),
            );
            setModalVisible(false);
            const success = await deletePost(postId);
            if (!success) {
              Alert.alert('Error', 'Failed to delete post');
              loadInitialPosts();
            }
          } catch (error) {
            console.error('Error deleting post:', error);
            Alert.alert('Error', 'An error occurred while deleting the post');
            loadInitialPosts();
          }
        },
      },
    ]);
  };

  const handleUpdate = () => {
    setModalVisible(false);
    if (selectedPost) {
      navigation.navigate('CommunityUpdatePostScreen', {
        postId: selectedPost.id,
      });
    }
  };

  const handleLikePost = async (id: string, isLike: boolean) => {
    if (!profile) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để thích bài viết', [
        {text: 'Đóng', style: 'cancel'},
      ]);
      return;
    }
    const success = await likePost(id, isLike);
    if (success) {
      setLocalPosts(prev =>
        prev.map(post =>
          post.id === id
            ? {
                ...post,
                is_upvoted: isLike,
                upvote_count: isLike
                  ? post.is_upvoted
                    ? post.upvote_count
                    : post.upvote_count + 1
                  : post.is_upvoted
                  ? post.upvote_count - 1
                  : post.upvote_count,
              }
            : post,
        ),
      );
    }
  };

  const renderPostsContent = () => {
    if ((isLoading && localPosts.length === 0) || refreshing) {
      return <SkeletonPostList count={4} />;
    }

    return (
      <FlatList
        data={localPosts}
        extraData={[localPosts.length, pageIndex]}
        renderItem={renderPostItem}
        keyExtractor={item => item.id.toString()}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        onEndReached={info => {
          if (info.distanceFromEnd > 0) {
            console.log(
              'onEndReached triggered with distance:',
              info.distanceFromEnd,
            );
            loadMorePosts();
          }
        }}
        onEndReachedThreshold={0.3}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={{paddingTop: 60, paddingBottom: 20}}
        maxToRenderPerBatch={10}
        windowSize={21}
        removeClippedSubviews={false}
      />
    );
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
            <Icon name="search" size={24} color={theme.colors.primaryDark} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() =>
              navigation.navigate('ManageNotificationsScreen' as never)
            }>
            <Icon
              name="notifications-outline"
              size={24}
              color={theme.colors.primaryDark}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('LeaderBoardScreen' as never)}>
            <Icon
              name="trophy-outline"
              size={24}
              color={theme.colors.primaryDark}
            />
          </TouchableOpacity>
        </View>
      </View>

      {renderPostsContent()}

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
            {selectedPost && selectedPost.user.id === currentUserId ? (
              <TouchableOpacity
                style={styles.modalOption}
                onPress={handleUpdate}>
                <Icon
                  name="create-outline"
                  size={24}
                  color={theme.colors.primaryDark}
                />
                <Text style={styles.modalOptionText}>Update</Text>
              </TouchableOpacity>
            ) : (
              <SaveDraftButton
                postId={selectedPost?.id ?? ''}
                onSave={() => setModalVisible(false)}
              />
            )}
            <View style={styles.modalDivider} />
            {selectedPost && selectedPost?.user?.id === currentUserId && (
              <TouchableOpacity
                style={styles.modalOption}
                onPress={handleDelete}>
                <Icon name="trash-outline" size={24} color="red" />
                <Text style={[styles.modalOptionText, {color: 'red'}]}>
                  Delete
                </Text>
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
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  debugFooter: {
    padding: 16,
    alignItems: 'center',
  },
  debugButton: {
    backgroundColor: theme.colors.primaryDark,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  debugButtonText: {
    color: 'white',
    fontWeight: '600',
  },

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
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginHorizontal: 10,
    color: '#000',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#4A6FA5',
  },
  postCreateInput: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 20,
    flex: 1,
    height: 40,
    justifyContent: 'center',
    marginLeft: 10,
  },
  placeholderText: {
    color: '#999',
  },
  sectionTitle: {
    marginVertical: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginHorizontal: 16,
  },
  postItem: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginHorizontal: 16,
  },
  moreButton: {
    padding: 8,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontWeight: 'bold',
    color: '#000',
  },
  postTime: {
    color: '#999',
    fontSize: 12,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 5,
    color: '#000',
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
  },
  imageIcon: {
    marginRight: 4,
  },
  remainingImagesText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  postText: {
    marginVertical: 10,
    color: '#333',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 10,
  },
  postActionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  postActionText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  tag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 8,
    marginTop: 0,
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
    backgroundColor: theme.colors.primaryDark,
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
  runDataIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.primaryDark,
    padding: 8,
    borderRadius: 8,
    marginVertical: 8,
  },
  runDataIndicatorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  runDataText: {
    marginLeft: 8,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
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
    color: '#000',
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
    color: theme.colors.primaryDark,
  },
  footerLoader: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  footerText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
});

export default CommunityScreen;
