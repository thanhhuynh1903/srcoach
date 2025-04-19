import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import BackButton from '../../BackButton';
import {
  initialize,
  requestPermission,
  readRecords,
  revokeAllPermissions,
} from 'react-native-health-connect';
import {Image} from 'react-native';
import logo_health_connect from '../../assets/logo_health_connect.png';
import logo_samsung_health from '../../assets/logo_samsung_health.png';
import {theme} from '../../contants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {format, formatDistanceToNow} from 'date-fns';
import CommonDialog from '../../commons/CommonDialog';

const syncFrequencyOptions = [
  {label: 'Never', value: 0},
  {label: '1 minute', value: 1},
  {label: '2 minutes', value: 2},
  {label: '5 minutes', value: 5},
  {label: '10 minutes', value: 10},
  {label: '30 minutes', value: 30},
  {label: '1 hour', value: 60},
  {label: '2 hours', value: 120},
  {label: '6 hours', value: 360},
  {label: '12 hours', value: 720},
  {label: '24 hours', value: 1440},
];

const SettingsDevicesScreen = () => {
  const [samsungHealthEnabled, setSamsungHealthEnabled] = useState(false);
  const [healthConnectEnabled, setHealthConnectEnabled] = useState(false);
  const [syncFrequency, setSyncFrequency] = useState(180);
  const [showFrequencyModal, setShowFrequencyModal] = useState(false);
  const [lastSynced, setLastSynced] = useState('Never');
  const [healthConnectError, setHealthConnectError] = useState<string | null>(
    null,
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({
    title: '',
    content: '',
    buttons: [] as Array<{label: string; handler: () => void}>,
  });

  const showDialog = (
    title: string,
    content: string,
    buttons = [{label: 'OK', handler: () => setDialogVisible(false)}],
  ) => {
    setDialogConfig({title, content, buttons});
    setDialogVisible(true);
  };

  // Check Health Connect status and last sync time on component mount
  useEffect(() => {
    const init = async () => {
      await checkHealthConnectStatus();
      await loadLastSyncTime();
      setInitializing(false);
    };
    init();
  }, []);

  const checkHealthConnectStatus = async () => {
    try {
      const isInitialized = await initialize();
      setHealthConnectEnabled(isInitialized);
      setHealthConnectError(null);
    } catch (error) {
      setHealthConnectError(
        'Failed to initialize Health Connect. Please make sure the app is installed and try again.',
      );
      setHealthConnectEnabled(false);
    }
  };

  const loadLastSyncTime = async () => {
    try {
      const timestamp = await AsyncStorage.getItem('syncDataTimestamp');
      if (timestamp) {
        const date = new Date(parseInt(timestamp, 10));
        setLastSynced(formatDistanceToNow(date, {addSuffix: true}));
      }
    } catch (error) {
      console.error('Failed to load last sync time:', error);
    }
  };

  const toggleHealthConnect = async () => {
    if (healthConnectEnabled) {
      // Turning off - revoke permissions
      try {
        await revokeAllPermissions();
        setHealthConnectEnabled(false);
        setHealthConnectError(null);
      } catch (error) {
        showDialog(
          'Error',
          'Failed to revoke Health Connect permissions. Please try again.',
        );
      }
    } else {
      // Turning on - request permissions
      try {
        const granted = await requestPermission([
          {accessType: 'read', recordType: 'Steps'},
          {accessType: 'read', recordType: 'Distance'},
          {accessType: 'read', recordType: 'ActiveCaloriesBurned'},
          // Add other required permissions here
        ]);

        if (granted) {
          setHealthConnectEnabled(true);
          setHealthConnectError(null);
        } else {
          showDialog(
            'Permission Required',
            'Health Connect permissions are required to sync data.',
          );
        }
      } catch (error) {
        setHealthConnectError(
          'Failed to request Health Connect permissions. Please try again.',
        );
        setHealthConnectEnabled(false);
      }
    }
  };

  const handleSyncNow = async () => {
    if (!healthConnectEnabled) {
      showDialog(
        'Sync disabled',
        'Please enable one of the following sync options to sync data.',
      );
      return;
    }

    setIsSyncing(true);
    try {
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real app, you would actually sync data here
      // const steps = await readRecords('Steps', {timeRangeFilter: {...}});
      // Process and store the data...

      // Update last sync time
      const now = new Date();
      await AsyncStorage.setItem('syncDataTimestamp', now.getTime().toString());
      setLastSynced(formatDistanceToNow(now, {addSuffix: true}));

      showDialog('Success', 'Data synced successfully');
    } catch (error) {
      showDialog('Error', 'Failed to sync data. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  const getFrequencyLabel = () => {
    const option = syncFrequencyOptions.find(
      opt => opt.value === syncFrequency,
    );
    return option ? option.label : 'Every 3 hours';
  };

  if (initializing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderWidth: 1,
          borderColor: '#F1F5F9',
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#FFF',
        }}>
        <BackButton size={26} />
        <Text style={{fontSize: 18, fontWeight: '600', marginLeft: 8}}>
          Manage connected accounts
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Sync Your Health Data</Text>
          <Text style={styles.headerDescription}>
            Connect your favorite health apps to sync and manage all your health
            data in one place.
          </Text>
        </View>

        {/* Available Apps Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Available Apps</Text>
          <Text style={styles.sectionSubtitle}>Select apps to sync data</Text>

          {/* Samsung Health - Disabled */}
          <View style={[styles.appItem, styles.unsupportedApp]}>
            <View style={styles.samsungIconContainer}>
              <Image
                source={logo_samsung_health}
                style={{width: 36, height: 36, resizeMode: 'cover'}}
              />
            </View>
            <View style={styles.appInfo}>
              <Text style={styles.appName}>Samsung Health</Text>
              <Text style={styles.appDescription}>Currently unsupported</Text>
            </View>
            <View style={styles.switchContainer}>
              <Switch
                value={false}
                disabled
                trackColor={{false: '#E2E8F0', true: '#CBD5E1'}}
                thumbColor="#E2E8F0"
              />
            </View>
          </View>

          {/* Health Connect */}
          <View style={styles.appItem}>
            <View style={styles.healthConnectIconContainer}>
              <View style={styles.healthConnectIcon}>
                <Image
                  source={logo_health_connect}
                  style={{width: 36, height: 36, resizeMode: 'cover'}}
                />
              </View>
            </View>
            <View style={styles.appInfo}>
              <Text style={styles.appName}>Health Connect</Text>
              <Text style={styles.appDescription}>Sync Google Health data</Text>
              {healthConnectError ? (
                <View style={styles.errorContainer}>
                  <Icon
                    name="warning-outline"
                    size={14}
                    color={theme.colors.error}
                  />
                  <Text style={styles.errorText}>{healthConnectError}</Text>
                </View>
              ) : healthConnectEnabled ? (
                <Text style={styles.noteText}>
                  Note: For this to work, your app associated with running
                  devices must be linked to this as well
                </Text>
              ) : null}
            </View>
            <View style={styles.switchContainer}>
              <Switch
                value={healthConnectEnabled}
                onValueChange={toggleHealthConnect}
                trackColor={{false: '#E2E8F0', true: '#CBD5E1'}}
                thumbColor={healthConnectEnabled ? '#1E40AF' : '#FFFFFF'}
              />
            </View>
          </View>
        </View>

        {/* Sync Settings Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Sync Settings</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setShowFrequencyModal(true)}>
            <View style={styles.settingLeft}>
              <Icon name="repeat-outline" size={18} color="#0EA5E9" />
              <Text style={styles.settingLabel}>Sync frequency</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>{getFrequencyLabel()}</Text>
              <Icon name="chevron-forward" size={18} color="#64748B" />
            </View>
          </TouchableOpacity>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="time-outline" size={18} color="#0EA5E9" />
              <Text style={styles.settingLabel}>Last synced: {lastSynced}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sync Now Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.connectButton,
            isSyncing && styles.connectButtonDisabled,
          ]}
          onPress={handleSyncNow}
          disabled={isSyncing}>
          {isSyncing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.connectButtonText}>Sync Now</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Sync Frequency Modal */}
      <Modal
        visible={showFrequencyModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFrequencyModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Sync Frequency</Text>
            <ScrollView style={styles.frequencyOptions}>
              {syncFrequencyOptions.map(option => (
                <Pressable
                  key={option.value}
                  style={({pressed}) => [
                    styles.frequencyOption,
                    pressed && styles.frequencyOptionPressed,
                    syncFrequency === option.value &&
                      styles.frequencyOptionSelected,
                  ]}
                  onPress={() => {
                    setSyncFrequency(option.value);
                    setShowFrequencyModal(false);
                  }}>
                  <Text style={styles.frequencyOptionText}>{option.label}</Text>
                  {syncFrequency === option.value && (
                    <Icon name="checkmark" size={18} color="#1E40AF" />
                  )}
                </Pressable>
              ))}
            </ScrollView>
            <Pressable
              style={styles.modalCloseButton}
              onPress={() => setShowFrequencyModal(false)}>
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Common Dialog */}
      <CommonDialog
        visible={dialogVisible}
        onClose={() => setDialogVisible(false)}
        title={dialogConfig.title}
        content={<Text>{dialogConfig.content}</Text>}
        actionButtons={dialogConfig.buttons.map(button => ({
          label: button.label,
          handler: button.handler,
          variant: 'contained' as const,
        }))}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  unsupportedApp: {
    opacity: 0.6,
    backgroundColor: '#F8FAFC',
  },
  samsungIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  healthConnectIconContainer: {
    marginRight: 12,
  },
  healthConnectIcon: {
    width: 36,
    height: 36,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  appInfo: {
    flex: 1,
    marginRight: 12, // Added margin to prevent text from overlapping switch
  },
  switchContainer: {
    width: 50, // Fixed width for switch container
  },
  appName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: 2,
  },
  appDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  noteText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    fontStyle: 'italic',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.error,
    marginLeft: 4,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 14,
    color: '#0F172A',
    marginLeft: 12,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 14,
    color: '#64748B',
    marginRight: 8,
  },
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  connectButton: {
    backgroundColor: '#0F2B5B',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  connectButtonDisabled: {
    opacity: 0.7,
  },
  connectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 16,
    textAlign: 'center',
  },
  frequencyOptions: {
    marginBottom: 16,
  },
  frequencyOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  frequencyOptionPressed: {
    backgroundColor: '#F8FAFC',
  },
  frequencyOptionSelected: {
    backgroundColor: '#EFF6FF',
  },
  frequencyOptionText: {
    fontSize: 16,
    color: '#0F172A',
  },
  modalCloseButton: {
    padding: 12,
    backgroundColor: theme.colors.primaryDark,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default SettingsDevicesScreen;
