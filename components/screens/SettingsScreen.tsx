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

  async function logout() {
    try {
      const currentUser = auth().currentUser;

      if (currentUser) {
        const isGoogleUser = currentUser.providerData.some(
          provider => provider.providerId === 'google.com',
        );

        if (isGoogleUser) {
          // Sign out from Google if needed
          await GoogleSignin.revokeAccess();
          await GoogleSignin.signOut();
        }

        // Sign out from Firebase for both email/password and Google
        await auth().signOut();
      }

      // Clear token from AsyncStorage
      await AsyncStorage.removeItem('authToken');
      // If you have a clearToken function from your store, call it here.
      await clear();
      await clearToken();
      await clearAll();

      // Navigate to Login after all operations have finished
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{name: 'LoginScreen'}],
        }),
      );
      Alert.alert('Logged Out', 'You have been successfully logged out.');
    } catch (error: any) {
      console.error('Logout Error:', error);
      Alert.alert(
        'Logout Failed',
        error.message || 'Unable to log out. Please try again.',
      );
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.profileSection}>
            <Image
              source={{uri: 'https://via.placeholder.com/100'}}
              style={styles.profileImage}
            />
            <Text style={styles.profileName}>{profile?.username}</Text>
            <View style={styles.statsContainer}>
              <Text style={styles.statText}>
                <Text style={styles.boldText}>2,547</Text> Points
              </Text>
              <Text style={styles.statText}>
                <Text style={styles.boldText}>156</Text> Posts
              </Text>
            </View>
          </View>

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
    screen: '',
  },
];

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    paddingBottom: 80, // Added padding to account for bottom tab
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
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 60,
    marginBottom: 15,
    backgroundColor: '#e1e1e1',
    borderWidth: 3,
    borderColor: '#4A6FA5',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 25,
    marginTop: 10,
  },
  statText: {
    fontSize: 16,
    color: '#666',
  },
  boldText: {
    fontWeight: 'bold',
    color: '#4A6FA5',
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
  menuSubtitle: {
    fontSize: 13,
    color: '#888',
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
});

export default SettingsScreen;