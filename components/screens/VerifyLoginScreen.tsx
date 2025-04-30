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
import {useNavigation, useRoute} from '@react-navigation/native';
import useAuthStore from '../utils/useAuthStore';
import NotificationService from '../services/NotificationService';
interface VerifyParam {
  emailLabel: string;
  password: string;
}

const VerifyLoginScreen = ({navigation}: {navigation: any}) => {
  const [code, setCode] = useState(['0', '0', '0', '0', '0', '0']);
  const [isLoading, setIsLoading] = useState(false);
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
  const {loadToken, token} = useAuthStore();
  const {emailLabel, password} = route.params as VerifyParam;

  const setupNotifications = async () => {
    try {
      console.log('Đang khởi tạo dịch vụ thông báo...');
      await NotificationService.init();
      await NotificationService.setupNotificationOpenHandlers(navigation);
      console.log('Đã khởi tạo dịch vụ thông báo thành công');
    } catch (error) {
      console.error('Lỗi khi thiết lập thông báo:', error);
    }
  };
  // Initialize refs array
  useEffect(() => {
    ResendCode(emailLabel); // Resend code when component mounts
    if (Array.isArray(inputRefs.current)) {
      inputRefs.current = inputRefs.current.slice(0, 6);
    }

    // Đảm bảo trạng thái ban đầu sạch
    return () => {
      clearstatus();
    };
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
    if (code.some(c => c === '')) {
      Alert.alert('Error', 'Please enter the full verification code.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Verify the code
      await verifyCode(emailLabel, code.join(''));

      // 2. Login after successful verification
      await login(emailLabel, password);

      // 3. Load token directly from storage
      const storedToken = await loadToken();
      if (storedToken) {
        await setupNotifications(); 
        navigation.reset({
          index: 0,
          routes: [{name: 'HomeTabs' as never}],
        });
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Verification or login failed. Please check the code and try again.',
      );
      console.log('Error verifying code:', error);
    } finally {
      setIsLoading(false);
      clearstatus(); // Clear any residual status
    }
  };
  // Handle resend code
  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      await ResendCode(emailLabel);
      Alert.alert('Success', 'New code sent to your email');
    } catch (error) {
      console.log('Error resending code:', error);
      Alert.alert('Error', 'Failed to resend code. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
          This account has been signed up but not verified. Please enter the
          code sent to your email{' '}
          <Text style={{color: '#666', fontWeight: 'bold'}}>{emailLabel}</Text>
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

        {/* Resend code link */}
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
