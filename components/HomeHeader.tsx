import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Animated,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { useLoginStore } from './utils/useLoginStore';
import { CommonAvatar } from './commons/CommonAvatar';
import { startSyncData } from './utils/utils_healthconnect';
import NotificationBell from './NotificationRealtime';
const HomeHeader = ({ onSyncPress }: { onSyncPress?: () => void }) => {
  const { profile } = useLoginStore();
  const [time, setTime] = useState({ current: '', date: '' });
  const [searchIndex, setSearchIndex] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const syncSpinAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  const searchPlaceholders = [
    'Search for experts...',
    'Search for posts...',
    'Search for runners...',
  ];
  const roles = {
    expert: { text: 'Expert', icon: 'trophy', color: '#FFD700' },
    runner: { text: 'Runner', icon: 'walk', color: '#00FF00' },
    default: {
      text: profile?.roles[0]
        ? `${profile.roles[0][0].toUpperCase()}${profile.roles[0].slice(1)}`
        : 'Member',
      icon: 'star',
      color: '#FFFFFF',
    },
  };

  const role = profile?.roles?.includes('expert')
    ? 'expert'
    : profile?.roles?.includes('runner')
      ? 'runner'
      : 'default';

  const handleSyncPress = async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    startSyncAnimation();

    try {
      // Get current date and yesterday's date
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 1);

      await startSyncData(startDate.toISOString(), endDate.toISOString());
      if (onSyncPress) onSyncPress();
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
      stopSyncAnimation();
    }
  };

  const startSyncAnimation = () => {
    syncSpinAnim.setValue(0);
    Animated.loop(
      Animated.timing(syncSpinAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  };

  const stopSyncAnimation = () => {
    syncSpinAnim.stopAnimation();
  };

  const spin = syncSpinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime({
        current: now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        date: now.toLocaleDateString('en-US', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
      });
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setSearchIndex(prev => (prev + 1) % searchPlaceholders.length);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [fadeAnim]);

  useEffect(() => {
    const wave = () => {
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    };
    wave();
    const interval = setInterval(wave, 5000);
    return () => clearInterval(interval);
  }, [waveAnim]);

  const waveStyle = {
    transform: [
      {
        rotate: waveAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '30deg'],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.topBar}>
        <Text style={styles.dateText}>
          {time.date} • {time.current}
        </Text>
        <View style={styles.icons}>
          <TouchableOpacity onPress={handleSyncPress}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Icon
                name="sync-outline"
                size={24}
                color="#fff"
                style={isSyncing ? styles.syncingIcon : null}
              />
            </Animated.View>
          </TouchableOpacity>
          <NotificationBell
            onPress={() => navigation.navigate('ManageNotificationsScreen' as never)}
            iconColor='#fff'
          />
          <TouchableOpacity
            onPress={() => navigation.navigate('GeneralScheduleScreen' as never)}>
            <Icon name="calendar-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.profile}
        onPress={() => navigation.navigate('RunnerProfileScreen' as never)}>
        <View style={styles.profileLeft}>
          <CommonAvatar
            mode={
              role === 'expert'
                ? 'expert'
                : role === 'runner'
                  ? 'runner'
                  : undefined
            }
            uri={profile?.image?.url}
            size={45}
          />
          <View style={styles.userInfo}>
            <View style={styles.greeting}>
              <Text style={styles.greetingText}>Hi, {profile?.username}! </Text>
              <Animated.Text style={waveStyle}>👋</Animated.Text>
            </View>
            <View style={[styles.role, styles[`${role}Role`]]}>
              <Icon
                name={roles[role].icon}
                size={14}
                color={roles[role].color}
                style={styles.roleIcon}
              />
              <Text style={[styles.roleText, styles[`${role}Text`]]}>
                {roles[role].text}
              </Text>
            </View>
          </View>
        </View>
        <Icon name="chevron-forward-outline" size={20} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.search}
        onPress={() => navigation.navigate('SearchScreen' as never)}>
        <Icon name="search" size={20} color="#FFFFFF" />
        <Animated.Text style={[styles.searchText, { opacity: fadeAnim }]}>
          {searchPlaceholders[searchIndex]}
        </Animated.Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1F2937',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 16,
    paddingBottom: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  syncingIcon: {
    opacity: 0.7,
  },
  dateText: {
    color: '#e2e2e2',
    fontSize: 14,
  },
  icons: {
    flexDirection: 'row',
    gap: 16,
  },
  profile: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  greeting: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  greetingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  role: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
  },
  expertRole: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.5)',
  },
  runnerRole: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.5)',
  },
  roleIcon: {
    marginRight: 4,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  expertText: {
    color: '#FFD700',
  },
  runnerText: {
    color: '#00FF00',
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
  },
});

export default HomeHeader;
