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
            name="shield-checkmark-outline"
            size={24}
            color="white"
            style={styles.headerIcon}
          />
          <Text style={styles.title}>Privacy Policy</Text>
        </View>
      </View>

      {/* Scrollable Content */}
      <View style={styles.scrollContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.effectiveDate}>Effective Date: 22/05/2025</Text>
          
          <Text style={styles.introText}>
            Smart Running Coach ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Smart Running Coach mobile application (the "App"). Please read this Privacy Policy carefully.
          </Text>
          
          <Text style={styles.introText}>
            By accessing or using the App, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our App.
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Information We Collect</Text>
            <Text style={styles.sectionText}>
              We collect several types of information from and about users of our App, including:
            </Text>
            
            <Text style={styles.subsectionTitle}>1.1 Personal Information</Text>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                <Text style={styles.boldText}>Account Information:</Text> When you create an account, we collect your name, email address, age, gender, and other registration details.
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                <Text style={styles.boldText}>Payment Information:</Text> If you make purchases through the App, we collect payment card information and billing details (processed securely by our payment processors).
              </Text>
            </View>
            
            <Text style={styles.subsectionTitle}>1.2 Health and Fitness Data</Text>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                <Text style={styles.boldText}>Workout Data:</Text> Information about your running activities, including distance, pace, duration, route, calories burned, and performance metrics.
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                <Text style={styles.boldText}>Health Data:</Text> With your permission, we may collect health-related data from Apple HealthKit, Google Fit, or other connected devices.
              </Text>
            </View>
            
            <Text style={styles.subsectionTitle}>1.3 Technical and Usage Data</Text>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                <Text style={styles.boldText}>Device Information:</Text> We collect device type, operating system, unique device identifiers, and mobile network information.
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                <Text style={styles.boldText}>Usage Data:</Text> Information about how you interact with our App, including features used, time spent, and other analytics.
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
            <Text style={styles.sectionText}>
              We use the information we collect for the following purposes:
            </Text>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                To provide, maintain, and improve our App and services
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                To personalize your experience and provide customized training plans
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                To analyze performance and provide feedback on your running progress
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                To communicate with you about App updates, security alerts, and support messages
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                To detect, prevent, and address technical issues and security vulnerabilities
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                To comply with legal obligations and enforce our terms of service
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Data Sharing and Disclosure</Text>
            <Text style={styles.sectionText}>
              We may share your information in the following circumstances:
            </Text>
            
            <Text style={styles.subsectionTitle}>3.1 Service Providers</Text>
            <Text style={styles.sectionText}>
              We may employ third-party companies and individuals to facilitate our App ("Service Providers"), provide services on our behalf, or assist us in analyzing how our App is used. These third parties have access to your information only to perform these tasks and are obligated not to disclose or use it for any other purpose.
            </Text>
            
            <Text style={styles.subsectionTitle}>3.2 Business Transfers</Text>
            <Text style={styles.sectionText}>
              If we are involved in a merger, acquisition, or asset sale, your information may be transferred. We will provide notice before your information is transferred and becomes subject to a different Privacy Policy.
            </Text>
            
            <Text style={styles.subsectionTitle}>3.3 Legal Requirements</Text>
            <Text style={styles.sectionText}>
              We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court or government agency).
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Data Security</Text>
            <Text style={styles.sectionText}>
              We implement appropriate technical and organizational measures to protect the security of your information, including:
            </Text>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                Encryption of data in transit using SSL/TLS protocols
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                Secure storage of sensitive information using industry-standard encryption
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                Regular security audits and vulnerability assessments
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                Access controls and authentication mechanisms
              </Text>
            </View>
            <Text style={styles.sectionText}>
              However, no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee its absolute security.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. International Data Transfers</Text>
            <Text style={styles.sectionText}>
              Your information, including Personal Data, may be transferred to — and maintained on — computers located outside of your state, province, country, or other governmental jurisdiction where the data protection laws may differ from those of your jurisdiction.
            </Text>
            <Text style={styles.sectionText}>
              If you are located outside [Your Country] and choose to provide information to us, please note that we transfer the data, including Personal Data, to [Your Country] and process it there.
            </Text>
            <Text style={styles.sectionText}>
              Your consent to this Privacy Policy followed by your submission of such information represents your agreement to that transfer.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Your Data Protection Rights</Text>
            <Text style={styles.sectionText}>
              Depending on your location, you may have certain rights regarding your personal information:
            </Text>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                <Text style={styles.boldText}>Access:</Text> Request copies of your personal data
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                <Text style={styles.boldText}>Rectification:</Text> Request correction of inaccurate or incomplete data
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                <Text style={styles.boldText}>Erasure:</Text> Request deletion of your personal data under certain conditions
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                <Text style={styles.boldText}>Restriction:</Text> Request restriction of processing your personal data
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                <Text style={styles.boldText}>Portability:</Text> Request transfer of your data to another organization
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                <Text style={styles.boldText}>Objection:</Text> Object to our processing of your personal data
              </Text>
            </View>
            <Text style={styles.sectionText}>
              To exercise any of these rights, please contact us using the information in the "Contact Us" section below.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
            <Text style={styles.sectionText}>
              Our App is not intended for use by children under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If you become aware that a child has provided us with personal information without parental consent, please contact us. If we become aware that we have collected personal information from children without verification of parental consent, we take steps to remove that information from our servers.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Changes to This Privacy Policy</Text>
            <Text style={styles.sectionText}>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Effective Date" at the top.
            </Text>
            <Text style={styles.sectionText}>
              You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Contact Us</Text>
            <Text style={styles.sectionText}>
              If you have any questions about this Privacy Policy, please contact us:
            </Text>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                By email: privacy@smartrunningcoach.com
              </Text>
            </View>
          </View>

          <Text style={styles.lastUpdated}>
            Last Updated: 22/05/2025
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
  effectiveDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  introText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    marginBottom: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#444',
    marginTop: 10,
    marginBottom: 8,
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
  boldText: {
    fontWeight: '600',
    color: '#333',
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666',
    marginTop: 20,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default PrivacyPolicyScreen;