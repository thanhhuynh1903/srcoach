'use client';

import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Pressable,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import BackButton from '../../BackButton';
import { useRestetPWstore } from '../../utils/useRestetPWstore';
import { useNavigation, useRoute } from '@react-navigation/native';

interface VerifyParam {
  email: string;
}

const PasswordRecoveryCodeScreen = ({ navigation }: { navigation: any }) => {
  const [code, setCode] = useState(['0', '0', '0', '0', '0', '0']);
  const [isLoading, setIsLoading] = useState(false);
  const { message, verifyStatus, ResendPassword, clear } = useRestetPWstore();
  const inputRefs = useRef<any | null[]>([]);
  const navigate = useNavigation();
  const route = useRoute();
  const { email } = route.params as VerifyParam;

  // Initialize refs array
  useEffect(() => {
    if (Array.isArray(inputRefs.current)) {
      inputRefs.current = inputRefs.current.slice(0, 6);
    }
    // Reset verification status on mount
    clear();
  }, []);

  // Handle input change: update code and auto-focus next input
  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text.length === 1 && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle backspace: auto-focus previous input
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Handle verify: call verifyCode and set loading status
  const handleVerify = async () => {
    setIsLoading(true);
    try {
      await ResendPassword(email);
    } catch (error) {
      console.log('Error verifying code:', error);
    }
    setIsLoading(false);
  };

  // Monitor verifyStatus changes to handle success or error
  useEffect(() => {
    console.log('resendStatus:', verifyStatus);
    if (verifyStatus === 'success') {
      Alert.alert('Success', 'Verification successful!');
      navigate.navigate('PasswordRecoveryNewScreen' as never);
      // Optionally, clear after navigating if needed:
      // clear();
    } else if (verifyStatus === 'error') {
      Alert.alert(message);
    }
  }, [verifyStatus]);

  // Handle resend code
  const handleResendCode = async () => {
    setIsLoading(true);
    console.log('emailLabel', email);
    
    try {
      await ResendPassword(email);
    } catch (error) {
      console.log('Error resending code:', error);
    }
    setIsLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <BackButton size={26} />
        </TouchableOpacity>
      </View>

      {/* Main content */}
      <View style={styles.content}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Please enter code associated to your email:{' '}
          <Text style={{ color: '#666', fontWeight: 'bold' }}>{email}</Text>
        </Text>

        {/* Verification code inputs */}
        <View style={[styles.codeContainer, { marginBottom: message ? 25 : 25 }]}>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={styles.codeInput}
              value={code[index]}
              onChangeText={(text) => handleCodeChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {message && (
          <View style={{ alignItems: 'center', marginBottom: 5 }}>
            <Text style={{ color: 'red' }}>{message}</Text>
          </View>
        )}
        {/* Verify button */}
        <TouchableOpacity
          style={styles.verifyButton}
          onPress={handleVerify}
          disabled={isLoading || code.join('').length !== 6}>
          <Text style={styles.verifyButtonText}>
            {isLoading ? 'Verifying...' : 'Verify'}
          </Text>
        </TouchableOpacity>

        {/* Resend code link */}
        <Pressable
          onPress={handleResendCode}
          style={{
            borderWidth: 1,
            borderColor: '#0a2463',
            borderRadius: 5,
            paddingVertical: 12,
            paddingHorizontal: 16,
          }}>
          {isLoading ? (
            <ActivityIndicator color="#ccc" size="small" />
          ) : (
            <Text style={styles.resendText}>Send code again</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  content: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  codeInput: {
    width: 56,
    height: 56,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '500',
    textAlign: 'center',
    color: '#1a1a1a',
  },
  verifyButton: {
    backgroundColor: '#0a2463',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendText: {
    color: '#0a2463',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default PasswordRecoveryCodeScreen;
