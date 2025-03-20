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
  Alert
} from 'react-native';
import BackButton from '../BackButton';

const VerifyScreen = ({navigation}: { navigation: any} ) => {
  // Pre-filled code for demo purposes - in a real app, this would be empty initially
  const [code, setCode] = useState(['0', '0', '0', '0', '0']);
  const [isLoading, setIsLoading] = useState(false);

  // Create refs for each input to allow focus management
  const inputRefs = useRef<any | null[]>([]);

  // Initialize refs array
  useEffect(() => {
    if (Array.isArray(inputRefs.current)) {
      inputRefs.current = inputRefs.current.slice(0, 5);
    }
  }, []);

  // Handle input change
  const handleCodeChange = (text: any, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-advance to next input if a digit was entered
    if (text.length === 1 && index < 4) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle backspace key press
  const handleKeyPress = (e: any, index: any) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Handle verification
  const handleVerify = () => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to next screen or show success message
        Alert.alert(
    'Verification Code notification',
    'Verification runner is successfull!!',
    [
      {
        text: 'Next',
        onPress: () => navigation.replace('Login'),
      },
    ],
  );
    }, 1000);
  };

  // Handle resend code
  const handleResendCode = () => {
    // Simulate resending code
    Alert.alert('New code sent to your email');
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
          Please enter code associated to your email
        </Text>

        {/* Verification code inputs */}
        <View style={styles.codeContainer}>
          {[0, 1, 2, 3, 4].map(index => (
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
          disabled={isLoading || code.join('').length !== 5}>
          <Text style={styles.verifyButtonText}>
            {isLoading ? 'Verifying...' : 'Verify'}
          </Text>
        </TouchableOpacity>

        {/* Resend code link */}
        <Pressable onPress={handleResendCode}>
          <Text style={styles.resendText}>Send code again</Text>
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
  backButtonText: {
    fontSize: 18,
    fontWeight: '500',
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
    backgroundColor: '#0a2463', // Dark blue color from the image
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

export default VerifyScreen;
