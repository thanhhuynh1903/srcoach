import { create } from 'zustand';
import useApiStore from './zustandfetchAPI';

// Định nghĩa interface cho cảnh báo sức khỏe
interface HealthAlert {
  id: string;
  alert_type: string;
  alert_message: string;
  severity: string;
  score: number;
  created_at: string;
  risk_factors: RiskFactor[];
  recommendations: string[];
  AIHealthAlertType: {
    id: string;
    type_name: string;
    description: string;
  }
  distance: number,
  step: number,
  is_deleted : boolean
}

// Định nghĩa interface cho chi tiết cảnh báo sức khỏe
interface HealthAlertDetail {
  id: string;
  alert_type_id: string;
  alert_message: string;
  alert_date: string;
  severity: string;
  status: string;
  user_id: string;
  score: number;
  created_at: string;
  updated_at: string | null;
  AIHealthAlertType: {
    id: string;
    type_name: string;
    description: string;
  };
  AIRecommendation: {
    id: string;
    recommendation: string;
    source: string;
    user_id: string;
    alert_id: string;
    created_at: string;
    updated_at: string | null;
  }[];
}

interface ActivityData {
  age: number;
  gender: string;
  heart_rate_min: number;
  heart_rate_max: number;
  heart_rate_avg: number;
  avg_pace: number;
  calories: number;
  distance: number;
  steps: number;
  activity_name: string;
}

interface RiskFactor {
  name: string;
  level: string;
  description: string;
}

interface RiskAssessment {
  heart_rate_avg: number;
  heart_rate_max: number;
  heart_rate_min: number;
  activity_name: string;
  heart_rate_danger : number;
  distance: number;
  step: number;
  score: number;
  severity: string;
  alert_type: string;
  alert_message: string;
  risk_factors: RiskFactor[];
  recommendations: string[];
  pace: number;
}

interface AiRiskState {
  assessment: RiskAssessment | null;
  healthAlerts: HealthAlert[];
  selectedHealthAlert: HealthAlertDetail | null;
  isLoading: boolean;
  isLoadingAlerts: boolean;
  isSavingResult: boolean;
  isLoadingAlertDetail: boolean;
  error: string | null;
  message: string | null;
  searchHealthAlerts: (query: string, severity?: string) => Promise<void>;
  saveFullAiResult: (activityData: ActivityData) => Promise<boolean>;
  evaluateActivityHealth: (activityData: ActivityData) => Promise<void>;
  fetchHealthAlerts: () => Promise<void>;
  deleteHealthAlert: (alertId: string) => Promise<boolean>;
  fetchHealthAlertDetail: (id: string) => Promise<void>;
  clearAssessment: () => void;
  clearError: () => void;
  clearMessage: () => void;
  clearSelectedAlert: () => void;
}

const api = useApiStore.getState();

const useAiRiskStore = create<AiRiskState>((set, get) => ({
  assessment: null,
  healthAlerts: [],
  selectedHealthAlert: null,
  isLoading: false,
  isLoadingAlerts: false,
  isSavingResult: false,
  isLoadingAlertDetail: false,
  error: null,
  message: null,
  
  searchHealthAlerts: async (query: string, severity?: string) => {
    set({ isLoadingAlerts: true, error: null });
    try {
      // Xây dựng params cho API request
      const params: Record<string, string> = {};
      if (query) params.alert_message = query;
      if (severity && severity !== 'All') params.severity = severity;
      
      // Gọi API với params
      const queryString = new URLSearchParams(params).toString();
      const endpoint = `/ai/ai-health-alerts${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.fetchData(endpoint);
      console.log('Search health alerts response:', response);
      
      if (response?.status === 'success') {
        set({
          healthAlerts: response.data || [],
          isLoadingAlerts: false
        });
      } else if (response?.status === 'error' && response?.message === 'Không tìm thấy AIHealthAlert nào cho user này') {
        // Trường hợp không có cảnh báo nào
        set({
          healthAlerts: [],
          isLoadingAlerts: false,
          message: 'No health alerts found for this user'
        });
      } else {
        set({
          error: response?.message || 'Failed to search health alerts',
          isLoadingAlerts: false
        });
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to search health alerts',
        isLoadingAlerts: false
      });
    }
  },

  evaluateActivityHealth: async (activityData) => {
    console.log('activityData from AI:', activityData);

    set({ isLoading: true, error: null });
    try {
      const response = await api.postData(
        '/ai/evaluate-activity-health',
        activityData
      );
      console.log('Response from AI:', response);
      
      if (response?.result?.status === 'success') {
        set({
          assessment: {
            score: response.result.data.score,
            severity: response.result.data.severity,
            alert_type: response.result.data.alert_type,
            heart_rate_danger : response.result.data.heart_rate_danger,
            alert_message: response.result.data.alert_message,
            risk_factors: response.result.data.risk_factors.map((factor: any) => ({
              name: factor.name,
              level: factor.level,
              description: factor.description
            })),
            recommendations: response.result.data.recommendations
          },
          isLoading: false,
          message: response?.result?.message
        });
      } else {
        set({
          error: response?.result?.status || 'Failed to evaluate activity health',
          message: response?.result?.message,
          isLoading: false
        });
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to evaluate activity health',
        isLoading: false
      });
    }
  },

  // Hàm để lấy danh sách cảnh báo sức khỏe
  fetchHealthAlerts: async () => {
    set({ isLoadingAlerts: true, error: null });
    try {
      const response = await api.fetchData('/ai/ai-health-alerts');
      console.log('Health alerts response:', response);
      
      if (response?.status === 'success') {
        console.log('response?.status:', response);
        set({
          healthAlerts: response.data || [],
          isLoadingAlerts: false
        });
      } else if (response?.status === 'error' && response?.message === 'Không tìm thấy AIHealthAlert nào cho user này') {
        // Trường hợp không có cảnh báo nào
        set({
          healthAlerts: [],
          isLoadingAlerts: false,
          message: 'No health alerts found for this user'
        });
      } else {
        set({
          error: response?.message || 'Failed to fetch health alerts',
          isLoadingAlerts: false
        });
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch health alerts',
        isLoadingAlerts: false
      });
    }
  },

  fetchHealthAlertDetail: async (id: string) => {
    console.log('Fetching health alert detail for ID:', id);
    
    set({ isLoading: true, error: null });
    try {
      const response = await api.fetchDataDetail(`/ai/ai-health-alert/${id}`);
      console.log('Health alert detail response:', response);
      
      if (response?.status === 'success') {
        // Chuyển đổi dữ liệu từ API thành định dạng phù hợp với UI
        set({
          assessment: {
            heart_rate_avg: response.data.heart_rate_avg,
            heart_rate_max: response.data.heart_rate_max,
            heart_rate_min: response.data.heart_rate_min,
            activity_name: response.data.activity_name, 
            distance : response.data.distance,
            pace: response.data.pace,
            step: response.data.step,
            score: response.data.score,
            severity: response.data.severity,
            alert_type: response.data.alert_type,
            alert_message: response.data.alert_message,
            risk_factors: response.data.risk_factors.map((factor: any) => ({
              name: factor.name,
              level: factor.level,
              description: factor.description
            })),
            recommendations: response.data.recommendations
          },
          isLoading: false,
          message: 'Chi tiết cảnh báo đã được tải thành công'
        });
      } else {
        set({
          error: response?.message || 'Không thể tải chi tiết cảnh báo sức khỏe',
          isLoading: false
        });
      }
    } catch (error: any) {
      set({
        error: error.message || 'Không thể tải chi tiết cảnh báo sức khỏe',
        isLoading: false
      });
    }
  },
  
  saveFullAiResult: async (activityData) => {
    const assessment = get().assessment;
    if (!assessment) {
      set({ error: 'No assessment data to save' });
      return false;
    }
    console.log('Saving AI result with activity data:', activityData);
    
    set({ isSavingResult: true, error: null });
    try {
      // Chuẩn bị dữ liệu để lưu
      const saveData = {
        ...assessment,
        // Đảm bảo các trường bắt buộc được thêm vào
        distance: assessment.distance || activityData.distance,
        step: assessment.step || activityData.steps,
        heart_rate_max: assessment.heart_rate_max || activityData.heart_rate_max,
        heart_rate_min: assessment.heart_rate_min || activityData.heart_rate_min,
        pace: assessment.pace || activityData.avg_pace
      };

      const response = await api.postData('/ai/save-full-ai-result', saveData);
      console.log('Save AI result response:', response);
      
      if (response?.alert?.status === 'success') {
        set({
          isSavingResult: false,
          message: 'AI assessment result saved successfully'
        });
        return true;
      } else {
        set({
          error: response?.message || 'Failed to save AI assessment result',
          isSavingResult: false
        });
        return false;
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to save AI assessment result',
        isSavingResult: false
      });
      return false;
    }
  },
  deleteHealthAlert: async (alertId: string) => {
    try {
      set({isLoading: true, });

      // Sử dụng PATCH để soft delete thay vì xóa hoàn toàn
      const response = await api.deleteData(
        `/ai/ai-health-alerts-soft/${alertId}`,
      );
      console.log('Delete health alert response:', response);

      if (response.status === 'success') {
        // Cập nhật danh sách cảnh báo sau khi xóa thành công
        await get().fetchHealthAlerts(); // Tải lại toàn bộ danh sách

        set({
          isLoading: false,
          message: 'Health alert deleted successfully',
        });
        return true;
      } else {
        set({
          message: response.message || 'Failed to delete health alert',
          isLoading: false,
        });
        return false;
      }
    } catch (error) {
      console.error('Error deleting health alert:', error);
      set({
        message:
          error instanceof Error
            ? error.message
            : 'An unknown error occurred while deleting health alert',
        isLoading: false,
      });
      return false;
    }
  },


  clearAssessment: () => set({ assessment: null }),
  clearError: () => set({ error: null }),
  clearMessage: () => set({ message: null }),
  clearSelectedAlert: () => set({ selectedHealthAlert: null })
}));

export default useAiRiskStore;
