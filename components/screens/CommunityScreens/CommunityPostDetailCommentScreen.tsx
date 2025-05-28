import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { useCommentStore } from '../../utils/useCommentStore';
import ModalPoppup from '../../ModalPoppup';
import { CommonAvatar } from '../../commons/CommonAvatar';
import { theme } from '../../contants/theme';

interface User {
  id: string;
  username: string;
  user_level: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
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

interface CommunityPostDetailCommentScreenProps {
  postId: string;
  currentUserId: string | undefined;
  profile: any;
  onCommentCountChange: (count: number) => void;
  onEditComment: (commentId: string) => void;
  onReplyComment: (commentId: string) => void;
}

const CommunityPostDetailCommentScreen = ({
  postId,
  currentUserId,
  profile,
  onCommentCountChange,
  onEditComment,
  onReplyComment,
}: CommunityPostDetailCommentScreenProps) => {
  const {
    getCommentsByPostId,
    comments,
    isLoading: isLoadingComments,
    deleteComment,
    likeComment,
  } = useCommentStore();
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (postId) {
      getCommentsByPostId(postId);
    }
  }, [postId]);

  useEffect(() => {
    onCommentCountChange(FilterComment(comments));
  }, [comments, onCommentCountChange]);

  const handleLikeComment = async (commentId: string, isCurrentlyLiked: boolean) => {
    if (!profile) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để thích bình luận', [
        { text: 'Đóng', style: 'cancel' },
      ]);
      return;
    }

    try {
      const newLikeState = !isCurrentlyLiked;
      const updateCommentInTree = (comments: Comment[]): Comment[] => {
        return comments.map((comment) => {
          if (comment.id === commentId) {
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
          if (comment.other_PostComment?.length) {
            return {
              ...comment,
              other_PostComment: updateCommentInTree(comment.other_PostComment),
            };
          }
          return comment;
        });
      };

      useCommentStore.setState({ comments: updateCommentInTree([...comments]) });
      const success = await likeComment(commentId, newLikeState);

      if (!success) {
        await getCommentsByPostId(postId);
        Alert.alert('Error', 'Cannot like comment. Please try again later.');
      }
    } catch (error) {
      console.error('Error liking comment:', error);
      await getCommentsByPostId(postId);
      Alert.alert('Error', 'Cannot like comment. Please try again later.');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const updatedComments = markCommentAsDeleted(comments, commentId);
      useCommentStore.setState({ comments: updatedComments });
      onCommentCountChange(FilterComment(updatedComments));

      const success = await deleteComment(commentId);
      if (!success) {
        await getCommentsByPostId(postId);
        Alert.alert('Error', 'Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      await getCommentsByPostId(postId);
      Alert.alert('Error', 'An error occurred while deleting the comment');
    }
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

  const FilterComment = (comments: Comment[]): number => {
    return comments.reduce((total, comment) => {
      let count = !comment?.is_deleted ? 1 : 0;
      if (Array.isArray(comment.other_PostComment)) {
        count += comment.other_PostComment.filter((c) => !c?.is_deleted).length;
      }
      return total + count;
    }, 0);
  };

  const renderComment = useCallback(
    (comment: Comment) => {
      return (
        <TouchableOpacity
          key={comment.id}
          style={styles.commentContainer}
          onPress={() => {
            if (comment.user_id === currentUserId) {
              setSelectedCommentId(comment.id);
              setShowModal(true);
            }
          }}
        >
          <CommonAvatar mode={null} size={36} uri={comment.User?.image?.url} />
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
                  style={styles.likeButton}
                >
                  <Icon
                    name={comment.is_upvote || comment.is_upvoted ? 'heart' : 'heart-outline'}
                    size={16}
                    color={comment.is_upvote || comment.is_upvoted ? theme.colors.primaryDark : '#666'}
                  />
                  <Text
                    style={[
                      styles.commentVoteCount,
                      (comment.is_upvote || comment.is_upvoted) && styles.commentVoteCountActive,
                    ]}
                  >
                    {comment.upvote_count || 0}
                  </Text>
                </TouchableOpacity>
              </View>
              {!comment.parent_comment_id && (
                <TouchableOpacity onPress={() => onReplyComment(comment.id)}>
                  <Text style={styles.replyButton}>Reply</Text>
                </TouchableOpacity>
              )}
            </View>
            {comment.other_PostComment && comment.other_PostComment.length > 0 && (
              <View style={styles.repliesContainer}>
                {comment.other_PostComment
                  .filter((childComment) => !childComment.is_deleted)
                  .map((childComment) => renderComment(childComment))}
              </View>
            )}
          </View>
        </TouchableOpacity>
      );
    },
    [currentUserId, handleLikeComment, onReplyComment]
  );

  return (
    <View style={styles.container}>
      <View style={styles.commentsSection}>
        <View style={styles.commentsSectionHeader}>
          <Text style={styles.commentsSectionTitle}>Comments ({FilterComment(comments)})</Text>
        </View>
        {isLoadingComments ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#4285F4" />
          </View>
        ) : comments && comments.filter((item) => !item.is_deleted).length > 0 ? (
          comments
            .filter((comment) => !comment.is_deleted)
            .map((comment) => renderComment(comment))
        ) : (
          <Text style={styles.noCommentsText}>No comments yet. Be the first to comment!</Text>
        )}
      </View>

      <ModalPoppup
        visible={showModal}
        onClose={() => setShowModal(false)}
        deleteComment={handleDeleteComment}
        editComment={onEditComment}
        commentId={selectedCommentId}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  commentsSection: {
    paddingHorizontal: 8,
    paddingTop: 16,
    paddingBottom: 50,
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
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 16,
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
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  commentVoteCount: {
    fontSize: 14,
    marginHorizontal: 6,
    color: '#666',
  },
  commentVoteCountActive: {
    color: theme.colors.primaryDark,
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
  noCommentsText: {
    textAlign: 'center',
    color: '#64748B',
    marginVertical: 20,
    fontStyle: 'italic',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
});

export default CommunityPostDetailCommentScreen;