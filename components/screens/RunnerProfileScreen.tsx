import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Modal,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import BackButton from '../BackButton';
import {usePostStore} from '../utils/usePostStore';
import {useLoginStore} from '../utils/useLoginStore';
import {useNavigation} from '@react-navigation/native';
import {useFocusEffect} from '@react-navigation/native';
import {useCommentStore} from '../utils/useCommentStore';

// Interface cho Post từ API
interface Post {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string | null;
  exercise_session_record_id: string | null;
  images: string[];
  upvote_count: number;
  downvote_count: number;
  comment_count: number;
  is_upvoted: boolean;
  is_downvoted: boolean;
  tags: string[];
}

interface Tag {
  tag_name: string;
}

const RunnerProfileScreen = () => {
  const {myPosts, getMyPosts, isLoading, deletePost, likePost} = usePostStore();
  const {profile} = useLoginStore();
  const navigation = useNavigation();
  const currentUserId = profile?.id || '';

  // State cho modal và bài viết đã chọn
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [localPosts, setLocalPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // State cho avatar
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [avatarOptionsModalVisible, setAvatarOptionsModalVisible] =
    useState(false);
  const [avatarUrl, setAvatarUrl] = useState(
    'data:image/jpeg;base64,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',
  );

  // Cập nhật localPosts khi myPosts từ store thay đổi
  useEffect(() => {
    if (myPosts && myPosts.length > 0) {
      setLocalPosts(myPosts);
    }
  }, [myPosts]);

  useEffect(() => {
    getMyPosts();
    console.log('profile', profile);
  }, [getMyPosts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getMyPosts()
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
  // Xử lý khi nhấn vào avatar
  const handleAvatarPress = () => {
    setAvatarOptionsModalVisible(true);
  };

  // Xử lý xem avatar phóng to
  const handleViewAvatar = () => {
    setAvatarOptionsModalVisible(false);
    setTimeout(() => {
      setAvatarModalVisible(true);
    }, 300);
  };

  // Xử lý cập nhật avatar
  const handleUpdateAvatar = () => {
    setAvatarOptionsModalVisible(false);
    // Thêm logic cập nhật avatar ở đây
    Alert.alert('Thông báo', 'Chức năng cập nhật avatar đang được phát triển');
  };

  // Xử lý xóa avatar
  const handleDeleteAvatar = () => {
    setAvatarOptionsModalVisible(false);
    Alert.alert(
      'Xóa ảnh đại diện',
      'Bạn có chắc chắn muốn xóa ảnh đại diện không?',
      [
        {text: 'Hủy', style: 'cancel'},
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            // Thêm logic xóa avatar ở đây
            Alert.alert('Thông báo', 'Đã xóa ảnh đại diện');
          },
        },
      ],
    );
  };

  // Xử lý khi nhấn nút "More"
  const handleMorePress = (post: Post) => {
    console.log('post', post);
    setSelectedPost(post);
    setModalVisible(true);
  };

  const handleLikePost = async (postId: string, isLike: boolean) => {
    if (!profile) {
      // Kiểm tra người dùng đã đăng nhập chưa
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để thích bài viết', [
        {text: 'Đóng', style: 'cancel'},
      ]);
      return;
    }

    // Cập nhật UI ngay lập tức (optimistic update)
    setLocalPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
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
      }),
    );

    try {
      // Gọi API để like/unlike bài viết
      await likePost(postId, isLike);
      // Không cần làm gì thêm vì đã cập nhật UI trước đó
    } catch (error) {
      console.error('Error liking post:', error);
      // Nếu có lỗi, khôi phục lại trạng thái từ store
      setLocalPosts(myPosts || []);
    }
  };

  // Xử lý xóa bài viết
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
                await getMyPosts();
              } else {
                // Nếu xóa thất bại, khôi phục lại danh sách
                Alert.alert('Error', 'Failed to delete post');
                getMyPosts(); // Tải lại danh sách từ API
              }
            } catch (error) {
              console.error('Error deleting post:', error);
              Alert.alert('Error', 'An error occurred while deleting the post');
              getMyPosts(); // Tải lại danh sách từ API
            }
          },
        },
      ],
      {cancelable: true},
    );
  };

  // Xử lý chỉnh sửa bài viết
  const handleUpdate = () => {
    console.log('Selected post:', selectedPost.id);

    setModalVisible(false);
    if (selectedPost) {
      navigation.navigate('CommunityUpdatePostScreen', {
        postId: selectedPost?.id,
      });
    }
  };

  // Xử lý ẩn bài viết
  const handleHide = () => {
    setModalVisible(false);
    Alert.alert('Thông báo', 'Đã ẩn bài viết này');
  };

  const renderTags = (tags: Tag[]) => {
    if (!tags || tags.length === 0) {
      return null;
    }

    // Nếu có 1-2 tags, hiển thị tất cả
    if (tags.length <= 3) {
      return (
        <View style={styles.tagsContainer}>
          {tags?.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      );
    }

    // Nếu có nhiều hơn 2 tags, hiển thị 2 đầu tiên + "+n"
    return (
      <View style={styles.tagsContainer}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{tags[0]}</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{tags[1]}</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{tags[2]}</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>more +{tags.length - 3}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <BackButton size={24} />
        </TouchableOpacity>
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('EditProfileScreen' as never)}>
            <Icon name="create-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              navigation.navigate('CommunityCreatePostScreen' as never)
            }>
            <Icon name="add-circle-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {(isLoading && localPosts.length === 0) || refreshing ? (
        // Nếu đang tải dữ liệu thì hiển thị loading
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#1E3A8A']}
              tintColor="#1E3A8A"
            />
          }>
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.photoContainer}>
              <TouchableOpacity
                style={styles.photoWrapper}
                onPress={handleAvatarPress}>
                <Image
                  source={{
                    uri: profile.image.url ? profile.image.url :  avatarUrl,
                  }}
                  style={styles.profilePhoto}
                />
                <TouchableOpacity style={styles.cameraButton}>
                  <Icon name="camera" size={20} color="#fff" />
                </TouchableOpacity>
              </TouchableOpacity>
            </View>
            <Text style={styles.profileName}>{profile?.name}</Text>
            <Text style={styles.profileBio}>
              Fitness enthusiast | Marathon runner | Helping others achieve
              their fitness goals
            </Text>
            <View style={styles.locationContainer}>
              <Icon name="location-outline" size={16} color="#64748B" />
              <Text style={styles.locationText}>San Francisco, CA</Text>
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.statsSection}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile?.points || 0}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile?.total_posts || 0}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {profile?.total_posts_liked || 0}
              </Text>
              <Text style={styles.statLabel}>Liked</Text>
            </View>
          </View>
          {/* Posts Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>My Posts</Text>

            {localPosts && localPosts.length > 0 ? (
              localPosts.map(post => (
                <View key={post.id} style={styles.postCard}>
                  <Text style={styles.postTime}>
                    {formatTimeAgo(post.created_at)}
                  </Text>
                  <View style={styles.postHeader}>
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate('CommunityPostDetailScreen', {
                          id: post.id,
                        })
                      }>
                      <Text style={styles.postTitle}>{post.title}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.moreButton}
                      onPress={() => handleMorePress(post)}>
                      <Icon
                        name="ellipsis-horizontal"
                        size={20}
                        color="#64748B"
                      />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('CommunityPostDetailScreen', {
                        id: post.id,
                      })
                    }>
                    <Text style={styles.postContent}>{post.content}</Text>

                    {post.images && post.images.length > 0 && (
                      <View style={styles.postImageContainer}>
                        <Image
                          source={{uri: post.images[0]}}
                          style={styles.postImage}
                          resizeMode="cover"
                        />
                        {post.images.length > 1 && (
                          <View style={styles.remainingImagesIndicator}>
                            <Icon
                              name="images-outline"
                              size={14}
                              color="#FFFFFF"
                              style={styles.imageIcon}
                            />
                            <Text style={styles.remainingImagesText}>
                              +{post.images.length - 1}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                    {/* Engagement */}
                    <View style={styles.postEngagement}>
                      <View style={styles.engagementItem}>
                        {/* Thêm chức năng like vào đây */}
                        <TouchableOpacity
                          onPress={() =>
                            handleLikePost(post.id, !post.is_upvoted)
                          }>
                          <Icon
                            name={post.is_upvoted ? 'heart' : 'heart-outline'}
                            size={20}
                            color={post.is_upvoted ? '#4285F4' : '#64748B'}
                          />
                        </TouchableOpacity>
                        <Text style={styles.engagementText}>
                          {post.upvote_count || 0}
                        </Text>
                      </View>
                      <View style={styles.engagementItem}>
                        <View style={styles.engagementItemRight}>
                          <Icon
                            name="chatbubble-outline"
                            size={20}
                            color="#64748B"
                          />
                          <Text style={styles.engagementText}>
                            {post.comment_count || 0}
                          </Text>
                        </View>
                      </View>

                      {renderTags(post?.tags)}
                    </View>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={{color: '#64748B'}}>No posts yet.</Text>
            )}
          </View>
        </ScrollView>
      )}

      {/* Modal hiển thị các tùy chọn cho bài viết */}
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
                <Icon name="create-outline" size={24} color="#0F2B5B" />
                <Text style={styles.modalOptionText}>Update</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.modalOption}>
                <Icon name="bookmark-outline" size={24} color="#0F2B5B" />
                <Text style={styles.modalOptionText}>Save draft</Text>
              </TouchableOpacity>
            )}
            <View style={styles.modalDivider} />

            {selectedPost && selectedPost?.user_id === currentUserId ? (
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

      {/* Modal hiển thị các tùy chọn cho avatar */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={avatarOptionsModalVisible}
        onRequestClose={() => setAvatarOptionsModalVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setAvatarOptionsModalVisible(false)}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleViewAvatar}>
              <Icon name="eye-outline" size={24} color="#0F2B5B" />
              <Text style={styles.modalOptionText}>View avatar</Text>
            </TouchableOpacity>

            <View style={styles.modalDivider} />

            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleUpdateAvatar}>
              <Icon name="camera-outline" size={24} color="#0F2B5B" />
              <Text style={styles.modalOptionText}>Edit Avatar</Text>
            </TouchableOpacity>

            <View style={styles.modalDivider} />

            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleDeleteAvatar}>
              <Icon name="trash-outline" size={24} color="red" />
              <Text style={[styles.modalOptionText, {color: 'red'}]}>
                Delete Avatar
              </Text>
            </TouchableOpacity>

            <View style={styles.modalDivider} />

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setAvatarOptionsModalVisible(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal hiển thị avatar phóng to */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={avatarModalVisible}
        onRequestClose={() => setAvatarModalVisible(false)}>
        <TouchableOpacity
          style={styles.avatarModalOverlay}
          activeOpacity={1}
          onPress={() => setAvatarModalVisible(false)}>
          <View style={styles.avatarModalContent}>
            <Image
              source={{uri: avatarUrl}}
              style={styles.zoomedAvatar}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setAvatarModalVisible(false)}>
              <Icon name="close-circle" size={40} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default RunnerProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  postTime: {color: '#999', fontSize: 14,marginLeft:14, marginTop: 10},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  photoContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  photoWrapper: {
    position: 'relative',
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#4A6FA5',
  },
  cameraButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#3B82F6',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  profileBio: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 4,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: '#F1F5F9',
    alignSelf: 'center',
  },
  sectionContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 16,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 8,
  },
  moreButton: {
    padding: 8,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    padding: 16,
    paddingBottom: 8,
    flex: 1,
  },
  postContent: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  postEngagement: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  engagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  engagementItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  engagementText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 4,
  },

  runStatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  runStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  runStatText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 4,
  },
  runStatDot: {
    fontSize: 14,
    color: '#64748B',
    marginHorizontal: 8,
  },
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
    color: '#0F172A',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  modalCancelButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F2B5B',
  },
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
  postImageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 8,
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
  avatarModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarModalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomedAvatar: {
    width: Dimensions.get('window').width * 0.9,
    height: Dimensions.get('window').width * 0.9,
    borderRadius: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
});
