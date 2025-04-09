import { create } from 'zustand';
import useApiStore from './zustandfetchAPI';


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
    score: number;
    severity: string;
    alert_type: string;
    alert_message: string;
    risk_factors: RiskFactor[];
    recommendations: string[];
  }
  
  interface AiRiskState {
    assessment: RiskAssessment | null;
    isLoading: boolean;
    error: string | null;
    message: string | null;
    
    evaluateActivityHealth: (activityData: ActivityData) => Promise<void>;
    clearAssessment: () => void;
    clearError: () => void;
    clearMessage: () => void;
  }

const api = useApiStore.getState();

const useAiRiskStore = create<AiRiskState>((set) => ({
  assessment: null,
  isLoading: false,
  error: null,
  message: null,

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
            alert_message: response.result.data.alert_message,
            risk_factors: response.result.data.risk_factors.map((factor: any) => ({
              name: factor.name,
              level: factor.level,
              description: factor.description
            })),
            recommendations: response.result.data.recommendations
          },
          isLoading: false,
          message: 'Assessment completed successfully'
        });
      } else {
        set({
          error: response?.message || 'Failed to evaluate activity health',
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

  clearAssessment: () => set({ assessment: null }),
  clearError: () => set({ error: null }),
  clearMessage: () => set({ message: null })
}));

export default useAiRiskStore;