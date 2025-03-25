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
  Platform,
} from 'react-native';
import {wp, hp} from '../helpers/common';
import BackButton from '../BackButton';
import {theme} from '../contants/theme';
import Input from '../Input';
import Icon from '@react-native-vector-icons/ionicons';
import ButtonModify from '../Button';
import {useRegisterStore} from '../utils/useRegisterStore';
import DateTimePicker from '@react-native-community/datetimepicker';

const SignUpScreen = ({navigation}: {navigation: any}) => {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordCf, setPasswordCf] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());

  const {dataUser, status, message, register, clear} = useRegisterStore();
  const [loading, setLoading] = useState(false);

  const validateInputs = (): boolean => {
    if (!username.trim() || !name.trim()) {
      Alert.alert('Error', 'Username and Name are required.');
      return false;
    }
    if (!gender.trim()) {
      Alert.alert('Error', 'Please select your gender.');
      return false;
    }

    if (!dob.trim()) {
      Alert.alert('Error', 'Please select your date of birth.');
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

  const handleRegister = async () => {
    if (!validateInputs()) return;
    setLoading(true);

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
      navigation.navigate('VerifyScreen', {
        emailLabel: email,
      });
      clear();
    }
  }, [status, dataUser, navigation, clear]);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);

    if (event.type === 'set') {
      const formattedDate = currentDate.toISOString().split('T')[0];
      setDob(formattedDate);
    }
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <View style={styles.backButtonContainer}>
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
          <Input
            containerStyle={styles.nameInput}
            icon={<Icon name="person-outline" size={24} color="black" />}
            placeholder="Enter your Name"
            onChangeText={setName}
            value={name}
            keyboardType="default"
          />
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === 'male' && styles.maleSelected,
              ]}
              onPress={() => setGender('male')}>
              <Icon
                name="male-outline"
                size={24}
                color={gender === 'male' ? 'white' : 'black'}
              />
              <Text
                style={[
                  styles.genderButtonText,
                  gender === 'male' && styles.genderButtonTextSelected,
                ]}>
                Male
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === 'female' && styles.femaleSelected,
              ]}
              onPress={() => setGender('female')}>
              <Icon
                name="female-outline"
                size={24}
                color={gender === 'female' ? 'white' : 'black'}
              />
              <Text
                style={[
                  styles.genderButtonText,
                  gender === 'female' && styles.genderButtonTextSelected,
                ]}>
                Female
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === 'other' && styles.otherSelected,
              ]}
              onPress={() => setGender('other')}>
              <Icon
                name="person-outline"
                size={24}
                color={gender === 'other' ? 'white' : 'black'}
              />
              <Text
                style={[
                  styles.genderButtonText,
                  gender === 'other' && styles.genderButtonTextSelected,
                ]}>
                Other
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <Input
              icon={<Icon name="calendar-outline" size={24} color="black" />}
              placeholder="Date of birth (yyyy-mm-dd)"
              value={dob}
              editable={false}
            />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onChangeDate}
              maximumDate={new Date()}
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
            isPassword
          />
          <Input
            icon={<Icon name="lock-closed-outline" size={24} color="black" />}
            placeholder="Confirm your password"
            onChangeText={setPasswordCf}
            value={passwordCf}
            isPassword
          />
          {message ? (
            <Text
              style={[
                styles.messageText,
                {color: status === 'error' ? 'red' : 'green'},
              ]}>
              {message}
            </Text>
          ) : null}
        </View>
        <ButtonModify
          title="Create Account"
          onPress={handleRegister}
          loading={loading}
        />
        <View>
          <Text style={styles.termsText}>
            By signing up, you agree to read{' '}
          </Text>
          <Text style={styles.termsTextSub}>
            <TouchableOpacity
              onPress={() => navigation.navigate('TermsOfService')}>
              <Text style={styles.link}>Terms of Service </Text>
            </TouchableOpacity>
            and{' '}
            <TouchableOpacity
              onPress={() => navigation.navigate('PrivacyPolicy')}>
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
          <Pressable onPress={() => navigation.push('Login')}>
            <Text style={styles.footerLinkText}>Login</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    gap: 30,
    paddingHorizontal: wp(5),
  },
  backButtonContainer: {
    marginTop: 16,
  },
  welcomeText: {
    fontSize: hp(4),
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  welcomesubText: {
    fontSize: hp(2.4),
    fontWeight: '500',
    color: theme.colors.text,
  },
  form: {
    gap: 15,
  },
  formHeaderText: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameInput: {
    width: '100%',
  },
  genderContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    gap: 5,
    borderRadius: theme.radius.xs,
    borderWidth: 1,
    borderColor: '#ccc',
    marginHorizontal: 2,
  },
  maleSelected: {
    backgroundColor: '#0016a8',
    borderColor: '#0016a8',
  },
  femaleSelected: {
    backgroundColor: '#E91E63',
    borderColor: '#E91E63',
  },
  otherSelected: {
    backgroundColor: '#7d7d7d',
    borderColor: '#7d7d7d',
  },
  genderButtonText: {
    fontSize: 12,
    marginTop: 4,
    color: 'black',
  },
  genderButtonTextSelected: {
    color: 'white',
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
    transform: [{translateY: 5}],
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
