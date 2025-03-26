import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import useAuthStore from '../utils/useAuthStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useLoginStore} from '../utils/useLoginStore';
import {useRegisterStore} from '../utils/useRegisterStore';
import {CommonActions} from '@react-navigation/native';

const SettingsScreen = ({navigation}: {navigation: any}) => {
  const {clearToken} = useAuthStore();
  const {clear} = useLoginStore();
  async function logout() {
    try {
      const currentUser = auth().currentUser;

      if (currentUser) {
        // Check if the current user is a Google user
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
      clearToken && clearToken();
      clear();
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
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <Image
          source={{uri: 'https://via.placeholder.com/100'}}
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>Sarah Johnson</Text>
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
            <Icon name={item.icon as any} size={24} color="#333" />
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <Icon name="chevron-forward" size={20} color="#888" />
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.logoutItem} onPress={logout}>
          <Icon name="log-out-outline" size={24} color="red" />
          <View style={styles.menuTextContainer}>
            <Text style={styles.logoutText}>Logout</Text>
            <Text style={styles.menuSubtitle}>Sign out of your account</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#888" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const menuItems = [
  {
    title: 'View Profile',
    subtitle: 'View your profile information',
    icon: 'person-circle-outline',
    screen: '',
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
    screen: 'SettingsDevices',
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
    screen: 'DeviceNotificationScreen',
  },
  {
    title: 'About',
    subtitle: 'App information and help',
    icon: 'information-circle-outline',
    screen: '',
  },
];

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 60},
  profileSection: {alignItems: 'center', marginBottom: 20},
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 40,
    marginBottom: 10,
    backgroundColor: '#cdcdcd',
  },
  profileName: {fontSize: 20, fontWeight: 'bold', marginBottom: 5},
  statsContainer: {flexDirection: 'row', gap: 15},
  statText: {fontSize: 16, color: '#555'},
  boldText: {fontWeight: 'bold', color: '#000'},
  menuSection: {marginTop: 10},
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  menuTextContainer: {flex: 1, marginLeft: 10},
  menuTitle: {fontSize: 16, fontWeight: 'bold'},
  menuSubtitle: {fontSize: 14, color: '#666'},
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  logoutText: {fontSize: 16, color: 'red', fontWeight: 'bold'},
});

export default SettingsScreen;
