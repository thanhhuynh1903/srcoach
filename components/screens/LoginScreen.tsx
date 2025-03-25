import React, { useState, useEffect } from 'react';
import {
  Image,
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { wp, hp } from '../helpers/common';
import ScreenWrapper from '../ScreenWrapper';
import Icon from '@react-native-vector-icons/ionicons';
import BackButton from '../BackButton';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { theme } from '../contants/theme';
import Input from '../Input';
import ButtonModify from '../Button';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import Toast from 'react-native-toast-message';
import { useLoginStore } from '../utils/useLoginStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  HomeTabs: undefined;
  Register: undefined;
  VerifyLoginScreen: {
    emailLabel: string;
  };
};

const LoginScreen: React.FC<{ navigation: NavigationProp<RootStackParamList> }> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, message, status, clear } = useLoginStore();
  const canGoBack = navigation.canGoBack();

  useEffect(() => {
    clear();
    console.log('Token mounted', AsyncStorage.getItem('authToken'));
    GoogleSignin.configure({
      webClientId: '235721584474-qo8doaih4g3lln7jia221pl7vjphfeq6.apps.googleusercontent.com',
    });
  }, [clear]);

  useEffect(() => {
    if (status === 'success') {
      showToast('success', message || 'Login Successful', 'Welcome to the homepage!');
      navigation.navigate('HomeTabs');
    } else if (status === 'wait') {
      navigation.navigate('VerifyLoginScreen', { emailLabel: email });
      clear();
    } else if (status === 'error' && message) {
      showToast('error', message);
    }
  }, [status, message, navigation]);

  const showToast = (type: string, text1: string, text2?: string) => {
    Toast.show({
      type,
      text1,
      text2,
    });
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showToast('error', 'Please fill in both email and password');
      return;
    }
    
    setLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const hasPlayServices = await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      
      if (!hasPlayServices) {
        throw new Error('Google Play Services not available');
      }

      const signInResult = await GoogleSignin.signIn();
      if (!signInResult.data?.idToken) {
        showToast('error', 'Login Failed', 'No ID token found');
        return;
      }

      const googleCredential = auth.GoogleAuthProvider.credential(signInResult.data.idToken);
      await auth().signInWithCredential(googleCredential);
      
      showToast('success', 'Login Successful', 'Welcome to the homepage!');
      navigation.navigate('HomeTabs');
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      showToast('error', 'Login Failed', 'Invalid username or password. Please try again.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <ScreenWrapper bg={'white'}>
      <View style={styles.container}>
        <View style={styles.backButtonContainer}>
          {canGoBack && <BackButton size={26} />}
        </View>
        
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Hello 😉,</Text>
          <Text style={styles.welcomeSubText}>
            Health is the most important in everyone's life
          </Text>
        </View>
        
        <View style={styles.form}>
          <Text style={styles.formHeaderText}>Please login to continue</Text>
          <Input
            icon={<Icon name="mail-outline" size={24} color="black" />}
            placeholder="Enter your email"
            onChangeText={setEmail}
            value={email}
            keyboardType="email-address"
          />
          <Input
            icon={<Icon name="lock-closed-outline" size={24} color="black" />}
            placeholder="Enter your password"
            onChangeText={setPassword}
            value={password}
            isPassword
          />
          <Pressable onPress={() => navigation.navigate('PasswordRecoveryScreen' as never)}>
            <Text style={styles.forgotPassword}>Forgot password?</Text>
          </Pressable>
        </View>

        <ButtonModify 
          title="Login" 
          onPress={handleLogin} 
          loading={loading} 
        />

        <View style={styles.socialContainer}>
          <Text style={styles.orText}>or continue with</Text>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={handleGoogleSignIn}>
            <Image
              source={{
                uri: 'https://upload.wikimedia.org/wikipedia/commons/0/09/IOS_Google_icon.png',
              }}
              style={styles.socialIcon}
            />
            <Text style={styles.socialText}>Google</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <Pressable onPress={() => navigation.navigate('RegisterScreen')}>
            <Text style={styles.footerLinkText}>Sign Up</Text>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 30,
    paddingHorizontal: wp(5),
  },
  backButtonContainer: {
    marginTop: 20,
  },
  header: {
    gap: 8,
  },
  welcomeText: {
    fontSize: hp(4),
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  welcomeSubText: {
    fontSize: hp(2.4),
    fontWeight: '500',
    color: theme.colors.text,
  },
  form: {
    gap: 25,
  },
  formHeaderText: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
  },
  forgotPassword: {
    textAlign: 'right',
    fontWeight: '600',
    color: theme.colors.text,
  },
  socialContainer: {
    gap: 20,
  },
  orText: {
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
  },
  socialIcon: {
    width: 20,
    height: 20,
  },
  socialText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  footerText: {
    textAlign: 'center',
    color: theme.colors.text,
    fontSize: hp(1.6),
  },
  footerLinkText: {
    color: theme.fontColor.SemiboldBlue,
    fontWeight: 'bold',
    fontSize: hp(1.6),
  },
});

export default LoginScreen;