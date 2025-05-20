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
  KeyboardAvoidingView,
  Platform,
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1, backgroundColor: 'white'}}>
      <ScrollView 
        style={{flex: 1}}
        contentContainerStyle={{paddingBottom: 30}}
        showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.backButtonWrapper}>
            <BackButton size={26} />
          </View>
          
          <View style={styles.headerContainer}>
            <Text style={styles.welcomeText}>Join the Journey 🏃</Text>
            <Text style={styles.welcomeSubText}>
              Create your account to start tracking your fitness goals
            </Text>
          </View>
          
          <View style={styles.form}>
            <Input
              icon={<Icon name="person-circle-outline" size={22} color={theme.colors.primary} />}
              placeholder="Username (8-40 characters)"
              onChangeText={setUsername}
              value={username}
              keyboardType="default"
              containerStyle={styles.inputContainer}
            />
            
            <Input
              icon={<Icon name="person-outline" size={22} color={theme.colors.primary} />}
              placeholder="Full Name"
              onChangeText={setName}
              value={name}
              keyboardType="default"
              containerStyle={styles.inputContainer}
            />
            
            <View style={styles.rowContainer}>
              <TouchableOpacity 
                style={styles.genderPickerContainer}
                activeOpacity={0.8}
                onPress={() => {
                  // This is just to make it look more interactive
                  // The actual picker will still open as normal
                }}>
                <View style={styles.pickerIconContainer}>
                  <Icon
                    name="people-outline"
                    size={22}
                    color={theme.colors.primary}
                  />
                </View>
                <Picker
                  selectedValue={gender}
                  onValueChange={itemValue => setGender(itemValue)}
                  style={styles.genderPicker}
                  dropdownIconColor={theme.colors.primary}>
                  <Picker.Item
                    label="Select Gender"
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
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={showDatePicker}
                activeOpacity={0.8}>
                <Icon name="calendar-outline" size={22} color={theme.colors.primary} style={styles.dateIcon} />
                <Text style={[styles.dateText, !dob && styles.placeholderText]}>
                  {dob || "Date of Birth"}
                </Text>
              </TouchableOpacity>
            </View>

            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={handleConfirm}
              onCancel={hideDatePicker}
              maximumDate={new Date()}
              minimumDate={new Date(1900, 0, 1)}
              display="spinner"
              confirmTextIOS="Confirm"
              cancelTextIOS="Cancel"
              headerTextIOS="Select Date of Birth"
            />

            <Input
              icon={<Icon name="mail-outline" size={22} color={theme.colors.primary} />}
              placeholder="Email Address"
              onChangeText={setEmail}
              value={email}
              keyboardType="email-address"
              containerStyle={styles.inputContainer}
            />
            
            <Input
              icon={<Icon name="lock-closed-outline" size={22} color={theme.colors.primary} />}
              placeholder="Password (8-40 characters)"
              onChangeText={setPassword}
              value={password}
              secureTextEntry
              containerStyle={styles.inputContainer}
            />
            
            <Input
              icon={<Icon name="shield-checkmark-outline" size={22} color={theme.colors.primary} />}
              placeholder="Confirm Password"
              onChangeText={setPasswordCf}
              value={passwordCf}
              secureTextEntry
              containerStyle={styles.inputContainer}
            />
            
            {message ? (
              <Text
                style={[
                  styles.messageText,
                  {color: status === 'error' ? '#FF3B30' : '#34C759'},
                ]}>
                {message}
              </Text>
            ) : null}
          </View>
          
          <ButtonModify
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            style={styles.registerButton}
          />
          
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By signing up, you agree to our{' '}
            </Text>
            <View style={styles.termsLinksContainer}>
              <TouchableOpacity
                onPress={() => navigation.navigate('TermsOfServiceScreen')}>
                <Text style={styles.link}>Terms of Service</Text>
              </TouchableOpacity>
              <Text style={styles.termsText}> and </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('PrivacyPolicyScreen')}>
                <Text style={styles.link}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Pressable 
              onPress={() => navigation.push('LoginScreen')}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Text style={styles.footerLinkText}>Sign In</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    paddingHorizontal: wp(6),
    paddingTop: hp(2),
  },
  backButtonWrapper: {
    alignItems: 'flex-start',
  },
  headerContainer: {
    marginBottom: hp(4),
  },
  welcomeText: {
    fontSize: hp(3.5),
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: hp(1),
    marginBottom: hp(1),
  },
  welcomeSubText: {
    fontSize: hp(2),
    color: theme.colors.textLight,
    lineHeight: hp(2.8),
  },
  form: {
    marginBottom: hp(3),
  },
  inputContainer: {
    marginBottom: hp(2),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    backgroundColor: '#FAFAFA',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(2),
  },
  genderPickerContainer: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    height: hp(6.5),
    paddingHorizontal: wp(2),
  },
  pickerIconContainer: {
    marginRight: wp(1),
  },
  genderPicker: {
    flex: 1,
    height: hp(6.5),
    color: theme.colors.text,
  },
  datePickerButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    height: hp(6.5),
    paddingHorizontal: wp(3),
  },
  dateIcon: {
    marginRight: wp(2),
  },
  dateText: {
    fontSize: hp(1.8),
    color: theme.colors.text,
  },
  placeholderText: {
    color: '#999',
  },
  messageText: {
    textAlign: 'center',
    marginTop: hp(1),
    fontSize: hp(1.8),
    fontWeight: '500',
  },
  registerButton: {
    height: hp(6.5),
    borderRadius: 12,
    marginBottom: hp(5),
  },
  termsContainer: {
    marginTop:hp(1),
    alignItems: 'center',
    marginBottom: hp(1),
  },
  termsText: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  termsLinksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  link: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: hp(1.6),
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(3),
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8E8E8',
  },
  orText: {
    paddingHorizontal: wp(4),
    color: theme.colors.textLight,
    fontSize: hp(1.6),
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    padding: hp(2),
    borderRadius: 12,
    marginBottom: hp(3),
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  socialIcon: {
    width: hp(2.5),
    height: hp(2.5),
    marginRight: wp(2),
  },
  socialText: {
    fontSize: hp(1.8),
    fontWeight: '500',
    color: theme.colors.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(2),
  },
  footerText: {
    color: theme.colors.textLight,
    fontSize: hp(1.8),
  },
  footerLinkText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontSize: hp(1.8),
  },
});

export default SignUpScreen;