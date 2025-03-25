import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../contants/theme';

const PasswordRecoverySuccessScreen = () => {
  const navigation = useNavigation();

  const handleNavigateToLogin = () => {
    navigation.reset({
      index: 0,
      routes: [{name: 'LoginScreen'}],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.content}>
        <View style={styles.messageContainer}>
          <Text style={styles.title}>Password Recovery Successful!</Text>
          
          <Text style={styles.description}>
            Your password has been successfully reset. You can now log in with your new password.
          </Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={handleNavigateToLogin}
            accessibilityLabel="Go to login"
          >
            <Text style={styles.buttonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  messageContainer: {
    flex: 1,
    paddingTop: 60,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000000',
    textAlign: 'left',
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'left',
    lineHeight: 22,
  },
  buttonContainer: {
    paddingTop: 16,
  },
  button: {
    backgroundColor: theme.colors.primaryDark,
    borderRadius: 4,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PasswordRecoverySuccessScreen;