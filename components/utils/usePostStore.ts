import {create} from 'zustand';
import useApiStore from './zustandfetchAPI';
import useAuthStore from './useAuthStore';

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
}
interface PostApiResponse {
  status: string;
  message: string;
  data: Post[] | Post | null;
}
interface PostState {
  post: Post[];
  currentPost: Post | null;
  isLoading: boolean;
  error: string | null;
  getAll: () => Promise<void>;
  clearCurrent: () => void;
}

const api = useApiStore.getState();

export const usePostStore = create<PostState>((set, get) => ({
  post: [],
  currentPost: null,
  isLoading: false,
  error: null,

  getAll: async () => {
    console.log(api);

    set({isLoading: true});

    try {
      await api.fetchData('/posts');
      console.log('api', api);

      const response = useApiStore.getState().data;
      console.log('response in post', response);

      if (response?.status === 'success' && Array.isArray(response.data)) {
        set({post: response.data, isLoading: false});
      } else {
        set({
          post: [],
          error: response?.message || 'No posts available',
          isLoading: false,
        });
      }
    } catch (error: any) {
      console.error(error);
      set({error: error.message, isLoading: false});
    }
  },

  getDetail: async (id: string) => {
    set({isLoading: true, error: null, currentPost: null});

    try {
      await api.fetchData(`/posts/${id}`);
      const response = api.data as PostApiResponse;
      console.log('response in post detail', response);
      
      if (response?.status === 'success' && response.data) {
        set({currentPost: response.data as Post, isLoading: false});
      } else {
        set({
          error: response?.message || 'News article not found',
          isLoading: false,
        });
      }
    } catch (error: any) {
      console.error(error);
      set({error: error.message, isLoading: false});
    }
  },

  clearCurrent: () => set({currentPost: null}),
}));
