import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import BackButton from '../../BackButton';
import Input from '../../Input';
import { theme } from '../../contants/theme';
import { useNavigation } from '@react-navigation/native';

const PasswordRecoveryScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [isValidEmail, setIsValidEmail] = useState<boolean | null>(null);

  useEffect(() => {
    if (email.length === 0) {
      setIsValidEmail(null);
      return;
    }
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValidEmail(emailPattern.test(email));
  }, [email]);

  const handleSubmit = () => {
    if (isValidEmail) {
      navigation.navigate("PasswordRecoveryCodeScreen", { email });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <BackButton size={26} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Password recovery</Text>
        
        <Text style={styles.description}>
          Please confirm your country code and enter the number associates with your account.
        </Text>
        
        <View style={styles.inputContainer}>
          <Input
            icon={<Icon name="mail-outline" size={24} color="black" />}
            placeholder="Email"
            value={email}
            onChangeText={(text) => setEmail(text)}
            keyboardType="email-address"
          />
          {isValidEmail === false && (
            <Text style={styles.errorText}>Please enter a valid email</Text>
          )}
        </View>
        
        <TouchableOpacity 
          style={[
            styles.button,
            (!email || isValidEmail === false) && styles.buttonDisabled
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
  inputIcon: {
    position: 'absolute',
    left: 16,
    top: 15,
    zIndex: 1,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingVertical: 14,
    paddingLeft: 48,
    paddingRight: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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

export default PasswordRecoveryScreen;