'use client';

import {useEffect, useState, useCallback} from 'react';
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
  RefreshControl,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import BackButton from '../BackButton';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {usePostStore} from '../utils/usePostStore';
import {useLoginStore} from '../utils/useLoginStore';
import {theme} from '../contants/theme';
import {SaveDraftButton} from './CommunityScreens/SaveDraftButton';
import { formatTimeAgo } from '../utils/utils_format';
// Interface cho Post từ API
interface Post {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string | null;
  exercise_session_record_id: string | null;
  is_deleted: boolean;
  images: string[];
  upvote_count: number;
  comment_count: number;
  is_upvoted: boolean;
  tags: string[];
  user: {
    id: string;
    username: string;
    name: string;
    is_active: boolean;
    created_at: string;
    updated_at: string | null;
    image?: {
      url: string;
    };
  };
  postVote: Array<{
    id: string;
    user_id: string;
    post_id: string;
    is_like: boolean;
    created_at: string;
  }>;
  postComment: Array<{
    id: string;
    content: string;
    user_id: string;
    post_id: string;
    parent_comment_id: string | null;
    created_at: string;
    updated_at: string | null;
    is_deleted: boolean;
    User: {
      id: string;
      username: string;
    };
  }>;
  is_saved: boolean;
}

interface UserData {
  user: {
    id: string;
    username: string;
    email: string;
    name: string;
    birth_date: string | null;
    gender: string;
    address1: string | null;
    address2: string | null;
    image?: {
      id: string;
      url: string;
      public_id: string;
      post_id: string | null;
      certificate_id: string | null;
      user_id: string;
      created_at: string;
    };
  };
  counts: {
    Post: number;
    PostComment: number;
    PostVote: number;
  };
  posts: Post[];
  points?: number;
}

const OtherProfileScreen = ({route}) => {
  const {postId} = route.params;
  const navigation = useNavigation();
  const {userByPost, userLoading, userError, getUserByPostId, likePost} =
    usePostStore();
  const {profile} = useLoginStore();

  const [refreshing, setRefreshing] = useState(false);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [localPosts, setLocalPosts] = useState<Post[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);

  // Lấy thông tin người dùng khi màn hình được tải
  useEffect(() => {
    if (postId) {
      loadUserData();
    }
  }, [postId]);

  const loadUserData = async () => {
    try {
      const data = await getUserByPostId(postId);
      if (data) {
        // Cập nhật dữ liệu người dùng và bài viết
        setUserData(data);
        if (data.posts && Array.isArray(data.posts)) {
          setLocalPosts(data.posts);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Cập nhật localPosts khi userByPost thay đổi
  useEffect(() => {
    if (userByPost && userByPost?.posts && Array.isArray(userByPost?.posts)) {
      setLocalPosts(userByPost?.posts);
      setUserData(userByPost);
    }
  }, [userByPost]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  }, [postId]);

  useFocusEffect(
    useCallback(() => {
      onRefresh();
      return () => {};
    }, [onRefresh]),
  );

  const formatFirstLetter = (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const handleLikePost = async (postId: string, isLike: boolean) => {
    if (!profile) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để thích bài viết', [
        {text: 'Đóng', style: 'cancel'},
      ]);
      return;
    }
    console.log('isLike', isLike);

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
    } catch (error) {
      console.error('Lỗi khi thích bài viết:', error);
      // Nếu có lỗi, khôi phục lại trạng thái
      onRefresh();
    }
  };

  const renderTags = (tags: string[]) => {
    if (!tags || tags.length === 0) {
      return null;
    }

    // Nếu có 1-3 tags, hiển thị tất cả
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

    // Nếu có nhiều hơn 3 tags, hiển thị 3 đầu tiên + "+n"
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
          <Text style={styles.tagText}>+{tags?.length - 3}</Text>
        </View>
      </View>
    );
  };

  if (userLoading && !userData) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </SafeAreaView>
    );
  }

  if (userError) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {userError}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <BackButton size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Page</Text>
      </View>

      {userLoading || refreshing ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1E3A8A" />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#1E3A8A']}
            />
          }>
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.profileHeader}>
              <View style={styles.photoContainer}>
                <TouchableOpacity
                  style={styles.photoWrapper}
                  onPress={() => setAvatarModalVisible(true)}>
                  <Image
                    source={{
                      uri:
                        userData?.user?.image?.url ||
                        'https://via.placeholder.com/150',
                    }}
                    style={styles.profilePhoto}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {userData?.user?.name || 'Người dùng'}
                </Text>
                <Text style={styles.profileUsername}>
                  @{userData?.user?.username || 'username'}
                </Text>
                <View style={{flexDirection: 'row', gap: 8}}>
                {userData?.user?.roles?.includes(
                  'runner',
                ) && (
                  <View style={styles.roleBadge}>
                    <Icon name="walk" size={14} color="#fff" />
                    <Text style={styles.roleBadgeText}>Runner</Text>
                  </View>
                )}
                {userData?.user?.roles?.includes(
                  'expert',
                ) && (
                  <View style={styles.roleBadgeEx}>
                    <Icon name="ribbon" size={14} color="#fff" />
                    <Text style={styles.roleBadgeText}>Expert</Text>
                  </View>
                )}
                </View>
              </View>
            </View>

            {/* Address Section */}
            {userData?.user?.address1 && (
              <View style={styles.infoRow}>
                <Icon name="location-outline" size={16} color="#64748B" />
                <Text style={styles.infoText}>
                  {userData?.user?.address1
                    ? `${userData.user.address1}${
                        userData.user.address2
                          ? `, ${userData.user.address2}`
                          : ''
                      }`
                    : 'Address not updated yet'}
                </Text>
              </View>
            )}

            {/* Level Progress */}
            <View style={styles.levelContainer}>
              <View style={styles.levelHeader}>
                <Text style={styles.levelTitle}>Level Progress</Text>
                <Text style={styles.levelValue}>
                  {formatFirstLetter(userData?.user?.user_level)}
                </Text>
              </View>
              <View style={styles.levelProgressContainer}>
                <View style={styles.levelProgress}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${
                          userData?.user?.points
                            ? userData.user?.points_percentage 
                            : 0
                        }%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.levelText}>
                  <Text style={styles.pointsHighlight}>
                    {userData?.user?.points || 0}
                  </Text>
                  / {userData?.user?.points_to_next_level + userData?.user?.points} XP
                </Text>
              </View>
              <Text style={styles.nextLevelText}>
                Next:{' '}
                <Text style={styles.nextLevelHighlight}>
                  {formatFirstLetter(userData?.user?.user_next_level)}
                </Text>
              </Text>
            </View>

            {/* Additional Info */}
            <View style={styles.statsRow}>
              <View style={styles.statBadge}>
                <Icon name="trophy" size={16} color="#10B981" />
                <Text style={styles.statBadgeText}>
                  {formatFirstLetter(userData?.user?.user_level)}
                </Text>
              </View>

              <View style={styles.statBadge}>
                <Icon name="star" size={16} color="#F59E0B" />
                <Text style={styles.statBadgeText}>
                  {userData?.user?.points || 0} Points
                </Text>
              </View>
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.statsSection}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userData?.user?.points}</Text>
              <Text style={styles.statLabel}>Point</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {userData?.counts?.Post || 0}
              </Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {userData?.counts?.PostVote || 0}
              </Text>
              <Text style={styles.statLabel}>Liked</Text>
            </View>
          </View>

          {/* Posts Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>User Post</Text>

            {localPosts && localPosts.length > 0 ? (
              localPosts.map(post => (
                <View key={post.id} style={styles.postCard}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.postTime}>
                      {formatTimeAgo(post.created_at)}
                    </Text>
                    {post.user_id !== profile?.id && (
                      <View style={styles.engagementItem}>
                        <SaveDraftButton
                          postId={post.id}
                          isSaved={post.is_saved}
                          onSave={newSavedState => {
                            setLocalPosts(prev =>
                              prev.map(p =>
                                p.id === post.id
                                  ? {...p, is_saved: newSavedState}
                                  : p,
                              ),
                            );
                          }}
                        />
                      </View>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('CommunityPostDetailScreen', {
                        id: post.id,
                      })
                    }>
                    <Text style={styles.postTitle}>{post.title}</Text>
                    <Text style={styles.postContent} numberOfLines={3}>
                      {post.content}
                    </Text>

                    {/* Hiển thị ảnh bài viết */}
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
                    {post.exercise_session_record_id && (
                      <View style={styles.runDataIndicator}>
                        <View style={styles.runDataIndicatorContent}>
                          <Icon name="walk" size={20} color="#FFFFFF" />
                          <Text style={styles.runDataText}>
                            Runner record included
                          </Text>
                        </View>
                        <Icon
                          name="chevron-forward"
                          size={20}
                          color="#FFFFFF"
                          style={{marginLeft: 4}}
                        />
                      </View>
                    )}
                  </TouchableOpacity>

                  <View style={styles.postEngagement}>
                    <View style={styles.engagementItem}>
                      <TouchableOpacity
                        onPress={() =>
                          handleLikePost(post.id, !post.is_upvoted)
                        }>
                        <Icon
                          name={post.is_upvoted ? 'heart' : 'heart-outline'}
                          size={20}
                          color={post.is_upvoted ? theme.colors.primaryDark : '#64748B'}
                        />
                      </TouchableOpacity>
                      <Text style={styles.engagementText}>
                        {post.upvote_count || 0}
                      </Text>
                    </View>
                    <View style={styles.engagementItem}>
                      <Icon
                        name="chatbubble-outline"
                        size={20}
                        color="#64748B"
                      />
                      <Text style={styles.engagementText}>
                        {post.comment_count || 0}
                      </Text>
                    </View>

                    {/* Hiển thị tags */}
                    {renderTags(post.tags)}
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No posts yet.</Text>
            )}
          </View>
        </ScrollView>
      )}

      {/* Modal hiển thị avatar phóng to */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={avatarModalVisible}
        onRequestClose={() => setAvatarModalVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setAvatarModalVisible(false)}>
          <Image
            source={{
              uri:
                userData?.user?.image?.url || 'https://via.placeholder.com/150',
            }}
            style={styles.zoomedAvatar}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setAvatarModalVisible(false)}>
            <Icon name="close-circle" size={40} color="#FFFFFF" />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  photoContainer: {
    marginRight: 16,
  },
  photoWrapper: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#4A6FA5',
  },
  profilePhoto: {
    width: '100%',
    height: '100%',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  profileUsername: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 6,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryDark,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleBadgeEx: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFB22C',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#334155',
    marginLeft: 8,
    flex: 1,
  },
  levelContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  },
  levelValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primaryDark,
  },
  levelProgressContainer: {
    marginBottom: 8,
  },
  levelProgress: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.primaryDark,
    borderRadius: 4,
  },
  levelText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'right',
  },
  pointsHighlight: {
    color: theme.colors.primaryDark,
    fontWeight: '700',
  },
  nextLevelText: {
    fontSize: 14,
    color: '#64748B',
  },
  nextLevelHighlight: {
    color: theme.colors.primaryDark,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flex: 1,
    minWidth: 100,
    justifyContent: 'center',
  },
  statBadgeText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  runDataIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.primaryDark,
    padding: 8,
    paddingVertical: 8,
    borderRadius: 8,
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
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
  },
  sectionContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  postTime: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 10,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  postContent: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    paddingBottom: 12,
  },
  postEngagement: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  engagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  engagementText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    paddingVertical: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomedAvatar: {
    width: Dimensions.get('window').width * 0.8,
    height: Dimensions.get('window').width * 0.8,
    borderRadius: 12,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  // Thêm styles cho hiển thị ảnh và tags
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
    height: 200,
    resizeMode: 'cover',
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
  tagText: {
    fontSize: 12,
    color: '#666',
  },
});

export default OtherProfileScreen;
