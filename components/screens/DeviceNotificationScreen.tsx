import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import BackButton from '../BackButton';
const DeviceNotificationScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <BackButton size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Application notifications</Text>
      </View>
      <StatusBar barStyle="dark-content" />

      <View style={styles.content}>
        {/* Bell Icon */}
        <View style={styles.iconContainer}>
          <Icon name="notifications-outline" size={60} color="#FFFFFF" />
        </View>

        {/* Heading */}
        <Text style={styles.heading}>Stay Updated</Text>
        <Text style={styles.subheading}>Never miss important updates</Text>

        {/* Benefits List */}
        <View style={styles.benefitsContainer}>
          <View style={styles.benefitItem}>
            <View style={styles.benefitIconContainer}>
              <Icon name="notifications" size={18} color="#002B5B" />
            </View>
            <Text style={styles.benefitText}>
              Get instant updates about your activity
            </Text>
          </View>

          <View style={styles.benefitItem}>
            <View style={styles.benefitIconContainer}>
              <Icon name="gift" size={18} color="#002B5B" />
            </View>
            <Text style={styles.benefitText}>
              Stay informed about special offers
            </Text>
          </View>

          <View style={styles.benefitItem}>
            <View style={styles.benefitIconContainer}>
              <Icon name="shield" size={18} color="#002B5B" />
            </View>
            <Text style={styles.benefitText}>
              Receive important security alerts
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity style={styles.allowButton}>
          <Text style={styles.allowButtonText}>Allow Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.laterButton}>
          <Text style={styles.laterButtonText}>Maybe Later</Text>
        </TouchableOpacity>

        {/* Footer Text */}
        <Text style={styles.footerText}>
          You can always change this later in Settings
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    borderWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#FFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#002B5B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 32,
    textAlign: 'center',
  },
  benefitsContainer: {
    width: '100%',
    marginBottom: 32,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  benefitIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#334155',
    flex: 1,
  },
  allowButton: {
    width: '100%',
    backgroundColor: '#002B5B',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  allowButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  laterButton: {
    width: '100%',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  laterButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748B',
  },
  footerText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
});

export default DeviceNotificationScreen;
