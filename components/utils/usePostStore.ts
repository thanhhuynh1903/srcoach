import {create} from 'zustand';
import useApiStore from './zustandfetchAPI';

interface Post {
  id: string;
  title: string;
  content: string;
  user_id: string;
  exercise_session_record_id: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  upvote_count: number;
  downvote_count: number;
  comment_count: number;
  is_upvoted: boolean;
  is_downvoted: boolean;
  images: string[];
  user?: {
    username: string;
    avatar?: string;
  };
  PostVote: [];
  PostComment: [];
}

interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
}

interface PostState {
  posts: Post[];
  myPosts: Post[]; // Thêm state để lưu danh sách bài đăng của chính user
  currentPost: Post | null;
  isLoading: boolean;
  message: string | null;
  status: string | null;
  getAll: () => Promise<void>;
  getDetail: (id: string) => Promise<void>;
  deletePost: (id: string) => Promise<boolean>;
  likePost: (id: string, isLiked: boolean) => Promise<boolean>;
  clearCurrent: () => void;
  getMyPosts: () => Promise<void>;
  createPost: (postData: {
    title: string;
    content: string;
    tags: string[];
    exerciseSessionRecordId?: string;
    images: any[];
  }) => Promise<void>;
  updatePost: (
    id: string,
    postData: {
      title: string;
      content: string;
      tags: string[];
      oldImageUrls?: string[];
      images?: any[];
      exerciseSessionRecordId?: string;
    },
  ) => Promise<void>;

  searchResults: Post[];
  searchLoading: boolean;

  searchError: string | null;
  searchPost: (params: {
    title?: string;
    tagName?: string;
    pageSize?: number;
    pageIndex?: number;
  }) => Promise<void>;
}

const api = useApiStore.getState();

export const usePostStore = create<PostState>((set, get) => ({
  posts: [],
  myPosts: [], // Khởi tạo rỗng
  currentPost: null,
  isLoading: false,
  message: null,
  status: null,

  searchResults: [],
  searchLoading: false,
  searchError: null,

  getAll: async () => {
    set({isLoading: true, status: null});

    try {
      const response = await api.fetchData<ApiResponse<Post[]>>('/posts');
      console.log('Response:', response);

      if (
        response &&
        response.status === 'success' &&
        Array.isArray(response.data)
      ) {
        set({posts: response.data, isLoading: false, status: response.status});
      } else {
        set({
          posts: [],
          isLoading: false,
          status: response?.status || 'Failed to fetch posts',
        });
      }
    } catch (error: any) {
      set({isLoading: false, status: error.message});
    }
  },

  getMyPosts: async () => {
    set({isLoading: true, status: null});
    try {
      // Gọi endpoint /posts/self
      const response = await api.fetchData<ApiResponse<Post[]>>('/posts/self');
      if (
        response &&
        response.status === 'success' &&
        Array.isArray(response.data)
      ) {
        set({
          myPosts: response.data,
          isLoading: false,
          status: response.status,
        });
      } else {
        set({
          myPosts: [],
          isLoading: false,
          status: response?.status || 'Failed to fetch your posts',
        });
      }
    } catch (error: any) {
      set({isLoading: false, status: error.message});
    }
  },

  getDetail: async (id: string) => {
    set({isLoading: true, status: null, currentPost: null});

    try {
      const response = await api.fetchDataDetail<ApiResponse<Post>>(
        `/posts/${id}`,
      );

      if (response && response.status === 'success' && response.data) {
        console.log('response.data', response.data);

        set({currentPost: response.data, isLoading: false, status: null});
      } else {
        set({
          isLoading: false,
          status: response?.message || 'Post not found',
        });
      }
    } catch (error: any) {
      set({isLoading: false, status: error.message});
    }
  },
  createPost: async postData => {
    set({isLoading: true, status: null});
    console.log('postData', postData);

    try {
      // Chuẩn bị FormData từ dữ liệu bài viết
      const formData = new FormData();

      formData.append('title', postData.title);
      formData.append('content', postData.content);

      // Thêm tags dưới dạng mảng
      postData.tags.forEach((tag, index) => {
        formData.append(`tags[${index}]`, tag);
      });

      if (postData?.exerciseSessionRecordId) {
        formData.append(
          'exerciseSessionRecordId',
          postData?.exerciseSessionRecordId,
        );
      }
      // Thêm images
      if (postData.images && postData.images.length > 0) {
        postData.images.forEach((image, index) => {
          const imageFile = {
            uri: image.uri,
            type: image.type || 'image/jpeg',
            name: image.fileName || `image-${index}.jpg`,
          };
          formData.append(`images`, imageFile);
        });
      }

      // Gọi API để tạo bài viết
      await api.postData('/posts/create', formData);

      set({isLoading: false, status: api.status, message: api.message});
    } catch (error: any) {
      set({
        isLoading: false,
        status: error.message || 'Không thể tạo bài viết',
      });
    }
  },
  updatePost: async (id, postData) => {
    set({isLoading: true, status: null});

    try {
      const formData = new FormData();

      // Append basic fields
      formData.append('title', postData.title);
      formData.append('content', postData.content);

      // Handle tags array - có thể gửi dưới dạng string JSON hoặc array
      if (postData.tags && postData.tags.length > 0) {
        // Phương án 1: Gửi dưới dạng tags[] (array)
        postData.tags.forEach((tag, index) => {
          formData.append(`tags[${index}]`, tag);
        });
      }

      // Handle exercise session record ID
      if (postData.exerciseSessionRecordId) {
        console.log(
          'postData.exerciseSessionRecordId',
          postData.exerciseSessionRecordId,
        );
        formData.append(
          'exerciseSessionRecordId',
          postData?.exerciseSessionRecordId,
        );
      }

      // Tách ảnh cũ và ảnh mới
      const existingImages = postData.oldImageUrls.filter(
        img => typeof img === 'string',
      );
      const newImages = postData.images.filter(img => img.uri);
      console.log('existingImages', existingImages);

      // Thêm ảnh cũ vào oldImageUrls[] (không phải images)
      if (existingImages.length > 0) {
        existingImages.forEach((imageUrl, index) => {
          formData.append(`oldImageUrls[${index}]`, imageUrl);
        });
      }

      // Thêm ảnh mới vào images[]
      if (newImages.length > 0) {
        newImages.forEach((image, index) => {
          const imageFile = {
            uri: image.uri,
            type: image.type || 'image/jpeg',
            name: image.fileName || `image-${index}.jpg`,
          };
          formData.append(`images`, imageFile);
        });
      }

      console.log('formData', formData);

      // Make PUT request
      const response = await api.putData(`/posts/${id}`, formData);
      console.log('response', response);

      // Update local state
      if (response && response.status === 'success') {
        // Cập nhật bài viết trong danh sách posts
        const updatedPosts = get().posts.map(post =>
          post.id === id ? {...post, ...response.data} : post,
        );

        // Cập nhật bài viết trong danh sách myPosts
        const updatedMyPosts = get().myPosts.map(post =>
          post.id === id ? {...post, ...response.data} : post,
        );

        // Cập nhật currentPost nếu đang xem bài viết này
        const updatedCurrentPost =
          get().currentPost?.id === id
            ? {...get().currentPost, ...response.data}
            : get().currentPost;

        set({
          posts: updatedPosts,
          myPosts: updatedMyPosts,
          currentPost: updatedCurrentPost,
          isLoading: false,
          status: 'success',
          message: 'Bài viết đã được cập nhật thành công',
        });
      } else {
        set({
          isLoading: false,
          status: 'error',
          message: response?.message || 'Không thể cập nhật bài viết',
        });
      }
    } catch (error: any) {
      set({
        isLoading: false,
        status: 'error',
        message: error.message || 'Đã xảy ra lỗi khi cập nhật bài viết',
      });
      throw error;
    }
  },

  deletePost: async (id: string) => {
    set({isLoading: true, status: null});
    console.log('id', id);

    try {
      const response = await api.deleteData(`/posts/${id}`);
      console.log('response delete', response);

      // Nếu API trả về 204 No Content, response có thể là {} hoặc null
      const isDeleted =
        !response || (response && response.status === 'success');
      console.log('isDeleted', isDeleted);

      if (isDeleted) {
        const currentPosts = get().posts;
        const currentMyPosts = get().myPosts;

        set({
          posts: currentPosts.filter(post => post.id !== id),
          myPosts: currentMyPosts.filter(post => post.id !== id),
          isLoading: false,
          status: 'success',
          message: 'Bài viết đã được xóa thành công',
        });
        return true;
      } else {
        set({
          isLoading: false,
          status: 'error',
          message: response?.message || 'Không thể xóa bài viết',
        });
        return false;
      }
    } catch (error: any) {
      set({
        isLoading: false,
        status: 'error',
        message: error.message || 'Đã xảy ra lỗi khi xóa bài viết',
      });
      return false;
    }
  },

  searchPost: async params => {
    set({searchLoading: true, searchError: null});
    console.log('params', params);

    try {
      // Xây dựng query params
      const queryParams = new URLSearchParams();

      if (params.title) {
        queryParams.append('title', params.title);
      }

      if (params.pageSize) {
        queryParams.append('pageSize', params.pageSize.toString());
      }

      if (params.pageIndex) {
        queryParams.append('pageIndex', params.pageIndex.toString());
      }

      const queryString = queryParams.toString();
      const endpoint = `/posts/filter${queryString ? `?${queryString}` : ''}`;

      const response = await api.fetchData<ApiResponse<Post[]>>(endpoint);
      console.log('Response:', response);

      if (
        response &&
        response.status === 'success' &&
        Array.isArray(response.data)
      ) {
        set({
          searchResults: response.data,
          searchLoading: false,
        });
      } else {
        set({
          searchResults: [],
          searchLoading: false,
          searchError: response?.message || 'Không tìm thấy kết quả',
        });
      }
    } catch (error: any) {
      set({
        searchLoading: false,
        searchError: error.message || 'Đã xảy ra lỗi khi tìm kiếm',
        searchResults: [],
      });
    }
  },

  likePost: async (postId: string, isLike: boolean) => {
    try {
      // Optimistic update - cập nhật UI trước khi API hoàn thành
      set(state => {
        // Cập nhật posts
        const updatedPosts = state.posts?.map(post => {
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
        });

        // Cập nhật searchResults
        const updatedSearchResults = state.searchResults?.map(post => {
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
        });

        // Cập nhật currentPost nếu đang xem chi tiết
        const updatedCurrentPost =
          state.currentPost && state.currentPost.id === postId
            ? {
                ...state.currentPost,
                is_upvoted: isLike,
                upvote_count: isLike
                  ? state.currentPost.is_upvoted
                    ? state.currentPost.upvote_count
                    : state.currentPost.upvote_count + 1
                  : state.currentPost.is_upvoted
                  ? state.currentPost.upvote_count - 1
                  : state.currentPost.upvote_count,
              }
            : state.currentPost;

        return {
          posts: updatedPosts,
          searchResults: updatedSearchResults,
          currentPost: updatedCurrentPost,
          status: 'loading',
        };
      });

      // Gọi API
      const response = await api.postData(`/posts-votes/post/${postId}`, {
        isLike: isLike,
      });

      if (response && response.status === 'success') {
        set({
          status: 'success',
          message: isLike ? 'Đã thích bài viết' : 'Đã bỏ thích bài viết',
        });
        return true;
      } else {
        // Rollback nếu API thất bại (có thể thêm logic rollback ở đây)
        set({
          status: 'error',
          message: response?.message || 'Không thể thực hiện thao tác',
        });
        return false;
      }
    } catch (error: any) {
      console.error('Error liking post:', error);
      // Rollback nếu có lỗi (có thể thêm logic rollback ở đây)
      set({
        status: 'error',
        message: error.message || 'Đã xảy ra lỗi khi thích bài viết',
      });
      return false;
    }
  },

  clearCurrent: () => set({currentPost: null}),
}));
