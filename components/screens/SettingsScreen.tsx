import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import useAuthStore from '../utils/useAuthStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLoginStore } from '../utils/useLoginStore';
import { CommonActions, useFocusEffect } from '@react-navigation/native';
import CommonDialog from '../commons/CommonDialog';
import { CommonAvatar } from '../commons/CommonAvatar';
import NotificationService from '../services/NotificationService';
import { capitalizeFirstLetter } from '../utils/utils_format';
import useScheduleStore from '../utils/useScheduleStore';
const SettingsScreen = ({ navigation }: { navigation: any }) => {
  const { clearToken } = useAuthStore();
  const { clearAll, clear, profile, fetchUserProfile } = useLoginStore();
  const isExpert = profile?.roles?.includes('expert');
  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);
  const { clearExpertSchedule, clearHistorySchedules } = useScheduleStore();
  // useFocusEffect(
  //   useCallback(() => {
  //     fetchUserProfile();
  //   }, []),
  // );

  useEffect(() => {}, [profile]);

  async function handleLogout() {
    await NotificationService.unregisterDevice();
    const currentUser = auth().currentUser;
    if (currentUser) {
      const isGoogleUser = currentUser.providerData.some(
        provider => provider.providerId === 'google.com',
      );
      if (isGoogleUser) {
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
      }
      await auth().signOut();
    }
    await clearExpertSchedule();
    await clearHistorySchedules();
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('authTokenTimestamp');
    await clear();
    await clearToken();
    await clearAll();

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'LoginScreen' }],
      }),
    );
  }

  const handleRecruitPress = () => {
    navigation.navigate('SettingsRecruitmentsScreen');
  };

  const logoutButtons = [
    {
      label: 'Cancel',
      variant: 'text',
      handler: () => setShowLogoutDialog(false),
      iconName: 'close-circle-outline',
    },
    {
      label: 'Log Out',
      color: '#E74C3C',
      variant: 'contained',
      handler: handleLogout,
      iconName: 'log-out-outline',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Profile Header Section */}
          <View style={styles.profileSection}>
            <CommonAvatar
              mode={isExpert ? 'expert' : 'runner'}
              size={100}
              uri={profile?.image?.url}
            />
            <Text style={styles.profileName}>{profile?.name}</Text>

            <View style={styles.levelContainer}>
              <Text style={styles.levelText}>
                {capitalizeFirstLetter(profile?.user_level || 'Newbie')}
              </Text>
              {isExpert && (
                <View style={styles.expertBadge}>
                  <Icon name="trophy" size={12} color="white" />
                  <Text style={styles.expertBadgeText}>EXPERT</Text>
                </View>
              )}
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.max(profile?.points_percentage || 0, 2)}%`,
                    },
                  ]}
                />
              </View>
              <View style={styles.progressTextContainer}>
                <Text style={styles.progressText}>
                  {profile?.points || 0}/
                  {profile?.points_to_next_level + profile?.points || 500} Point
                </Text>
                <Text style={styles.nextLevelText}>
                  Next:{' '}
                  {capitalizeFirstLetter(
                    profile?.user_next_level || 'Beginner',
                  )}
                </Text>
              </View>
            </View>

            <View style={styles.statsGrid}>
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => navigation.navigate('UserPointsHistoryScreen')}>
                <View style={styles.statIconContainer}>
                  <Icon name="trophy" size={23} color="#2C3E50" />
                </View>
                <View>
                  <Text style={styles.statNumber}>{profile?.points || 0}</Text>
                  <Text style={styles.statLabel}>Points</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <Icon name="document-text" size={23} color="#2C3E50" />
                </View>
                <View>
                  <Text style={styles.statNumber}>
                    {profile?.total_posts || 0}
                  </Text>
                  <Text style={styles.statLabel}>Posts</Text>
                </View>
              </View>
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <Icon name="heart" size={23} color="#2C3E50" />
                </View>
                <View>
                  <Text style={styles.statNumber}>
                    {profile?.total_posts_liked || 0}
                  </Text>
                  <Text style={styles.statLabel}>Likes</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Menu Section */}
          <View style={styles.menuSection}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() =>
                  item.screen === ''
                    ? navigation.navigate('ErrorScreen', {
                      titleError: 'An error has occurred',
                      contentError: 'Page not found. Please return back',
                      errorStatus: 'ERROR_CODE: 500',
                    })
                    : navigation.navigate(item.screen)
                }>
                <View style={styles.iconContainer}>
                  <Icon name={item.icon as any} size={24} color="#4A6FA5" />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                <Icon name="chevron-forward" size={20} color="#888" />
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleRecruitPress}>
              <View style={styles.iconContainer}>
                <Icon name="people-outline" size={24} color="#4A6FA5" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Recruitments</Text>
                <Text style={styles.menuSubtitle}>
                  {isExpert
                    ? 'View your recruit status and certificates'
                    : 'Join our recruit program'}
                </Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#888" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutItem}
              onPress={() => setShowLogoutDialog(true)}>
              <View style={styles.iconContainer}>
                <Icon name="log-out-outline" size={24} color="#E74C3C" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.logoutText}>Logout</Text>
                <Text style={styles.menuSubtitle}>
                  Sign out of your account
                </Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#888" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Logout Dialog */}
      <CommonDialog
        visible={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        title="Confirm Logout"
        content={
          <View>
            <Text style={{ color: '#666', fontSize: 16 }}>
              Are you sure you want to log out?
            </Text>
          </View>
        }
        actionButtons={logoutButtons}
        width="85%"
      />
    </SafeAreaView>
  );
};

const menuItems = [
  {
    title: 'Profile',
    subtitle: 'View your profile information',
    icon: 'person-circle-outline',
    screen: 'RunnerProfileScreen',
  },
  {
    title: 'Schedules',
    subtitle: 'View your schedule information',
    icon: 'calendar-outline',
    screen: 'GeneralScheduleScreen',
  },
  {
    title: 'Bookmarks',
    subtitle: 'View your saving posts',
    icon: 'bookmark-outline',
    screen: 'DraftScreen',
  },
  {
    title: 'Manage Health Sync',
    subtitle: 'Manage your data sync methods',
    icon: 'construct-outline',
    screen: 'SettingsDevicesScreen',
  },
  {
    title: 'Notifications',
    subtitle: 'Manage your notifications',
    icon: 'notifications-outline',
    screen: 'DeviceNotificationsScreen',
  },
  {
    title: 'About',
    subtitle: 'App information and help',
    icon: 'information-circle-outline',
    screen: 'SettingsAboutScreen',
  },
];

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { paddingBottom: 80 },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 10,
    color: '#333',
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  levelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A6FA5',
    backgroundColor: '#EFF3F9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  expertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFA500',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  expertBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  progressContainer: { width: '100%', marginBottom: 20 },
  progressBar: {
    height: 8,
    width: '100%',
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressFill: { height: '100%', backgroundColor: '#4A6FA5', borderRadius: 4 },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  progressText: { fontSize: 13, color: '#666', fontWeight: '500' },
  nextLevelText: { fontSize: 13, color: '#4A6FA5', fontWeight: '500' },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 5,
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  statIconContainer: {
    backgroundColor: '#EFF3F9',
    width: 38,
    height: 38,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
  },
  menuSection: { marginTop: 10 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  iconContainer: { width: 40, alignItems: 'center' },
  menuTextContainer: { flex: 1, marginLeft: 10 },
  menuTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 3 },
  menuSubtitle: { fontSize: 13, color: '#888' },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    marginTop: 10,
  },
  logoutText: {
    fontSize: 16,
    color: '#E74C3C',
    fontWeight: '600',
    marginBottom: 3,
  },
});

export default SettingsScreen;
