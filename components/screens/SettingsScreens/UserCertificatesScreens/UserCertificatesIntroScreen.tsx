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
  Image,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {theme} from '../../../contants/theme';
import LinearGradient from 'react-native-linear-gradient';

const {width, height} = Dimensions.get('window');

const UserCertificatesIntroScreen = ({navigation}) => {
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
            name="ribbon"
            size={24}
            color="white"
            style={styles.headerIcon}
          />
          <Text style={styles.title}>Become an Expert</Text>
        </View>
      </LinearGradient>

      {/* Scrollable Content */}
      <View style={styles.scrollContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Hero Section */}
          <View style={styles.heroContainer}>
            <Icon
              name="ribbon"
              size={120}
              color={theme.colors.primary}
              style={styles.heroImage}
            />
            <Text style={styles.heroTitle}>Join Our Elite Running Experts</Text>
            <Text style={styles.heroText}>
              As a certified Expert, you'll gain access to premium features,
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
                  {backgroundColor: 'rgba(92, 124, 250, 0.1)'},
                ]}>
                <Icon name="people" size={20} color={theme.colors.primary} />
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
                  {backgroundColor: 'rgba(255, 164, 91, 0.1)'},
                ]}>
                <Icon name="cash" size={20} color="#FFA45B" />
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
                  {backgroundColor: 'rgba(77, 218, 184, 0.1)'},
                ]}>
                <Icon name="medal" size={20} color="#4DDAB8" />
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
              <Icon name="school-outline" size={20} color="#FFA45B" />
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
              <Icon name="trophy-outline" size={20} color="#4DDAB8" />
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
              <Icon name="time-outline" size={20} color="#9C5BFF" />
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
      </View>

      {/* Sticky Footer with Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => navigation.navigate('UserCertificatesLegalScreen')}>
          <LinearGradient
            colors={[theme.colors.primaryDark, theme.colors.primaryDark]}
            style={styles.gradientButton}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}>
            <Text style={styles.continueButtonText}>Begin Verification</Text>
            <Icon name="arrow-forward" size={20} color="white" />
          </LinearGradient>
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
    paddingBottom: 100,
    paddingTop: 30,
  },
  heroContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  heroImage: {
    marginBottom: 15,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  heroText: {
    fontSize: 15,
    color: '#666',
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
    backgroundColor: '#eee',
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
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
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
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
    color: '#333',
    marginBottom: 5,
  },
  benefitText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  sectionTitleContainer: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  step: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
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
    backgroundColor: 'rgba(92, 124, 250, 0.1)',
  },
  stepIcon2: {
    backgroundColor: 'rgba(255, 164, 91, 0.1)',
  },
  stepIcon3: {
    backgroundColor: 'rgba(77, 218, 184, 0.1)',
  },
  stepIcon4: {
    backgroundColor: 'rgba(156, 91, 255, 0.1)',
  },
  stepText: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  faqContainer: {
    marginTop: 25,
  },
  faqTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  faqItem: {
    marginBottom: 15,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  faqAnswer: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: '#f8f9fa',
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
  },
  gradientButton: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default UserCertificatesIntroScreen;
