import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {theme} from '../../contants/theme';
import LinearGradient from 'react-native-linear-gradient';
import packageJson from '../../../package.json';

const {width, height} = Dimensions.get('window');

const SettingsAboutScreen = ({navigation}) => {
  // Extract version from package.json
  const appVersion = packageJson.version;

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
            name="information-circle-outline"
            size={24}
            color="white"
            style={styles.headerIcon}
          />
          <Text style={styles.title}>About</Text>
        </View>
      </LinearGradient>

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

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>INFORMATION</Text>
            <View style={styles.dividerLine} />
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
                  color={theme.colors.primary}
                  style={styles.optionIcon}
                />
                <Text style={styles.optionText}>What's New</Text>
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
                  color={theme.colors.primary}
                  style={styles.optionIcon}
                />
                <Text style={styles.optionText}>Terms of Service</Text>
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
                  color={theme.colors.primary}
                  style={styles.optionIcon}
                />
                <Text style={styles.optionText}>Privacy Policy</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => navigation.navigate('ContactUsScreen')}>
              <View style={styles.optionContent}>
                <Icon
                  name="mail-outline"
                  size={20}
                  color={theme.colors.primary}
                  style={styles.optionIcon}
                />
                <Text style={styles.optionText}>Contact Us</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>SOCIAL</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Links */}
          <View style={styles.socialContainer}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => navigation.navigate('TwitterScreen')}>
              <Icon name="logo-twitter" size={24} color="#1DA1F2" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => navigation.navigate('InstagramScreen')}>
              <Icon name="logo-instagram" size={24} color="#E1306C" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => navigation.navigate('FacebookScreen')}>
              <Icon name="logo-facebook" size={24} color="#4267B2" />
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
  appInfoContainer: {
    alignItems: 'center',
    marginVertical: 30,
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#eee',
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginHorizontal: 10,
    letterSpacing: 1,
  },
  optionsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
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
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
    color: '#333',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 15,
  },
  socialButton: {
    marginHorizontal: 15,
    padding: 10,
  },
  copyrightContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  copyrightText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default SettingsAboutScreen;