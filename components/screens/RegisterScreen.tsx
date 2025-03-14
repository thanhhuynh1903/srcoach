import {
  Image,
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import {useState} from 'react';
import {wp, hp} from '../helpers/common';
import BackButton from '../BackButton';
import ScreenWrapper from '../ScreenWrapper';
import {useNavigation} from '@react-navigation/native';
import {theme} from '../contants/theme';
import Input from '../Input';
import Icon from '@react-native-vector-icons/ionicons';
import ButtonModify from '../Button';
import {Alert} from 'react-native';
const SignUpScreen = ({navigation}: {navigation: any}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordCf, setPasswordCf] = useState('');
  const handleLogin = () => {
    if (email === 'admin' && password === '123456') {
      navigation.replace('Main');
    } else {
      Alert.alert('Invalid credentials');
    }
  };

  return (
    <ScreenWrapper bg={'white'}>
      <View style={styles.container}>
        <BackButton size={26} />
        <View>
          <Text style={styles.welcomeText}>Create Account,</Text>
          <Text style={styles.welcomesubText}>Join us to start your journey</Text>
        </View>
        <View style={styles.form}>
          <Text style={{fontSize: hp(1.5), color: theme.colors.textLight}}>
            Try to register a new account here
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
          <Input
            icon={<Icon name="lock-closed-outline" size={24} color="black" />}
            placeholder="Enter your confirm password"
            onChangeText={value => setPasswordCf(value)}
            value={passwordCf}
            secureTextEntry={true}
          />
        </View>
        <ButtonModify
          title="Create Account"
          onPress={() => navigation.navigate('Login')}
        />
        <View>
          <Text style={styles.termsText}>
            By signing up, you agree to read{' '}
            <Text style={styles.link}>Terms of Service</Text> and{' '}
            <Text style={styles.link}>Privacy Policy</Text>
          </Text>

          <Text style={styles.orText}>or continue with</Text>

          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton}>
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
          <Text style={styles.footerText}>Already have an account?</Text>
          <Pressable onPress={() => navigation.push('Login')}>
            <Text
              style={[
                styles.footerText,
                {color: theme.fontColor.SemiboldBlue, fontWeight: 'bold'},
              ]}>
              Login
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
    fontSize: hp(2.4),
    fontWeight: 500,
    color: theme.colors.text,
  },
  form: {
    gap: 20,
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
  },
  footerText: {
    textAlign: 'center',
    color: theme.colors.text,
    fontSize: hp(1.6),
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  link: {
    color: '#0B2341',
    fontWeight: 'bold',
  },
  iconImage: {
    width: 20,
    height: 20,
  },
  orText: {
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  socialContainer: {
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
});
export default SignUpScreen;
