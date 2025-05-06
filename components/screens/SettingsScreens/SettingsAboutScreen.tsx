import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Linking,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { theme } from '../../contants/theme';
import packageJson from '../../../package.json';
import BackButton from '../../BackButton';

const SettingsAboutScreen: React.FC = ({ navigation }) => {
  const appVersion = packageJson.version;

  const handleEmailPress = () => {
    Linking.openURL('mailto:smartrunningcoach@gmail.com');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <BackButton size={24} style={styles.backButton} />
        <Text style={styles.title}>About</Text>
      </View>

      {/* Scrollable Content */}
      <View style={styles.scrollContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* App Info Section */}
          <View style={styles.appInfoContainer}>
            <Image
              source={require('../../../components/assets/logo.png')}
              style={styles.appIcon}
            />
            <Text style={styles.appName}>Smart Running Coach</Text>
            <Text style={styles.appVersion}>Version {appVersion}</Text>
          </View>

          {/* About Options */}
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => navigation.navigate('WhatsNewScreen')}>
              <View style={styles.optionContent}>
                <Icon
                  name="megaphone-outline"
                  size={20}
                  color={theme.colors.primaryDark}
                  style={styles.optionIcon}
                />
                <View>
                  <Text style={styles.optionText}>What's New</Text>
                  <Text style={styles.optionSubtext}>Latest features and updates</Text>
                </View>
              </View>
              <Icon name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => navigation.navigate('TermsOfServiceScreen')}>
              <View style={styles.optionContent}>
                <Icon
                  name="document-text-outline"
                  size={20}
                  color={theme.colors.primaryDark}
                  style={styles.optionIcon}
                />
                <View>
                  <Text style={styles.optionText}>Terms of Service</Text>
                  <Text style={styles.optionSubtext}>Legal terms and conditions</Text>
                </View>
              </View>
              <Icon name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => navigation.navigate('PrivacyPolicyScreen')}>
              <View style={styles.optionContent}>
                <Icon
                  name="shield-checkmark-outline"
                  size={20}
                  color={theme.colors.primaryDark}
                  style={styles.optionIcon}
                />
                <View>
                  <Text style={styles.optionText}>Privacy Policy</Text>
                  <Text style={styles.optionSubtext}>How we handle your data</Text>
                </View>
              </View>
              <Icon name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionItem}
              onPress={handleEmailPress}>
              <View style={styles.optionContent}>
                <Icon
                  name="mail-outline"
                  size={20}
                  color={theme.colors.primaryDark}
                  style={styles.optionIcon}
                />
                <View>
                  <Text style={styles.optionText}>Contact Us</Text>
                  <Text style={styles.optionSubtext}>Email our support team</Text>
                </View>
              </View>
              <Icon name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          </View>

          {/* Copyright */}
          <View style={styles.copyrightContainer}>
            <Text style={styles.copyrightText}>
              © 2025 Smart Running Coach. All rights reserved.
            </Text>
          </View>
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
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    gap: 10,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  appInfoContainer: {
    alignItems: 'center',
    marginVertical: 30,
    paddingHorizontal: 20,
  },
  appIcon: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginBottom: 15,
  },
  appName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
  },
  appVersion: {
    fontSize: 16,
    color: '#666',
  },
  optionsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionItemLast: {
    borderBottomWidth: 0,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    marginRight: 15,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  optionSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  copyrightContainer: {
    marginTop: 20,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  copyrightText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default SettingsAboutScreen;