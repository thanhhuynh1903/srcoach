import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Keyboard,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {useNavigation, useRoute} from '@react-navigation/native';
import BackButton from '../../BackButton';
import { theme } from '../../contants/theme';

const PasswordRecoveryCodeScreen: React.FC = () => {
  const navigation = useNavigation();
  const routes = useRoute();
  const {email} = routes.params

  const codeLength = 5;
  const [code, setCode] = useState<string[]>(Array(codeLength).fill(''));
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [status, setStatus] = useState<'idle' | 'success' | 'failure'>('idle');
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, codeLength);
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }, []);

  const handleCodeChange = (text: string, index: number) => {
    if (status !== 'idle') setStatus('idle');
    if (!/^\d*$/.test(text)) return;
    const newCode = [...code];

    if (text.length > 1) {
      const pastedCode = text.split('').slice(0, codeLength - index);
      pastedCode.forEach((digit, i) => {
        if (index + i < codeLength) newCode[index + i] = digit;
      });
      setCode(newCode);
      const nextIndex = Math.min(index + pastedCode.length, codeLength - 1);
      setFocusedIndex(nextIndex);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    newCode[index] = text;
    setCode(newCode);
    if (text && index < codeLength - 1) {
      setFocusedIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      const newCode = [...code];
      newCode[index - 1] = '';
      setCode(newCode);
      setFocusedIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== codeLength) return;
    Keyboard.dismiss();

    try {
      const isSuccess = true;
      setStatus(isSuccess ? 'success' : 'failure');
      if (isSuccess) navigation.navigate('PasswordRecoveryNew');
      else setTimeout(resetCode, 2000);
    } catch {
      setStatus('failure');
      setTimeout(resetCode, 2000);
    }
  };

  const resetCode = () => {
    setStatus('idle');
    setCode(Array(codeLength).fill(''));
    setFocusedIndex(0);
    inputRefs.current[0]?.focus();
  };

  const getInputStyle = (index: number) => [
    styles.codeInput,
    status === 'success' && styles.successInput,
    status === 'failure' && styles.failureInput,
    focusedIndex === index && styles.focusedInput,
  ];

  const getTextStyle = () =>
    status === 'failure' ? styles.failureText : styles.codeText;
  const isCodeComplete = code.every(digit => digit !== '');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <BackButton size={26} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Enter your code</Text>
        <Text style={styles.description}>
          Please enter code associated to your email {email}
        </Text>

        <View style={styles.codeContainer}>
          {Array(codeLength)
            .fill(0)
            .map((_, index) => (
              <TextInput
                key={index}
                ref={ref => (inputRefs.current[index] = ref)}
                style={getInputStyle(index)}
                value={code[index]}
                onChangeText={text => handleCodeChange(text, index)}
                onKeyPress={e => handleKeyPress(e, index)}
                onFocus={() => setFocusedIndex(index)}
                keyboardType="number-pad"
                maxLength={codeLength}
                selectTextOnFocus
                accessibilityLabel={`Digit ${index + 1} of verification code`}
                style={[
                  getInputStyle(index),
                  {
                    textAlign: 'center',
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: status === 'failure' ? '#FFFFFF' : '#111827',
                  },
                ]}
              />
            ))}
        </View>

        <TouchableOpacity
          style={[styles.button, !isCodeComplete && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={!isCodeComplete}
          accessibilityLabel="Verify code">
          <Text style={styles.buttonText}>Verify</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={resetCode}
          accessibilityLabel="Send code again">
          <Text style={styles.resendText}>Send code again</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Styles variables
const styles = {
  container: {flex: 1, backgroundColor: '#FFFFFF'},
  header: {paddingHorizontal: 16, height: 44, justifyContent: 'center', marginTop: 20},
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#111827',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
    textAlign: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  codeInput: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  focusedInput: {borderColor: theme.colors.primaryDark, borderWidth: 2},
  successInput: {backgroundColor: '#10B981', borderColor: '#10B981'},
  failureInput: {backgroundColor: '#EF4444', borderColor: '#EF4444'},
  codeText: {fontSize: 20, fontWeight: 'bold', color: '#111827'},
  failureText: {fontSize: 20, fontWeight: 'bold', color: '#FFFFFF'},
  button: {
    backgroundColor: theme.colors.primaryDark,
    borderRadius: 4,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 16,
  },
  buttonDisabled: {opacity: 0.7},
  buttonText: {color: '#FFFFFF', fontSize: 16, fontWeight: '600'},
  resendText: {color: theme.colors.primaryDark, fontSize: 16, fontWeight: '500'},
};

export default PasswordRecoveryCodeScreen;
