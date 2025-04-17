import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import useAuthStore from '../utils/useAuthStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useLoginStore} from '../utils/useLoginStore';
import {CommonActions} from '@react-navigation/native';
import CommonDialog from '../commons/CommonDialog';

const SettingsScreen = ({navigation}: {navigation: any}) => {
  const {clearToken} = useAuthStore();
  const {clearAll, clear, profile} = useLoginStore();
  const isExpert = profile?.roles?.includes('expert');
  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);
  const [showExpertDialog, setShowExpertDialog] = React.useState(false);

  async function handleLogout() {
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
    await AsyncStorage.removeItem('authToken');
    await clear();
    await clearToken();
    await clearAll();
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: 'LoginScreen'}],
      }),
    );
  }

  const handleExpertPress = () => {
    if (isExpert) {
      navigation.navigate('UserCertificatesExpertsScreen');
    } else {
      setShowExpertDialog(true);
    }
  };

  const capitalizeFirstLetter = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);

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

  const expertButtons = [
    {
      label: 'Cancel',
      variant: 'text',
      handler: () => setShowExpertDialog(false),
      iconName: 'close-circle-outline',
    },
    {
      label: 'Continue',
      color: '#4A6FA5',
      variant: 'contained',
      handler: () => {
        setShowExpertDialog(false);
        navigation.navigate('UserCertificatesIntroScreen');
      },
      iconName: 'arrow-forward-outline',
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
            <Image
              source={{
                uri: profile?.image?.url
                  ? profile?.image?.url
                  : `data:image/jpeg;base64,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`,
              }}
              style={styles.profileImage}
            />
            <Text style={styles.profileName}>{profile?.username}</Text>

            <View style={styles.levelContainer}>
              <Text style={styles.levelText}>
                {capitalizeFirstLetter(profile?.user_level || 'Newbie')}
              </Text>
              {isExpert && (
                <View style={styles.expertBadge}>
                  <Icon name="ribbon" size={12} color="white" />
                  <Text style={styles.expertBadgeText}>EXPERT</Text>
                </View>
              )}
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {width: `${profile?.points_percentage || 10}%`},
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
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{profile?.points || 0}</Text>
                <Text style={styles.statLabel}>Points</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {profile?.total_posts || 0}
                </Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {profile?.total_posts_liked || 0}
                </Text>
                <Text style={styles.statLabel}>Likes</Text>
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
              style={[styles.expertItem, isExpert && styles.expertItemActive]}
              onPress={handleExpertPress}>
              <View style={styles.iconContainer}>
                <Icon
                  name={isExpert ? 'ribbon' : 'ribbon-outline'}
                  size={24}
                  color={isExpert ? '#4CAF50' : '#FFA500'}
                />
              </View>
              <View style={styles.menuTextContainer}>
                <Text
                  style={[
                    styles.expertTitle,
                    isExpert && styles.expertTitleActive,
                  ]}>
                  {isExpert ? 'Expert Dashboard' : 'Become an Expert'}
                </Text>
                <Text
                  style={[
                    styles.expertSubtitle,
                    isExpert && styles.expertSubtitleActive,
                  ]}>
                  {isExpert
                    ? 'View your expert status and certificates'
                    : 'Requires legal documents for verification'}
                </Text>
              </View>
              {!isExpert && (
                <View style={styles.legalBadge}>
                  <Text style={styles.legalBadgeText}>LEGAL</Text>
                </View>
              )}
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
            <Text style={{color: '#666', fontSize: 16}}>
              Are you sure you want to log out?
            </Text>
          </View>
        }
        actionButtons={logoutButtons}
        width="85%"
      />

      {/* Become Expert Dialog */}
      <CommonDialog
        visible={showExpertDialog}
        onClose={() => setShowExpertDialog(false)}
        title="Become an Expert"
        content={
          <View>
            <Text style={{color: '#666', fontSize: 16}}>
              This process requires submission of legal documents for
              verification. Are you ready to proceed?
            </Text>
          </View>
        }
        actionButtons={expertButtons}
        width="85%"
      />
    </SafeAreaView>
  );
};

const menuItems = [
  {
    title: 'View Profile',
    subtitle: 'View your profile information',
    icon: 'person-circle-outline',
    screen: 'RunnerProfileScreen',
  },
  {
    title: 'View schedules',
    subtitle: 'View your schedule information',
    icon: 'calendar-outline',
    screen: 'GenerateScheduleScreen',
  },
  {
    title: 'Connect Accounts',
    subtitle: 'Manage your connect account',
    icon: 'construct-outline',
    screen: 'DevicesScreen',
  },
  {
    title: 'Goals',
    subtitle: 'Manage your Goals',
    icon: 'golf-outline',
    screen: 'GoalListScreen',
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
  safeArea: {flex: 1, backgroundColor: '#fff'},
  scrollContainer: {paddingBottom: 80},
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    backgroundColor: '#e1e1e1',
    borderWidth: 3,
    borderColor: '#4A6FA5',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
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
    backgroundColor: '#4CAF50',
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
  progressContainer: {width: '100%', marginBottom: 20},
  progressBar: {
    height: 8,
    width: '100%',
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressFill: {height: '100%', backgroundColor: '#4A6FA5', borderRadius: 4},
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  progressText: {fontSize: 13, color: '#666', fontWeight: '500'},
  nextLevelText: {fontSize: 13, color: '#4A6FA5', fontWeight: '500'},
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  statItem: {alignItems: 'center', paddingHorizontal: 10},
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A6FA5',
    marginBottom: 2,
  },
  statLabel: {fontSize: 14, color: '#666'},
  menuSection: {marginTop: 10},
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  expertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#ffffff',
    marginVertical: 10,
    borderRadius: 8,
    paddingHorizontal: 0,
  },
  expertItemActive: {backgroundColor: '#F0F8F0', borderColor: '#4CAF50'},
  iconContainer: {width: 40, alignItems: 'center'},
  menuTextContainer: {flex: 1, marginLeft: 10},
  menuTitle: {fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 3},
  expertTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFA500',
    marginBottom: 3,
  },
  expertTitleActive: {color: '#4CAF50'},
  menuSubtitle: {fontSize: 13, color: '#888'},
  expertSubtitle: {fontSize: 13, color: '#FFA500', fontWeight: '500'},
  expertSubtitleActive: {color: '#4CAF50'},
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
  legalBadge: {
    backgroundColor: '#FFA500',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 10,
  },
  legalBadgeText: {color: 'white', fontSize: 10, fontWeight: 'bold'},
});

export default SettingsScreen;
