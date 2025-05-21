import React, {useState, useEffect} from 'react';
import {
  Image,
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {wp, hp} from '../helpers/common';
import BackButton from '../BackButton';
import {theme} from '../contants/theme';
import Input from '../Input';
import ButtonModify from '../Button';
import {useRegisterStore} from '../utils/useRegisterStore';
import CommonDialog from '../commons/CommonDialog';

const SignUpScreen = ({navigation}: {navigation: any}) => {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('male');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordCf, setPasswordCf] = useState('');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogContent, setDialogContent] = useState('');
  const [dialogTitle, setDialogTitle] = useState('');

  const {dataUser, status, message, register, clear} = useRegisterStore();
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    username: '',
    name: '',
    gender: '',
    dob: '',
    email: '',
    password: '',
    passwordCf: '',
  });

  const emailValidated = (): boolean | null => {
    if (!email) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const showDialog = (title: string, content: string) => {
    setDialogTitle(title);
    setDialogContent(content);
    setDialogVisible(true);
  };

  const validateInputs = (): boolean => {
    const errors = {
      username: '',
      name: '',
      gender: '',
      dob: '',
      email: '',
      password: '',
      passwordCf: '',
    };
    let isValid = true;

    // Validate Name
    const trimmedName = name.trim();
    const nameRegex = /^[a-zA-ZÀ-ỹ\s']{3,25}$/;
    if (!trimmedName) {
      errors.name = 'Name is required';
      isValid = false;
    } else if (!nameRegex.test(trimmedName)) {
      errors.name = '3-25 characters, only letters and accents allowed';
      isValid = false;
    }

    // Validate Username
    const trimmedUsername = username.trim();
    const usernameRegex = /^[a-zA-Z0-9_]{8,40}$/;
    if (!trimmedUsername) {
      errors.username = 'Username is required';
      isValid = false;
    } else if (!usernameRegex.test(trimmedUsername)) {
      errors.username =
        '8-40 characters, letters, numbers and underscores only';
      isValid = false;
    }

    // Validate Gender
    const trimmedGender = gender.trim().toLowerCase();
    const validGenders = ['male', 'female', 'others'];
    if (!validGenders.includes(trimmedGender)) {
      errors.gender = 'Please select a valid gender';
      isValid = false;
    }

    // Validate Date of Birth
    const trimmedDob = dob.trim();
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!trimmedDob || !dateRegex.test(trimmedDob)) {
      errors.dob = 'Please enter a valid date (yyyy-mm-dd)';
      isValid = false;
    } else {
      const dobDate = new Date(trimmedDob);
      const age = new Date().getFullYear() - dobDate.getFullYear();
      if (age < 13) {
        errors.dob = 'You must be at least 13 years old';
        isValid = false;
      }
    }

    // Validate Email
    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Validate Password
    const trimmedPassword = password.trim();
    if (trimmedPassword.length < 8 || trimmedPassword.length > 40) {
      errors.password = 'Password must be 8-40 characters';
      isValid = false;
    }

    // Validate Password Confirmation
    const trimmedPasswordCf = passwordCf.trim();
    if (trimmedPassword !== trimmedPasswordCf) {
      errors.passwordCf = 'Passwords do not match';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  useEffect(() => {
    clear();
  }, [navigation]);

  const handleRegister = async () => {
    if (!validateInputs()) {
      showDialog('Validation Error', 'Please fix all errors before submitting');
      return;
    }

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
      showDialog('Registration Error', 'An error occurred during registration');
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
              icon="person-circle-outline"
              placeholder="Username (8-40 characters)"
              onChangeText={setUsername}
              value={username}
              keyboardType="default"
              containerStyle={styles.inputContainer}
              errorMsg={validationErrors.username}
            />

            <Input
              icon="person-outline"
              placeholder="Full name (John Doe)"
              onChangeText={setName}
              value={name}
              keyboardType="default"
              containerStyle={styles.inputContainer}
              errorMsg={validationErrors.name}
            />

            <View style={styles.rowContainer}>
              <Input
                icon="transgender-outline"
                placeholder="Select Gender"
                value={gender}
                onChangeText={setGender}
                keyboardType="picker"
                pickerItems={[
                  {label: 'Male', value: 'male'},
                  {label: 'Female', value: 'female'},
                  {label: 'Others', value: 'others'},
                ]}
                containerStyle={[styles.inputContainer, {width: '48%'}]}
                errorMsg={validationErrors.gender}
              />

              <Input
                icon="calendar-outline"
                placeholder="Date of Birth"
                value={dob}
                onDateConfirm={date => {
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  setDob(`${year}-${month}-${day}`);
                }}
                keyboardType="date"
                containerStyle={[styles.inputContainer, {width: '48%'}]}
                errorMsg={validationErrors.dob}
              />
            </View>

            <Input
              placeholder="Email Address"
              onChangeText={setEmail}
              value={email}
              keyboardType="email"
              validated={emailValidated()}
              containerStyle={styles.inputContainer}
              errorMsg={validationErrors.email}
            />

            <Input
              placeholder="Password (8-40 characters)"
              keyboardType="password"
              onChangeText={setPassword}
              value={password}
              secureTextEntry
              containerStyle={styles.inputContainer}
              errorMsg={validationErrors.password}
            />

            <Input
              placeholder="Confirm Password"
              keyboardType="password"
              onChangeText={setPasswordCf}
              value={passwordCf}
              secureTextEntry
              containerStyle={styles.inputContainer}
              errorMsg={validationErrors.passwordCf}
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
            textStyle={styles.registerButtonText}
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

      <CommonDialog
        visible={dialogVisible}
        onClose={() => setDialogVisible(false)}
        title={dialogTitle}
        content={<Text>{dialogContent}</Text>}
        actionButtons={[
          {
            label: 'OK',
            variant: 'contained',
            handler: () => setDialogVisible(false),
          },
        ]}
      />
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
    marginTop: hp(2),
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
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  registerButtonText: {
    color: 'white',
    fontSize: hp(2),
    fontWeight: '600',
  },
  termsContainer: {
    marginTop: hp(1),
    alignItems: 'center',
    marginBottom: hp(1),
  },
  termsText: {
    fontSize: 14,
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
    color: theme.colors.primaryDark,
    fontWeight: '600',
    fontSize: 14,
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
    color: theme.colors.primaryDark,
    fontWeight: 'bold',
    fontSize: hp(1.8),
  },
});

export default SignUpScreen;
