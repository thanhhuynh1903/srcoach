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

const TermsOfServiceScreen = ({navigation}) => {
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
            name="document-text-outline"
            size={24}
            color="white"
            style={styles.headerIcon}
          />
          <Text style={styles.title}>Terms of Service</Text>
        </View>
      </LinearGradient>

      {/* Scrollable Content */}
      <View style={styles.scrollContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.introText}>
            Welcome to Smart Running Coach! These Terms of Service ("Terms") govern your use of the
            Smart Running Coach app and services. By accessing or using our app, you agree to be
            bound by these Terms.
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
            <Text style={styles.sectionText}>
              By using Smart Running Coach, you agree to these Terms and our Privacy Policy. If you
              do not agree to these Terms, you may not use the app.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Use of the App</Text>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                You must be at least 13 years old to use Smart Running Coach.
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                You are responsible for maintaining the confidentiality of your account and password.
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                You agree to use the app only for lawful purposes and in accordance with these
                Terms.
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. User Content</Text>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                You retain ownership of any content you submit or post on the app.
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                By submitting content, you grant Smart Running Coach a worldwide, non-exclusive,
                royalty-free license to use, reproduce, and distribute your content.
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Prohibited Activities</Text>
            <Text style={styles.sectionText}>You agree not to:</Text>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                Use the app for any illegal or unauthorized purpose.
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                Attempt to gain unauthorized access to the app or its related systems.
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                Interfere with or disrupt the app or its servers.
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Limitation of Liability</Text>
            <Text style={styles.sectionText}>
              Smart Running Coach is not liable for any indirect, incidental, or consequential
              damages arising out of your use of the app.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Changes to Terms</Text>
            <Text style={styles.sectionText}>
              We may update these Terms from time to time. We will notify you of any changes by
              posting the new Terms on this page. Your continued use of the app after any changes
              constitutes your acceptance of the new Terms.
            </Text>
          </View>

          <Text style={styles.contactText}>
            If you have any questions about these Terms, please contact us at
            support@smartrunningcoach.com.
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

export default TermsOfServiceScreen;