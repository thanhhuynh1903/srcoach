'use client';

import {useState, useRef, useEffect} from 'react';
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
import BackButton from '../BackButton';
import {useLoginStore} from '../utils/useLoginStore';
import {useNavigation} from '@react-navigation/native';

const VerifyLoginScreen = ({navigation}: {navigation: any}) => {
  const [code, setCode] = useState(['0', '0', '0', '0', '0', '0']);
  const [isLoading, setIsLoading] = useState(false);
  const {verifyCode, status, message,ResendCode,resendStatus} = useLoginStore();
  const inputRefs = useRef<any | null[]>([]);
  const navigate = useNavigation();

  // Initialize refs array
  useEffect(() => {
    if (Array.isArray(inputRefs.current)) {
      inputRefs.current = inputRefs.current.slice(0, 6);
    }
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
      await verifyCode(code.join(''));
    } catch (error) {
      console.log('Error verifying code:', error);
    }
    setIsLoading(false);
  };

  // Monitor verifyStatus changes to handle success or error
  useEffect(() => {
    if (status === 'success') {
      Alert.alert('Success', 'Verification successful!');
      navigate.navigate('HomeTabs' as never);
    } else if (status === 'error') {
      Alert.alert('Error', message);
    }
  }, [status]);
  // Handle resend code
  const handleResendCode = async () => {
    Alert.alert('New code sent to your email');
    setIsLoading(true);
    try {
      await ResendCode();
    } catch (error) {
      console.log('Error verifying code:', error);
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
        <Text style={styles.title}>Enter your code</Text>
        <Text style={styles.subtitle}>
          This account have been signed up but not verified Please enter the
          code sent to your email
        </Text>

        {/* Verification code inputs */}
        <View style={styles.codeContainer}>
          {[0, 1, 2, 3, 4, 5].map(index => (
            <TextInput
              key={index}
              ref={ref => (inputRefs.current[index] = ref)}
              style={styles.codeInput}
              value={code[index]}
              onChangeText={text => handleCodeChange(text, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

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
    paddingTop: 20,
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
    marginBottom: 30,
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

export default VerifyLoginScreen;
