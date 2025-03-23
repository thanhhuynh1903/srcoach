import React, {useState, useEffect} from 'react';
import {
  Image,
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {wp, hp} from '../helpers/common';
import BackButton from '../BackButton';
import {theme} from '../contants/theme';
import Input from '../Input';
import Icon from '@react-native-vector-icons/ionicons';
import ButtonModify from '../Button';
import {useRegisterStore} from '../utils/useRegisterStore';

const SignUpScreen = ({navigation}: {navigation: any}) => {
  // Local state
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordCf, setPasswordCf] = useState('');

  // Access state and actions from the store
  const {dataUser, status, message, register, clear} =
    useRegisterStore();
  const [loading, setLoading] = useState(false);

  // Hàm kiểm tra định dạng email
  // const isValidEmail = (email: string) => {
  //   const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;
  //   return re.test(String(email).toLowerCase());
  // };

  // Hàm validate đầu vào
  const validateInputs = (): boolean => {
    if (!username.trim() || !name.trim()) {
      Alert.alert('Error', 'Username and Name are required.');
      return false;
    }
    if (!age.trim() || isNaN(Number(age)) || Number(age) <= 0) {
      Alert.alert('Error', 'Please enter a valid age.');
      return false;
    }
    // if (!email.trim() || !isValidEmail(email)) {
    //   Alert.alert('Error', 'Please enter a valid email address.');
    //   return false;
    // }
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return false;
    }
    if (password !== passwordCf) {
      Alert.alert('Error', 'Passwords do not match.');
      return false;
    }
    return true;
  };

  // Handle registration
  const handleRegister = async () => {
    if (!validateInputs()) return;
    setLoading(true); // Start loading

    try {
      await register(
        name.trim(),
        username.trim(),
        parseInt(age, 10),
        email.trim().toLowerCase(),
        password,
      );
      // Optionally, navigate or show success
    } catch (error) {
      console.error(error);
      // Optionally, show error message
    } finally {
      setLoading(false); // End loading
    }
  };

  // Khi đăng ký thành công, chuyển đến VerifyScreen
  useEffect(() => {
    if (status === 'success') {
      console.log('dataUser', dataUser);
      navigation.navigate('VerifyScreen', {
        emailLabel: email, // pass the email to the next screen
      });
      clear(); // Reset store sau khi thành công
    }
  }, [status, dataUser, navigation, clear]);

  return (
    <ScrollView style={{flex: 1, backgroundColor: 'white'}}>
      <View style={styles.container}>
        <View style={{marginTop: 16}}>
          <BackButton size={26} />
        </View>
        <View>
          <Text style={styles.welcomeText}>Create Account,</Text>
          <Text style={styles.welcomesubText}>
            Join us to start your journey
          </Text>
        </View>
        <View style={styles.form}>
          <Text style={{fontSize: hp(1.5), color: theme.colors.textLight}}>
            Try to register a new account here
          </Text>
          <Input
            icon={<Icon name="glasses-outline" size={24} color="black" />}
            placeholder="Enter your Username"
            onChangeText={setUsername}
            value={username}
            keyboardType="default"
          />
          <View style={{flexDirection: 'row'}}>
            <Input
              containerStyle={{width: '67%'}}
              icon={<Icon name="person-outline" size={24} color="black" />}
              placeholder="Enter your Name"
              onChangeText={setName}
              value={name}
              keyboardType="default"
            />
            <Input
              containerStyle={{width: '30%', marginLeft: 10}}
              icon={<Icon name="ribbon-outline" size={24} color="black" />}
              placeholder="Age"
              onChangeText={setAge}
              value={age}
              keyboardType="numeric"
              maxLength={3}
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
            secureTextEntry
          />
          <Input
            icon={<Icon name="lock-closed-outline" size={24} color="black" />}
            placeholder="Confirm your password"
            onChangeText={setPasswordCf}
            value={passwordCf}
            secureTextEntry
          />
          {/* Hiển thị message từ store nếu có */}
          {message ? (
            <Text
              style={{
                color: status === 'error' ? 'red' : 'green',
                textAlign: 'center',
              }}>
              {message}
            </Text>
          ) : null}
        </View>
        <ButtonModify
          title="Create Account"
          onPress={handleRegister}
          loading={loading} // Pass the loading state to the ButtonModify component
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, gap: 30, paddingHorizontal: wp(5)},
  welcomeText: {fontSize: hp(4), fontWeight: 'bold', color: theme.colors.text},
  welcomesubText: {
    fontSize: hp(2.4),
    fontWeight: '500',
    color: theme.colors.text,
  },
  form: {gap: 15},
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
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
  link: {color: '#0B2341', fontWeight: 'bold'},
  iconImage: {width: 20, height: 20},
  orText: {color: '#666', marginBottom: 10, textAlign: 'center'},
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
  socialText: {marginLeft: 8, fontSize: 14, fontWeight: '500'},
});

export default SignUpScreen;
