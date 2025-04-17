import {create} from 'zustand';
import useApiStore from './zustandfetchAPI';

interface User {
  id: string;
  username: string;
  avatar?: string;
}

interface Comment {
  id: string;
  content: string;
  user_id: string;
  post_id: string;
  parent_comment_id: string | null;
  is_upvote: boolean;
  is_downvote: boolean;
  is_deleted: boolean; 
  is_upvoted: boolean; 
  is_downvoted: boolean; 
  upvote_count: number;
  downvote_count: number;
  created_at: string;
  updated_at: string | null;
  User: User;
  childComments?: Comment[];
}

interface CommentState {
  comments: Comment[];
  currentComment: Comment | null;
  isLoading: boolean;
  message: string | null;
  status: string | null;

  // Lấy tất cả bình luận của một bài viết
  getCommentsByPostId: (postId: string) => Promise<void>;

  // Tạo bình luận mới
  createComment: (
    postId: string,
    content: string,
    parentCommentId?: string,
  ) => Promise<Comment | null>;

  // Xóa bình luận
  deleteComment: (commentId: string) => Promise<boolean>;

  // Cập nhật bình luận
  updateComment: (
    commentId: string,
    content: string,
    parentCommentId?: string,
  ) => Promise<boolean>;

  likeComment: (commentId: string, isLike: boolean) => Promise<boolean>;
  getCommentbyId: (commentId: string) => Promise<void>;
  // Xóa state hiện tại
  clearComments: () => void;
}

export const useCommentStore = create<CommentState>((set, get) => {
  const api = useApiStore.getState();

  // Hàm để chuyển đổi danh sách bình luận phẳng thành cấu trúc cây
  const buildCommentTree = (comments: Comment[]): Comment[] => {
    const commentMap: Record<string, Comment> = {};
    const rootComments: Comment[] = [];

    // Tạo map từ id đến comment
    comments.forEach(comment => {
      commentMap[comment.id] = {...comment, childComments: []};
    });

    // Xây dựng cấu trúc cây
    comments.forEach(comment => {
      if (comment.parent_comment_id && commentMap[comment.parent_comment_id]) {
        // Nếu có parent_comment_id và parent comment tồn tại
        commentMap[comment.parent_comment_id].childComments?.push(
          commentMap[comment.id],
        );
      } else {
        // Nếu không có parent hoặc parent không tồn tại, đây là bình luận gốc
        rootComments.push(commentMap[comment.id]);
      }
    });

    return rootComments;
  };

  return {
    comments: [],
    currentComment: null,
    isLoading: false,
    message: null,
    status: null,

    getCommentsByPostId: async (postId: string) => {
      try {
        set({isLoading: true});
        const response = await api.fetchDataDetail(`/posts-comments/${postId}`);
        console.log('response comment detail', response);

        if (response.status === 'success') {
          // Chuyển đổi danh sách bình luận phẳng thành cấu trúc cây
          const commentTree = buildCommentTree(response.data);
          set({
            comments: commentTree,
            isLoading: false,
            status: 'success',
          });
        } else {
          set({
            message: response.message || 'Failed to fetch comments',
            isLoading: false,
            status: 'error',
          });
        }
      } catch (error) {
        set({
          message:
            error instanceof Error
              ? error.message
              : 'An unknown error occurred',
          isLoading: false,
          status: 'error',
        });
      }
    },
    getCommentbyId: async (commentId: string) => {
      try {
        set({isLoading: true});
        const response = await api.fetchDataDetail(
          `/posts-comments/comment/${commentId}`,
        );
        console.log('response comment detail', response);

        if (response.status === 'success') {
          // Chuyển đổi danh sách bình luận phẳng thành cấu trúc cây
          const commentTree = buildCommentTree(response.data);
          set({
            comments: commentTree,
            isLoading: false,
            status: 'success',
          });
        } else {
          set({
            message: response.message || 'Failed to fetch comments',
            isLoading: false,
            status: 'error',
          });
        }
      } catch (error) {
        set({
          message:
            error instanceof Error
              ? error.message
              : 'An unknown error occurred',
          isLoading: false,
          status: 'error',
        });
      }
    },

    createComment: async (
      postId: string,
      content: string,
      parentCommentId?: string,
    ) => {
      try {
        set({isLoading: true});

        const payload = {
          content,
          ...(parentCommentId && {parentCommentId}),
        };
        console.log('payload', payload);

        const response = await api.postData(
          `/posts-comments/${postId}`,
          payload,
        );
        console.log('response', response);

        if (response.status === 'success') {
          // Cập nhật lại danh sách bình luận sau khi tạo mới
          await get().getCommentsByPostId(postId);
          set({isLoading: false, status: 'success'});
          return response.data;
        } else {
          set({
            message: response.message || 'Failed to create comment',
            isLoading: false,
            status: 'error',
          });
          return null;
        }
      } catch (error) {
        set({
          message:
            error instanceof Error
              ? error.message
              : 'An unknown error occurred',
          isLoading: false,
          status: 'error',
        });
        return null;
      }
    },

    deleteComment: async commentId => {
      try {
        set({isLoading: true});

        const response = await api.patchData(
          `/posts-comments/${commentId}/soft-delete`,
        );
        console.log('Delete comment response:', response);

        if (response.status === 'success') {
          // Lấy postId từ state hiện tại để cập nhật lại danh sách bình luận
          const currentComments = get().comments;
          const postId =
            currentComments.length > 0 ? currentComments[0].postId : null;

          if (postId) {
            // Cập nhật lại danh sách bình luận
            await get().getCommentsByPostId(postId);
          }

          set({isLoading: false, status: 'success'});
          return true;
        } else {
          set({
            message: response.message || 'Failed to delete comment',
            isLoading: false,
            status: 'error',
          });
          return false;
        }
      } catch (error) {
        console.error('Error deleting comment:', error);
        set({
          message:
            error instanceof Error
              ? error.message
              : 'An unknown error occurred',
          isLoading: false,
          status: 'error',
        });
        return false;
      }
    },

    likeComment: async (commentId: string, isLike: boolean) => {
      try {
        // Optimistic update - cập nhật UI trước khi API hoàn thành
        set(state => {
          // Hàm cập nhật comment trong cấu trúc cây
          const updateCommentInTree = (comments: Comment[]): Comment[] => {
            return comments.map(comment => {
              if (comment.id === commentId) {
                return {
                  ...comment,
                  is_upvote: isLike, // Cập nhật cả hai thuộc tính
                  is_upvoted: isLike,
                  upvote_count: isLike
                    ? comment.is_upvoted || comment.is_upvote
                      ? comment.upvote_count
                      : comment.upvote_count + 1
                    : comment.is_upvoted || comment.is_upvote
                    ? comment.upvote_count - 1
                    : comment.upvote_count,
                };
              }

              // Đệ quy cập nhật các comment con
              if (comment.childComments && comment.childComments.length > 0) {
                return {
                  ...comment,
                  childComments: updateCommentInTree(comment.childComments),
                };
              }

              // Kiểm tra cả other_PostComment nếu có
              if (
                comment.other_PostComment &&
                comment.other_PostComment.length > 0
              ) {
                return {
                  ...comment,
                  other_PostComment: updateCommentInTree(
                    comment.other_PostComment,
                  ),
                };
              }

              return comment;
            });
          };

          // Cập nhật cây comment
          const updatedComments = updateCommentInTree(state.comments);

          // Cập nhật currentComment nếu đang được chọn
          const updatedCurrentComment =
            state.currentComment && state.currentComment.id === commentId
              ? {
                  ...state.currentComment,
                  is_upvote: isLike,
                  is_upvoted: isLike,
                  upvote_count: isLike
                    ? state.currentComment.is_upvoted ||
                      state.currentComment.is_upvote
                      ? state.currentComment.upvote_count
                      : state.currentComment.upvote_count + 1
                    : state.currentComment.is_upvoted ||
                      state.currentComment.is_upvote
                    ? state.currentComment.upvote_count - 1
                    : state.currentComment.upvote_count,
                }
              : state.currentComment;

          return {
            comments: updatedComments,
            currentComment: updatedCurrentComment,
            status: 'loading',
          };
        });

        // Gọi API
        const response = await api.postData(
          `/posts-votes/comment/${commentId}/like`,
          {}, // Không cần payload như yêu cầu
        );
        console.log('Like comment response:', response);

        if (response && response.status === 'success') {
          // Thay vì gọi getCommentbyId, cập nhật trạng thái thành công
          set({
            status: 'success',
            message: isLike ? 'Đã thích bình luận' : 'Đã bỏ thích bình luận',
          });
          return true;
        } else {
          // Rollback nếu API thất bại
          set({
            status: 'error',
            message: response?.message || 'Không thể thực hiện thao tác',
          });
          return false;
        }
      } catch (error: any) {
        console.error('Error liking comment:', error);
        set({
          status: 'error',
          message: error.message || 'Đã xảy ra lỗi khi thích bình luận',
        });
        return false;
      }
    },

    updateComment: async (
      commentId: string,
      content: string,
      parentCommentId?: string,
    ) => {
      console.log('parentCommentId', parentCommentId);

      try {
        set({isLoading: true});

        // Chuẩn bị payload theo yêu cầu API
        const payload = {
          content,
          ...(parentCommentId && {parentCommentId}),
        };

        // Gọi API để cập nhật bình luận
        const response = await api.putData(
          `/posts-comments/${commentId}`,
          payload,
        );
        console.log('Update comment response:', response);

        if (response.status === 'success') {
          // Lấy postId từ bình luận đã cập nhật để refresh lại danh sách
          const postId = response.data.post_id;
          console.log('postId', postId);

          if (postId) {
            // Cập nhật lại toàn bộ danh sách bình luận từ API
            await get().getCommentsByPostId(postId);
          }

          set({
            isLoading: false,
            status: 'success',
            currentComment: response.data, // Lưu bình luận vừa cập nhật vào state
          });

          return response.data; // Trả về dữ liệu bình luận đã cập nhật
        } else {
          set({
            message: response.message || 'Failed to update comment',
            isLoading: false,
            status: 'error',
          });
          return null;
        }
      } catch (error) {
        console.error('Error updating comment:', error);
        set({
          message:
            error instanceof Error
              ? error.message
              : 'An unknown error occurred',
          isLoading: false,
          status: 'error',
        });
        return null;
      }
    },

    clearComments: () => {
      set({
        comments: [],
        currentComment: null,
        message: null,
        status: null,
      });
    },
  };
});
