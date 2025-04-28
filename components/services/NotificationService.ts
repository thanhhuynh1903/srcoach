import messaging from '@react-native-firebase/messaging';
import notifee, {AndroidImportance} from '@notifee/react-native';
import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PermissionsAndroid } from 'react-native';
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
      console.log('Get background notifications', remoteMessage);
      try {
        // Đảm bảo không có thao tác UI ở đây
        await this.displayNotification(remoteMessage);
      } catch (error) {
        console.error('Background notification processing error:', error);
      }
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
      console.error('Error initializing notification service:', error);
      return false;
    }
  }

  async requestPermission() {
    try {
      // Xử lý quyền cho Android 13+
      if (Platform.OS === 'android') {
        // Kiểm tra phiên bản Android (API level 33+)
        if (Platform.Version >= 33) {
          const status = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
          
          if (status !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Android notification permission denied');
            return false;
          }
        }
      }

      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log('Firebase Notification Permission Denied!');
      }
      return enabled;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }


  async createNotificationChannel() {
    if (Platform.OS === 'android') {
      try {
        await notifee.createChannel({
          id: 'default',
          name: 'Default notification',
          importance: AndroidImportance.HIGH,
          sound: 'default', // Thêm âm thanh mặc định
          vibration: true,
          lights: true,
        });
      } catch (error) {
        console.error('Error creating notification channel:', error);
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
        this.token = savedToken;
        return savedToken;
      }

      // Nếu không có, lấy token mới từ FCM
      const newToken = await messaging().getToken();
      if (newToken) {
        this.token = newToken;

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
      console.log('Registering device...', token);

      if (!token) {
        console.log('Unable to register device: No token');
        return false;
      }

      const api = useApiStore.getState();
      await api.postData(`/devices`, {
        device_token: token,
        device_type: "android",
      });

      console.log('Device registered successfully');
      return true;
    } catch (error) {
      console.error('Error while registering device:', error);
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

      // Hủy đăng ký sự kiện lắng nghe thông báo nếu có
      if (this.messageUnsubscribe) {
        this.messageUnsubscribe();
        this.messageUnsubscribe = null;
      }

      console.log('Token has been cleared from memory');
      return true;
    } catch (error) {
      console.error('Error while deleting device:', error);
    }
  }

  onTokenRefresh() {
    // Lắng nghe khi token FCM thay đổi
    return messaging().onTokenRefresh(async token => {
      console.log('FCM token has been refreshed:', token);

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
  
      // Validate mạnh mẽ hơn
      if (!notification || typeof notification !== 'object') {
        console.log('Thông báo không hợp lệ: Không có notification object');
      }
  
      // Fallback cho các trường quan trọng
      const safeNotification = {
        title: notification?.title || 'Thông báo mới',
        body: notification?.body || 'Bạn có thông báo mới'
      };
  
      // Xử lý data an toàn
      const safeData = data || {};
      if (!safeData?.postId) {
        console.warn('Thông báo không có postId');
      }
  
      // Hiển thị thông báo với Notifee
      await notifee.displayNotification({
        title: safeNotification?.title,
        body: safeNotification?.body,
        data: safeData,
        android: {
          channelId: 'default',
          smallIcon: 'ic_launcher',
          pressAction: {
            id: 'default',
            launchActivity: 'default',
          },
          sound: 'default',
        },
      });
  
    } catch (error) {
      console.error('Lỗi hiển thị thông báo:', error);
      // Gửi lỗi đến crash reporting nếu cần
    }
  }
  // Xử lý khi nhấn vào thông báo
  setupNotificationOpenHandlers(navigation : any) {
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
  handleNotificationNavigation(remoteMessage: any, navigation : any) {
    if (!navigation || !remoteMessage.data) return;

    const {data} = remoteMessage;

    // Điều hướng dựa trên loại thông báo
    // Ví dụ:
    switch (data?.type) {
      case 'post':
        navigation.navigate('CommunityPostDetailScreen', {postId: data.postId});
        break;
      case 'schedule':
        navigation.navigate('GenerateScheduleScreen', {
          scheduleId: data?.scheduleId,
        });
        break;
      default:
        // Mặc định điều hướng đến màn hình thông báo
        navigation.navigate('ManageNotificationsScreen');
        break;
    }
  }
}

export default new NotificationService();
