import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {theme} from '../../contants/theme';
import LinearGradient from 'react-native-linear-gradient';
import BackButton from '../../BackButton';

const PrivacyPolicyScreen = ({navigation}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <BackButton />

        <View style={styles.headerContent}>
          <Icon
            name="document-text-outline"
            size={24}
            color="white"
            style={styles.headerIcon}
          />
          <Text style={styles.title}>Terms of Service</Text>
        </View>
      </View>

      {/* Scrollable Content */}
      <View style={styles.scrollContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.introText}>
            Your privacy is important to us. This Privacy Policy explains how
            Smart Running Coach collects, uses, and protects your personal
            information when you use our app.
          </Text>
          <Text style={styles.introText}>
            By using Smart Running Coach, you agree to the collection and use of
            information in accordance with this policy.
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Information We Collect</Text>
            <Text style={styles.sectionText}>
              We may collect the following types of information:
            </Text>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                <Text style={styles.boldText}>Personal Information:</Text> Name,
                email address, and other contact details you provide when
                registering or using the app.
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                <Text style={styles.boldText}>Usage Data:</Text> Information
                about how you use the app, such as your running activity,
                preferences, and device information.
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              2. How We Use Your Information
            </Text>
            <Text style={styles.sectionText}>
              We use the collected information for the following purposes:
            </Text>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                To provide and maintain our app.
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                To improve and personalize your experience.
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                To communicate with you, including sending updates and
                notifications.
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Data Security</Text>
            <Text style={styles.sectionText}>
              We take the security of your data seriously and implement
              appropriate measures to protect it. However, no method of
              transmission over the internet or electronic storage is 100%
              secure.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Third-Party Services</Text>
            <Text style={styles.sectionText}>
              We may use third-party services to help operate our app. These
              third parties have access to your information only to perform
              specific tasks on our behalf and are obligated not to disclose or
              use it for other purposes.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              5. Changes to This Privacy Policy
            </Text>
            <Text style={styles.sectionText}>
              We may update our Privacy Policy from time to time. We will notify
              you of any changes by posting the new Privacy Policy on this page.
              You are advised to review this Privacy Policy periodically for any
              changes.
            </Text>
          </View>

          <Text style={styles.contactText}>
            If you have any questions about this Privacy Policy, please contact
            us at privacy@smartrunningcoach.com.
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
    gap: 5,
  },
  backButton: {
    zIndex: 1,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  headerIcon: {
    color: '#000',
    margin: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  introText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555',
    marginBottom: 8,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  bullet: {
    marginRight: 8,
    color: '#555',
  },
  contactText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555',
    marginTop: 20,
    fontStyle: 'italic',
  },
});

export default PrivacyPolicyScreen;
