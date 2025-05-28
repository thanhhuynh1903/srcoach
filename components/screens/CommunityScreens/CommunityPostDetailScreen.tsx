import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  FlatList,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import BackButton from '../../BackButton';
import { usePostStore } from '../../utils/usePostStore';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useLoginStore } from '../../utils/useLoginStore';
import { useCommentStore } from '../../utils/useCommentStore';
import { Dimensions } from 'react-native';
import CommunityPostDetailMap from './CommunityPostDetailMap';
import SkeletonPostDetail from './SkeletonPostDetail';
import { CommonAvatar } from '../../commons/CommonAvatar';
import { SaveDraftButton } from './SaveDraftButton';
import CommunityPostDetailCommentScreen from './CommunityPostDetailCommentScreen';
import { theme } from '../../contants/theme';

// Interface definitions
interface User {
  id: string;
  username: string;
  user_level: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

interface Post {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string | null;
  exercise_session_record_id: string | null;
  User: User;
  user: User;
  postTags: string[];
  PostVote: any[];
  PostComment: any[];
  images: string[];
  upvote_count: number;
  downvote_count: number;
  comment_count: number;
  is_upvote: boolean;
  is_upvoted: boolean;
  is_downvoted: boolean;
  is_saved: boolean;
}

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string | null;
  parent_comment_id: string | null;
  User: User;
  user: User;
  is_upvote: boolean;
  is_upvoted: boolean;
  upvote_count: number;
  is_deleted: boolean;
  other_PostComment: Comment[];
}

const CommunityPostDetailScreen = () => {
  const {
    getDetail,
    currentPost,
    getAll,
    deletePost,
    likePost,
    getMyPosts,
    isLoading: isLoadingPost,
  } = usePostStore();
  const { profile } = useLoginStore();
  const { createComment, updateComment, comments, getCommentsByPostId } = useCommentStore();
  const navigation = useNavigation();
  const route = useRoute();
  const id = route.params?.id;
  const [localPost, setLocalPost] = useState<Post | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [zoomModalVisible, setZoomModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isEditingComment, setIsEditingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingParentCommentId, setEditingParentCommentId] = useState<string | null>(null);
  const [commentCount, setCommentCount] = useState(0);

  const currentUserId = useMemo(() => profile?.id, [profile]);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (id) {
      getDetail(id);
      getCommentsByPostId(id);
    } else {
      console.error('No post ID provided');
    }
  }, [id]);

  useEffect(() => {
    if (currentPost) {
      setLocalPost(currentPost);
      setCommentCount(currentPost.comment_count || 0);
    }
  }, [currentPost]);

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffMs = now.getTime() - postDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    else if (diffHours > 0) return `${diffHours}h ago`;
    else if (diffMins > 0) return `${diffMins}m ago`;
    else return 'Just now';
  };

  const handleMorePress = () => {
    setModalVisible(true);
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const postId = currentPost?.id;
              setModalVisible(false);
              const success = await deletePost(postId ?? '');
              if (success) {
                Alert.alert('Success', 'Post deleted successfully', [
                  { text: 'OK', onPress: () => navigation.goBack() },
                ]);
              } else {
                Alert.alert('Error', 'Failed to delete post');
              }
            } catch (error) {
              console.error('Error deleting post:', error);
              Alert.alert('Error', 'An error occurred while deleting the post');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleUpdate = () => {
    setModalVisible(false);
    navigation.navigate('CommunityUpdatePostScreen', { postId: currentPost.id });
  };

  const handleLikePost = async (postId: string, isLike: boolean) => {
    if (!profile) {
      Alert.alert('Success', 'Please login to like this post');
      return;
    }

    try {
      const updatedPost = {
        ...currentPost,
        is_upvoted: isLike,
        upvote_count: isLike
          ? currentPost.upvote_count + 1
          : Math.max(0, currentPost.upvote_count - 1),
      };

      usePostStore.setState({ currentPost: updatedPost });
      usePostStore.setState((state) => ({
        myPosts: state.myPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                is_upvoted: isLike,
                upvote_count: isLike
                  ? post.upvote_count + 1
                  : Math.max(0, post.upvote_count - 1),
              }
            : post
        ),
      }));

      await likePost(postId, isLike);
    } catch (error) {
      usePostStore.setState({ currentPost });
      usePostStore.setState((state) => ({
        myPosts: state.myPosts,
      }));
    }
  };

  const handleSendComment = async () => {
    if (!commentText.trim()) return;

    try {
      setIsSubmittingComment(true);

      if (isEditingComment && editingCommentId) {
        const updatedComments = updateCommentInTree(comments, editingCommentId, commentText);
        useCommentStore.setState({ comments: updatedComments });

        const result = await updateComment(editingCommentId, commentText);
        if (result) {
          setIsEditingComment(false);
          setEditingCommentId(null);
          setCommentText('');
          Alert.alert('Success', 'Comment updated successfully');
        } else {
          await getCommentsByPostId(id);
          Alert.alert('Error', 'Failed to update comment');
        }
      } else {
        const newComment: Comment = {
          id: `temp-${Date.now()}`,
          content: commentText,
          user_id: currentUserId || '',
          created_at: new Date().toISOString(),
          updated_at: null,
          parent_comment_id: replyingTo || null,
          User: profile,
          user: profile,
          is_upvote: false,
          is_upvoted: false,
          upvote_count: 0,
          is_deleted: false,
          other_PostComment: [],
        };

        let updatedComments: Comment[];
        if (replyingTo) {
          updatedComments = addReplyToComment(comments, replyingTo, newComment);
        } else {
          updatedComments = [newComment, ...comments];
        }

        useCommentStore.setState({ comments: updatedComments });
        setCommentCount(FilterComment(updatedComments));

        const result = await createComment(id, commentText, replyingTo ?? '');
        if (result) {
          setCommentText('');
          setReplyingTo(null);
          setEditingParentCommentId(null);
        } else {
          await getCommentsByPostId(id);
          Alert.alert('Error', 'Failed to post comment');
        }
      }
    } catch (error) {
      console.error('Error with comment:', error);
      await getCommentsByPostId(id);
      Alert.alert('Error', 'An error occurred while processing your comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const updateCommentInTree = (comments: Comment[], commentId: string, newContent: string): Comment[] => {
    return comments.map((comment) => {
      if (comment.id === commentId) {
        return {
          ...comment,
          content: newContent,
          updated_at: new Date().toISOString(),
        };
      }
      if (comment.other_PostComment?.length) {
        return {
          ...comment,
          other_PostComment: updateCommentInTree(comment.other_PostComment, commentId, newContent),
        };
      }
      return comment;
    });
  };

  const addReplyToComment = (comments: Comment[], parentId: string, newComment: Comment): Comment[] => {
    return comments.map((comment) => {
      if (comment.id === parentId) {
        return {
          ...comment,
          other_PostComment: [newComment, ...(comment.other_PostComment || [])],
        };
      }
      if (comment.other_PostComment?.length) {
        return {
          ...comment,
          other_PostComment: addReplyToComment(comment.other_PostComment, parentId, newComment),
        };
      }
      return comment;
    });
  };

  const handleCancelEdit = () => {
    setIsEditingComment(false);
    setEditingCommentId(null);
    setCommentText('');
  };

  const handleEditComment = (commentId: string) => {
    const findComment = (comments: Comment[], targetId: string): Comment | null => {
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
      setIsEditingComment(true);
      setEditingCommentId(commentId);
      setEditingParentCommentId(commentToEdit.parent_comment_id || null);
      setCommentText(commentToEdit.content);
      inputRef.current?.focus();
    }
  };

  const handleReplyComment = (commentId: string) => {
    setReplyingTo(commentId);
    inputRef.current?.focus();
  };

  const markCommentAsDeleted = (comments: Comment[], commentId: string): Comment[] => {
    return comments.map((comment) => {
      if (comment.id === commentId) {
        return { ...comment, is_deleted: true };
      }
      if (comment.other_PostComment?.length) {
        return {
          ...comment,
          other_PostComment: markCommentAsDeleted(comment.other_PostComment, commentId),
        };
      }
      return comment;
    });
  };

  const FilterComment = (comments: Comment[]): number => {
    return comments.reduce((total, comment) => {
      let count = !comment?.is_deleted ? 1 : 0;
      if (Array.isArray(comment.other_PostComment)) {
        count += comment.other_PostComment.filter((c) => !c?.is_deleted).length;
      }
      return total + count;
    }, 0);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackButton size={24} />
        </TouchableOpacity>
      </View>

      {isLoadingPost ? (
        <SkeletonPostDetail />
      ) : (
        <>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.userInfoContainer}>
              <TouchableOpacity
                onPress={() =>
                  currentPost?.user?.id === profile.id
                    ? navigation.navigate('RunnerProfileScreen' as never)
                    : navigation.navigate('OtherProfileScreen', {
                        postId: currentPost?.id,
                      })
                }
              >
                <View style={styles.userInfo}>
                  <CommonAvatar mode={null} size={40} uri={localPost?.user?.image?.url} />
                  <View style={styles.userTextInfo}>
                    <Text style={styles.userName}>{localPost?.user?.username}</Text>
                    <View style={styles.postMetaInfo}>
                      <Text style={styles.postTime}>{formatTimeAgo(localPost?.created_at)}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
              {currentPost?.user?.id !== currentUserId ? (
                <SaveDraftButton
                  postId={localPost?.id}
                  isSaved={localPost?.is_saved}
                  onSave={(newSavedState) => {
                    setLocalPost((prev) => ({
                      ...prev,
                      is_saved: newSavedState,
                    }));
                    usePostStore.setState((state) => ({
                      posts: state.posts.map((post) =>
                        post.id === localPost.id
                          ? { ...post, is_saved: newSavedState }
                          : post
                      ),
                    }));
                  }}
                />
              ) : (
                <TouchableOpacity style={styles.moreButton} onPress={handleMorePress}>
                  <Icon name="ellipsis-horizontal" size={20} color="#000" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.postContent}>
              <Text style={styles.postTitle}>{localPost?.title}</Text>
              <Text style={styles.postDescription}>{localPost?.content}</Text>

              {localPost?.images && localPost?.images.length > 0 && (
                <>
                  {localPost.images.length > 2 ? (
                    <View style={{ marginBottom: 16 }}>
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedImageIndex(0);
                          setZoomModalVisible(true);
                        }}
                        style={{ marginBottom: 8 }}
                      >
                        <Image
                          source={{ uri: localPost.images[0] }}
                          style={[styles.runPhoto, { height: 180 }]}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        scrollEnabled={false}
                        contentContainerStyle={{ paddingHorizontal: 2 }}
                      >
                        {localPost.images.slice(1).map((imageUri, index) => (
                          <TouchableOpacity
                            key={index + 1}
                            onPress={() => {
                              setSelectedImageIndex(index + 1);
                              setZoomModalVisible(true);
                            }}
                            style={{ marginRight: 8 }}
                          >
                            <Image
                              source={{ uri: imageUri }}
                              style={styles.postImagev2}
                              resizeMode="cover"
                            />
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
                                }}
                              >
                                <Text
                                  style={{
                                    color: 'white',
                                    fontSize: 18,
                                    fontWeight: 'bold',
                                  }}
                                >
                                  +{localPost.images.length - 4}
                                </Text>
                              </View>
                            )}
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  ) : localPost.images.length === 2 ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        marginBottom: 16,
                        height: 180,
                        gap: 8,
                      }}
                    >
                      <TouchableOpacity
                        style={{ flex: 1 }}
                        onPress={() => {
                          setSelectedImageIndex(0);
                          setZoomModalVisible(true);
                        }}
                      >
                        <Image
                          source={{ uri: localPost.images[0] }}
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: 12,
                          }}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{ flex: 1 }}
                        onPress={() => {
                          setSelectedImageIndex(1);
                          setZoomModalVisible(true);
                        }}
                      >
                        <Image
                          source={{ uri: localPost.images[1] }}
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
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedImageIndex(0);
                        setZoomModalVisible(true);
                      }}
                      style={{ marginBottom: 16 }}
                    >
                      <Image
                        source={{ uri: localPost.images[0] }}
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
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      marginRight: 5,
                    }}
                  >
                    Tags :{' '}
                  </Text>
                  {currentPost.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.engagementContainer}>
                <View style={styles.engagementLeft}>
                  <TouchableOpacity
                    style={styles.voteButton}
                    onPress={() => handleLikePost(localPost?.id, !localPost?.is_upvoted)}
                  >
                    <Icon
                      name={localPost?.is_upvoted ? 'heart' : 'heart-outline'}
                      size={20}
                      color={localPost?.is_upvoted ? theme.colors.primaryDark : '#666'}
                    />
                  </TouchableOpacity>
                  <Text style={styles.voteCount}>{localPost?.upvote_count}</Text>
                  <View style={styles.engagementMiddle}>
                    <TouchableOpacity style={styles.commentButton}>
                      <Icon name="chatbubble-outline" size={20} color="#666" />
                      <Text style={styles.commentCount}>{commentCount}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            <CommunityPostDetailCommentScreen
              postId={id}
              currentUserId={currentUserId}
              profile={profile}
              onCommentCountChange={(newCount) => setCommentCount(newCount)}
              onEditComment={handleEditComment}
              onReplyComment={handleReplyComment}
            />
          </ScrollView>

          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.attachButton}>
              <CommonAvatar mode={null} size={36} uri={profile?.image?.url} />
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
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
                <Icon name="close" size={20} color="#A1A1AA" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.sendButton, commentText.trim() ? styles.activeSendButton : null]}
              onPress={handleSendComment}
              disabled={!commentText.trim() || isSubmittingComment}
            >
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

          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                {currentPost && currentPost?.user?.id === currentUserId && (
                  <>
                    <TouchableOpacity style={styles.modalOption} onPress={handleUpdate}>
                      <Icon name="create-outline" size={24} color="#4285F4" />
                      <Text style={styles.modalOptionText}>Update</Text>
                    </TouchableOpacity>
                    <View style={styles.modalDivider} />
                    <TouchableOpacity style={styles.modalOption} onPress={handleDelete}>
                      <Icon name="trash-outline" size={24} color="red" />
                      <Text style={[styles.modalOptionText, { color: 'red' }]}>Delete</Text>
                    </TouchableOpacity>
                  </>
                )}
                <View style={styles.modalDivider} />
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>

          <Modal
            visible={zoomModalVisible}
            transparent={true}
            onRequestClose={() => setZoomModalVisible(false)}
          >
            <View style={styles.zoomModalContainer}>
              <FlatList
                data={localPost?.images || []}
                horizontal
                pagingEnabled
                initialScrollIndex={selectedImageIndex}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item }) => (
                  <ScrollView
                    style={styles.zoomScrollView}
                    maximumZoomScale={3}
                    minimumZoomScale={1}
                    contentContainerStyle={styles.zoomContentContainer}
                  >
                    <Image
                      source={{ uri: item }}
                      style={styles.zoomImage}
                      resizeMode="contain"
                    />
                  </ScrollView>
                )}
                onScrollToIndexFailed={() => {}}
              />
              <TouchableOpacity
                style={styles.zoomModalCloseButton}
                onPress={() => setZoomModalVisible(false)}
              >
                <Icon name="close" size={30} color="white" />
              </TouchableOpacity>
            </View>
          </Modal>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 20,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginBottom: 16,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
  cancelButton: {
    padding: 8,
    marginRight: 4,
  },
  sendButton: {
    padding: 8,
  },
  activeSendButton: {
    backgroundColor: '#EEF2FF',
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