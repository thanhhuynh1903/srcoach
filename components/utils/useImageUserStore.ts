// utils/useImageUserStore.ts
import { create } from 'zustand';
import useApiStore from './zustandfetchAPI';

interface ImageUserState {
  isLoading: boolean;
  message: string | null;
  userImage: string | null;
  
  // Actions
  updateUserImage: (imageUri: string) => Promise<any>;
  deleteImage: () => Promise<boolean>;
  resetMessage: () => void;
}
const api = useApiStore.getState();
export const useImageUserStore = create<ImageUserState>((set, get) => ({
  isLoading: false,
  message: null,
  userImage: null,

  updateUserImage: async (imageUri) => {
    set({ isLoading: true });

    try {
      // Tạo FormData object
      const formData = new FormData();

      // Tạo file object từ image URI
      const imageFile = {
        uri: imageUri,
        type: 'image/jpeg', // Hoặc lấy từ image type thực tế
        name: `user-avatar-${Date.now()}.jpg`, // Tên file unique
      };

      // Thêm image vào form data với key 'image'
      formData.append('image', imageFile);

      // Gọi API upload
      const response = await api.postData('/users/image', formData);
      console.log('response image', response);

      // Cập nhật state nếu thành công
      set({
        isLoading: false,
        message: response?.message || 'Update image successfully',
        userImage: response?.data?.imageUrl || get().userImage,
      });
      return response?.data;
    } catch (error: any) {
      set({
        isLoading: false,
        message: error.response?.data?.message || 'Cập nhật ảnh thất bại',
      });
      return null;
    }
  },

  deleteImage: async () => {
    set({ isLoading: true });

    try {
      const response = await api.deleteData(`/users/image`);
      console.log('response delete', response);

      set({
        isLoading: false,
        message: response?.message || 'Xóa ảnh thành công',
        userImage: null,
      });
      return true;
    } catch (error: any) {
      set({
        isLoading: false,
        message: error.message || 'Đã xảy ra lỗi khi xóa ảnh',
      });
      return false;
    }
  },

  resetMessage: () => set({ message: null }),
}));
