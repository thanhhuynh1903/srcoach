import { create } from "zustand";
import useApiStore from "./zustandfetchAPI";

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  news_type_id: string;
  admin_user_id: string;
  is_draft: boolean;
  archive: boolean;
  created_at: string;
  updated_at: string | null;
}

interface NewsApiResponse {
  status: string;
  message: string;
  data: NewsArticle[] | NewsArticle | null;
}

interface NewsState {
  news: NewsArticle[];
  currentArticle: NewsArticle | null;
  isLoading: boolean;
  error: string | null;
  getAll: () => Promise<void>;
  getDetail: (id: string) => Promise<void>;
  clearCurrent: () => void;
}

const useNewsApi = create<NewsState>((set) => ({
  news: [],
  currentArticle: null,
  isLoading: false,
  error: null,

  getAll: async () => {
    const api = useApiStore.getState();

    console.log(api)
    set({ isLoading: true, error: null });
    
    try {
      await api.fetchData("/news");
      const response = api.data as NewsApiResponse;

      if (response?.status === "success" && Array.isArray(response.data)) {
        set({ news: response.data, isLoading: false });
      } else {
        set({ news: [], error: response?.message || "No news available", isLoading: false });
      }
    } catch (error: any) {
      console.error(error);
      set({ error: error.message, isLoading: false });
    }
  },

  getDetail: async (id: string) => {
    const api = useApiStore.getState();
    set({ isLoading: true, error: null, currentArticle: null });
    
    try {
      await api.fetchData(`/news/${id}`);
      const response = api.data as NewsApiResponse;

      if (response?.status === "success" && response.data) {
        set({ currentArticle: response.data as NewsArticle, isLoading: false });
      } else {
        set({ error: response?.message || "News article not found", isLoading: false });
      }
    } catch (error: any) {
      console.error(error);
      set({ error: error.message, isLoading: false });
    }
  },

  clearCurrent: () => set({ currentArticle: null }),
}));

export default useNewsApi;
