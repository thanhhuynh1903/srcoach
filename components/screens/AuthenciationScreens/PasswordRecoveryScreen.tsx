import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import BackButton from '../../BackButton';
import Input from '../../Input';
import { theme } from '../../contants/theme';
import { useNavigation } from '@react-navigation/native';
import { useRestetPWstore } from '../../utils/useRestetPWstore';
const PasswordRecoveryScreen = () => {
  const navigation = useNavigation();

  // Local state for email & validation
  const [email, setEmail] = useState('');
  const [isValidEmail, setIsValidEmail] = useState<boolean | null>(null);

  // Import from store
  const { ResetPassword, status, message, clear } = useRestetPWstore();

  // Check email validity on change
  useEffect(() => {
    if (email.length === 0) {
      setIsValidEmail(null);
      return;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValidEmail(emailPattern.test(email));
  }, [email]);

  // Handle store updates (success, error)
  useEffect(() => {
    if (status === 'success') {
      // If password reset request was successful, go to code screen
      navigation.navigate('PasswordRecoveryCodeScreen', { email });
      clear();
    } else if (status === 'error') {
      // Show an alert or toast with the error message
      Alert.alert('Error', message || 'Something went wrong.');
      clear();
    }
  }, [status, message, email, navigation, clear]);

  // Submit form → calls store function
  const handleSubmit = () => {
    if (isValidEmail) {
      ResetPassword(email);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header with Back Button */}
      <View style={styles.header}>
        <BackButton size={26} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Password recovery</Text>
        <Text style={styles.description}>
          Please confirm your email address associated with your account.
        </Text>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Input
            icon={<Icon name="mail-outline" size={24} color="black" />}
            placeholder="Email"
            value={email}
            onChangeText={text => setEmail(text)}
            keyboardType="email-address"
          />
          {isValidEmail === false && (
            <Text style={styles.errorText}>Please enter a valid email</Text>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.button,
            (!email || isValidEmail === false) && styles.buttonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!email || isValidEmail === false}
          accessibilityLabel="Send recovery request"
        >
          <Text style={styles.buttonText}>Send recovery request</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PasswordRecoveryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    height: 44,
    marginTop: 20,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000000',
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 24,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 24,
  },
  errorText: {
    color: '#EF4444',
    marginTop: 4,
    fontSize: 14,
  },
  button: {
    backgroundColor: theme.colors.primaryDark,
    borderRadius: 4,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
