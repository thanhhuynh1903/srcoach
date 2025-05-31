import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { theme } from '../../contants/theme';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import notifee, { AuthorizationStatus } from '@notifee/react-native';

const DeviceNotificationScreen = ({ navigation }) => {
  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    overall: true,
    posts: true,
    chats: true,
    news: true,
    reminders: true,
  });

  const checkNotificationPermission = useCallback(async () => {
    try {
      if (Platform.OS === 'android') {
        // For Android
        const settings = await notifee.getNotificationSettings();
        setHasNotificationPermission(settings.authorizationStatus === AuthorizationStatus.AUTHORIZED);
      } else {
        // For iOS
        const settings = await notifee.requestPermission();
        setHasNotificationPermission(settings.authorizationStatus === AuthorizationStatus.AUTHORIZED);
      }
    } catch (error) {
      console.error('Error checking notification permission:', error);
      setHasNotificationPermission(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkNotificationPermission();
    }, [checkNotificationPermission])
  );

  const requestNotificationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        // On Android, we need to create a notification channel
        await notifee.createChannel({
          id: 'default',
          name: 'Default Channel',
        });
      }

      const settings = await notifee.requestPermission({
        sound: true,
        announcement: true,
        inAppNotificationSettings: true,
      });

      if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {
        setHasNotificationPermission(true);
        Alert.alert(
          'Notifications Enabled',
          'You will now receive notifications from Smart Running Coach.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Permission Required',
          'To receive notifications, please enable them in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: openAppSettings },
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      Alert.alert(
        'Error',
        'There was an error while requesting notification permissions.',
        [{ text: 'OK' }]
      );
    }
  };

  const openAppSettings = () => {
    Linking.openSettings();
  };

  const toggleSwitch = (setting) => {
    if (setting === 'overall') {
      const newValue = !notificationSettings.overall;
      setNotificationSettings({
        overall: newValue,
        posts: newValue,
        chats: newValue,
        news: newValue,
        reminders: newValue,
      });
    } else {
      setNotificationSettings({
        ...notificationSettings,
        [setting]: !notificationSettings[setting],
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Fixed Header */}
      <LinearGradient
        colors={[theme.colors.primaryDark, theme.colors.primary]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Icon
            name="notifications-outline"
            size={24}
            color="white"
            style={styles.headerIcon}
          />
          <Text style={styles.title}>Notifications</Text>
        </View>
      </LinearGradient>

      {/* Scrollable Content */}
      <View style={styles.scrollContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Permission Banner */}
          {!hasNotificationPermission && (
            <View style={styles.permissionBanner}>
              <View style={styles.bannerIconContainer}>
                <Icon name="alert-circle" size={24} color="#fff" />
              </View>
              <View style={styles.bannerTextContainer}>
                <Text style={styles.bannerTitle}>Notifications are disabled</Text>
                <Text style={styles.bannerText}>
                  Enable notifications to stay updated with your running progress and coaching tips
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.enableButton}
                onPress={requestNotificationPermission}>
                <Text style={styles.enableButtonText}>Enable</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Notification Settings */}
          <View style={styles.settingsContainer}>
            <Text style={styles.sectionTitle}>Notification Settings</Text>
            
            {/* Overall Notifications */}
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Icon name="notifications" size={20} color={theme.colors.primary} />
                <Text style={styles.settingLabel}>Notifications</Text>
              </View>
              <Switch
                value={notificationSettings.overall && hasNotificationPermission}
                onValueChange={() => toggleSwitch('overall')}
                trackColor={{ false: "#767577", true: theme.colors.primaryLight }}
                thumbColor={notificationSettings.overall && hasNotificationPermission ? theme.colors.primary : "#f4f3f4"}
                disabled={true}
              />
            </View>

            <View style={styles.divider} />
       
          </View>

          {/* App Settings Link */}
          <TouchableOpacity 
            style={styles.settingsLink}
            onPress={openAppSettings}>
            <Icon name="settings" size={20} color={theme.colors.primary} />
            <Text style={styles.settingsLinkText}>Open Notification Settings</Text>
            <Icon name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          {/* Help Text */}
          <Text style={styles.helpText}>
            Customize how you receive notifications from Smart Running Coach. 
            Turning off notifications may cause you to miss important updates.
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  backButton: {
    marginRight: 10,
    zIndex: 1,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  headerIcon: {
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  permissionBanner: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  bannerIconContainer: {
    marginRight: 12,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  bannerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  enableButton: {
    backgroundColor: 'white',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 12,
  },
  enableButtonText: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  settingsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    padding: 16,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 16,
  },
  settingsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  settingsLinkText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default DeviceNotificationScreen;