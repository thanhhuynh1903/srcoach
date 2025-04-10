import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {useNavigation} from '@react-navigation/native';
import {theme} from '../../../contants/theme';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'react-native-image-picker';
import { UserCertificatesAPI } from './UserCertificatesAPI';

type CertificateForm = {
  certificate_type_id: string;
  description: string;
};

type ImageForm = {
  uri: string;
  type?: string;
  fileName?: string;
};

const CustomCheckbox = ({value, onValueChange}) => (
  <TouchableOpacity
    onPress={() => onValueChange(!value)}
    style={styles.checkboxPressable}>
    <View style={[styles.checkboxBase, value && styles.checkboxChecked]}>
      {value && <Icon name="checkmark" size={16} color="white" />}
    </View>
  </TouchableOpacity>
);

const UserCertificatesSubmitScreen = () => {
  const navigation = useNavigation();
  const [certificateTypes, setCertificateTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [forms, setForms] = useState<Record<string, CertificateForm[]>>({
    citizen_document_front: [
      {certificate_type_id: 'citizen_document_front', description: ''},
    ],
    citizen_document_back: [
      {certificate_type_id: 'citizen_document_back', description: ''},
    ],
    running_certification: [],
    race_organizer_certificate: [],
    coaching_license: [],
    international_passport: [],
    other: [],
    note: [{certificate_type_id: 'note', description: ''}],
  });

  const [images, setImages] = useState<Record<string, ImageForm>>({
    citizen_document_front: null,
    citizen_document_back: null,
  });

  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const fetchCertificateTypes = async () => {
      try {
        const response = await UserCertificatesAPI.getCertificateTypes();
        setCertificateTypes(response.data);
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message || 'Failed to load certificate types',
        });
      }
    };
    fetchCertificateTypes();
  }, []);

  const formatTypeName = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleAddLink = (type: string) => {
    setForms(prev => ({
      ...prev,
      [type]: [...prev[type], {certificate_type_id: type, description: ''}],
    }));
  };

  const handleRemoveLink = (type: string, index: number) => {
    setForms(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const handleChangeText = (type: string, index: number, text: string) => {
    setForms(prev => ({
      ...prev,
      [type]: prev[type].map((form, i) =>
        i === index ? {...form, description: text} : form,
      ),
    }));
  };

  const showInfoDialog = (type: string) => {
    const typeInfo = certificateTypes.find(ct => ct.id === type);
    Toast.show({
      type: 'info',
      text1: 'Document Information',
      text2: typeInfo?.description || 'No information available',
      visibilityTime: 4000,
    });
  };

  const openHelpLink = () => {
    Linking.openURL('https://yourdomain.com/help/certificates');
  };

  const pickImage = async (type: 'citizen_document_front' | 'citizen_document_back') => {
    try {
      const result = await ImagePicker.launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });

      if (result.didCancel) return;
      if (result.errorCode) {
        throw new Error(result.errorMessage || 'Image picker error');
      }

      const asset = result.assets?.[0];
      if (!asset) return;

      setImages(prev => ({
        ...prev,
        [type]: {
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          fileName: asset.fileName || `document_${Date.now()}.jpg`,
        },
      }));

      // Auto-fill description if empty
      if (forms[type][0].description === '') {
        handleChangeText(type, 0, `Uploaded ${formatTypeName(type)}`);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to pick image',
      });
    }
  };

  const removeImage = (type: 'citizen_document_front' | 'citizen_document_back') => {
    setImages(prev => ({...prev, [type]: null}));
  };

  const validateSubmission = () => {
    if (!images.citizen_document_front || !images.citizen_document_back) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please upload both front and back of your ID document',
      });
      return false;
    }

    if (!confirmed) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please confirm that all documents are authentic',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateSubmission()) return;

    setIsLoading(true);
    try {
      const allCertificates = Object.values(forms).flat();
      const certificatesToSubmit = allCertificates.filter(
        cert =>
          cert.certificate_type_id === 'note' || cert.description.trim() !== '',
      );

      // Convert images to array in the order of front then back
      const imageFiles = [
        images.citizen_document_front,
        images.citizen_document_back,
      ].filter(Boolean);

      const response = await UserCertificatesAPI.submitCertificates(
        certificatesToSubmit,
        imageFiles,
      );

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: response.message || 'Certificates submitted successfully',
      });

      navigation.navigate('UserCertificatesSuccessScreen');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to submit certificates',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderImageUpload = (type: 'citizen_document_front' | 'citizen_document_back') => {
    const image = images[type];
    const hasImage = !!image;

    return (
      <View style={styles.imageUploadContainer}>
        {hasImage ? (
          <View style={styles.imagePreviewContainer}>
            <Image source={{uri: image.uri}} style={styles.imagePreview} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => removeImage(type)}>
              <Icon name="close" size={20} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => pickImage(type)}>
            <Icon
              name="cloud-upload"
              size={32}
              color={theme.colors.primary}
              style={styles.uploadIcon}
            />
            <Text style={styles.uploadText}>Upload {formatTypeName(type)}</Text>
          </TouchableOpacity>
        )}
        <TextInput
          style={styles.imageDescriptionInput}
          placeholder={`Description for ${formatTypeName(type)}`}
          value={forms[type][0].description}
          onChangeText={text => handleChangeText(type, 0, text)}
        />
      </View>
    );
  };

  const renderCertificateSection = (type: string, maxLinks: number = 1) => {
    const isSingle = maxLinks === 1;
    const canAddMore = forms[type].length < maxLinks;

    // Special handling for citizen documents (image upload)
    if (type === 'citizen_document_front' || type === 'citizen_document_back') {
      return (
        <View key={type} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{formatTypeName(type)}</Text>
            <TouchableOpacity
              onPress={() => showInfoDialog(type)}
              style={styles.infoButton}>
              <Icon name="information-circle" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          {renderImageUpload(type)}
        </View>
      );
    }

    return (
      <View key={type} style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{formatTypeName(type)}</Text>
          <TouchableOpacity
            onPress={() => showInfoDialog(type)}
            style={styles.infoButton}>
            <Icon name="information-circle" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {forms[type].map((form, index) => (
          <View key={`${type}-${index}`} style={styles.inputContainer}>
            {type === 'note' ? (
              <View style={styles.noteContainer}>
                <TextInput
                  style={styles.noteInput}
                  placeholder="Enter your note here..."
                  value={form.description}
                  onChangeText={text => handleChangeText(type, index, text)}
                  multiline
                  maxLength={2000}
                />
                <Text style={styles.charCounter}>
                  {form.description.length}/2000
                </Text>
              </View>
            ) : (
              <TextInput
                style={styles.input}
                placeholder="Enter document URL"
                value={form.description}
                onChangeText={text => handleChangeText(type, index, text)}
                keyboardType="url"
              />
            )}

            {!isSingle && forms[type].length > 1 && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveLink(type, index)}>
                <Icon name="remove" size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>
        ))}

        {!isSingle && canAddMore && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleAddLink(type)}>
            <Icon name="add" size={20} color="white" style={styles.addIcon} />
            <Text style={styles.addButtonText}>Add link</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Fixed Header */}
      <LinearGradient
        colors={[theme.colors.primaryDark, theme.colors.primaryDark]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Icon
            name="cloud-upload"
            size={24}
            color="white"
            style={styles.headerIcon}
          />
          <Text style={styles.title}>Submit Certificates</Text>
        </View>
      </LinearGradient>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>
          Provide all required documents to verify your expert status
        </Text>

        {/* Citizen document sections (image upload) */}
        {renderCertificateSection('citizen_document_front')}
        {renderCertificateSection('citizen_document_back')}

        {/* Multiple document sections */}
        {renderCertificateSection('running_certification', 10)}
        {renderCertificateSection('race_organizer_certificate', 10)}
        {renderCertificateSection('coaching_license', 10)}
        {renderCertificateSection('international_passport', 10)}
        {renderCertificateSection('other', 10)}

        {/* Note section */}
        {renderCertificateSection('note')}

        <View style={styles.helpContainer}>
          <TouchableOpacity onPress={openHelpLink} style={styles.helpButton}>
            <Icon name="help-circle" size={20} color={theme.colors.primary} />
            <Text style={styles.helpText}>Need help with documents?</Text>
          </TouchableOpacity>
        </View>

        {/* Confirmation checkbox */}
        <View style={styles.confirmationContainer}>
          <CustomCheckbox
            value={confirmed}
            onValueChange={setConfirmed}
          />
          <Text style={styles.confirmationText}>
            I confirm all documents are authentic and belong to me
          </Text>
        </View>
      </ScrollView>

      {/* Sticky Footer with Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!confirmed || !images.citizen_document_front || !images.citizen_document_back || isLoading) && 
              styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!confirmed || !images.citizen_document_front || !images.citizen_document_back || isLoading}>
          <LinearGradient
            colors={[theme.colors.primaryDark, theme.colors.primaryDark]}
            style={styles.gradientButton}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}>
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Submit Certificates</Text>
                <Icon name="arrow-forward" size={20} color="white" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  backButton: {
    marginRight: 10,
    zIndex: 1,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  headerIcon: {
    marginRight: 10,
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
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'left',
  },
  section: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 16,
    backgroundColor: 'white',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  infoButton: {
    padding: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    backgroundColor: '#fff',
    fontSize: 14,
  },
  noteContainer: {
    flex: 1,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    backgroundColor: '#fff',
    fontSize: 14,
    height: 120,
    textAlignVertical: 'top',
  },
  charCounter: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    padding: 10,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  addIcon: {
    marginRight: 5,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  helpContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpText: {
    color: theme.colors.primary,
    marginLeft: 5,
    fontWeight: '500',
  },
  confirmationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  checkboxPressable: {
    marginRight: 12,
  },
  checkboxBase: {
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.primaryDark,
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primaryDark,
  },
  confirmationText: {
    flex: 1,
    fontSize: 14,
    color: '#555',
  },
  footer: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  submitButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  gradientButton: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  // Image upload styles
  imageUploadContainer: {
    marginBottom: 10,
  },
  uploadButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  uploadIcon: {
    marginBottom: 8,
  },
  uploadText: {
    color: theme.colors.primary,
    fontWeight: '500',
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 6,
    resizeMode: 'contain',
    backgroundColor: '#f8f9fa',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageDescriptionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    backgroundColor: '#fff',
    fontSize: 14,
    marginTop: 10,
  },
});

export default UserCertificatesSubmitScreen;