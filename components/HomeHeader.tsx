import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {useNavigation} from '@react-navigation/native';
import {useLoginStore} from './utils/useLoginStore';
import {CommonAvatar} from './commons/CommonAvatar';
import { theme } from './contants/theme';

const HomeHeader = () => {
  const {profile} = useLoginStore();
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const navigation = useNavigation();

  const isExpert = profile?.roles?.includes('expert');
  const isRunner = profile?.roles?.includes('runner') && !isExpert;

  const getRoleText = () => {
    if (isExpert) return 'Expert';
    if (isRunner) return 'Runner';
    return (
      profile?.roles[0]?.charAt(0)?.toUpperCase() +
        profile?.roles[0]?.slice(1) || 'Member'
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={'light-content'} />

      {/* Date and Notification */}
      <View style={styles.topBar}>
        <Text style={styles.dateText}>
          {currentDate} • {currentTime}
        </Text>
        <View style={{flexDirection: 'row', gap: 16}}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('ManageNotificationsScreen' as never)
            }>
            <Icon name="notifications-outline" size={24} color={'#fff'} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('LeaderBoardScreen' as never)}>
            <Icon name="trophy-outline" size={24} color={'#fff'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* User Profile */}
      <TouchableOpacity
        style={styles.profileSection}
        onPress={() => navigation.navigate('RunnerProfileScreen' as never)}>
        <View style={styles.profileLeft}>
          <CommonAvatar
            mode={isExpert ? 'expert' : isRunner ? 'runner' : undefined}
            uri={
              profile?.avatar ||
              'https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg'
            }
            size={45}
          />
          <View style={styles.userInfo}>
            <Text style={styles.greeting}>Hi, {profile?.username}! 👋</Text>
            <View
              style={[
                styles.membershipContainer,
                isExpert && styles.expertMembershipContainer,
                isRunner && styles.runnerMembershipContainer,
              ]}>
              <Icon
                name={isExpert ? 'trophy' : isRunner ? 'walk' : 'star'}
                size={14}
                color={isExpert ? '#FFD700' : isRunner ? '#00FF00' : '#FFFFFF'}
                style={{marginRight: 4}}
              />
              <Text
                style={[
                  styles.membershipText,
                  isExpert && styles.expertText,
                  isRunner && styles.runnerText,
                ]}>
                {getRoleText()}
              </Text>
            </View>
          </View>
        </View>
        <Icon name="chevron-forward-outline" size={20} color={'#fff'} />
      </TouchableOpacity>

      {/* Search Bar */}
      <TouchableOpacity
        style={styles.searchContainer}
        onPress={() => {
          navigation.navigate('SearchScreen' as never);
        }}>
        <Icon name="search" size={20} color={'#FFFFFF'} />
        <Text style={styles.searchInput}>Search Experts</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1F2937',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateText: {
    color: '#e2e2e2',
    fontSize: 14,
  },
  profileSection: {
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
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  membershipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
  },
  expertMembershipContainer: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.5)',
  },
  runnerMembershipContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.5)',
  },
  membershipText: {
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    padding: 0,
  },
});

export default HomeHeader;
