import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {theme} from '../../../contants/theme';
import LinearGradient from 'react-native-linear-gradient';
import BackButton from '../../../BackButton';

const {width, height} = Dimensions.get('window');

const UserCertificatesIntroScreen = ({navigation}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* White Header */}
      <View style={styles.header}>
        <BackButton size={24} />

        <View style={styles.headerContent}>
          <Icon
            name="ribbon"
            size={24}
            color={theme.colors.primary}
            style={styles.headerIcon}
          />
          <Text style={styles.title}>Become an Expert</Text>
        </View>
      </View>

      {/* Blue Background Content */}
      <LinearGradient
        colors={[theme.colors.primaryDark, theme.colors.primary]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.backgroundGradient}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Hero Section */}
          <View style={styles.heroContainer}>
            <Icon
              name="ribbon"
              size={120}
              color="white"
              style={styles.heroImage}
            />
            <Text style={styles.heroTitle}>Join Our Coaching Expert Program</Text>
            <Text style={styles.heroText}>
              As a certified Expert, you'll gain access to elevating features,
              build your coaching brand, and connect with runners worldwide.
            </Text>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>BENEFITS</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Benefits Section */}
          <View style={styles.benefitsContainer}>
            <View style={styles.benefitItem}>
              <View
                style={[
                  styles.benefitIcon,
                  {backgroundColor: 'rgba(255, 255, 255, 0.2)'},
                ]}>
                <Icon name="people" size={20} color="white" />
              </View>
              <Text style={styles.benefitTitle}>Build Your Following</Text>
              <Text style={styles.benefitText}>
                Get featured in our expert directory and attract more clients
              </Text>
            </View>

            <View style={styles.benefitItem}>
              <View
                style={[
                  styles.benefitIcon,
                  {backgroundColor: 'rgba(255, 255, 255, 0.2)'},
                ]}>
                <Icon name="cash" size={20} color="white" />
              </View>
              <Text style={styles.benefitTitle}>Earn More</Text>
              <Text style={styles.benefitText}>
                Premium coaching rates and exclusive monetization options
              </Text>
            </View>

            <View style={styles.benefitItem}>
              <View
                style={[
                  styles.benefitIcon,
                  {backgroundColor: 'rgba(255, 255, 255, 0.2)'},
                ]}>
                <Icon name="medal" size={20} color="white" />
              </View>
              <Text style={styles.benefitTitle}>Credibility</Text>
              <Text style={styles.benefitText}>
                Verified badge to showcase your professional status
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>REQUIREMENTS</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Requirements Section */}
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>What You'll Need</Text>
            <Text style={styles.sectionSubtitle}>
              To qualify as a Running Expert, please prepare these documents
            </Text>
          </View>

          {/* Step 1 */}
          <View style={styles.step}>
            <View style={[styles.stepIcon, styles.stepIcon1]}>
              <Icon
                name="document-text-outline"
                size={20}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.stepText}>
              <Text style={styles.stepTitle}>Government ID</Text>
              <Text style={styles.stepDescription}>
                Valid passport, driver's license or national ID for verification
              </Text>
            </View>
          </View>

          {/* Step 2 */}
          <View style={styles.step}>
            <View style={[styles.stepIcon, styles.stepIcon2]}>
              <Icon name="school-outline" size={20} color="white" />
            </View>
            <View style={styles.stepText}>
              <Text style={styles.stepTitle}>Certifications</Text>
              <Text style={styles.stepDescription}>
                Coaching certificates or relevant fitness qualifications
              </Text>
            </View>
          </View>

          {/* Step 3 */}
          <View style={styles.step}>
            <View style={[styles.stepIcon, styles.stepIcon3]}>
              <Icon name="trophy-outline" size={20} color="white" />
            </View>
            <View style={styles.stepText}>
              <Text style={styles.stepTitle}>Achievements</Text>
              <Text style={styles.stepDescription}>
                Race results, competition awards, or client success stories
              </Text>
            </View>
          </View>

          {/* Step 4 */}
          <View style={styles.step}>
            <View style={[styles.stepIcon, styles.stepIcon4]}>
              <Icon name="time-outline" size={20} color="white" />
            </View>
            <View style={styles.stepText}>
              <Text style={styles.stepTitle}>Experience</Text>
              <Text style={styles.stepDescription}>
                Minimum 2 years coaching or competitive running experience
              </Text>
            </View>
          </View>

          {/* FAQ Section */}
          <View style={styles.faqContainer}>
            <Text style={styles.faqTitle}>Frequently Asked Questions</Text>

            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>
                How long does verification take?
              </Text>
              <Text style={styles.faqAnswer}>
                Typically 3-5 business days after submitting all required
                documents.
              </Text>
            </View>

            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>
                Is there a fee to become an Expert?
              </Text>
              <Text style={styles.faqAnswer}>
                No, verification is completely free. You only pay a small
                commission on paid coaching.
              </Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Sticky Footer with Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => navigation.navigate('UserCertificatesLegalScreen')}>
          <Icon name="arrow-forward" size={20} color={'#FFF'} />
          <Text style={styles.continueButtonText}>Begin Verification</Text>
        </TouchableOpacity>
        <Text style={styles.footerText}>
          By proceeding, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
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
    color: '#000',
  },
  backgroundGradient: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  heroContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  heroImage: {
    paddingTop: 20,
    marginBottom: 15,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  heroText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginHorizontal: 10,
    letterSpacing: 1,
  },
  benefitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  benefitItem: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  benefitTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
    marginBottom: 5,
  },
  benefitText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
  },
  sectionTitleContainer: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  step: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepIcon1: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  stepIcon2: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  stepIcon3: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  stepIcon4: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  stepText: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  faqContainer: {
    marginTop: 25,
  },
  faqTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 15,
  },
  faqItem: {
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
    marginBottom: 5,
  },
  faqAnswer: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerText: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
  },
  continueButton: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: theme.colors.primaryDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    gap: 12
  },
  gradientButton: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
    color: '#FFF',
  },
});

export default UserCertificatesIntroScreen;
