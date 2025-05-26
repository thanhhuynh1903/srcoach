import { create } from 'zustand';
import useApiStore from './zustandfetchAPI';

interface PointsData {
  id: string;
  username: string;
  name: string;
  points: number;
  level: string;
  nextLevel: string | null;
  pointsToNextLevel: number;
  pointsPercentage: number;
  avatar?: string | null;
}

interface PointsHistoryItem {
  id: string;
  point_earn: number;
  reason: string;
  description?: string;
  created_at: string;
}

interface LeaderboardItem {
  id: string;
  username: string;
  name: string;
  totalPoints: number;
  currentLevel: string;
  nextLevel: string | null;
  pointsToNextLevel: number;
  pointsPercentage: number;
  avatar?: string | null;
}

interface PointsHistoryResponse {
  data: PointsHistoryItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface LeaderboardResponse {
  data: LeaderboardItem[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface UserPointsState {
  pointsData: PointsData | null;
  pointsHistory: PointsHistoryItem[];
  historyMeta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
  leaderboard: LeaderboardItem[];
  dailyLeaderboard: LeaderboardItem[];
  weeklyLeaderboard: LeaderboardItem[];
  monthlyLeaderboard: LeaderboardItem[];
  isLoading: boolean;
  error: string | null;
  message: string | null;

  // Points operations
  getMyPoints: () => Promise<void>;
  getMyPointsHistory: (page?: number, limit?: number) => Promise<void>;
  getLeaderboard: (levelFilter?: string, page?: number, limit?: number) => Promise<void>;
  getDailyLeaderboard: () => Promise<void>;
  getWeeklyLeaderboard: () => Promise<void>;
  getMonthlyLeaderboard: () => Promise<void>;

  // Clear state
  clearPointsData: () => void;
  clearPointsHistory: () => void;
  clearLeaderboard: () => void;
  clearDailyLeaderboard: () => void;
  clearWeeklyLeaderboard: () => void;
  clearMonthlyLeaderboard: () => void;
  clearError: () => void;
  clearMessage: () => void;
}

const useUserPointsStore = create<UserPointsState>((set) => ({
  pointsData: null,
  pointsHistory: [],
  historyMeta: null,
  leaderboard: [],
  dailyLeaderboard: [],
  weeklyLeaderboard: [],
  monthlyLeaderboard: [],
  isLoading: false,
  error: null,
  message: null,

  getMyPoints: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await useApiStore.getState().fetchData('/user-points/me');

      if (response?.status === 'success') {
        set({
          pointsData: {
            id: response.data.id,
            username: response.data.username,
            name: response.data.name,
            points: response.data.points,
            level: response.data.level,
            nextLevel: response.data.nextLevel,
            pointsToNextLevel: response.data.pointsToNextLevel,
            pointsPercentage: response.data.pointsPercentage,
            avatar: response.data.avatar || null,
          },
          isLoading: false,
        });
      } else {
        set({
          error: response?.message || 'Failed to fetch points data',
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch points data',
        isLoading: false,
      });
    }
  },

  getMyPointsHistory: async (page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await useApiStore
        .getState()
        .fetchData(`/user-points/me/history?page=${page}&limit=${limit}`);

      if (response?.status === 'success') {
        set({
          pointsHistory: response.data.data.map((item: any) => ({
            id: item.id,
            point_earn: item.point_earn,
            reason: item.reason,
            description: item.PointReason?.description,
            created_at: item.created_at,
          })),
          historyMeta: response.data.meta,
          isLoading: false,
        });
        return response.data
      } else {
        set({
          error: response?.message || 'Failed to fetch points history',
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch points history',
        isLoading: false,
      });
    }
  },

  getLeaderboard: async (levelFilter = '', page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      let url = `/user-points/leaderboard?page=${page}&limit=${limit}`;
      if (levelFilter) {
        url += `&level=${levelFilter}`;
      }

      const response = await useApiStore.getState().fetchData(url);

      if (response?.status === 'success') {
        set({
          leaderboard: response.data.map((item: any) => ({
            id: item.id,
            username: item.username,
            name: item.name,
            totalPoints: item.totalPoints,
            currentLevel: item.currentLevel,
            nextLevel: item.nextLevel,
            pointsToNextLevel: item.pointsToNextLevel,
            pointsPercentage: item.pointsPercentage,
            avatar: item.avatar || null,
          })),
          isLoading: false,
        });
      } else {
        set({
          error: response?.message || 'Failed to fetch leaderboard',
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch leaderboard',
        isLoading: false,
      });
    }
  },

  getDailyLeaderboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await useApiStore.getState().fetchData('/user-points/leaderboard/daily');

      if (response?.status === 'success') {
        set({
          dailyLeaderboard: response.data.map((item: any) => ({
            id: item.id,
            username: item.username,
            name: item.name,
            totalPoints: item.totalPoints,
            currentLevel: item.currentLevel,
            nextLevel: item.nextLevel,
            pointsToNextLevel: item.pointsToNextLevel,
            pointsPercentage: item.pointsPercentage,
            avatar: item.avatar || null,
          })),
          isLoading: false,
        });
      } else {
        set({
          error: response?.message || 'Failed to fetch daily leaderboard',
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch daily leaderboard',
        isLoading: false,
      });
    }
  },

  getWeeklyLeaderboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await useApiStore.getState().fetchData('/user-points/leaderboard/weekly');

      if (response?.status === 'success') {
        set({
          weeklyLeaderboard: response.data.map((item: any) => ({
            id: item.id,
            username: item.username,
            name: item.name,
            totalPoints: item.totalPoints,
            currentLevel: item.currentLevel,
            nextLevel: item.nextLevel,
            pointsToNextLevel: item.pointsToNextLevel,
            pointsPercentage: item.pointsPercentage,
            avatar: item.avatar || null,
          })),
          isLoading: false,
        });
      } else {
        set({
          error: response?.message || 'Failed to fetch weekly leaderboard',
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch weekly leaderboard',
        isLoading: false,
      });
    }
  },

  getMonthlyLeaderboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await useApiStore.getState().fetchData('/user-points/leaderboard/monthly');

      if (response?.status === 'success') {
        set({
          monthlyLeaderboard: response.data.map((item: any) => ({
            id: item.id,
            username: item.username,
            name: item.name,
            totalPoints: item.totalPoints,
            currentLevel: item.currentLevel,
            nextLevel: item.nextLevel,
            pointsToNextLevel: item.pointsToNextLevel,
            pointsPercentage: item.pointsPercentage,
            avatar: item.avatar || null,
          })),
          isLoading: false,
        });
      } else {
        set({
          error: response?.message || 'Failed to fetch monthly leaderboard',
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch monthly leaderboard',
        isLoading: false,
      });
    }
  },

  clearPointsData: () => set({ pointsData: null }),
  clearPointsHistory: () => set({ pointsHistory: [], historyMeta: null }),
  clearLeaderboard: () => set({ leaderboard: [] }),
  clearDailyLeaderboard: () => set({ dailyLeaderboard: [] }),
  clearWeeklyLeaderboard: () => set({ weeklyLeaderboard: [] }),
  clearMonthlyLeaderboard: () => set({ monthlyLeaderboard: [] }),
  clearError: () => set({ error: null }),
  clearMessage: () => set({ message: null }),
}));

export default useUserPointsStore;