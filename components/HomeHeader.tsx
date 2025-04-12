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
import LinearGradient from 'react-native-linear-gradient';

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

  // Container component that switches between View and LinearGradient based on role
  const Container = ({children}) => {
    if (isExpert) {
      return (
        <LinearGradient
          colors={['#FFD700', '#D4AF37', '#FFD700']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={[styles.container, styles.expertContainer]}>
          {children}
        </LinearGradient>
      );
    }
    return <View style={styles.container}>{children}</View>;
  };

  return (
    <Container>
      <StatusBar barStyle={isExpert ? 'dark-content' : 'light-content'} />

      {/* Date and Notification */}
      <View style={styles.topBar}>
        <Text style={[styles.dateText, isExpert && styles.expertDateText]}>
          {currentDate}
        </Text>
        <View style={{flexDirection: 'row', gap: 16}}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('ManageNotificationsScreen' as never)
            }>
            <Icon
              name="notifications-outline"
              size={24}
              color={isExpert ? '#000' : '#fff'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('LeaderBoardScreen' as never)}>
            <Icon
              name="nuclear-outline"
              size={24}
              color={isExpert ? '#000' : '#fff'}
            />
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
            style={[styles.avatar, isExpert && styles.expertAvatar]}
          />
          <View style={styles.userInfo}>
            <Text style={[styles.greeting, isExpert && styles.expertGreeting]}>
              Hi, {profile?.username}! 👋
            </Text>
            <View
              style={[
                styles.membershipContainer,
                isExpert && styles.expertContainer,
                isRunner && styles.runnerContainer,
              ]}>
              <Icon
                name={isExpert ? 'trophy' : isRunner ? 'footsteps' : 'star'}
                size={14}
                color={isExpert ? '#ffc400' : isRunner ? '#10B981' : '#000000'}
                style={isExpert ? {marginRight: 4} : {}}
              />
              <Text
                style={[
                  styles.membershipText,
                  isExpert && styles.expertText,
                  isRunner && styles.runnerText,
                ]}>
                {getRoleText()} {isExpert ? 'Member' : ''}
              </Text>
            </View>
          </View>
        </View>
        <Icon
          name="chevron-forward-outline"
          size={20}
          color={isExpert ? '#000' : '#9CA3AF'}
        />
      </TouchableOpacity>

      {/* Search Bar */}
      <TouchableOpacity
        style={[
          styles.searchContainer,
          isExpert && styles.expertSearchContainer,
        ]}
        onPress={() => {
          navigation.navigate('SearchScreen' as never);
        }}>
        <Icon name="search" size={20} color={isExpert ? '#555' : '#9CA3AF'} />
        <Text
          style={[styles.searchInput, isExpert && styles.expertSearchInput]}>
          Search Experts
        </Text>
      </TouchableOpacity>
    </Container>
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
  expertContainer: {
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
  expertDateText: {
    color: '#333',
    fontWeight: '500',
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
    borderWidth: 2,
    borderColor: 'transparent',
  },
  expertAvatar: {
    borderColor: '#000',
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
  expertGreeting: {
    color: '#000',
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
    backgroundColor: 'rgba(0, 0, 0, 1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    color: '#FFF',
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
    color: '#ffffff',
    fontWeight: '600',
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
  expertSearchContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  searchInput: {
    flex: 1,
    color: '#9CA3AF',
    fontSize: 14,
    padding: 0,
  },
  expertSearchInput: {
    color: '#333',
  },
});

export default HomeHeader;
