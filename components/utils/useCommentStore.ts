import { create } from 'zustand';
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
  createComment: (postId: string, content: string, parentCommentId?: string) => Promise<Comment | null>;
  
  // Xóa bình luận
  deleteComment: (commentId: string) => Promise<boolean>;
  
  // Cập nhật bình luận
  updateComment: (commentId: string, content: string) => Promise<boolean>;
  
  // Vote bình luận
  upvoteComment: (commentId: string) => Promise<boolean>;
  downvoteComment: (commentId: string) => Promise<boolean>;
  
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
      commentMap[comment.id] = { ...comment, childComments: [] };
    });
    
    // Xây dựng cấu trúc cây
    comments.forEach(comment => {
      if (comment.parent_comment_id && commentMap[comment.parent_comment_id]) {
        // Nếu có parent_comment_id và parent comment tồn tại
        commentMap[comment.parent_comment_id].childComments?.push(commentMap[comment.id]);
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
        set({ isLoading: true });
        const response = await api.fetchDataDetail(`/posts-comments/${postId}`);
        console.log('response comment detail', response);
        
        if (response.status === 'success') {
          // Chuyển đổi danh sách bình luận phẳng thành cấu trúc cây
          const commentTree = buildCommentTree(response.data);
          set({ 
            comments: commentTree,
            isLoading: false,
            status: 'success'
          });
        } else {
          set({ 
            message: response.message || 'Failed to fetch comments',
            isLoading: false,
            status: 'error'
          });
        }
      } catch (error) {
        set({ 
          message: error instanceof Error ? error.message : 'An unknown error occurred',
          isLoading: false,
          status: 'error'
        });
      }
    },
    
    createComment: async (postId: string, content: string, parentCommentId?: string) => {
      try {
        set({ isLoading: true });
        
        const payload = {
          content,
          ...(parentCommentId && { parentCommentId })
        };
        console.log('payload', payload);
        
        const response = await api.postData(`/posts-comments/${postId}`, payload);
        console.log('response', response);
        
        if (response.status === 'success') {
          // Cập nhật lại danh sách bình luận sau khi tạo mới
          await get().getCommentsByPostId(postId);
          set({ isLoading: false, status: 'success' });
          return response.data;
        } else {
          set({ 
            message: response.message || 'Failed to create comment',
            isLoading: false,
            status: 'error'
          });
          return null;
        }
      } catch (error) {
        set({ 
          message: error instanceof Error ? error.message : 'An unknown error occurred',
          isLoading: false,
          status: 'error'
        });
        return null;
      }
    },
    
    deleteComment: async (commentId) => {
      try {
        set({ isLoading: true });
        
        const response = await api.patchData(`/posts-comments/${commentId}/soft-delete`);
        console.log('Delete comment response:', response);
        
        if (response.status === 'success') {
          // Lấy postId từ state hiện tại để cập nhật lại danh sách bình luận
          const currentComments = get().comments;
          const postId = currentComments.length > 0 ? currentComments[0].postId : null;
          
          if (postId) {
            // Cập nhật lại danh sách bình luận
            await get().getCommentsByPostId(postId);
          }
          
          set({ isLoading: false, status: 'success' });
          return true;
        } else {
          set({ 
            message: response.message || 'Failed to delete comment',
            isLoading: false,
            status: 'error'
          });
          return false;
        }
      } catch (error) {
        console.error('Error deleting comment:', error);
        set({ 
          message: error instanceof Error ? error.message : 'An unknown error occurred',
          isLoading: false,
          status: 'error'
        });
        return false;
      }
    },
  
  
    updateComment: async (commentId: string, content: string, parentCommentId?: string) => {
      try {
        set({ isLoading: true });
        
        // Chuẩn bị payload theo yêu cầu API
        const payload = {
          content,
          ...(parentCommentId && { parentCommentId })
        };
        
        // Gọi API để cập nhật bình luận
        const response = await api.putData(`/posts-comments/${commentId}`, payload);
        console.log('Update comment response:', response);
        
        if (response.status === 'success') {
          // Lấy postId từ bình luận đã cập nhật để refresh lại danh sách
          const postId = response.data.post_id;
          
          if (postId) {
            // Cập nhật lại toàn bộ danh sách bình luận từ API
            await get().getCommentsByPostId(postId);
          }
          
          set({ 
            isLoading: false, 
            status: 'success',
            currentComment: response.data // Lưu bình luận vừa cập nhật vào state
          });
          
          return response.data; // Trả về dữ liệu bình luận đã cập nhật
        } else {
          set({ 
            message: response.message || 'Failed to update comment',
            isLoading: false,
            status: 'error'
          });
          return null;
        }
      } catch (error) {
        console.error('Error updating comment:', error);
        set({ 
          message: error instanceof Error ? error.message : 'An unknown error occurred',
          isLoading: false,
          status: 'error'
        });
        return null;
      }
    },
    
    
    upvoteComment: async (commentId: string) => {
      try {
        set({ isLoading: true });
        const response = await api.post(`/api/posts-comments/${commentId}/upvote`);
        
        if (response.status === 'success') {
          // Cập nhật state sau khi upvote
          set(state => {
            const updateVoteInTree = (comments: Comment[]): Comment[] => {
              return comments.map(comment => {
                if (comment.id === commentId) {
                  return { 
                    ...comment, 
                    is_upvote: !comment.is_upvote,
                    is_downvote: comment.is_upvote ? comment.is_downvote : false,
                    upvote_count: comment.is_upvote ? comment.upvote_count - 1 : comment.upvote_count + 1,
                    downvote_count: comment.is_upvote && comment.is_downvote ? comment.downvote_count - 1 : comment.downvote_count
                  };
                }
                
                if (comment.childComments && comment.childComments.length > 0) {
                  return {
                    ...comment,
                    childComments: updateVoteInTree(comment.childComments)
                  };
                }
                
                return comment;
              });
            };
            
            return {
              comments: updateVoteInTree(state.comments),
              isLoading: false,
              status: 'success'
            };
          });
          return true;
        } else {
          set({ 
            message: response.message || 'Failed to upvote comment',
            isLoading: false,
            status: 'error'
          });
          return false;
        }
      } catch (error) {
        set({ 
          message: error instanceof Error ? error.message : 'An unknown error occurred',
          isLoading: false,
          status: 'error'
        });
        return false;
      }
    },
    
    downvoteComment: async (commentId: string) => {
      try {
        set({ isLoading: true });
        const response = await api.post(`/api/posts-comments/${commentId}/downvote`);
        
        if (response.status === 'success') {
          // Cập nhật state sau khi downvote
          set(state => {
            const updateVoteInTree = (comments: Comment[]): Comment[] => {
              return comments.map(comment => {
                if (comment.id === commentId) {
                  return { 
                    ...comment, 
                    is_downvote: !comment.is_downvote,
                    is_upvote: comment.is_downvote ? comment.is_upvote : false,
                    downvote_count: comment.is_downvote ? comment.downvote_count - 1 : comment.downvote_count + 1,
                    upvote_count: comment.is_downvote && comment.is_upvote ? comment.upvote_count - 1 : comment.upvote_count
                  };
                }
                
                if (comment.childComments && comment.childComments.length > 0) {
                  return {
                    ...comment,
                    childComments: updateVoteInTree(comment.childComments)
                  };
                }
                
                return comment;
              });
            };
            
            return {
              comments: updateVoteInTree(state.comments),
              isLoading: false,
              status: 'success'
            };
          });
          return true;
        } else {
          set({ 
            message: response.message || 'Failed to downvote comment',
            isLoading: false,
            status: 'error'
          });
          return false;
        }
      } catch (error) {
        set({ 
          message: error instanceof Error ? error.message : 'An unknown error occurred',
          isLoading: false,
          status: 'error'
        });
        return false;
      }
    },
    
    clearComments: () => {
      set({
        comments: [],
        currentComment: null,
        message: null,
        status: null
      });
    }
  };
});
