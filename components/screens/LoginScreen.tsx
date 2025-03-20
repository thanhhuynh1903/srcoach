import {
  Image,
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
} from 'react-native';
import React, {useEffect} from 'react';
import {useState} from 'react';
import {wp, hp} from '../helpers/common';
import ScreenWrapper from '../ScreenWrapper';
import Icon from '@react-native-vector-icons/ionicons';
import BackButton from '../BackButton';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {theme} from '../contants/theme';
import Input from '../Input';
import ButtonModify from '../Button';
import {TouchableOpacity} from 'react-native';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import Toast from 'react-native-toast-message';
import {useLoginStore} from '../utils/useLoginStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
type RootStackParamList = {
  HomeTabs: undefined;
  Register: undefined;
  // Add other routes as needed
};

const LoginScreen: React.FC<{
  navigation: NavigationProp<RootStackParamList>;
}> = ({navigation}) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const {login, status, message, accessToken,clear} = useLoginStore();
  // Configure Google Sign-In on component mount
  useEffect(() => {
    clear();
    AsyncStorage.clear();
    console.log('Token mounted',AsyncStorage.getItem('authToken'));
    GoogleSignin.configure({
      webClientId:
        '235721584474-qo8doaih4g3lln7jia221pl7vjphfeq6.apps.googleusercontent.com',
    });
  }, []);
  const handleLogin = () => {
    login(email, password);
    if (status === 'success' && accessToken !== null) {
      return navigation.navigate('HomeTabs');
    }
  };
  // Google Sign-In handler
  async function onGoogleButtonPress() {
    try {
      console.log('Starting Google login');
      const hasPlayServices = await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      if (!hasPlayServices) {
        throw new Error('Google Play Services not available');
      }
      const signInResult = await GoogleSignin.signIn();

      if (!signInResult.data?.idToken) {
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: 'No ID token found',
        });
        return;
      }

      const googleCredential = auth.GoogleAuthProvider.credential(
        signInResult.data?.idToken,
      );
      await auth().signInWithCredential(googleCredential);
      console.log('googleCredential', signInResult.data);

      Toast.show({
        type: 'success',
        text1: 'Login Successful',
        text2: 'Welcome to the homepage!',
      });
      navigation.navigate('HomeTabs');
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: 'Invalid username or password. Please try again.',
      });
    }
  }

  return (
    <ScreenWrapper bg={'white'}>
      <View style={styles.container}>
        <View style={{marginTop: 20}}>
          <BackButton size={26} />
        </View>
        <View>
          <Text style={styles.welcomeText}>Hello 😉,</Text>
          <Text style={styles.welcomesubText}>
            Health is the most important in everyone's life
          </Text>
        </View>
        <View style={styles.form}>
          <Text style={{fontSize: hp(1.5), color: theme.colors.textLight}}>
            Please login to continue
          </Text>
          <Input
            icon={<Icon name="mail-outline" size={24} color="black" />}
            placeholder="Enter your email"
            onChangeText={value => setEmail(value)}
            value={email}
            keyboardType="email-address"
          />
          <Input
            icon={<Icon name="lock-closed-outline" size={24} color="black" />}
            placeholder="Enter your password"
            onChangeText={value => setPassword(value)}
            value={password}
            secureTextEntry={true}
          />
          <Text style={styles.forgotPassword}>Forgot password?</Text>
        </View>
        {status !== 'loading' ? (
          <ButtonModify title="Login" onPress={handleLogin} />
        ) : (
          <ButtonModify title="Login" loading={true} />
        )}
        <View style={{gap: 20}}>
          <Text style={styles.orText}>or continue with</Text>
          <View style={styles.socialButtons}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={onGoogleButtonPress}>
              <Image
                source={{
                  uri: 'https://upload.wikimedia.org/wikipedia/commons/0/09/IOS_Google_icon.png',
                }}
                style={styles.iconImage}
              />
              <Text style={styles.socialText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton}>
              <Icon name="call-outline" size={20} color="black" />
              <Text style={styles.socialText}>Phone</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <Pressable onPress={() => navigation.navigate('Register')}>
            <Text
              style={[
                styles.footerText,
                {color: theme.fontColor.SemiboldBlue, fontWeight: 'bold'},
              ]}>
              Sign Up
            </Text>
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
  welcomeImage: {
    height: hp(18),
    width: wp(100),
    alignSelf: 'center',
  },
  welcomeText: {
    fontSize: hp(4),
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  welcomesubText: {
    fontSize: hp(3),
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  form: {
    gap: 25,
  },
  forgotPassword: {
    textAlign: 'right',
    fontWeight: '600',
    color: theme.colors.text,
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
  orText: {
    color: '#666',
    textAlign: 'center',
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  socialText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  iconImage: {
    width: 20,
    height: 20,
  },
});
export default LoginScreen;
