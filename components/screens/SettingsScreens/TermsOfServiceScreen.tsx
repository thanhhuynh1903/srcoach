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

const TermsOfServiceScreen = ({navigation}) => {
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
          <Text style={styles.effectiveDate}>Effective Date: 22/05/2025</Text>
          
          <Text style={styles.introText}>
            Welcome to Smart Running Coach ("App," "Service," "we," "our," or "us"). These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") and Smart Running Coach regarding your use of our mobile application and related services.
          </Text>
          
          <Text style={styles.introText}>
            PLEASE READ THESE TERMS CAREFULLY BEFORE USING THE APP. BY ACCESSING OR USING THE APP, YOU AGREE TO BE BOUND BY THESE TERMS AND OUR PRIVACY POLICY. IF YOU DO NOT AGREE TO ALL OF THESE TERMS, YOU ARE NOT AUTHORIZED TO USE THE APP.
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
            <Text style={styles.sectionText}>
              By accessing or using the Smart Running Coach app, you:
            </Text>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                Acknowledge that you have read, understood, and agree to be bound by these Terms
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                Represent that you are at least 13 years of age (or the age of majority in your jurisdiction if higher)
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                Agree to comply with all applicable laws and regulations
              </Text>
            </View>
            <Text style={styles.sectionText}>
              If you are using the App on behalf of an organization, you represent that you have authority to bind that organization to these Terms.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Account Registration and Security</Text>
            <Text style={styles.subsectionTitle}>2.1 Account Creation</Text>
            <Text style={styles.sectionText}>
              To access certain features of the App, you must register for an account. You agree to:
            </Text>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                Provide accurate, current, and complete information during registration
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                Maintain and promptly update your account information
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                Maintain the confidentiality of your account credentials
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                Be responsible for all activities that occur under your account
              </Text>
            </View>
            
            <Text style={styles.subsectionTitle}>2.2 Account Suspension</Text>
            <Text style={styles.sectionText}>
              We reserve the right to suspend or terminate your account at any time if we determine, in our sole discretion, that:
            </Text>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                You have violated these Terms or applicable laws
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                Your use of the App poses a security risk or may harm other users
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                Your account shows signs of fraud, abuse, or unauthorized activity
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. License and Restrictions</Text>
            <Text style={styles.subsectionTitle}>3.1 License Grant</Text>
            <Text style={styles.sectionText}>
              Subject to these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to:
            </Text>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                Download and install the App on your personal mobile device
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                Access and use the App for your personal, non-commercial use
              </Text>
            </View>
            
            <Text style={styles.subsectionTitle}>3.2 Restrictions</Text>
            <Text style={styles.sectionText}>
              You agree not to:
            </Text>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                Modify, adapt, translate, reverse engineer, decompile, or disassemble the App
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                Remove any copyright, trademark, or other proprietary notices
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                Use the App for any commercial purpose without our express written consent
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                Use the App in any manner that could damage, disable, overburden, or impair our servers
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. User Content</Text>
            <Text style={styles.subsectionTitle}>4.1 Content Ownership</Text>
            <Text style={styles.sectionText}>
              You retain all rights to any content you create, upload, post, or display through the App ("User Content"). By submitting User Content, you:
            </Text>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                Grant us a worldwide, non-exclusive, royalty-free, sublicensable license to use, reproduce, modify, and display your User Content
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                Represent that you have all necessary rights to grant this license
              </Text>
            </View>
            
            <Text style={styles.subsectionTitle}>4.2 Content Standards</Text>
            <Text style={styles.sectionText}>
              You agree not to post User Content that:
            </Text>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                Violates any third-party rights, including intellectual property or privacy rights
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                Contains unlawful, harmful, threatening, abusive, or harassing material
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                Contains false or misleading information
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Prohibited Conduct</Text>
            <Text style={styles.sectionText}>
              You agree not to engage in any of the following prohibited activities:
            </Text>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                Using the App for any illegal purpose or in violation of any laws
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                Attempting to gain unauthorized access to other users' accounts
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                Interfering with the proper functioning of the App
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                Bypassing any security or access controls
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                Using any automated system to access the App in violation of these Terms
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                Impersonating any person or entity
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Subscription and Payments</Text>
            <Text style={styles.subsectionTitle}>6.1 Subscription Terms</Text>
            <Text style={styles.sectionText}>
              Certain features of the App may require payment of fees ("Premium Features"). By subscribing to Premium Features, you agree to:
            </Text>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                Pay all applicable fees as described in the App
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                Authorize us to charge your chosen payment method
              </Text>
            </View>
            
            <Text style={styles.subsectionTitle}>6.2 Renewals and Cancellations</Text>
            <Text style={styles.sectionText}>
              Unless otherwise stated, subscriptions automatically renew until canceled. You may cancel your subscription at any time through your device's subscription settings.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Intellectual Property</Text>
            <Text style={styles.sectionText}>
              The App and its entire contents, features, and functionality (including all software, text, graphics, and designs) are owned by Smart Running Coach or its licensors and are protected by intellectual property laws.
            </Text>
            <Text style={styles.sectionText}>
              The Smart Running Coach name, logo, and all related names, logos, and designs are trademarks of Smart Running Coach. You may not use these marks without our prior written permission.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Disclaimers and Limitation of Liability</Text>
            <Text style={styles.subsectionTitle}>8.1 No Medical Advice</Text>
            <Text style={styles.sectionText}>
              THE APP PROVIDES FITNESS INFORMATION ONLY AND DOES NOT CONSTITUTE MEDICAL ADVICE. CONSULT WITH A HEALTHCARE PROFESSIONAL BEFORE BEGINNING ANY EXERCISE PROGRAM.
            </Text>
            
            <Text style={styles.subsectionTitle}>8.2 No Warranties</Text>
            <Text style={styles.sectionText}>
              THE APP IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </Text>
            
            <Text style={styles.subsectionTitle}>8.3 Limitation of Liability</Text>
            <Text style={styles.sectionText}>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, SMART RUNNING COACH SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE APP.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Termination</Text>
            <Text style={styles.sectionText}>
              We may terminate or suspend your access to the App immediately, without prior notice or liability, for any reason, including if you breach these Terms.
            </Text>
            <Text style={styles.sectionText}>
              Upon termination, your right to use the App will cease immediately. All provisions of these Terms which should survive termination will survive.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>10. Governing Law</Text>
            <Text style={styles.sectionText}>
              These Terms shall be governed by and construed in accordance with the laws of [Your Country/State], without regard to its conflict of law provisions.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>11. Changes to Terms</Text>
            <Text style={styles.sectionText}>
              We reserve the right to modify these Terms at any time. We will notify you of material changes through the App or via email. Your continued use of the App after such changes constitutes acceptance of the new Terms.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>12. Contact Information</Text>
            <Text style={styles.sectionText}>
              For any questions about these Terms, please contact us at:
            </Text>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                Email: legal@smartrunningcoach.com
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.sectionText}>
                Mail: [Your Company Address]
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

export default TermsOfServiceScreen;