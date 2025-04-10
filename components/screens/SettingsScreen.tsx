import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
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

const SettingsScreen = ({navigation}: {navigation: any}) => {
  const {clearToken} = useAuthStore();
  const {clearAll, clear, profile} = useLoginStore();
  const isExpert = profile?.roles?.includes('expert');

  async function logout() {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
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
          },
        },
      ],
      {cancelable: true},
    );
  }

  const handleExpertPress = () => {
    if (isExpert) {
      navigation.navigate('UserCertificatesExpertsScreen');
    } else {
      Alert.alert(
        'Become an Expert',
        'This process requires submission of legal documents for verification. Are you ready to proceed?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Continue',
            onPress: () => navigation.navigate('UserCertificatesIntroScreen'),
          },
        ],
      );
    }
  };

  // Capitalize first letter of user level
  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Profile Header Section */}
          <View style={styles.profileSection}>
            <Image
              source={{uri: `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 100)}.jpg`}}
              style={styles.profileImage}
            />
            <Text style={styles.profileName}>{profile?.username}</Text>
            
            {/* Level Badge */}
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
            
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    {width: `${profile?.points_percentage || 10}%`}
                  ]} 
                />
              </View>
              <View style={styles.progressTextContainer}>
                <Text style={styles.progressText}>
                  {profile?.points || 0}/{profile?.points_to_next_level + profile?.points || 500} XP
                </Text>
                <Text style={styles.nextLevelText}>
                  Next: {capitalizeFirstLetter(profile?.user_next_level || 'Beginner')}
                </Text>
              </View>
            </View>
            
            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{profile?.points || 0}</Text>
                <Text style={styles.statLabel}>Points</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{profile?.total_posts || 0}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{profile?.total_posts_liked || 0}</Text>
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
              style={[
                styles.expertItem,
                isExpert && styles.expertItemActive,
              ]}
              onPress={handleExpertPress}>
              <View style={styles.iconContainer}>
                <Icon 
                  name={isExpert ? "ribbon" : "ribbon-outline"} 
                  size={24} 
                  color={isExpert ? "#4CAF50" : "#FFA500"} 
                />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={[
                  styles.expertTitle,
                  isExpert && styles.expertTitleActive
                ]}>
                  {isExpert ? 'Expert Dashboard' : 'Become an Expert'}
                </Text>
                <Text style={[
                  styles.expertSubtitle,
                  isExpert && styles.expertSubtitleActive
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

            <TouchableOpacity style={styles.logoutItem} onPress={logout}>
              <View style={styles.iconContainer}>
                <Icon name="log-out-outline" size={24} color="#E74C3C" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.logoutText}>Logout</Text>
                <Text style={styles.menuSubtitle}>Sign out of your account</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#888" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    title: 'Edit Profile',
    subtitle: 'Change your profile information',
    icon: 'create-outline',
    screen: 'EditProfileScreen',
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
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    paddingBottom: 80,
  },
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
  progressContainer: {
    width: '100%',
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    width: '100%',
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A6FA5',
    borderRadius: 4,
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  progressText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  nextLevelText: {
    fontSize: 13,
    color: '#4A6FA5',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A6FA5',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  menuSection: {
    marginTop: 10,
  },
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
  expertItemActive: {
    backgroundColor: '#F0F8F0',
    borderColor: '#4CAF50',
  },
  iconContainer: {
    width: 40,
    alignItems: 'center',
  },
  menuTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  expertTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFA500',
    marginBottom: 3,
  },
  expertTitleActive: {
    color: '#4CAF50',
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#888',
  },
  expertSubtitle: {
    fontSize: 13,
    color: '#FFA500',
    fontWeight: '500',
  },
  expertSubtitleActive: {
    color: '#4CAF50',
  },
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
  legalBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;