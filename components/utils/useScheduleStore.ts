import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import axios from 'axios';
import useApiStore from './zustandfetchAPI';

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
  days: DailySchedule[];
  created_at?: string;
  updated_at?: string;
  is_expert_choice?: boolean;
  alarm_enabled?: boolean;
  schedule_type?: string;
  status: string;
}

interface ScheduleState {
  schedules: Schedule[];
  isLoading: boolean;
  error: string | null;
  currentSchedule: Schedule | null;
  message: string | null; // Thêm thuộc tính message để lưu thông báo từ API
  // Actions
  fetchSchedules: () => Promise<void>;
  fetchSelfSchedules: () => Promise<void>;
  createSchedule: (scheduleData: Partial<Schedule>) => Promise<Schedule | null>;
  updateSchedule: (
    id: string,
    schedule: Partial<Schedule>,
  ) => Promise<Schedule | null>;
  deleteSchedule: (id: string) => Promise<boolean>;
  setCurrentSchedule: (schedule: Schedule | null) => void;
  resetCurrentSchedule: () => void;
  toggleAlarm: (scheduleId: string) => Promise<void>;
  clear: () => void;
}
const api = useApiStore.getState();
// Khởi tạo store
const useScheduleStore = create<ScheduleState>()(
  persist(
    (set, get) => ({
      schedules: [],
      isLoading: false,
      error: null,
      currentSchedule: null,
      message: null,
      // Lấy danh sách lịch tập
      fetchSchedules: async () => {
        set({isLoading: true, error: null});
        try {
          const response = await api.fetchData(`/schedules/self`);
          console.log('response', response);
          set({schedules: response.data, isLoading: false});
        } catch (error) {
          console.error('Lỗi khi lấy danh sách lịch tập:', error);
          set({
            error: 'Không thể lấy danh sách lịch tập. Vui lòng thử lại sau.',
            isLoading: false,
          });
        }
      },

      fetchSelfSchedules: async () => {
        set({isLoading: true, error: null});
        try {
          const response = await api.fetchData(`/schedules/self`);
          console.log('response', response);

          set({schedules: response.data, isLoading: false});
        } catch (error) {
          console.error('Error getting personal training schedule list:', error);
          set({
            error:
              'Unable to get personal training schedule list. Please try again later..',
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

          const response = await api.postData(`/schedules/create`, payload);
          const newSchedule = response?.data;

          console.log('Kết quả tạo lịch tập:', response?.message);
          set(state => ({
            schedules: [...state.schedules, newSchedule],
            isLoading: false,
            message: response?.message,
          }));

          return newSchedule;
        } catch (error: any) {
          console.log('Error creating workout schedule:', error.response?.data.message);
          set({
            message: error?.response?.data?.message,
            error: 'Unable to create workout schedule. Please try again later.',
            isLoading: false,
          });
          return null;
        }
      },
      clear() {
        set({
          isLoading: false,
          error: null,
          message: null,
        });
      },
      // Cập nhật lịch tập
      updateSchedule: async (id, scheduleUpdate) => {
        set({isLoading: true, error: null});
        try {
          const response = await axios.put(
            `${API_URL}/api/schedules/${id}`,
            scheduleUpdate,
          );
          const updatedSchedule = response.data;

          set(state => ({
            schedules: state.schedules.map(s =>
              s.id === id ? updatedSchedule : s,
            ),
            isLoading: false,
          }));

          return updatedSchedule;
        } catch (error) {
          console.error('Lỗi khi cập nhật lịch tập:', error);
          set({
            error: 'Không thể cập nhật lịch tập. Vui lòng thử lại sau.',
            isLoading: false,
          });
          return null;
        }
      },

      // Xóa lịch tập
      deleteSchedule: async id => {
        set({isLoading: true, error: null,message: null});
        try {
          const response = await api.deleteData(`/schedules/cancel/${id}`);
          if (response.status === 'success') {
            set(state => ({
              schedules: state.schedules.filter(s => s.id !== id),
              message: response.message,
              isLoading: false,
            }));
            return true;
          }
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
