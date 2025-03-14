import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Switch} from 'react-native-paper';
import Icon from '@react-native-vector-icons/ionicons';
import BackButton from '../BackButton';
import ScreenWrapper from '../ScreenWrapper';
const ManageNotification = () => {
  const [isSwitchOn, setIsSwitchOn] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState('all');

  const notifications = [
    {
      id: 1,
      avatar: 'https://i.pravatar.cc/100?img=1',
      name: 'Alex Johnson',
      message: 'liked your post',
      time: '2m ago',
      unread: true,
    },
    {
      id: 2,
      avatar: 'https://i.pravatar.cc/100?img=2',
      name: 'Sarah Wilson',
      message: 'commented on your photo',
      time: '15m ago',
      unread: true,
    },
    {
      id: 3,
      avatar: 'https://i.pravatar.cc/100?img=3',
      name: 'Michael Brown',
      message: 'started following you',
      time: '45m ago',
      unread: true,
    },
    {
      id: 4,
      avatar: 'https://i.pravatar.cc/100?img=4',
      name: 'Emily Davis',
      message: 'mentioned you in a comment',
      time: '1h ago',
      unread: false,
    },
    {
      id: 5,
      avatar: 'https://i.pravatar.cc/100?img=5',
      name: 'David Miller',
      message: 'liked your comment',
      time: '2h ago',
      unread: false,
    },
  ];

  const tabs = [
    {id: 'all', label: 'All', count: 12},
    {id: 'unread', label: 'Unread', count: 3},
    {id: 'mentions', label: 'Mentions', count: 2},
    {id: 'comments', label: 'Comments', count: null},
  ];

  return (
    <ScreenWrapper bg={'#FFF'}>
      <View style={{backgroundColor: '#FFF'}}>
        <View
          style={{
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#FFF',
          }}>
          <BackButton size={26} />
          <Text style={{fontSize: 18, fontWeight: '600', marginLeft: 8}}>
            View Devices
          </Text>
        </View>
      </View>

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={{backgroundColor: '#007AFF', padding: 5, borderRadius: 50}}>
            <Icon name="notifications-outline" size={24} color="#FFF" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>Push Notifications</Text>
            <Text style={styles.subtitle}>Manage your alerts</Text>
          </View>
        </View>
        <Switch
          value={isSwitchOn}
          onValueChange={() => setIsSwitchOn(!isSwitchOn)}
        />
      </View>

      <TouchableOpacity style={styles.manageButton}>
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
              {tab.count && <Text style={styles.tabCount}> {tab.count}</Text>}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={[styles.notificationList, {backgroundColor: '#F2F2F7'}]}>
        {notifications.map(notification => (
          <TouchableOpacity
            key={notification.id}
            style={styles.notificationItem}>
            <Image source={{uri: notification.avatar}} style={styles.avatar} />
            <View style={styles.notificationContent}>
              <Text style={styles.notificationText}>
                <Text style={styles.notificationName}>{notification.name}</Text>{' '}
                {notification.message}
              </Text>
              <Text style={styles.notificationTime}>{notification.time}</Text>
            </View>
            <View style={styles.notificationRight}>
              {notification.unread && <View style={styles.unreadDot} />}
              <Icon name="chevron-forward" size={20} color="#8E8E93" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerText: {
    marginLeft: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  manageButton: {
    backgroundColor: '#052658',
    marginHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 18,
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
    fontSize: 14,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  notificationContent: {
    flex: 1,
    marginLeft: 12,
  },
  notificationText: {
    fontSize: 14,
    marginBottom: 4,
  },
  notificationName: {
    fontWeight: '600',
  },
  notificationTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  notificationRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
});

export default ManageNotification;
