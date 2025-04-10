import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
  Pressable,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {theme} from '../../../contants/theme';
import LinearGradient from 'react-native-linear-gradient';

const CustomCheckbox = ({value, onValueChange}) => (
  <Pressable
    onPress={() => onValueChange(!value)}
    style={styles.checkboxPressable}>
    <View style={[styles.checkboxBase, value && styles.checkboxChecked]}>
      {value && <Icon name="checkmark" size={16} color="white" />}
    </View>
  </Pressable>
);

const UserCertificatesLegalScreen = ({navigation}) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [certificationAgreed, setCertificationAgreed] = useState(false);

  const handleContinue = () => {
    if (termsAccepted && privacyAccepted && certificationAgreed) {
      navigation.navigate('UserCertificatesAlreadyExistsScreen');
    }
  };

  const openTermsLink = () => {
    Linking.openURL('https://yourdomain.com/terms');
  };

  const openPrivacyLink = () => {
    Linking.openURL('https://yourdomain.com/privacy');
  };

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
            name="document-text"
            size={24}
            color="white"
            style={styles.headerIcon}
          />
          <Text style={styles.title}>Legal Notice</Text>
        </View>
      </LinearGradient>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Before You Proceed</Text>
          <Text style={styles.legalText}>
            To become a certified Expert on Smart Running Coach, you must agree
            to the following terms and conditions:
          </Text>

          <View style={styles.checkboxContainer}>
            <CustomCheckbox
              value={termsAccepted}
              onValueChange={setTermsAccepted}
            />
            <Text style={styles.checkboxLabel}>
              I agree to the{' '}
              <Text style={styles.linkText} onPress={openTermsLink}>
                Terms of Service
              </Text>
            </Text>
          </View>

          <View style={styles.checkboxContainer}>
            <CustomCheckbox
              value={privacyAccepted}
              onValueChange={setPrivacyAccepted}
            />
            <Text style={styles.checkboxLabel}>
              I agree to the{' '}
              <Text style={styles.linkText} onPress={openPrivacyLink}>
                Privacy Policy
              </Text>
            </Text>
          </View>

          <View style={styles.checkboxContainer}>
            <CustomCheckbox
              value={certificationAgreed}
              onValueChange={setCertificationAgreed}
            />
            <Text style={styles.checkboxLabel}>
              I certify that all information and documents I provide are
              accurate and belong to me
            </Text>
          </View>

          <Text style={styles.noteText}>
            Note: Falsifying information may result in permanent account
            suspension and legal action.
          </Text>
        </View>
      </ScrollView>

      {/* Sticky Footer with Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!termsAccepted || !privacyAccepted || !certificationAgreed) &&
              styles.disabledButton,
          ]}
          onPress={handleContinue}
          disabled={!termsAccepted || !privacyAccepted || !certificationAgreed}>
          <LinearGradient
            colors={[theme.colors.primaryDark, theme.colors.primaryDark]}
            style={styles.gradientButton}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}>
            <Text style={styles.continueButtonText}>
              Continue to Document Submission
            </Text>
            <Icon name="arrow-forward" size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Extra padding to account for sticky button
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  legalText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 25,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  checkboxPressable: {
    marginRight: 12,
  },
  checkboxBase: {
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.primaryDark,
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primaryDark,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 15,
    color: '#444',
  },
  linkText: {
    color: theme.colors.primaryDark,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  noteText: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 10,
    marginBottom: 25,
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  continueButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.6,
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

export default UserCertificatesLegalScreen;
