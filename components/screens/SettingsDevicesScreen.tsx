import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import BackButton from '../BackButton';
const SettingsDevicesScreen = () => {
  const [samsungHealthEnabled, setSamsungHealthEnabled] = useState(false);
  const [healthConnectEnabled, setHealthConnectEnabled] = useState(false);

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

          {/* Samsung Health */}
          <View style={styles.appItem}>
            <View style={styles.samsungIconContainer}>
              <Text style={styles.samsungIconText}>samsung health</Text>
            </View>
            <View style={styles.appInfo}>
              <Text style={styles.appName}>Samsung Health</Text>
              <Text style={styles.appDescription}>
                Sync Samsung Health data
              </Text>
            </View>
            <Switch
              value={samsungHealthEnabled}
              onValueChange={setSamsungHealthEnabled}
              trackColor={{false: '#E2E8F0', true: '#CBD5E1'}}
              thumbColor={samsungHealthEnabled ? '#1E40AF' : '#FFFFFF'}
            />
          </View>

          {/* Health Connect */}
          <View style={styles.appItem}>
            <View style={styles.healthConnectIconContainer}>
              <View style={styles.healthConnectIcon}>
                <Icon name="heart" size={20} color="#4285F4" />
              </View>
            </View>
            <View style={styles.appInfo}>
              <Text style={styles.appName}>Health Connect</Text>
              <Text style={styles.appDescription}>Sync Google Health data</Text>
            </View>
            <Switch
              value={healthConnectEnabled}
              onValueChange={setHealthConnectEnabled}
              trackColor={{false: '#E2E8F0', true: '#CBD5E1'}}
              thumbColor={healthConnectEnabled ? '#1E40AF' : '#FFFFFF'}
            />
          </View>
        </View>

        {/* Sync Settings Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Sync Settings</Text>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="repeat-outline" size={18} color="#0EA5E9" />
              <Text style={styles.settingLabel}>Sync frequency</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>Every 3 hours</Text>
              {/* <Icon name="chevron-right" size={18} color="#64748B" /> */}
            </View>
          </TouchableOpacity>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="time-outline" size={18} color="#0EA5E9" />
              <Text style={styles.settingLabel}>Last synced: 2 hours ago</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Connect Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.connectButton}>
          <Text style={styles.connectButtonText}>Connect & Sync</Text>
        </TouchableOpacity>
      </View>
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
  samsungIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#1428A0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  samsungIconText: {
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: '700',
    textAlign: 'center',
  },
  healthConnectIconContainer: {
    marginRight: 12,
  },
  healthConnectIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  appInfo: {
    flex: 1,
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
  connectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default SettingsDevicesScreen;
