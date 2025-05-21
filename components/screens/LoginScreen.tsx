import React, {useState, useEffect, useRef} from 'react';
import {
  Image,
  View,
  Text,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {wp, hp} from '../helpers/common';
import ScreenWrapper from '../ScreenWrapper';
import Icon from '@react-native-vector-icons/ionicons';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import Input from '../Input';
import ButtonModify from '../Button';
import Toast from 'react-native-toast-message';
import {useLoginStore} from '../utils/useLoginStore';
import useAuthStore from '../utils/useAuthStore';
import NotificationService from '../services/NotificationService';

type RootStackParamList = {
  HomeTabs: undefined;
  Register: undefined;
  VerifyLoginScreen: {
    emailLabel: string;
    password: string;
  };
  PasswordRecoveryScreen: undefined;
  RegisterScreen: undefined;
};

const LoginScreen: React.FC<{
  navigation: NavigationProp<RootStackParamList>;
}> = ({navigation}) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const {data, profile, login, message, status, clear} = useLoginStore();
  const canGoBack = navigation.canGoBack();
  const {loadToken} = useAuthStore();
  const prevStatusRef = useRef('');
  const [invalidPassword, setInvalidPassword] = useState(false);

  useEffect(() => {
    clear();
  }, [clear]);

  useEffect(() => {
    if (status === prevStatusRef.current) return;
    prevStatusRef.current = status;

    const handleAuthStatus = async () => {
      if (status === 'success') {
        await loadToken();
        await setupNotifications();
        showToast('success', message, 'Welcome back!');
        navigation.navigate('HomeTabs');
        setInvalidPassword(false);
        clear();
      } else if (status === 'wait') {
        navigation.navigate('VerifyLoginScreen', {
          emailLabel: data.user.email,
          password: password,
        });
        setInvalidPassword(false);
        clear();
      } else if (status === 'error' && message) {
        showToast('error', message.toString());
        clear();
        setInvalidPassword(true);
      }
    };

    handleAuthStatus();
  }, [status, message, email, password, navigation, loadToken]);

  useEffect(() => {
    if (status === 'success' && prevStatusRef.current === 'success') {
      setTimeout(() => {
        clear();
      }, 500);
    }
  }, [status, clear]);

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

  const emailValidated = (): boolean | null => {
    if (!email || !email.includes('@')) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const setupNotifications = async () => {
    try {
      await NotificationService.init();
      await NotificationService.setupNotificationOpenHandlers(navigation);
    } catch (error) {
      console.error('Notification setup error:', error);
    }
  };

  return (
    <ScreenWrapper bg={'white'}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            {/* Centered Content */}
            <View style={styles.centeredContent}>
              <View style={styles.header}>
                <Image
                  source={require('../assets/logo.png')}
                  style={styles.logo}
                />
                <View style={styles.textContainer}>
                  <Text style={styles.welcomeText}>Welcome, runners!</Text>
                  <Text style={styles.welcomeSubText}>
                    Sign in to continue your running journey
                  </Text>
                </View>
              </View>

              <View style={styles.formContainer}>
                <View style={styles.form}>
                  <Input
                    keyboardType="email"
                    placeholder="Email or username"
                    onChangeText={setEmail}
                    value={email}
                    containerStyle={styles.inputContainer}
                    validated={emailValidated()}
                    errorMsg={invalidPassword ? 'Invalid credentials' : ''}
                  />
                  <Input
                    keyboardType="password"
                    placeholder="Password"
                    onChangeText={setPassword}
                    value={password}
                    containerStyle={styles.inputContainer}
                    errorMsg={invalidPassword ? 'Invalid credentials' : ''}
                  />
                  <Pressable
                    style={styles.forgotPasswordContainer}
                    onPress={() =>
                      navigation.navigate('PasswordRecoveryScreen')
                    }>
                    <Text style={styles.forgotPassword}>Forgot password?</Text>
                  </Pressable>
                </View>

                <ButtonModify
                  title="Sign In"
                  onPress={handleLogin}
                  loading={loading}
                  style={styles.loginButton}
                  textStyle={styles.loginButtonText}
                />
              </View>
            </View>

            {/* Footer stays at bottom */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <Pressable onPress={() => navigation.navigate('RegisterScreen')}>
                <Text style={styles.footerLinkText}>Sign Up</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  container: {
    flex: 1,
    paddingHorizontal: wp(6),
    justifyContent: 'space-between',
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    marginTop: hp(-10),
  },
  header: {
    alignItems: 'center',
    marginBottom: hp(4),
  },
  logo: {
    width: hp(8),
    height: hp(8),
    marginBottom: hp(2),
  },
  textContainer: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: hp(3.2),
    fontWeight: '700',
    color: '#212121',
    marginBottom: hp(1),
  },
  welcomeSubText: {
    fontSize: hp(2),
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: hp(2.8),
  },
  formContainer: {
    marginTop: hp(2),
  },
  form: {
    marginBottom: hp(3),
  },
  inputContainer: {
    marginBottom: hp(2),
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: hp(1),
  },
  forgotPassword: {
    color: '#1E40AF',
    fontSize: hp(1.8),
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#3B82F6',
    borderRadius: hp(1.5),
    height: hp(6.5),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  loginButtonText: {
    color: 'white',
    fontSize: hp(2),
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: hp(4),
    gap: wp(1.5),
  },
  footerText: {
    color: '#6B7280',
    fontSize: hp(1.8),
  },
  footerLinkText: {
    color: '#1E40AF',
    fontWeight: '600',
    fontSize: hp(1.8),
  },
});

export default LoginScreen;
