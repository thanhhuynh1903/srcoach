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
  FlatList,
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
import {Dimensions} from 'react-native';
import CommunityPostDetailMap from './CommunityPostDetailMap';
import SkeletonPostDetail from './SkeletonPostDetail';

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
  is_upvote: boolean;
  is_upvoted: boolean;
  is_downvoted: boolean;
}

const CommunityPostDetailScreen = () => {
  const {getDetail, currentPost, getAll, deletePost, likePost, getMyPosts,isLoading: isLoadingPost} =
    usePostStore();
  const [localPost, setLocalPost] = useState<Post[]>([]);
  const {profile} = useLoginStore();
  const {
    createComment,
    getCommentsByPostId,
    comments,
    isLoading: isLoadingComments,
    deleteComment,
    updateComment,
    likeComment,
  } = useCommentStore();
  const navigation = useNavigation();
  const route = useRoute();
  const id = route.params?.id;
  const [showModal, setShowModal] = useState(false);

  // State cho modal
  const [modalVisible, setModalVisible] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState(null);

  const [isEditingComment, setIsEditingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingParentCommentId, setEditingParentCommentId] = useState<string | null>(null);

  const [zoomModalVisible, setZoomModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const isLoading = isLoadingPost || isLoadingComments;

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

  const handleEditComment = async (commentId: string) => {
    setCommentText('');
    // Tìm comment cần edit trong danh sách comments
    const findComment = (comments: any[], targetId: string): any => {
      for (const comment of comments) {
        if (comment.id === targetId) return comment;
        if (comment.other_PostComment?.length) {
          const found = findComment(comment.other_PostComment, targetId);
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
      setEditingParentCommentId(commentToEdit.parent_comment_id || null); // Capture parent ID
      setCommentText(commentToEdit.content);

      // Focus vào input
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleLikeComment = async (
    commentId: string,
    isCurrentlyLiked: boolean,
  ) => {
    if (!profile) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để thích bình luận', [
        {text: 'Đóng', style: 'cancel'},
      ]);
      return;
    }

    try {
      // Trạng thái mới là ngược lại với trạng thái hiện tại
      const newLikeState = !isCurrentlyLiked;

      // Optimistic update - cập nhật UI ngay lập tức
      const updateCommentInTree = comments => {
        return comments.map(comment => {
          if (comment.id === commentId) {
            // Cập nhật cả is_upvote và is_upvoted để đảm bảo nhất quán
            const newUpvoteCount = newLikeState
              ? (comment.upvote_count || 0) + 1
              : Math.max(0, (comment.upvote_count || 0) - 1);

            return {
              ...comment,
              is_upvote: newLikeState,
              is_upvoted: newLikeState,
              upvote_count: newUpvoteCount,
            };
          }

          // Đệ quy cập nhật các comment con
          if (
            comment.other_PostComment &&
            comment.other_PostComment.length > 0
          ) {
            return {
              ...comment,
              other_PostComment: updateCommentInTree(comment.other_PostComment),
            };
          }

          return comment;
        });
      };

      // Cập nhật state comments trong store với optimistic update
      const updatedComments = updateCommentInTree([...comments]);
      useCommentStore.setState({comments: updatedComments});

      // Gọi API để like/unlike bình luận - truyền trạng thái mới
      const success = await likeComment(commentId, newLikeState);

      if (!success) {
        // Nếu API thất bại, khôi phục lại danh sách comments ban đầu
        await getCommentsByPostId(id);
        Alert.alert('Error', 'Cannot like comment. Please try again later.');
      }
    } catch (error) {
      console.error('Error liking comment:', error);
      // Khôi phục lại danh sách comments ban đầu nếu có lỗi
      await getCommentsByPostId(id);
      Alert.alert('Error', 'Cannot like comment. Please try again later.');
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
          await getMyPosts();
          Alert.alert('Success', 'Comment updated successfully');
        } else {
          Alert.alert('Error', 'Failed to update comment');
        }
      } else {
        // Nếu đang tạo comment mới hoặc reply
        const result = await createComment(id, commentText, replyingTo ?? '');

        if (result) {
          // Reset input và trạng thái reply
          setCommentText('');
          setReplyingTo(null);
          setEditingParentCommentId(null); // Clear parent ID

          // Cập nhật lại danh sách bình luận
          await getCommentsByPostId(id);
          // Cập nhật lại thông tin bài viết
          await getDetail(id);
          await getAll();
          await getMyPosts();
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
              comment.User?.image.url ||
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
              <TouchableOpacity
                onPress={() => handleLikeComment(comment.id, comment.is_upvote)}
                style={styles.likeButton}>
                <Icon
                  name={
                    comment.is_upvote || comment.is_upvoted
                      ? 'heart'
                      : 'heart-outline'
                  }
                  size={16}
                  color={
                    comment.is_upvote || comment.is_upvoted ? '#4285F4' : '#666'
                  }
                />
                <Text
                  style={[
                    styles.commentVoteCount,
                    (comment.is_upvote || comment.is_upvoted) &&
                      styles.commentVoteCountActive,
                  ]}>
                  {comment.upvote_count || 0}
                </Text>
              </TouchableOpacity>
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
      Alert.alert('Success', 'Please login to like this post', [
        {text: 'Close', style: 'cancel'},
      ]);
      return;
    }

    try {
      // Cập nhật UI ngay lập tức (optimistic update)
      // Lưu trạng thái cũ để khôi phục nếu API thất bại
      const oldPostState = {...currentPost};

      // Cập nhật trạng thái hiện tại của bài viết
      const updatedPost = {
        ...currentPost,
        is_upvoted: isLike,
        upvote_count: isLike
          ? currentPost?.is_upvoted
            ? currentPost.upvote_count
            : currentPost!.upvote_count + 1
          : currentPost?.is_upvoted
          ? currentPost.upvote_count - 1
          : currentPost?.upvote_count,
      };
      console.log('updatedPost', updatedPost);

      // Cập nhật currentPost trong store
      usePostStore.setState({currentPost: updatedPost});

      // Gọi API để like/unlike bài viết
      const success = await likePost(id, isLike);
      await getMyPosts();
      if (!success) {
        // Nếu API thất bại, khôi phục lại trạng thái cũ
        usePostStore.setState({currentPost: oldPostState});
        Alert.alert('Error', 'Unable to like this post. Please try again later.');
      }
    } catch (error) {
      console.error('Error liking post:', error);
      Alert.alert('Error', 'Unable to like this post. Please try again later.');
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

    {isLoading ? (
      <SkeletonPostDetail />
    ) : (
      <>
      <ScrollView style={styles.scrollView}>
        {/* User info section */}
        <View style={styles.userInfoContainer}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('OtherProfileScreen', {postId: currentPost?.id})
            }>
            <View style={styles.userInfo}>
              <Image
                source={{
                  uri:
                    localPost?.user?.image?.url ||
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
                
                </View>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.moreButton} onPress={handleMorePress}>
            <Icon name="ellipsis-horizontal" size={20} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Post content */}
        <View style={styles.postContent}>
          <Text style={styles.postTitle}>{localPost?.title}</Text>
          <Text style={styles.postDescription}>{localPost?.content}</Text>

          {/* Run photo */}
          {localPost?.images && localPost?.images.length > 0 && (
            <>
              {localPost.images.length > 2 ? (
                <View style={{marginBottom: 16}}>
                  {/* First image shown larger */}
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedImageIndex(0);
                      setZoomModalVisible(true);
                    }}
                    style={{marginBottom: 8}}>
                    <Image
                      source={{uri: localPost.images[0]}}
                      style={[styles.runPhoto, {height: 180}]} // Slightly smaller than full runPhoto
                      resizeMode="cover"
                    />
                  </TouchableOpacity>

                  {/* Remaining images in horizontal scroll */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    scrollEnabled={false}
                    contentContainerStyle={{paddingHorizontal: 2}}>
                    {localPost.images.slice(1).map((imageUri, index) => (
                      <TouchableOpacity
                        key={index + 1}
                        onPress={() => {
                          setSelectedImageIndex(index + 1);
                          setZoomModalVisible(true);
                        }}
                        style={{marginRight: 8}}>
                        <Image
                          source={{uri: imageUri}}
                          style={styles.postImagev2}
                          resizeMode="cover"
                        />

                        {/* Show count on last visible image if there are many */}
                        {localPost.images.length > 3 && index === 2 && (
                          <View
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundColor: 'rgba(0,0,0,0.5)',
                              justifyContent: 'center',
                              alignItems: 'center',
                              borderRadius: 8,
                            }}>
                            <Text
                              style={{
                                color: 'white',
                                fontSize: 18,
                                fontWeight: 'bold',
                              }}>
                              +{localPost.images.length - 4}
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              ) : localPost.images.length === 2 ? (
                // For exactly 2 images, show them side by side
                <View
                  style={{
                    flexDirection: 'row',
                    marginBottom: 16,
                    height: 180,
                    gap: 8,
                  }}>
                  <TouchableOpacity
                    style={{flex: 1}}
                    onPress={() => {
                      setSelectedImageIndex(0);
                      setZoomModalVisible(true);
                    }}>
                    <Image
                      source={{uri: localPost.images[0]}}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 12,
                      }}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{flex: 1}}
                    onPress={() => {
                      setSelectedImageIndex(1);
                      setZoomModalVisible(true);
                    }}>
                    <Image
                      source={{uri: localPost.images[1]}}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 12,
                      }}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                // For a single image
                <TouchableOpacity
                  onPress={() => {
                    setSelectedImageIndex(0);
                    setZoomModalVisible(true);
                  }}
                  style={{marginBottom: 16}}>
                  <Image
                    source={{uri: localPost.images[0]}}
                    style={styles.runPhoto}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}
            </>
          )}

          <CommunityPostDetailMap
            exerciseSessionRecordId={currentPost?.exercise_session_record_id}
          />

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
          ) : comments && comments.filter((item) => !item.is_deleted).length > 0 ? (
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
          <Image
            source={{
              uri:
                profile?.image?.url ||
                'data:image/png;base64,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',
            }}
            style={styles.commentAvatar}
          />
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

      <Modal
        visible={zoomModalVisible}
        transparent={true}
        onRequestClose={() => setZoomModalVisible(false)}>
        <View style={styles.zoomModalContainer}>
          <FlatList
            data={localPost?.images || []}
            horizontal
            pagingEnabled
            initialScrollIndex={selectedImageIndex}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({item}) => (
              <ScrollView
                style={styles.zoomScrollView}
                maximumZoomScale={3}
                minimumZoomScale={1}
                contentContainerStyle={styles.zoomContentContainer}>
                <Image
                  source={{uri: item}}
                  style={styles.zoomImage}
                  resizeMode="contain"
                />
              </ScrollView>
            )}
            // Giúp FlatList scroll đúng vị trí đã chọn khi modal mở
            onScrollToIndexFailed={() => {}}
          />
          <TouchableOpacity
            style={styles.zoomModalCloseButton}
            onPress={() => setZoomModalVisible(false)}>
            <Icon name="close" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </Modal>

      <ModalPoppup
        visible={showModal}
        onClose={() => setShowModal(false)}
        deleteComment={handleDeleteComment}
        editComment={handleEditComment}
        commentId={selectedCommentId}
      />
    </>

    )}
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
    borderWidth: 1,
    borderColor: '#4285F4',
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
    borderWidth: 1,
    borderColor: '#4285F4',
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
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  commentVoteCountActive: {
    color: '#4285F4',
  },
  postImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginRight: 10,
  },
  postImagev2: {
    width: 113,
    height: 113,
    borderRadius: 8,
    marginRight: 10,
  },
  zoomModalContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomScrollView: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  zoomContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  zoomModalCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
});

export default CommunityPostDetailScreen;
