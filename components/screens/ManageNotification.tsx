import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Switch } from 'react-native-paper';
import Icon from '@react-native-vector-icons/ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackButton from '../BackButton';
import ScreenWrapper from '../ScreenWrapper';
import NotificationService from '../services/NotificationService';
import useApiStore from '../utils/zustandfetchAPI';
import { useNavigation } from '@react-navigation/native';
import { EventRegister } from 'react-native-event-listeners';
interface Notification {
  unread: boolean;
  type: string;
  message: string
  time: string;
  targetId: string;
  targetType: string;
  title: string;
  iconType: string;
  id: string;
}
const ManageNotification = () => {
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationStats, setNotificationStats] = useState({
    all: 0,
    unread: 0,
    likes: 0,
    comments: 0,
    schedule: 0
  });
  const navigation = useNavigation();
  const api = useApiStore(state => state);
  useEffect(() => {
    // Đăng ký lắng nghe sự kiện thông báo mới
    const newNotificationListener = EventRegister.addEventListener(
      'newNotification',
      remoteMessage => {
        console.log(
          'Nhận thông báo mới trong ManageNotification:',
          remoteMessage,
        );
        // Refresh danh sách thông báo khi có thông báo mới
        fetchNotifications();
      },
    );

    // Đăng ký lắng nghe sự kiện mở thông báo
    const notificationOpenedListener = EventRegister.addEventListener(
      'notificationOpened',
      remoteMessage => {
        console.log(
          'Thông báo được mở trong ManageNotification:',
          remoteMessage,
        );
        fetchNotifications();

        // Xử lý điều hướng nếu cần
        if (
          remoteMessage.data &&
          remoteMessage.data.targetType &&
          remoteMessage.data.targetId
        ) {
          handleNotificationNavigation(remoteMessage.data);
        }
      },
    );

    const handleNotificationNavigation = data => {
      switch (data.targetType) {
        case 'post':
          navigation.navigate('CommunityPostDetailScreen', { id: data.targetId });
          break;
        case 'schedule':
          navigation.navigate('GeneralScheduleScreen', {
            scheduleId: data.targetId,
          });
          break;
        default:
          break;
      }
    };

    // Dọn dẹp khi component unmount
    return () => {
      EventRegister.removeEventListener(newNotificationListener);
      EventRegister.removeEventListener(notificationOpenedListener);
    };
  }, []);

  // Tải trạng thái thông báo từ AsyncStorage khi component mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Lấy danh sách thông báo từ API
  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await api.fetchData('/devices/notifications/self');
      console.log('response', response);

      if (response && response.data) {
        // Chuyển đổi dữ liệu API thành định dạng hiển thị
        const formattedNotifications = response.data.map(notification => {
          // Xác định avatar dựa trên loại thông báo
          let avatar = 'https://i.pravatar.cc/100';
          let name = 'Hệ thống';

          // Trích xuất tên từ tiêu đề nếu có
          if (notification.title) {
            const nameMatch = notification.title.match(/([A-Za-z\s]+) đã/);
            if (nameMatch && nameMatch[1]) {
              name = nameMatch[1].trim();
            }
          }

          // Xác định loại icon dựa trên loại thông báo
          let iconType = 'notifications-outline';
          if (notification.type === 'post_like') {
            iconType = 'heart-outline';
          } else if (notification.type === 'post_comment') {
            iconType = 'chatbubble-outline';
          }

          return {
            id: notification.id,
            avatar: avatar,
            name: name,
            message: notification.message,
            time: formatTimeAgo(notification.created_at),
            unread: !notification.is_read,
            type: notification.type,
            targetId: notification.target_id,
            targetType: notification.target_type,
            title: notification.title,
            iconType: iconType,
          };
        });

        setNotifications(formattedNotifications);

        // Tính toán số lượng thông báo cho từng tab
        const stats = {
          all: formattedNotifications.length,
          likes: formattedNotifications.filter(n => n.type === 'post_like')
            .length,
          comments: formattedNotifications.filter(
            n => n.type === 'post_comment',
          ).length,
          schedule: formattedNotifications.filter(
            n =>
              n.type.startsWith('schedule_') ||
              n.type === 'schedule_updated' ||
              n.type === 'schedule_deleted',
          ).length,
        };
        setNotificationStats(stats);
      }
    } catch (error) {
      console.error('Lỗi khi tải thông báo:', error);
      Alert.alert('Lỗi', 'Không thể tải thông báo. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Xử lý kéo để làm mới
  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleNotificationPress = (notification: any) => {
    // Điều hướng dựa trên loại thông báo
    if (notification.targetType && notification.targetId) {
      switch (notification.targetType) {
        case 'post':
          navigation.navigate('CommunityPostDetailScreen', {
            id: notification.targetId,
          });
          break;
        case 'schedule':
          navigation.navigate('GeneralScheduleScreen', {
            scheduleId: notification.targetId,
          });
          break;
        default:
          // Không làm gì nếu không có hành động cụ thể
          break;
      }
    }
  };

  // Chuyển đổi thời gian thành định dạng "X ago"
  const formatTimeAgo = dateString => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  // Lọc thông báo dựa trên tab đang chọn
  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'likes':
        return notifications.filter(
          notification => notification.type === 'post_like',
        );
      case 'comments':
        return notifications.filter(
          notification => notification.type === 'post_comment',
        );
      case 'schedule':
        return notifications.filter(
          notification =>
            notification.type.startsWith('schedule_') ||
            notification.type === 'schedule_updated' ||
            notification.type === 'schedule_deleted'
        );
      default:
        return notifications;
    }
  };

  // Mở màn hình cài đặt thông báo chi tiết
  const openNotificationSettings = () => {
    navigation.navigate('DeviceNotificationsScreen' as never);
  };

  const tabs = [
    { id: 'all', label: 'All', count: notificationStats.all },
    { id: 'schedule', label: 'Schedule', count: notificationStats.schedule },
    { id: 'likes', label: 'Likes', count: notificationStats.likes },
    { id: 'comments', label: 'Comments', count: notificationStats.comments },
  ];

  const filteredNotifications = getFilteredNotifications();

  const getNotificationIcon = (type: any) => {
    switch (type) {
      case 'post_like':
        return <Icon name="heart" size={16} color="#FF3B30" />;
      case 'post_comment':
        return <Icon name="chatbubble" size={16} color="#007AFF" />;
      default:
        return <Icon name="notifications" size={16} color="#34C759" />;
    }
  };

  return (
    <ScreenWrapper bg={'#FFF'}>
      <View style={{ backgroundColor: '#FFF' }}>
        <View
          style={{
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#FFF',
            marginTop: 16,
          }}>
          <BackButton size={26} />
          <Text style={{ fontSize: 18, fontWeight: '600', marginLeft: 8 }}>
            Notification
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.manageButton}
        onPress={openNotificationSettings}>
        <Text style={styles.manageButtonText}>Manage Notifications</Text>
      </TouchableOpacity>

      <View style={styles.tabContainer}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            onPress={() => setActiveTab(tab.id)}>
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText,
              ]}>
              {tab.label}
              {tab.count > 0 && (
                <Text style={styles.tabCount}>
                  {' '}
                  {'('}
                  {tab.count}
                  {')'}
                </Text>
              )}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={[styles.notificationList, { backgroundColor: '#F2F2F7' }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {isLoading && !refreshing ? (
          <ActivityIndicator
            style={styles.loader}
            size="large"
            color="#007AFF"
          />
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map(notification => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationItem,
                notification.unread && styles.unreadItem,
              ]}
              onPress={() => handleNotificationPress(notification)}>
              <View style={styles.iconContainer}>
                {getNotificationIcon(notification.type)}
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle} numberOfLines={1}>
                  {notification.title || 'New announcement'}
                </Text>
                <Text style={styles.notificationText} numberOfLines={2}>
                  {notification.message}
                </Text>
                <Text style={styles.notificationTime}>{notification.time}</Text>
              </View>
              <View style={styles.notificationRight}>
                {notification.unread && <View style={styles.unreadDot} />}
                <Icon name="chevron-forward" size={20} color="#8E8E93" />
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="notifications-off-outline" size={50} color="#C7C7CC" />
            <Text style={styles.emptyText}>No announcements yet</Text>
            <Text style={styles.emptySubtext}>
              We will notify you when something important happens.
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    marginTop: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  manageButton: {
    backgroundColor: '#052658',
    marginHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 18,
    borderRadius: 8,
    alignItems: 'center',
  },
  manageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginTop: 16,
    marginBottom: 8,
    gap: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  activeTab: {
    backgroundColor: '#052658',
  },
  tabText: {
    fontSize: 13,
    color: '#666',
  },
  activeTabText: {
    color: '#F3F4F6',
  },
  tabCount: {
    color: '#8E8E93',
  },
  notificationList: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    marginBottom: 1,
  },
  unreadItem: {
    backgroundColor: '#F0F7FF',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
    marginLeft: 12,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#3C3C43',
  },
  notificationTime: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 4,
  },
  notificationRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginRight: 8,
  },
  loader: {
    marginTop: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
});

export default ManageNotification;
