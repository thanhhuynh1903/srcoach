import axios from "axios";
import { create } from "zustand";

interface RegisterState {
  email: string;
  password: string;
  verificationCode: string;
  username: string;
  age: string;
  message: string;
  status: "idle" | "loading" | "success" | "error";
  // Action: Gửi yêu cầu đăng ký (gửi mã xác minh)
  register: (email: string, password: string, username: string, age: string) => Promise<void>;
  // Action: Xác minh tài khoản với mã code
  verifyAccount: (email: string, verificationCode: string) => Promise<void>;
  // Các action để cập nhật giá trị của form
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setUsername: (username: string) => void;
  setAge: (age: string) => void;
  setVerificationCode: (code: string) => void;
  // Reset toàn bộ trạng thái
  clear: () => void;
}

export const useRegisterStore = create<RegisterState>((set : any) => ({
  email: "",
  password: "",
  verificationCode: "",
  username: "",
  age: "",
  message: "",
  status: "idle",

  register: async (email : any, password : any, username : string, age : string) => {
    set({ status: "loading", message: "" });
    try {
        const payload = { email, password, username, age };
        const headers = { "Content-Type": "application/json" };
      // Gọi API gửi mã xác minh (backend gửi email mã xác minh)
      const response = await axios.post("https://xavia.pro/api/users", payload, { headers });
      set({ email, password, username, age, status: "success", message: response.data.message });
    } catch (error: any) {
      set({
        status: "error",
        message: error.response?.data?.message || "Có lỗi khi gửi email xác minh",
      });
    }
  },

  verifyAccount: async (email : any, verificationCode : string) => {
    set({ status: "loading", message: "" });
    try {
      // Gọi API kích hoạt tài khoản với mã xác minh
      const response = await axios.post("http://localhost:5000/api/users/activate", { email, verificationCode });
      set({ status: "success", message: response.data.message });
    } catch (error: any) {
      set({
        status: "error",
        message: error.response?.data?.message || "Có lỗi khi kích hoạt tài khoản",
      });
    }
  },

  setEmail: (email: string) => set({ email }),
  setPassword: (password: string) => set({ password }),
  setUsername: (username: string) => set({ username }),
  setAge: (age: string) => set({ age }),
  setVerificationCode: (code: string) => set({ verificationCode: code }),
  clear: () => set({ email: "", password: "", verificationCode: "", username: "", age: "", message: "", status: "idle" }),
}));