import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import BackButton from '../../BackButton';
import Input from '../../Input';
import {theme} from '../../contants/theme';
import {useNavigation} from '@react-navigation/native';
import {useRestetPWstore} from '../../utils/useRestetPWstore';
import { useRoute } from '@react-navigation/native';
const PasswordRecoveryNewScreen = () => {
  const navigation = useNavigation();

  // Lấy email đang reset từ store
  const {confirmResetPassword, status, message,clear} =
    useRestetPWstore();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isValidPassword, setIsValidPassword] = useState<boolean | null>(null);
  const [doPasswordsMatch, setDoPasswordsMatch] = useState<boolean | null>(
    null,
  );
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const {emailReset} = useRoute().params as { emailReset: string };

  useEffect(() => {
    if (password.length === 0) {
      setIsValidPassword(null);
      return;
    }
    // Đảm bảo mật khẩu >= 8 ký tự
    setIsValidPassword(password.length >= 8);

    if (confirmPassword.length > 0) {
      setDoPasswordsMatch(password === confirmPassword);
    } else {
      setDoPasswordsMatch(null);
    }
  }, [password, confirmPassword]);

  // Hàm xử lý khi nhấn nút xác nhận
  const handleSubmit = async () => {
    if (!emailReset) {
      // Trường hợp không có email (nếu user bỏ dở flow reset)
      // Bạn có thể điều hướng về màn hình nhập email
      return;
    }

    if (isValidPassword && doPasswordsMatch) {
      await confirmResetPassword(emailReset, password);
    }
  };
  useEffect(() => {
    console.log('status', status);
    console.log('message', message);
    
    if (status === 'success') {
      navigation.navigate('LoginScreen' as never);
    }
  }, [status, navigation]);
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <BackButton size={26} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Enter your new password</Text>

        <Text style={styles.description}>
          Create a new password for your account. Make sure it's at least 8
          characters long.
        </Text>

        <View style={styles.inputContainer}>
          <Input
            icon={<Icon name="lock-closed-outline" size={24} color="black" />}
            placeholder="New Password"
            value={password}
            onChangeText={text => setPassword(text)}
            secureTextEntry={!isPasswordVisible}
            rightIcon={
              <TouchableOpacity onPress={togglePasswordVisibility}>
                <Icon
                  name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                  size={24}
                  color="black"
                />
              </TouchableOpacity>
            }
          />
          {isValidPassword === false && (
            <Text style={styles.errorText}>
              Password must be at least 8 characters
            </Text>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Input
            icon={<Icon name="lock-closed-outline" size={24} color="black" />}
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChangeText={text => setConfirmPassword(text)}
            secureTextEntry={!isPasswordVisible}
          />
          {doPasswordsMatch === false && (
            <Text style={styles.errorText}>Passwords do not match</Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            (!password ||
              !confirmPassword ||
              isValidPassword === false ||
              doPasswordsMatch === false) &&
              styles.buttonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={
            !password ||
            !confirmPassword ||
            isValidPassword === false ||
            doPasswordsMatch === false
          }
          accessibilityLabel="Confirm password change">
          <Text style={styles.buttonText}>Confirm password change</Text>
        </TouchableOpacity>

        {/* Nếu muốn hiển thị trạng thái hay thông báo lỗi */}
        {status === 'error' && message ? (
          <Text style={{color: 'red', marginTop: 8}}>{message}</Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    height: 44,
    marginTop: 20,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000000',
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 24,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 24,
  },
  errorText: {
    color: '#EF4444',
    marginTop: 4,
    fontSize: 14,
  },
  button: {
    backgroundColor: theme.colors.primaryDark,
    borderRadius: 4,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PasswordRecoveryNewScreen;
