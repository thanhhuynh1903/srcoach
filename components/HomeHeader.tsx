import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {useNavigation} from '@react-navigation/native';
import {useLoginStore} from './utils/useLoginStore';

const HomeHeader = () => {
  const {profile} = useLoginStore();
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const navigation = useNavigation();

  // Check user roles
  const isExpert = profile?.roles?.includes('expert');
  const isRunner = profile?.roles?.includes('runner') && !isExpert;

  // Capitalize first letter of role
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
      <StatusBar barStyle="light-content" />

      {/* Date and Notification */}
      <View style={styles.topBar}>
        <Text style={styles.dateText}>{currentDate}</Text>
        <View style={{flexDirection: 'row', gap: 16}}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('ManageNotificationsScreen' as never)
            }>
            <Icon name="notifications-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('LeaderBoardScreen' as never)}>
            <Icon name="nuclear-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* User Profile */}
      <TouchableOpacity
        style={styles.profileSection}
        onPress={() => navigation.navigate('RunnerProfileScreen' as never)}>
        <View style={styles.profileLeft}>
          <Image
            source={{
              uri: 'https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg',
            }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.greeting}>Hi, {profile?.username}! 👋</Text>
            <View
              style={[
                styles.membershipContainer,
                isExpert && styles.expertContainer,
                isRunner && styles.runnerContainer,
              ]}>
              <Icon
                name={isExpert ? 'trophy' : 'star'}
                size={12}
                color={isExpert ? '#FFD700' : isRunner ? '#10B981' : '#FFD700'}
              />
              <Text
                style={[
                  styles.membershipText,
                  isExpert && styles.expertText,
                  isRunner && styles.runnerText,
                ]}>
                {getRoleText()} {isExpert ? 'Member' : ''}
              </Text>
              {isRunner && (
                <Icon
                  name="footsteps"
                  size={12}
                  color="#10B981"
                  style={{marginLeft: 4}}
                />
              )}
            </View>
          </View>
        </View>
        <Icon name="chevron-forward-outline" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      {/* Search Bar */}
      <TouchableOpacity
        style={styles.searchContainer}
        onPress={() => {
          navigation.navigate('SearchScreen' as never);
        }}>
        <Icon name="search" size={20} color="#9CA3AF" />
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
    color: '#9CA3AF',
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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
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
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  expertContainer: {
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
  },
  runnerContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  membershipText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
  },
  expertText: {
    color: '#FBBF24',
  },
  runnerText: {
    color: '#10B981',
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
    color: '#9CA3AF',
    fontSize: 14,
    padding: 0,
  },
});

export default HomeHeader;
