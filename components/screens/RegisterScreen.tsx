import {
  Image,
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { wp, hp } from '../helpers/common';
import BackButton from '../BackButton';
import ScreenWrapper from '../ScreenWrapper';
import { theme } from '../contants/theme';
import Input from '../Input';
import Icon from '@react-native-vector-icons/ionicons';
import ButtonModify from '../Button';
import { Alert } from 'react-native';
import { useRegisterStore } from '../utils/useRegisterStore';
const SignUpScreen = ({ navigation } : {navigation: any}) => {
  // Access state and actions from the store
  const {
    email,
    password,
    username,
    age,
    message,
    status,
    setEmail,
    setPassword,
    setUsername,
    setAge,
    register,
    clear,
  } = useRegisterStore();

  // Local state for password confirmation (not in store)
  const [passwordCf, setPasswordCf] = useState('');

  // Handle registration
  const handleRegister = () => {
    if (password !== passwordCf) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (!email || !password || !username || !age) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    register(email, password, username, age);
  };

  // Navigate to VerifyScreen on successful registration
  useEffect(() => {
    clear();
    if (status === 'success') {
      navigation.navigate('VerifyScreen');
      clear(); // Optional: Clear the form after success
    }
  }, [status, navigation, clear]);

  return (
    <ScrollView style={{ flex: 1,backgroundColor:"white" }}>
      <View style={styles.container}>
        <View style={{ marginTop: 16 }}>
          <BackButton size={26} />
        </View>
        <View>
          <Text style={styles.welcomeText}>Create Account,</Text>
          <Text style={styles.welcomesubText}>
            Join us to start your journey
          </Text>
        </View>
        <View style={styles.form}>
          <Text style={{ fontSize: hp(1.5), color: theme.colors.textLight }}>
            Try to register a new account here
          </Text>
          <View style={{ flexDirection: 'row' }}>
            <Input
              containerStyle={{ width: '67%' }}
              icon={<Icon name="person-outline" size={24} color="black" />}
              placeholder="Enter your username"
              onChangeText={setUsername}
              value={username}
              keyboardType="default"
            />
            <Input
              containerStyle={{ width: '30%', marginLeft: 10 }}
              icon={<Icon name="ribbon-outline" size={24} color="black" />}
              placeholder="Age"
              onChangeText={setAge}
              value={age}
              keyboardType="numeric"
              maxLength={2}
            />
          </View>
          <Input
            icon={<Icon name="mail-outline" size={24} color="black" />}
            placeholder="Enter your Email"
            onChangeText={setEmail}
            value={email}
            keyboardType="email-address"
          />
          <Input
            icon={<Icon name="lock-closed-outline" size={24} color="black" />}
            placeholder="Enter your password"
            onChangeText={setPassword}
            value={password}
            secureTextEntry={true}
          />
          <Input
            icon={<Icon name="lock-closed-outline" size={24} color="black" />}
            placeholder="Enter your confirm password"
            onChangeText={setPasswordCf}
            value={passwordCf}
            secureTextEntry={true}
          />
          {/* Display message from the store */}
          {message && (
            <Text
              style={{
                color: status === 'error' ? 'red' : 'green',
                textAlign: 'center',
              }}>
              {message}
            </Text>
          )}
        </View>
        <ButtonModify
          title={status === 'loading' ? 'Creating...' : 'Create Account'}
          onPress={handleRegister}
          loading={status === 'loading'} // Disable button during loading
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
                { color: theme.fontColor.SemiboldBlue, fontWeight: 'bold' },
              ]}>
              Login
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 30,
    paddingHorizontal: wp(5),
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
    gap: 15,
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