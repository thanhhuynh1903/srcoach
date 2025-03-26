import React, { useState, useEffect } from 'react';
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
import { wp, hp } from '../helpers/common';
import BackButton from '../BackButton';
import { theme } from '../contants/theme';
import Input from '../Input';
import Icon from '@react-native-vector-icons/ionicons';
import ButtonModify from '../Button';
import { useRegisterStore } from '../utils/useRegisterStore';
import { Picker } from '@react-native-picker/picker';
import { Calendar } from 'react-native-calendars';

const SignUpScreen = ({ navigation }: { navigation: any }) => {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordCf, setPasswordCf] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  const { dataUser, status, message, register, clear } = useRegisterStore();
  const [loading, setLoading] = useState(false);

  // Hàm validate đầu vào
  const validateInputs = (): boolean => {
    if (!username.trim() || !name.trim()) {
      Alert.alert('Error', 'Username and Name are required.');
      return false;
    }
    if (!gender.trim()) {
      Alert.alert('Error', 'Please select your gender.');
      return false;
    }

    // Date of birth validation (yyyy-mm-dd format)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dob.trim() || !dateRegex.test(dob)) {
      Alert.alert(
        'Error',
        'Please enter a valid date of birth in yyyy-mm-dd format.',
      );
      return false;
    }

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

  useEffect(() => {
    clear();
  }, [navigation]);

  // Handle registration
  const handleRegister = async () => {
    if (!validateInputs()) return;
    setLoading(true); // Start loading
    console.log('status register', status);

    try {
      await register(
        name.trim(),
        username.trim(),
        gender.trim(),
        dob.trim(),
        email.trim().toLowerCase(),
        password,
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'success') {
      console.log('dataUser', dataUser);
      navigation.navigate('VerifyScreen', {
        emailLabel: email,
      });
      clear();
    }
  }, [status, dataUser, navigation, clear]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: 'white' }}>
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
          <Text style={styles.formHeaderText}>
            Try to register a new account here
          </Text>
          <Input
            icon={<Icon name="glasses-outline" size={24} color="black" />}
            placeholder="Enter your Username"
            onChangeText={setUsername}
            value={username}
            keyboardType="default"
          />
          <View style={styles.rowContainer}>
            <Input
              containerStyle={styles.nameInput}
              icon={<Icon name="person-outline" size={24} color="black" />}
              placeholder="Enter your Name"
              onChangeText={setName}
              value={name}
              keyboardType="default"
            />
            <View style={styles.genderPickerContainer}>
              <Picker
                selectedValue={gender}
                onValueChange={itemValue => setGender(itemValue)}
                style={styles.genderPicker}>
                <Picker.Item label="Select Gender" value="" />
                <Picker.Item label="Male" value="Male" />
                <Picker.Item label="Female" value="Female" />
                <Picker.Item label="Other" value="Other" />
              </Picker>
            </View>
          </View>
          <TouchableOpacity onPress={() => setShowCalendar(!showCalendar)}>
            <Input
              icon={<Icon name="calendar-outline" size={24} color="black" />}
              placeholder="Date of birth (yyyy-mm-dd)"
              value={dob}
              editable={false}

            />
          </TouchableOpacity>
          {showCalendar && (
            <Calendar
              onDayPress={day => {
                setDob(day.dateString);
                setShowCalendar(false);
              }}
              markedDates={{
                [dob]: { selected: true, selectedColor: theme.colors.primary },
              }}
            />
          )}
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
              style={[
                styles.messageText,
                { color: status === 'error' ? 'red' : 'green' },
              ]}>
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
          </Text>
          <Text style={styles.termsTextSub}>
            <TouchableOpacity onPress={() => navigation.navigate('TermsOfServiceScreen')}>
              <Text style={styles.link}>Terms of Service{' '}</Text>
            </TouchableOpacity>
            and{' '}
            <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicyScreen')}>
              <Text style={styles.link}>Privacy Policy</Text>
            </TouchableOpacity>
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
          <Text style={styles.footerText}>Already have an account? </Text>
          <Pressable onPress={() => navigation.push('LoginScreen')}>
            <Text style={styles.footerLinkText}>Login</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, gap: 30, paddingHorizontal: wp(5) },
  welcomeText: { fontSize: hp(4), fontWeight: 'bold', color: theme.colors.text },
  welcomesubText: {
    fontSize: hp(2.4),
    fontWeight: '500',
    color: theme.colors.text,
  },
  form: { gap: 15 },
  formHeaderText: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameInput: {
    width: '65%',
  },
  genderPickerContainer: {
    width: '32%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    justifyContent: 'center',
  },
  genderPicker: {
    height: 50,
    width: '100%',
  },
  messageText: {
    textAlign: 'center',
  },
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
  footerLinkText: {
    color: theme.fontColor.SemiboldBlue,
    fontWeight: 'bold',
    fontSize: hp(1.6),
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  termsTextSub: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  link: {
    color: '#0B2341',
    fontWeight: 'bold',
    transform: [{ translateY: 5 }],
  },
  iconImage: { width: 20, height: 20 },
  orText: { color: '#666', marginBottom: 10, textAlign: 'center' },
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
  socialText: { marginLeft: 8, fontSize: 14, fontWeight: '500' },
});

export default SignUpScreen;