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
  // State cho modal và bài viết đã chọn
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [localPosts, setLocalPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  // Cập nhật localPosts khi myPosts từ store thay đổi
  useEffect(() => {
    if (myPosts && myPosts.length > 0) {
      setLocalPosts(myPosts);
    }
    console.log('myPosts', myPosts);
  }, [myPosts]);

  useEffect(() => {
    getMyPosts();
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

  const renderTags = (tags: Tag[]) => {
    if (!tags || tags.length === 0) {
      return null;
    }

    // Nếu có 1-2 tags, hiển thị tất cả
    if (tags.length <= 4) {
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
          <Text style={styles.tagText}>{tags[3]}</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>+{tags.length - 4}</Text>
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            navigation.navigate('CommunityCreatePostScreen' as never)
          }>
          <Icon name="create-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {isLoading && localPosts.length === 0 || refreshing ? (
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
            <Image
              source={{uri: 'https://randomuser.me/api/portraits/women/32.jpg'}}
              style={styles.profileImage}
            />
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
              <Text style={styles.statValue}>1.2K</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>45.6K</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>328</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
          </View>

          {/* Achievements Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <View style={styles.achievementsContainer}>
              <View style={styles.achievementItem}>
                <View style={styles.achievementIconContainer}>
                  <Icon name="medal" size={24} color="#0F2B5B" />
                </View>
                <Text style={styles.achievementTitle}>Marathon Master</Text>
                <Text style={styles.achievementDescription}>
                  Completed 10 marathons
                </Text>
              </View>

              <View style={styles.achievementItem}>
                <View style={styles.achievementIconContainer}>
                  <Icon name="trophy" size={24} color="#0F2B5B" />
                </View>
                <Text style={styles.achievementTitle}>Top Contributor</Text>
                <Text style={styles.achievementDescription}>
                  1000+ helpful posts
                </Text>
              </View>

              <View style={styles.achievementItem}>
                <View style={styles.achievementIconContainer}>
                  <Icon name="people" size={24} color="#0F2B5B" />
                </View>
                <Text style={styles.achievementTitle}>Community Leader</Text>
                <Text style={styles.achievementDescription}>
                  Most active expert
                </Text>
              </View>
            </View>
          </View>

          {/* Posts Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>My Posts</Text>

            {localPosts && localPosts.length > 0 ? (
              localPosts.map(post => (
                <View key={post.id} style={styles.postCard}>
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

                    <View style={styles.runStatsContainer}>
                      <View style={styles.runStatItem}>
                        <Icon name="walk" size={16} color="#64748B" />
                        <Text style={styles.runStatText}>10.2km</Text>
                      </View>
                      <Text style={styles.runStatDot}>•</Text>
                      <View style={styles.runStatItem}>
                        <Icon name="time" size={16} color="#64748B" />
                        <Text style={styles.runStatText}>48:23</Text>
                      </View>
                      <Text style={styles.runStatDot}>•</Text>
                      <View style={styles.runStatItem}>
                        <Icon name="speedometer" size={16} color="#64748B" />
                        <Text style={styles.runStatText}>4'45"/km</Text>
                      </View>
                    </View>
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
            <TouchableOpacity style={styles.modalOption} onPress={handleUpdate}>
              <Icon name="create-outline" size={24} color="#0F2B5B" />
              <Text style={styles.modalOptionText}>Edit Post</Text>
            </TouchableOpacity>

            <View style={styles.modalDivider} />

            <TouchableOpacity style={styles.modalOption} onPress={handleDelete}>
              <Icon name="trash-outline" size={24} color="red" />
              <Text style={[styles.modalOptionText, {color: 'red'}]}>
                Delete Post
              </Text>
            </TouchableOpacity>

            <View style={styles.modalDivider} />

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
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
  achievementsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  achievementItem: {
    alignItems: 'center',
    width: '30%',
  },
  achievementIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
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
});
