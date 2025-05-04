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

    // Calculate age based on date of birth
    const dobDate = new Date(dob);
    const age = Math.floor((new Date() - dobDate) / 31536000000); // 31536000000 is the number of milliseconds in a year

    if (age < 13) {
      Alert.alert('Error', 'You must be at least 13 years old to register.');
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
