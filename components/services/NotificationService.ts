import messaging from '@react-native-firebase/messaging';
import notifee, {AndroidImportance} from '@notifee/react-native';
import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import useApiStore from '../utils/zustandfetchAPI';

class NotificationService {
  private token: string | null = null;
  private messageUnsubscribe: any = null;
  constructor() {
    this.token = null;
    this.messageUnsubscribe = null;
  }

  setupBackgroundHandler() {
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Nhận thông báo khi app ở nền/đóng:', remoteMessage);
      await this.displayNotification(remoteMessage);
    });
  }
  async init() {
    try {
      // Yêu cầu quyền thông báo
      await this.requestPermission();

      // Tạo kênh thông báo cho Android
      await this.createNotificationChannel();

      // Khôi phục token từ bộ nhớ nếu có
      const savedToken = await AsyncStorage.getItem('fcmToken');

      if (savedToken) {
        this.token = savedToken;
      }

      // Lấy token và đăng ký với server
      await this.registerDevice();

      // Lắng nghe sự kiện khi token thay đổi
      this.onTokenRefresh();

      // Lắng nghe thông báo khi ứng dụng đang mở
      this.onForegroundMessage();
      this.setupBackgroundHandler();

      return true;
    } catch (error) {
      console.error('Lỗi khi khởi tạo dịch vụ thông báo:', error);
      return false;
    }
  }

  async requestPermission() {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log('Quyền thông báo bị từ chối!');
      }
      return enabled;
    } catch (error) {
      console.error('Lỗi khi yêu cầu quyền thông báo:', error);
      return false;
    }
  }

  async createNotificationChannel() {
    if (Platform.OS === 'android') {
      try {
        await notifee.createChannel({
          id: 'default',
          name: 'Thông báo mặc định',
          importance: AndroidImportance.HIGH,
          sound: 'default', // Thêm âm thanh mặc định
          vibration: true,
          lights: true,
        });
      } catch (error) {
        console.error('Lỗi khi tạo kênh thông báo:', error);
      }
    }
  }
  

  async getToken() {
    try {
      // Nếu đã có token trong bộ nhớ, sử dụng nó
      if (this.token) {
        return this.token;
      }

      // Lấy token từ bộ nhớ cục bộ
      const savedToken = await AsyncStorage.getItem('fcmToken');

      if (savedToken) {
        console.log('Đang lấy FCM token từ bộ nhớ...',savedToken);
        
        this.token = savedToken;
        return savedToken;
      }

      // Nếu không có, lấy token mới từ FCM
      const newToken = await messaging().getToken();
      if (newToken) {
        this.token = newToken;
        console.log('Đang lấy FCM token từ bộ nhớ...',this.token);

        // Lưu token vào bộ nhớ cục bộ
        await AsyncStorage.setItem('fcmToken', newToken);
        return newToken;
      }
      return null;
    } catch (error) {
      console.error('Lỗi khi lấy FCM token:', error);
      return null;
    }
  }

  async registerDevice() {
    try {
      const token = await this.getToken();
      console.log('Đang đăng ký thiết bị...', token);

      if (!token) {
        console.log('Không thể đăng ký thiết bị: Không có token');
        return false;
      }

      const api = useApiStore.getState();
      await api.postData(`/devices`, {
        device_token: token,
      });

      console.log('Đã đăng ký thiết bị thành công');
      return true;
    } catch (error) {
      console.error('Lỗi khi đăng ký thiết bị:', error);
      return false;
    }
  }

  async unregisterDevice() {
    try {
      const tokenDevice = await AsyncStorage.getItem('fcmToken');
      const api = useApiStore.getState();
      await api.deleteNotification(`/devices`, {
        device_token: tokenDevice,
      });
  
      // Sau khi xóa thiết bị thành công, xóa token khỏi bộ nhớ
      await AsyncStorage.removeItem('fcmToken');
      this.token = null;
      console.log('Token hiện tại:', this.token);

      // Hủy đăng ký sự kiện lắng nghe thông báo nếu có
      if (this.messageUnsubscribe) {
        this.messageUnsubscribe();
        this.messageUnsubscribe = null;
      }
  
      console.log('Token đã được xóa khỏi bộ nhớ');
      return true;
    } catch (error) {
      console.error('Lỗi khi xóa thiết bị:', error);    
    }
  }

  onTokenRefresh() {
    // Lắng nghe khi token FCM thay đổi
    return messaging().onTokenRefresh(async token => {
      console.log('FCM token đã được làm mới:', token);

      // Lưu token mới
      this.token = token;
      await AsyncStorage.setItem('fcmToken', token);

      // Đăng ký lại thiết bị với token mới
      await this.registerDevice();
    });
  }

  onForegroundMessage() {
    // Xử lý thông báo khi ứng dụng đang mở
    this.messageUnsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('Nhận thông báo khi app đang mở:', remoteMessage);

      // Hiển thị thông báo bằng notifee
      await this.displayNotification(remoteMessage);
    });

    return this.messageUnsubscribe;
  }

  async displayNotification(remoteMessage: any) {
    try {
      const { notification, data } = remoteMessage;
  
      await notifee.displayNotification({
        title: notification?.title,
        body: notification?.body,
        android: {
          channelId: 'default',
          smallIcon: 'ic_notification', // Tên file không cần đuôi .png
          color: '#4A6FA5', // Màu nền icon
          pressAction: {
            id: 'default',
          },
        },
        data: data,
      });
    } catch (error) {
      console.error('Lỗi khi hiển thị thông báo:', error);
    }
  }
  

  // Xử lý khi nhấn vào thông báo
  setupNotificationOpenHandlers(navigation) {
    // Khi ứng dụng đang chạy nền và người dùng nhấn vào thông báo
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Thông báo đã được mở khi app đang chạy nền:', remoteMessage);
      // Xử lý điều hướng dựa trên dữ liệu thông báo
      this.handleNotificationNavigation(remoteMessage, navigation);
    });

    // Kiểm tra xem ứng dụng có được mở từ một thông báo không
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('Ứng dụng được mở từ thông báo:', remoteMessage);
          // Xử lý điều hướng dựa trên dữ liệu thông báo
          this.handleNotificationNavigation(remoteMessage, navigation);
        }
      });
  }

  // Hàm xử lý điều hướng khi nhấn vào thông báo
  handleNotificationNavigation(remoteMessage, navigation) {
    if (!navigation || !remoteMessage.data) return;

    const {data} = remoteMessage;

    // Điều hướng dựa trên loại thông báo
    // Ví dụ:
    switch (data.type) {
      case 'post':
        navigation.navigate('PostDetailScreen', {postId: data.postId});
        break;
      case 'schedule':
        navigation.navigate('ScheduleDetailScreen', {
          scheduleId: data.scheduleId,
        });
        break;
      default:
        // Mặc định điều hướng đến màn hình thông báo
        navigation.navigate('NotificationsScreen');
        break;
    }
  }
}

export default new NotificationService();
