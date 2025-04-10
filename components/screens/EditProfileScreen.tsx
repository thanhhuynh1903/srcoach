import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  SafeAreaView,
  Modal,
  FlatList,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { useLoginStore } from '../utils/useLoginStore';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../contants/theme';
import phone_codes from '../contants/phone_code.json';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { CommonActions } from '@react-navigation/native';
import useAuthStore from '../utils/useAuthStore';
import { MASTER_URL } from '../utils/zustandfetchAPI';

interface ProfileData {
  id: string;
  username: string;
  email: string;
  name: string;
  birth_date: string;
  gender: string;
  address1: string;
  address2: string;
  zip_code: string;
  phone_code: string;
  phone_number: string;
  is_active: boolean;
  isResetPassAllowed: boolean;
  created_at: string;
  updated_at: string;
  points: number;
  user_level: string;
  roles: string[];
}

interface PhoneCode {
  name: string;
  dial_code: string;
  code: string;
}

const EditProfileScreen = ({ navigation }) => {
  const { profile, clearAll, clear } = useLoginStore();
  const { clearToken } = useAuthStore();
  const [formData, setFormData] = useState<Partial<ProfileData>>({
    username: '',
    email: '',
    name: '',
    birth_date: '',
    gender: '',
    address1: '',
    address2: '',
    zip_code: '',
    phone_code: '',
    phone_number: '',
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showPhoneCodeModal, setShowPhoneCodeModal] = useState(false);
  const [selectedPhoneCode, setSelectedPhoneCode] = useState<PhoneCode | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username,
        email: profile.email,
        name: profile.name,
        birth_date: profile.birth_date,
        gender: profile.gender,
        address1: profile.address1,
        address2: profile.address2,
        zip_code: profile.zip_code,
        phone_code: profile.phone_code,
        phone_number: profile.phone_number,
      });
      setPhoneNumber(profile.phone_number || '');
      
      const matchingCode = phone_codes.find(code => code.dial_code === profile.phone_code);
      if (matchingCode) {
        setSelectedPhoneCode(matchingCode);
      }
    }
  }, [profile]);

  const handleChange = (field: keyof ProfileData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePhoneCodeSelect = (code: PhoneCode) => {
    setSelectedPhoneCode(code);
    handleChange('phone_code', code.dial_code);
    setShowPhoneCodeModal(false);
  };

  const logout = async () => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      const isGoogleUser = currentUser.providerData.some(
        provider => provider.providerId === 'google.com',
      );
      if (isGoogleUser) {
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
      }
      await auth().signOut();
    }
    await AsyncStorage.removeItem('authToken');
    await clear();
    await clearToken();
    await clearAll();
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: 'LoginScreen'}],
      }),
    );
  };

  const handleSubmit = async () => {
    if (showPasswordFields && password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Passwords do not match',
      });
      return;
    }

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const updateData = {
        ...formData,
        phoneNumber: phoneNumber,
        ...(showPasswordFields && password ? { password } : {}),
      };

      await axios.put(`${MASTER_URL}/users`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Profile updated successfully',
      });

      // Log out after successful update
      await logout();
    } catch (error) {
      console.error('Error updating profile:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update profile',
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Fixed Header */}
      <LinearGradient
        colors={[theme.colors.primaryDark, theme.colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Profile</Text>
        </View>
      </LinearGradient>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Profile Photo */}
          <View style={styles.photoContainer}>
            <View style={styles.photoWrapper}>
              <Image
                source={{ uri: 'https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg' }}
                style={styles.profilePhoto}
              />
              <TouchableOpacity style={styles.cameraButton}>
                <Icon name="camera" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity>
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Your name"
                placeholderTextColor="#999"
                value={formData.name}
                onChangeText={(text) => handleChange('name', text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="@username"
                placeholderTextColor="#999"
                value={formData.username}
                onChangeText={(text) => handleChange('username', text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="your.email@example.com"
                placeholderTextColor="#999"
                keyboardType="email-address"
                value={formData.email}
                onChangeText={(text) => handleChange('email', text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.phoneInputContainer}>
                <TouchableOpacity 
                  style={styles.phoneCodeButton}
                  onPress={() => setShowPhoneCodeModal(true)}
                >
                  <Text style={styles.phoneCodeText}>
                    {selectedPhoneCode ? `${selectedPhoneCode.dial_code}` : '+1'}
                  </Text>
                  <Icon name="chevron-down" size={16} color="#666" />
                </TouchableOpacity>
                <TextInput
                  style={styles.phoneNumberInput}
                  placeholder="Phone number"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address Line 1</Text>
              <TextInput
                style={styles.input}
                placeholder="Street address"
                placeholderTextColor="#999"
                value={formData.address1}
                onChangeText={(text) => handleChange('address1', text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address Line 2</Text>
              <TextInput
                style={styles.input}
                placeholder="Apt, suite, etc."
                placeholderTextColor="#999"
                value={formData.address2}
                onChangeText={(text) => handleChange('address2', text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Zip Code</Text>
              <TextInput
                style={styles.input}
                placeholder="Postal code"
                placeholderTextColor="#999"
                value={formData.zip_code}
                onChangeText={(text) => handleChange('zip_code', text)}
              />
            </View>

            {!showPasswordFields && (
              <TouchableOpacity
                style={styles.changePasswordButton}
                onPress={() => setShowPasswordFields(true)}>
                <Text style={styles.changePasswordText}>Change Password</Text>
              </TouchableOpacity>
            )}

            {showPasswordFields && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>New Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter new password"
                    placeholderTextColor="#999"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm new password"
                    placeholderTextColor="#999"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                </View>

                <TouchableOpacity
                  style={styles.cancelPasswordChangeButton}
                  onPress={() => {
                    setShowPasswordFields(false);
                    setPassword('');
                    setConfirmPassword('');
                  }}>
                  <Text style={styles.cancelPasswordChangeText}>
                    Cancel Password Change
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Phone Code Selection Modal */}
      <Modal
        visible={showPhoneCodeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPhoneCodeModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country Code</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowPhoneCodeModal(false)}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={phone_codes}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.phoneCodeItem}
                  onPress={() => handlePhoneCodeSelect(item)}
                >
                  <Text style={styles.phoneCodeItemText}>
                    {item.name} ({item.dial_code})
                  </Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        </View>
      </Modal>

      {/* Sticky Footer with Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleSubmit}>
          <LinearGradient
            colors={[theme.colors.primaryDark, theme.colors.primaryDark]}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}>
            <Text style={styles.continueButtonText}>Save Changes</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  content: {
    flex: 1,
  },
  photoContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  photoWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#3B82F6',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  changePhotoText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  formSection: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  phoneCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  phoneCodeText: {
    fontSize: 14,
    color: '#333',
    marginRight: 4,
  },
  phoneNumberInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    padding: 16,
  },
  changePasswordButton: {
    marginTop: 16,
    padding: 12,
    alignItems: 'center',
  },
  changePasswordText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  cancelPasswordChangeButton: {
    marginTop: 8,
    padding: 12,
    alignItems: 'center',
  },
  cancelPasswordChangeText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  continueButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  gradientButton: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 10,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  modalCloseButton: {
    padding: 4,
  },
  phoneCodeItem: {
    padding: 16,
  },
  phoneCodeItemText: {
    fontSize: 14,
    color: '#000',
  },
  separator: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
  },
});

export default EditProfileScreen;