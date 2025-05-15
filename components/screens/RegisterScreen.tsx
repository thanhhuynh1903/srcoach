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
import {Picker} from '@react-native-picker/picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const SignUpScreen = ({navigation}: {navigation: any}) => {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordCf, setPasswordCf] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const {dataUser, status, message, register, clear} = useRegisterStore();
  const [loading, setLoading] = useState(false);

  // Hàm validate đầu vào
  const validateInputs = (): boolean => {
  // Trim các giá trị đầu vào
  const trimmedName = name.trim();
  const trimmedUsername = username.trim();
  const trimmedGender = gender.trim().toLowerCase();
  const trimmedDob = dob.trim();
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();
  const trimmedPasswordCf = passwordCf.trim();

  // Validate Name (3-25 ký tự)
  const nameRegex = /^[a-zA-ZÀ-ỹ\s']{3,25}$/;
  if (!trimmedName) {
    Alert.alert('Error', 'Name is required.');
    return false;
  }
  if (!nameRegex.test(trimmedName)) {
    Alert.alert(
      'Invalid Name',
      'Name must be 3-25 characters, only letters and accents are allowed.'
    );
    return false;
  }

  // Validate Username (8-40 ký tự)
  const usernameRegex = /^[a-zA-Z0-9_]{8,40}$/;
  if (!trimmedUsername) {
    Alert.alert('Error', 'Username is required.');
    return false;
  }
  if (!usernameRegex.test(trimmedUsername)) {
    Alert.alert(
      'Invalid Username',
      'Username must be 8-40 characters, only letters, numbers and underscores are allowed.'
    );
    return false;
  }

  // Validate Gender (chính xác các giá trị yêu cầu)
  const validGenders = ['male', 'female', 'others'];
  if (!validGenders.includes(trimmedGender)) {
    Alert.alert('Error', 'Please select a valid gender (Male/Female/Others).');
    return false;
  }

  // Validate Date of Birth
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!trimmedDob || !dateRegex.test(trimmedDob)) {
    Alert.alert(
      'Error',
      'Please enter a valid date of birth in yyyy-mm-dd format.'
    );
    return false;
  }

  // Validate Age >= 13
  const dobDate = new Date(trimmedDob);
  const age = new Date().getFullYear() - dobDate.getFullYear();
  if (age < 13) {
    Alert.alert('Error', 'You must be at least 13 years old to register.');
    return false;
  }

  // Validate Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
    Alert.alert('Error', 'Please enter a valid email address.');
    return false;
  }

  // Validate Password (8-40 ký tự)
  if (trimmedPassword.length < 8 || trimmedPassword.length > 40) {
    Alert.alert(
      'Error',
      'Password must be between 8 and 40 characters.'
    );
    return false;
  }

  // Validate Password Confirmation
  if (trimmedPassword !== trimmedPasswordCf) {
    Alert.alert('Error', 'Passwords do not match.');
    return false;
  }

  return true;
};

  useEffect(() => {
    clear();
  }, [navigation]);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  // Xử lý khi xác nhận chọn ngày
  const handleConfirm = date => {
    // Format date to yyyy-mm-dd
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    setDob(`${year}-${month}-${day}`);
    hideDatePicker();
  };
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
    <ScrollView style={{flex: 1, backgroundColor: 'white'}}>
      <View style={styles.container}>
        <View style={{marginTop: 16, alignSelf: 'flex-start'}}>
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
              <View style={styles.pickerIconContainer}>
                <Icon
                  name="people-outline"
                  size={20}
                  color="#666"
                  style={styles.pickerIcon}
                />
              </View>
              <Picker
                selectedValue={gender}
                onValueChange={itemValue => setGender(itemValue)}
                style={styles.genderPicker}
                dropdownIconColor={theme.colors.primary}>
                <Picker.Item
                  label="Gender"
                  value=""
                  style={{fontSize: 14, color: '#999'}}
                />
                <Picker.Item label="Male" value="Male" style={{fontSize: 14}} />
                <Picker.Item
                  label="Female"
                  value="Female"
                  style={{fontSize: 14}}
                />
                <Picker.Item
                  label="Other"
                  value="Other"
                  style={{fontSize: 14}}
                />
              </Picker>
            </View>
          </View>
          <TouchableOpacity onPress={showDatePicker}>
            <Input
              icon={<Icon name="calendar-outline" size={24} color="black" />}
              placeholder="Date of birth (yyyy-mm-dd)"
              value={dob}
              editable={false}
            />
          </TouchableOpacity>

          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
            maximumDate={new Date()} // Không cho phép chọn ngày trong tương lai
            minimumDate={new Date(1900, 0, 1)} // Giới hạn năm tối thiểu là 1900
            // Các tùy chọn UI cho iOS
            display="spinner"
            // Các tùy chọn ngôn ngữ
            confirmTextIOS="Xác nhận"
            cancelTextIOS="Hủy"
            headerTextIOS="Chọn ngày sinh"
          />

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
                {color: status === 'error' ? 'red' : 'green'},
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
            <TouchableOpacity
              onPress={() => navigation.navigate('TermsOfServiceScreen')}>
              <Text style={styles.link}>Terms of Service </Text>
            </TouchableOpacity>
            and{' '}
            <TouchableOpacity
              onPress={() => navigation.navigate('PrivacyPolicyScreen')}>
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
  container: {flex: 1, gap: 30, paddingHorizontal: wp(5)},
  welcomeText: {fontSize: hp(4), fontWeight: 'bold', color: theme.colors.text},
  welcomesubText: {
    fontSize: hp(2.4),
    fontWeight: '500',
    color: theme.colors.text,
  },
  form: {gap: 15},
  formHeaderText: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameInput: {
    width: '60%',
  },
  genderPickerContainer: {
    width: '38%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerIconContainer: {
    paddingLeft: 8,
    paddingRight: 2,
  },
  pickerIcon: {
    marginRight: 0,
  },
  genderPicker: {
    height: 50,
    width: '80%',
    color: theme.colors.text,
    fontSize: 14,
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
