import { create } from 'zustand';
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
  User?: {
    username: string;
    avatar?: string;
  };
}

interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
}

interface PostState {
  posts: Post[];
  currentPost: Post | null;
  isLoading: boolean;
  message: string | null;
  status: string | null;
  getAll: () => Promise<void>;
  getDetail: (id: string) => Promise<void>;
  clearCurrent: () => void;
  createPost: (postData: {
    title: string;
    content: string;
    tags: string[];
    images: any[];
    exerciseSessionRecordId?: string;
  }) => Promise<void>;

  searchResults: Post[];
  searchLoading: boolean;
  searchError: string | null;
  searchPost: (params: { title?: string; tagName?: string; pageSize?: number; pageIndex?: number }) => Promise<void>;

}

const api = useApiStore.getState();

export const usePostStore = create<PostState>((set, get) => ({
  posts: [],
  currentPost: null,
  isLoading: false,
  message: null,
status: null,

searchResults: [],
  searchLoading: false,
  searchError: null,

  getAll: async () => {
    set({ isLoading: true, status: null });
    
    try {
      const response = await api.fetchData<ApiResponse<Post[]>>('/posts');
      console.log('Response:', response);
      
      if (response && response.status === 'success' && Array.isArray(response.data)) {
        set({ posts: response.data, isLoading: false, status: response.status });
      } else {
        set({
          posts: [],
          isLoading: false,
          status: response?.status || 'Failed to fetch posts',
        });
      }
    } catch (error: any) {
      set({ isLoading: false, status: error.message });
    }
  },

  getDetail: async (id: string) => {
    set({ isLoading: true, status: null, currentPost: null });
    
    try {
      const response = await api.fetchDataDetail<ApiResponse<Post>>(`/posts/${id}`);
      
      if (response && response.status === 'success' && response.data) {
        set({ currentPost: response.data, isLoading: false, status: null });
      } else {
        set({
          isLoading: false,
          status: response?.message || 'Post not found',
        });
      }
    } catch (error: any) {
      set({ isLoading: false, status: error.message });
    }
  },
  createPost: async (postData) => {
    set({ isLoading: true, status: null });
    
    try {
      // Chuẩn bị FormData từ dữ liệu bài viết
      const formData = new FormData();
      console.log('postData', postData);
      
      formData.append('title', postData.title);
      formData.append('content', postData.content);
      
      // Thêm tags dưới dạng mảng
      postData.tags.forEach((tag, index) => {
        formData.append(`tags[${index}]`, tag);
      });
      
      // Thêm exerciseSessionRecordId nếu có
      if (postData.exerciseSessionRecordId) {
        formData.append('exerciseSessionRecordId', postData.exerciseSessionRecordId);
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

      
      set({ isLoading: false, status: api.status,message: api.message  });
    } catch (error: any) {
      set({ isLoading: false, status: error.message || 'Không thể tạo bài viết' });
    }
  },
  searchPost: async (params) => {
    set({ searchLoading: true, searchError: null });
    console.log('params', params);
    
    try {
      // Xây dựng query params
      const queryParams = new URLSearchParams();
      
      if (params.title) {
        queryParams.append('title', params.title);
      }
      
      if (params.tagName) {
        queryParams.append('tagName', params.tagName);
      }
      
      if (params.pageSize) {
        queryParams.append('pageSize', params.pageSize.toString());
      }
      
      if (params.pageIndex) {
        queryParams.append('pageIndex', params.pageIndex.toString());
      }
      
      const queryString = queryParams.toString();
      const endpoint = `/posts${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.fetchData<ApiResponse<Post[]>>(endpoint);
      console.log('Response:', response);
      
      if (response && response.status === 'success' && Array.isArray(response.data)) {
        set({ 
          searchResults: response.data, 
          searchLoading: false 
        });
      } else {
        set({
          searchResults: [],
          searchLoading: false,
          searchError: response?.message || 'Không tìm thấy kết quả'
        });
      }
    } catch (error: any) {
      set({ 
        searchLoading: false, 
        searchError: error.message || 'Đã xảy ra lỗi khi tìm kiếm',
        searchResults: []
      });
    }
  },
  clearCurrent: () => set({ currentPost: null }),
}));
