import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {theme} from '../../../contants/theme';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';

const UserCertificatesSuccessScreen = () => {
  const navigation = useNavigation();
  const [secondsRemaining, setSecondsRemaining] = useState(10);

  useEffect(() => {
    if (secondsRemaining > 0) {
      const timer = setTimeout(() => {
        setSecondsRemaining(secondsRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      navigation.goBack();
    }
  }, [secondsRemaining, navigation]);

  const handleBack = () => {
    navigation.navigate('HomeTabs', { screen: 'Home', params: { screen: 'HomeMain' } });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header - No back button as requested */}
      <LinearGradient
        colors={[theme.colors.primaryDark, theme.colors.primary]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.header}>
        <View style={styles.headerContent}>
          <Icon
            name="checkmark-done"
            size={24}
            color="white"
            style={styles.headerIcon}
          />
          <Text style={styles.title}>Submission Complete</Text>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Icon name="checkmark-circle" size={80} color="#4BB543" />
          </View>
          <Text style={styles.successTitle}>Documents Submitted!</Text>
          <Text style={styles.successText}>
            Your expert application is under review. We'll notify you once
            verified.
          </Text>
          <Text style={styles.timerText}>
            Returning in {secondsRemaining} seconds...
          </Text>
        </View>
      </View>

      {/* Footer with Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}>
          <LinearGradient
            colors={[theme.colors.primaryDark, theme.colors.primary]}
            style={styles.gradientButton}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}>
            <Text style={styles.buttonText}>Return to Dashboard</Text>
            <Icon name="home" size={20} color="white" />
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
    justifyContent: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  successContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  successText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  timerText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  footer: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  backButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  gradientButton: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default UserCertificatesSuccessScreen;