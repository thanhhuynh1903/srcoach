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
  ActivityIndicator,
} from 'react-native';
import BackButton from '../BackButton';
import { useLoginStore } from '../utils/useLoginStore';
import { useNavigation, useRoute } from '@react-navigation/native';
import useAuthStore from '../utils/useAuthStore';
import NotificationService from '../services/NotificationService';
import CommonDialog from '../commons/CommonDialog';

interface VerifyParam {
  emailLabel: string;
  password: string;
}

export default function VerifyLoginInactiveScreen({ navigation }: { navigation: any }) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogContent, setDialogContent] = useState('');
  const [inputStatus, setInputStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const {
    verifyCode,
    status,
    message,
    ResendCode,
    resendStatus,
    clearstatus,
    login,
  } = useLoginStore();
  const inputRefs = useRef<any | null[]>([]);
  const navigate = useNavigation();
  const route = useRoute();
  const { loadToken, token } = useAuthStore();
  const { emailLabel, password } = route.params as VerifyParam;

  const setupNotifications = async () => {
    try {
      await NotificationService.init();
      await NotificationService.setupNotificationOpenHandlers(navigation);
    } catch (error) {
      setDialogTitle('Error');
      setDialogContent('Failed to setup notifications');
      setDialogVisible(true);
    }
  };

  useEffect(() => {
    ResendCode(emailLabel);
    inputRefs.current = inputRefs.current.slice(0, 6);
    return () => {
      clearstatus();
    };
  }, []);

  const handleCodeChange = async (text: string, index: number) => {
    if (inputStatus !== 'idle') {
      setInputStatus('idle');
    }

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text.length === 1 && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = async (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      const newCode = [...code];
      
      if (newCode[index] === '') {
        if (index > 0) {
          inputRefs.current[index - 1].focus();
        }
      } else {
        newCode[index] = '';
        setCode(newCode);
      }
    }
  };

  const handleVerify = async () => {
    if (code.some(c => !c)) {
      setDialogTitle('Error');
      setDialogContent('Please enter the full verification code.');
      setDialogVisible(true);
      return;
    }

    setIsLoading(true);
    try {
      await verifyCode(emailLabel, code.join(''));
      await login(emailLabel, password);
      const storedToken = await loadToken();
      if (storedToken) {
        setInputStatus('success');
        await setupNotifications();
        navigation.reset({
          index: 0,
          routes: [{ name: 'HomeTabs' as never }],
        });
      }
    } catch (error) {
      setInputStatus('error');
      setDialogTitle('Error');
      setDialogContent('Verification or login failed. Please check the code and try again.');
      setDialogVisible(true);
    } finally {
      setIsLoading(false);
      clearstatus();
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      await ResendCode(emailLabel);
      setDialogTitle('Success');
      setDialogContent('New code sent to your email');
      setDialogVisible(true);
    } catch (error) {
      setDialogTitle('Error');
      setDialogContent('Failed to resend code. Please try again.');
      setDialogVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getInputStyle = (index: number) => {
    if (inputStatus === 'success') {
      return styles.successInput;
    }
    if (inputStatus === 'error') {
      return styles.errorInput;
    }
    if (isLoading) {
      return styles.loadingInput;
    }
    return styles.codeInput;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <BackButton size={26} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Enter your code</Text>
        <Text style={styles.subtitle}>
          This account has been signed up but not verified. Please enter the
          code sent to your credentials following {' '}
          <Text style={{ color: '#666', fontWeight: 'bold' }}>{emailLabel}</Text>
        </Text>

        <View style={styles.codeContainer}>
          {[0, 1, 2, 3, 4, 5].map(index => (
            <TextInput
              key={index}
              ref={ref => (inputRefs.current[index] = ref)}
              style={getInputStyle(index)}
              value={code[index]}
              onChangeText={text => handleCodeChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              editable={!isLoading}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.verifyButton,
            (isLoading || code.join('').length !== 6) && styles.disabledButton,
          ]}
          onPress={handleVerify}
          disabled={isLoading || code.join('').length !== 6}>
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.verifyButtonText}>Verify</Text>
          )}
        </TouchableOpacity>

        <Pressable
          onPress={handleResendCode}
          disabled={isLoading}
          style={{
            borderWidth: 1,
            borderColor: '#0a2463',
            borderRadius: 5,
            paddingVertical: 12,
            paddingHorizontal: 16,
            opacity: isLoading ? 0.6 : 1,
          }}>
          {isLoading ? (
            <ActivityIndicator color="#0a2463" size="small" />
          ) : (
            <Text style={styles.resendText}>Send code again</Text>
          )}
        </Pressable>

        <CommonDialog
          visible={dialogVisible}
          onClose={() => setDialogVisible(false)}
          title={dialogTitle}
          content={<Text>{dialogContent}</Text>}
          actionButtons={[
            {
              label: 'OK',
              variant: 'contained',
              handler: () => setDialogVisible(false),
            },
          ]}
        />
      </View>
    </SafeAreaView>
  );
}

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
  successInput: {
    width: 56,
    height: 56,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '500',
    textAlign: 'center',
    color: '#FFFFFF',
    backgroundColor: '#4CAF50',
  },
  errorInput: {
    width: 56,
    height: 56,
    borderWidth: 1,
    borderColor: '#F44336',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '500',
    textAlign: 'center',
    color: '#FFFFFF',
    backgroundColor: '#F44336',
  },
  loadingInput: {
    width: 56,
    height: 56,
    borderWidth: 1,
    borderColor: '#0a2463',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '500',
    textAlign: 'center',
    color: '#FFFFFF',
    backgroundColor: '#0a2463',
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
  disabledButton: {
    opacity: 0.6,
  },
});