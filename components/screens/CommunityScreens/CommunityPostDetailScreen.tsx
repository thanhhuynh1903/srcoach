import React, {useEffect, useState, useRef, useMemo} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import BackButton from '../../BackButton';
import {usePostStore} from '../../utils/usePostStore';
import {useRoute, useNavigation} from '@react-navigation/native';
import {useLoginStore} from '../../utils/useLoginStore';
import {useCommentStore} from '../../utils/useCommentStore';
import ModalPoppup from '../../ModalPoppup';


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

const CommunityPostDetailScreen = () => {
  const {getDetail, currentPost, getAll, deletePost, likePost} = usePostStore();
  const [localPost, setLocalPost] = useState<Post[]>([]);
  const {profile} = useLoginStore();
  const {
    createComment,
    getCommentsByPostId,
    comments,
    isLoading: isLoadingComments,
    deleteComment,
    updateComment,
  } = useCommentStore();
  const navigation = useNavigation();
  const route = useRoute();
  const id = route.params?.id;
  const [showModal, setShowModal] = useState(false);

  // State cho modal
  const [modalVisible, setModalVisible] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState(null);

  const [isEditingComment, setIsEditingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  // Lấy currentUserId từ profile
  const currentUserId = useMemo(() => profile?.id, [profile]);

  // Tham chiếu đến input để focus
  const inputRef = useRef(null);
  console.log('currentPost', currentPost);

  useEffect(() => {
    if (id) {
      // Tải thông tin bài viết
      getDetail(id);
      // Tải bình luận
      getCommentsByPostId(id);
    } else {
      console.error('No post ID provided');
    }
  }, [id]);

  const handleEditComment = async commentId => {
    // Tìm comment cần edit trong danh sách comments
    const findComment: any = (comments, id) => {
      for (const comment of comments) {
        if (comment.id === id) {
          return comment;
        }
        if (comment.children && comment.children.length > 0) {
          const found = findComment(comment.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    const commentToEdit = findComment(comments, commentId);

    if (commentToEdit) {
      // Thiết lập trạng thái chỉnh sửa
      setIsEditingComment(true);
      setEditingCommentId(commentId);
      setCommentText(commentToEdit.content);

      // Focus vào input
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  // Hàm xử lý gửi bình luận
  const handleSendComment = async () => {
    if (!commentText.trim()) return;

    try {
      setIsSubmittingComment(true);

      // Nếu đang edit comment
      if (isEditingComment && editingCommentId) {
        const result = await updateComment(editingCommentId, commentText);

        if (result) {
          // Reset trạng thái edit
          setIsEditingComment(false);
          setEditingCommentId(null);
          setCommentText('');

          // Cập nhật lại danh sách bình luận
          await getCommentsByPostId(id);
          // Cập nhật lại thông tin bài viết
          await getDetail(id);
          await getAll();

          Alert.alert('Success', 'Comment updated successfully');
        } else {
          Alert.alert('Error', 'Failed to update comment');
        }
      } else {
        // Nếu đang tạo comment mới hoặc reply
        const result = await createComment(id, commentText, replyingTo);

        if (result) {
          // Reset input và trạng thái reply
          setCommentText('');
          setReplyingTo(null);

          // Cập nhật lại danh sách bình luận
          await getCommentsByPostId(id);
          // Cập nhật lại thông tin bài viết
          await getDetail(id);
          await getAll();
        } else {
          Alert.alert('Error', 'Failed to post comment');
        }
      }
    } catch (error) {
      console.error('Error with comment:', error);
      Alert.alert('Error', 'An error occurred while processing your comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Hàm hủy chỉnh sửa comment
  const handleCancelEdit = () => {
    setIsEditingComment(false);
    setEditingCommentId(null);
    setCommentText('');
  };

  // Hàm xử lý khi nhấn Reply trên một bình luận
  const handleReplyComment = (commentId: string) => {

    setReplyingTo(commentId);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const formatTimeAgo = dateString => {
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

  // Xử lý khi nhấn nút "More"
  const handleMorePress = () => {
    setModalVisible(true);
  };

  // Xử lý xóa bài viết
  const handleDelete = async () => {
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
              const postId = currentPost?.id;
              console.log('Deleting post with id:', postId);

              setModalVisible(false);

              // Gọi API xóa bài viết
              const success = await deletePost(postId ?? '');

              if (success) {
                // Thông báo thành công và quay lại màn hình trước
                Alert.alert('Success', 'Post deleted successfully', [
                  {text: 'OK', onPress: () => navigation.goBack()},
                ]);
              } else {
                // Nếu xóa thất bại
                Alert.alert('Error', 'Failed to delete post');
              }
            } catch (error) {
              console.error('Error deleting post:', error);
              Alert.alert('Error', 'An error occurred while deleting the post');
            }
          },
        },
      ],
      {cancelable: true},
    );
  };

  // Xử lý cập nhật bài viết
  const handleUpdate = () => {
    setModalVisible(false);
    navigation.navigate('CommunityUpdatePostScreen', {postId: currentPost.id});
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const success = await deleteComment(commentId);

      if (success) {
        // Cập nhật lại thông tin bài viết để lấy số lượng bình luận mới
        await getCommentsByPostId(id);
        await getAll();
        Alert.alert('Success', 'Comment deleted successfully');
      } else {
        Alert.alert('Error', 'Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      Alert.alert('Error', 'An error occurred while deleting the comment');
    }
  };

  // Xử lý lưu nháp bài viết
  const handleSaveDraft = () => {
    setModalVisible(false);
    // Thực hiện lưu nháp
    Alert.alert('Success', 'Post saved to drafts');
  };

  // Xử lý ẩn bài viết
  const handleHide = () => {
    setModalVisible(false);
    Alert.alert('Success', 'Post hidden from your feed');
    navigation.goBack();
  };

  // Trong CommunityPostDetailScreen
  const renderComment = (comment: any) => {
    console.log('comment', comment);

    return (
      <TouchableOpacity
        key={comment.id}
        style={styles.commentContainer}
        onPress={() => {
          // Chỉ cho phép chỉnh sửa/xóa comment của chính user
          if (comment.user_id === currentUserId) {
            setSelectedCommentId(comment.id);
            setShowModal(true);
          }
        }}>
        <Image
          source={{
            uri:
              comment.user?.avatar ||
              'https://randomuser.me/api/portraits/women/32.jpg',
          }}
          style={styles.commentAvatar}
        />
        <View style={styles.commentContent}>
          <View style={styles.commentHeader}>
            <Text style={styles.commentUserName}>
              {comment.User?.username || comment.user?.username}
            </Text>
            <Text style={styles.commentTime}>
              {formatTimeAgo(comment.created_at)}
              {comment.updated_at &&
                new Date(comment.updated_at) > new Date(comment.created_at) &&
                ' (edited)'}
            </Text>
          </View>
          <Text style={styles.commentText}>{comment.content}</Text>
          <View style={styles.commentActions}>
            <View style={styles.commentVotes}>
              <TouchableOpacity>
                <Icon name="heart-outline" size={16} color="#4285F4" />
              </TouchableOpacity>
              <Text style={styles.commentVoteCount}>
                {comment.upvote_count || 0}
              </Text>
            </View>
            {!comment.parent_comment_id && (
              <TouchableOpacity onPress={() => handleReplyComment(comment.id)}>
                <Text style={styles.replyButton}>Reply</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Render các bình luận con (nếu có) */}
          {comment.other_PostComment &&
            comment.other_PostComment.length > 0 && (
              <View style={styles.repliesContainer}>
                {comment.other_PostComment
                  .filter((childComment: any) => !childComment.is_deleted)
                  .map((childComment: any) => renderComment(childComment))}
              </View>
            )}
        </View>
      </TouchableOpacity>
    );
  };

  const FilterComment = (comments: any[]): number => {
    return comments.reduce((total, comment) => {
      // Nếu comment chính không bị xóa, tăng 1
      let count = !comment?.is_deleted ? 1 : 0;
      // Nếu có other_PostComment, cộng thêm số comment không bị xóa
      if (Array.isArray(comment.other_PostComment)) {
        count += comment.other_PostComment.filter(
          (c: any) => !c?.is_deleted,
        ).length;
      }
      return total + count;
    }, 0);
  };

  useEffect(() => {
    if (currentPost) {
      setLocalPost(currentPost);
    }
  }, [currentPost]);

  const handleLikePost = async (id: string, isLike: boolean) => {
    if (!profile) {
      // Kiểm tra người dùng đã đăng nhập chưa
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để thích bài viết', [
        {text: 'Đóng', style: 'cancel'},
      ]);
      return;
    }
  
    try {
      // Cập nhật UI ngay lập tức (optimistic update)
      // Lưu trạng thái cũ để khôi phục nếu API thất bại
      const oldPostState = { ...currentPost };
      
      // Cập nhật trạng thái hiện tại của bài viết
      const updatedPost = {
        ...currentPost,
        is_upvoted: isLike,
        upvote_count: isLike 
          ? currentPost?.is_upvoted ? currentPost.upvote_count : currentPost!.upvote_count + 1
          : currentPost?.is_upvoted ? currentPost.upvote_count - 1 : currentPost?.upvote_count
      };
      
      // Cập nhật currentPost trong store
      usePostStore.setState({ currentPost: updatedPost });
      
      // Gọi API để like/unlike bài viết
      const success = await likePost(id, isLike);
      
      if (!success) {
        // Nếu API thất bại, khôi phục lại trạng thái cũ
        usePostStore.setState({ currentPost: oldPostState });
        Alert.alert('Lỗi', 'Không thể thích bài viết. Vui lòng thử lại sau.');
      }
    } catch (error) {
      console.error('Error liking post:', error);
      Alert.alert('Lỗi', 'Không thể thích bài viết. Vui lòng thử lại sau.');
    }
  };
  

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackButton size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* User info section */}
        <View style={styles.userInfoContainer}>
          <View style={styles.userInfo}>
          <Image
              source={{
                uri:
                  localPost?.user?.avatar ||
                  'https://randomuser.me/api/portraits/men/32.jpg',
              }}
              style={styles.avatar}
            />
            <View style={styles.userTextInfo}>
              <Text style={styles.userName}>{localPost?.user?.username}</Text>
              <View style={styles.postMetaInfo}>
                <Text style={styles.postTime}>
                  {formatTimeAgo(localPost?.created_at)}
                </Text>
                <Text style={styles.postTime}> • </Text>
                <Icon name="location-outline" size={14} color="#666" />
                <Text style={styles.postTime}>Central Park</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.moreButton} onPress={handleMorePress}>
            <Icon name="ellipsis-horizontal" size={20} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Post content */}
        <View style={styles.postContent}>
          <Text style={styles.postTitle}>{localPost?.title}</Text>
          <Text style={styles.postDescription}>{localPost?.content}</Text>

          {/* Run photo */}
          {localPost?.images && localPost.images.length > 0 && (
            <Image
              source={{uri: localPost?.images[0]}}
              style={styles.runPhoto}
              resizeMode="cover"
            />
          )}
          {/* Run map */}
          <View style={styles.mapContainer}>
            <View style={styles.mapTitleContainer}>
              <Icon name="trending-up" size={16} color="#4285F4" />
              <Text style={styles.mapTitle}>Morning Route</Text>
            </View>
            <Image
              source={{
                uri: 'https://maps.googleapis.com/maps/api/staticmap?center=40.7831,-73.9712&zoom=14&size=600x300&maptype=roadmap&path=color:0x4285F4|weight:3|40.7831,-73.9712|40.7735,-73.9675|40.7685,-73.9751&key=YOUR_API_KEY',
              }}
              style={styles.mapImage}
              resizeMode="cover"
            />
          </View>
          {currentPost && currentPost.tags && currentPost.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              <Text style={{fontSize: 16, fontWeight: 'bold', marginRight: 5}}>
                Tags :{' '}
              </Text>
              {currentPost.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
          {/* Run stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>8.2 km</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>45:23</Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>154 bpm</Text>
              <Text style={styles.statLabel}>Avg Heart Rate</Text>
            </View>
          </View>

          {/* Post engagement */}
          <View style={styles.engagementContainer}>
            <View style={styles.engagementLeft}>
              <TouchableOpacity
                style={styles.voteButton}
                onPress={() =>
                  handleLikePost(localPost?.id, !localPost?.is_upvoted)
                }>
                <Icon
                  name={localPost?.is_upvoted ? 'heart' : 'heart-outline'}
                  size={20}
                  color={localPost?.is_upvoted ? '#4285F4' : '#666'}
                />
              </TouchableOpacity>
              <Text style={styles.voteCount}>{localPost?.upvote_count}</Text>

              <View style={styles.engagementMiddle}>
                <TouchableOpacity style={styles.commentButton}>
                  <Icon name="chatbubble-outline" size={20} color="#666" />
                  <Text style={styles.commentCount}>
                    {FilterComment(comments)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.engagementRight}>
              <TouchableOpacity style={styles.actionButton}>
                <Icon name="bookmark-outline" size={20} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Icon name="share-social-outline" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Comments section */}
        <View style={styles.commentsSection}>
          <View style={styles.commentsSectionHeader}>
            <Text style={styles.commentsSectionTitle}>
              Comments ({FilterComment(comments)})
            </Text>
            <TouchableOpacity style={styles.sortButton}>
              <Text style={styles.sortButtonText}>Sort by: Best</Text>
              <Icon name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Comments */}
          {isLoadingComments ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#4285F4" />
            </View>
          ) : comments && comments.length > 0 ? (
            comments
              .filter(comment => comment?.is_deleted === false)
              .map(comment => renderComment(comment))
          ) : (
            <Text style={styles.noCommentsText}>
              No comments yet. Be the first to comment!
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Input container cho bình luận */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton}>
          <Icon name="person-circle-outline" size={32} color="#64748B" />
        </TouchableOpacity>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={
            isEditingComment
              ? 'Edit your comment...'
              : replyingTo
              ? 'Write a reply...'
              : 'Type your message...'
          }
          placeholderTextColor="#64748B"
          value={commentText}
          onChangeText={setCommentText}
          multiline
        />

        {isEditingComment && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelEdit}>
            <Icon name="close" size={20} color="#A1A1AA" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.sendButton,
            commentText.trim() ? styles.activeSendButton : null,
          ]}
          onPress={handleSendComment}
          disabled={!commentText.trim() || isSubmittingComment}>
          {isSubmittingComment ? (
            <ActivityIndicator size="small" color="#4285F4" />
          ) : (
            <Icon
              name={isEditingComment ? 'checkmark' : 'send'}
              size={20}
              color={commentText.trim() ? '#4285F4' : '#A1A1AA'}
            />
          )}
        </TouchableOpacity>
      </View>

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
            {currentPost && currentPost?.user?.id === currentUserId ? (
              <>
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={handleUpdate}>
                  <Icon name="create-outline" size={24} color="#4285F4" />
                  <Text style={styles.modalOptionText}>Update</Text>
                </TouchableOpacity>

                <View style={styles.modalDivider} />

                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={handleDelete}>
                  <Icon name="trash-outline" size={24} color="red" />
                  <Text style={[styles.modalOptionText, {color: 'red'}]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={handleSaveDraft}>
                  <Icon name="bookmark-outline" size={24} color="#4285F4" />
                  <Text style={styles.modalOptionText}>Save draft</Text>
                </TouchableOpacity>

                <View style={styles.modalDivider} />

                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={handleHide}>
                  <Icon name="eye-off-outline" size={24} color="#666" />
                  <Text style={styles.modalOptionText}>Hide</Text>
                </TouchableOpacity>
              </>
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

      <ModalPoppup
        visible={showModal}
        onClose={() => setShowModal(false)}
        deleteComment={handleDeleteComment}
        editComment={handleEditComment}
        commentId={selectedCommentId}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  cancelButton: {
    padding: 8,
    marginRight: 4,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    height: 50,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userTextInfo: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  postMetaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  postTime: {
    fontSize: 14,
    color: '#666',
  },
  moreButton: {
    padding: 8,
  },
  postContent: {
    paddingHorizontal: 16,
  },
  postTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  postDescription: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
    marginBottom: 16,
  },
  runPhoto: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  mapContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  mapTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 6,
    color: '#000',
  },
  mapImage: {
    width: '100%',
    height: 180,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#f0f0f0',
  },
  engagementContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  engagementLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voteButton: {
    padding: 4,
  },
  voteCount: {
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: 8,
    color: '#000',
  },
  engagementMiddle: {
    marginLeft: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentCount: {
    fontSize: 16,
    marginLeft: 6,
    color: '#666',
  },
  engagementRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 4,
    marginLeft: 16,
  },
  commentsSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  commentsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  commentsSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortButtonText: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  commentContent: {
    flex: 1,
    marginLeft: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUserName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  commentTime: {
    fontSize: 13,
    color: '#666',
  },
  commentText: {
    fontSize: 15,
    lineHeight: 20,
    color: '#333',
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  commentVotes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentVoteCount: {
    fontSize: 14,
    marginHorizontal: 6,
    color: '#666',
  },
  replyButton: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  repliesContainer: {
    marginLeft: 10,
    marginTop: 12,
    paddingLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 12,
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  sendButton: {
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
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
    color: '#4285F4',
  },
  replyingToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#f0f2f5',
    borderRadius: 8,
    marginBottom: 5,
    width: '100%',
  },
  replyingToText: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
  },
  activeSendButton: {
    backgroundColor: '#EEF2FF',
  },
  noCommentsText: {
    textAlign: 'center',
    color: '#64748B',
    marginVertical: 20,
    fontStyle: 'italic',
  },
});

export default CommunityPostDetailScreen;
