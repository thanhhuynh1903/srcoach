import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import axios from 'axios';
import useApiStore from './zustandfetchAPI';
import ToastUtil from './utils_toast';

// Định nghĩa các interfaces
export interface TrainingSession {
  description: string;
  start_time: string;
  end_time: string;
  goal_steps: number;
  goal_distance: number;
  goal_calories: number;
  goal_minbpms: number;
  goal_maxbpms: number;
}

export interface DailySchedule {
  day: string;
  details: TrainingSession[];
}

export interface Schedule {
  id?: string;
  title: string;
  description: string;
  user_id: string | null;
  expert_id: string | null;
  days: DailySchedule[];
  created_at?: string;
  updated_at?: string;
  is_expert_choice?: boolean;
  alarm_enabled?: boolean;
  schedule_type?: string;
  status?: string;
}

interface ScheduleState {
  schedules: Schedule[];
  ExpertSchedule: Schedule[];
  historySchedule: Schedule[];
  isLoading: boolean;
  error: string | null;
  currentSchedule: Schedule | null;
  message: string | null; // Thêm thuộc tính message để lưu thông báo từ API
  // Actions
  fetchSelfSchedules: () => Promise<void>;
  fetchExpertSchedule: () => Promise<void>;
  fetchDetail: (scheduleId: string) => Promise<Schedule | null>;
  fetchHistorySchedule: () => Promise<void>;
  fetchHistoryScheduleExpert: () => Promise<void>;
  createSchedule: (scheduleData: Partial<Schedule>) => Promise<Schedule | null>;
  createExpertSchedule: (
    scheduleData: Partial<Schedule>,
  ) => Promise<Schedule | null>;
  updateSchedule: (
    id: string,
    schedule: Partial<Schedule>,
  ) => Promise<string | null>;
  updateScheduleExpert: (
    id: string,
    schedule: Partial<Schedule>,
  ) => Promise<string | null>;
  deleteSchedule: (id: string) => Promise<boolean>;
  deleteScheduleExpert: (id: string) => Promise<boolean>;
  acceptExpertSchedule: (scheduleId: string) => Promise<Schedule | null>;
  declineExpertSchedule: (scheduleId: string) => Promise<Schedule | null>;
  setCurrentSchedule: (schedule: Schedule | null) => void;
  resetCurrentSchedule: () => void;
  clearExpertSchedule: () => void;
  toggleAlarm: (scheduleId: string) => Promise<void>;
  clear: () => void;
}
const api = useApiStore.getState();
// Khởi tạo store
const useScheduleStore = create<ScheduleState>()(
  persist(
    (set, get) => ({
      schedules: [],
      ExpertSchedule: [],
      historySchedule: [],
      isLoading: false,
      error: null,
      currentSchedule: null,
      message: null,

      fetchSelfSchedules: async () => {
        set({isLoading: true, error: null});
        try {
          const response = await api.fetchData(`/schedules/self/current`);
          console.log('response', response);

          set({schedules: response?.data, isLoading: false});
          return response?.data || [];
        } catch (error) {
          console.error(
            'Error getting personal training schedule list:',
            error,
          );
          set({
            error:
              'Unable to get personal training schedule list. Please try again later..',
            isLoading: false,
          });
        }
      },
      fetchExpertSchedule: async () => {
        set({isLoading: true, error: null});
        try {
          const response = await api.fetchDataDetail(
            `/schedules/expert/current-created`,
          );
          console.log('Expert response', response);

          set({ExpertSchedule: response?.data, isLoading: false});
        } catch (error) {
          set({
            error:
              'Unable to get personal training schedule list. Please try again later..',
            isLoading: false,
          });
        }
      },

      fetchDetail: async (scheduleId: string) => {
        set({isLoading: true, error: null});
        try {
          const response = await api.fetchData(`/schedules/${scheduleId}`);
          console.log('response', response);
          set({isLoading: false});
          return response?.data;
        } catch (error) {
          console.error(
            'Error getting personal training schedule list:',
            error,
          );
          set({
            error:
              'Unable to get personal training schedule list. Please try again later..',
            isLoading: false,
          });
          return null;
        }
      },

      fetchHistorySchedule: async () => {
        set({isLoading: true, error: null});
        try {
          const response = await api.fetchData(`/schedules/self/history-full`);
          set({
            historySchedule: response?.data || [],
            isLoading: false,
          });
        } catch (error) {
          set({
            error:
              'Unable to get personal history schedule list. Please try again later..',
            isLoading: false,
          });
        }
      },

      fetchHistoryScheduleExpert: async () => {
        set({isLoading: true, error: null});
        try {
          const response = await api.fetchData(
            `/schedules/expert/history-created`,
          );
          set({
            historySchedule: response?.data || [],
            isLoading: false,
          });
        } catch (error) {
          set({
            error:
              'Unable to get expert history schedule list. Please try again later..',
            isLoading: false,
          });
        }
      },

      // Tạo lịch tập mới
      createSchedule: async scheduleData => {
        set({isLoading: true, error: null, message: null});

        try {
          // Đảm bảo dữ liệu có định dạng đúng
          const payload = scheduleData?.user_id
            ? {
                title: scheduleData.title || '',
                description: scheduleData.description || '',
                user_id: scheduleData.user_id,
                days: scheduleData.days || [],
              }
            : {
                title: scheduleData.title || '',
                description: scheduleData.description || '',
                days: scheduleData.days || [],
              };
          console.log('Payload tạo lịch tập:', payload);

          const response: any = await api.postData(
            `/schedules/self-create`,
            payload,
          );

          console.log('Kết quả tạo lịch tập:', response?.message);
          set({
            message: response?.message,
            isLoading: false,
          });
          return response;
        } catch (error: any) {
          const serverMessage =
            error.response?.data?.message || 'Unknown error';
          console.log('serverMessage', serverMessage);

          set({
            message: serverMessage, // Cập nhật message trực tiếp từ server
            isLoading: false,
          });
          return null;
        }
      },
      createExpertSchedule: async (scheduleData: any) => {
        set({isLoading: true, error: null, message: null});

        try {
          const response: any = await api.postData(
            `/schedules/expert/create-for-runner`,
            scheduleData,
          );

          ToastUtil.success('Schedule created', response?.message);
          set({
            error: null,
            message: response?.message,
            isLoading: false,
          });

          return response;
        } catch (error: any) {
          const serverMessage =
            error.response?.data?.message || 'Unknown error';
          ToastUtil.error('Error', serverMessage);
          set({
            error: serverMessage,
            message: serverMessage,
            isLoading: false,
          });
          return null;
        }
      },
      acceptExpertSchedule: async (scheduleId: string) => {
        set({isLoading: true, error: null, message: null});
        try {
          const response = await api.postData(
            `/schedules/accept/${scheduleId}`,
          );
          if (response?.status === 'success') {
            await get().fetchSelfSchedules();
            await get().fetchExpertSchedule();
            ToastUtil.success('Success', response?.message);
            return response.data;
          }
          return response;
        } catch (error: any) {
          const serverMessage =
            error.response?.data?.message || 'Unknown error';
          ToastUtil.error('Error', serverMessage);
        }

        return null;
      },
      declineExpertSchedule: async (scheduleId: string) => {
        set({isLoading: true, error: null, message: null});
        try {
          const response = await api.postData(
            `/schedules/decline/${scheduleId}`,
          );
          if (response?.status === 'success') {
            await get().fetchSelfSchedules();
            await get().fetchExpertSchedule();
            ToastUtil.success('Success', response?.message);
            return response.data;
          }
          return response;
        } catch (error: any) {
          const serverMessage =
            error.response?.data?.message || 'Unknown error';
          ToastUtil.error('Error', serverMessage);
        }

        return null;
      },
      clear() {
        set({
          isLoading: false,
          error: null,
          message: null,
        });
      },
      // Cập nhật lịch tập
      updateSchedule: async (scheduleId, data) => {
        try {
          set({isLoading: true});
          const response = await api.putData(
            `/schedules/self/${scheduleId}`,
            data,
          );
          const updateSchedule = response?.status;
          console.log('Kết quả cập nhật lịch tập:', updateSchedule);

          return updateSchedule;
        } catch (error) {
          console.log('Error while updating schedule:', error);
          return null;
        } finally {
          set({isLoading: false});
        }
      },
      updateScheduleExpert: async (scheduleId, data) => {
        try {
          set({isLoading: true});
          const response = await api.putData(
            `/schedules/expert/${scheduleId}`,
            data,
          );
          const updateSchedule = response?.status;
          console.log('Kết quả cập nhật lịch tập:', updateSchedule);

          return updateSchedule;
        } catch (error) {
          console.log('Error while updating schedule:', error);
          return null;
        } finally {
          set({isLoading: false});
        }
      },

      // Xóa lịch tập
      deleteSchedule: async id => {
        set({isLoading: true, error: null, message: null});
        try {
          const response = await api.deleteData(`/schedules/self/${id}`);
          console.log('Kết quả xóa lịch tập:', response?.message);

          if (response?.status === 'success') {
            // Sau khi xóa thành công, gọi lại fetchSelfSchedules để đồng bộ dữ liệu mới nhất từ backend
            await get().fetchSelfSchedules();
            set({
              message: response?.message,
              isLoading: false,
            });
            return true;
          }
          set({
            message: response?.message || 'Delete failed.',
            isLoading: false,
          });
          return false;
        } catch (error) {
          console.error('Error while deleting workout schedule:', error);
          set({
            error: 'Unable to delete workout schedule. Please try again later.',
            isLoading: false,
          });
          return false;
        }
      },
      deleteScheduleExpert: async id => {
        set({isLoading: true, error: null, message: null});
        try {
          const response = await api.deleteData(`/schedules/expert/${id}`);
          console.log('Kết quả xóa lịch tập:', response?.message);

          if (response?.status === 'success') {
            await get().fetchSelfSchedules();
            await get().fetchExpertSchedule();
            set({
              message: response?.message,
              isLoading: false,
            });
            return true;
          }
          set({
            message: response?.message || 'Delete failed.',
            isLoading: false,
          });
          return false;
        } catch (error) {
          console.error('Error while deleting workout schedule:', error);
          set({
            error: 'Unable to delete workout schedule. Please try again later.',
            isLoading: false,
          });
          return false;
        }
      },

      // Thiết lập lịch tập hiện tại (để chỉnh sửa)
      setCurrentSchedule: schedule => {
        set({currentSchedule: schedule});
      },

      // Đặt lại lịch tập hiện tại về trạng thái mặc định
      resetCurrentSchedule: () => {
        set({currentSchedule: null});
      },
      clearExpertSchedule: () => set({ExpertSchedule: [], schedules: []}),
      // Bật/tắt báo thức cho lịch tập
      toggleAlarm: async scheduleId => {
        try {
          const {schedules} = get();
          const schedule = schedules.find(s => s.id === scheduleId);

          if (!schedule) return;

          const updatedSchedule = {
            ...schedule,
            alarm_enabled: !schedule.alarm_enabled,
          };

          await get().updateSchedule(scheduleId, updatedSchedule);
        } catch (error) {
          console.error('Lỗi khi bật/tắt báo thức:', error);
          set({error: 'Không thể cập nhật trạng thái báo thức.'});
        }
      },
    }),
    {
      name: 'schedule-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        schedules: state.schedules,
        currentSchedule: state.currentSchedule,
      }),
    },
  ),
);

export default useScheduleStore;
