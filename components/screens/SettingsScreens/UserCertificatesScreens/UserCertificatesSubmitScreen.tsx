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
import {
  CertificateType,
  submitCertificates,
} from '../../../utils/useUserCertificatesAPI';
import ToastUtil from '../../../utils/utils_toast';
import CommonDialog from '../../../commons/CommonDialog';
import BackButton from '../../../BackButton';
import { capitalizeFirstLetter } from '../../../utils/utils_format';

type CertificateForm = {
  certificate_type: CertificateType;
  description: string;
};

type ImageForm = {
  uri: string;
  type?: string;
  name?: string;
};

const documentInfo: Record<CertificateType, {title: string; content: string}> = {
  CITIZEN_DOCUMENT_FRONT: {
    title: 'Citizen ID (Front)',
    content: 'This is the front side of your government-issued identification document. It typically includes your photo, full name, document number, and issue/expiry dates. Acceptable documents include national ID cards, driver\'s licenses, or other official identification. Ensure the image is clear and all details are readable. The document must be valid and not expired.'
  },
  CITIZEN_DOCUMENT_BACK: {
    title: 'Citizen ID (Back)',
    content: 'This is the back side of your government-issued identification document. It often contains additional security features, barcodes, or other verification elements. Make sure to capture the entire document and avoid glare or shadows that might obscure important details. Both front and back sides are required for identity verification purposes.'
  },
  RUNNING_CERTIFICATION: {
    title: 'Running Certification',
    content: 'Upload certificates or documentation proving your running achievements or qualifications. This could include race completion certificates, timing results from official events, or certifications from running organizations. For professional runners, this might include elite athlete status documentation. Multiple documents can be uploaded if needed.'
  },
  RACE_ORGANIZER_CERTIFICATE: {
    title: 'Race Organizer Certificate',
    content: 'Provide documentation showing your experience as a race organizer. This could include permits from previous events, letters of recommendation from running associations, or certificates from race director training programs. If you\'ve organized multiple events, you may upload documentation for each significant event to demonstrate your experience level.'
  },
  COACHING_LICENSE: {
    title: 'Coaching License',
    content: 'Upload your official coaching certification from a recognized athletic organization. This could include certifications from national running federations, personal training certifications with running specializations, or degrees in sports science/coaching. The documentation should clearly show your name, certification level, issuing organization, and validity dates.'
  },
  INTERNATIONAL_PASSPORT: {
    title: 'International Passport',
    content: 'If you\'re submitting an international passport as identification, please upload the photo page containing your personal details. Ensure the passport is valid and all text is clearly visible. This is particularly important if you plan to participate in or organize international events where passport verification may be required.'
  },
  OTHER: {
    title: 'Other Documents',
    content: 'Upload any additional documents that support your application but don\'t fit the other categories. This might include media coverage of your running achievements, unique certifications, or specialized training documentation. Please provide clear descriptions for each document to help reviewers understand their relevance.'
  },
  NOTE: {
    title: 'Additional Notes',
    content: 'Use this section to provide any additional information that might help verify your credentials. You can explain special circumstances, provide context for your documents, or highlight particular achievements. Keep notes concise but informative, with a maximum of 2000 characters.'
  }
};

const CustomCheckbox = ({
  value,
  onValueChange,
}: {
  value: boolean;
  onValueChange: (val: boolean) => void;
}) => (
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
  const [isLoading, setIsLoading] = useState(false);
  const [forms, setForms] = useState<
    Record<CertificateType, CertificateForm[]>
  >({
    CITIZEN_DOCUMENT_FRONT: [
      {certificate_type: 'CITIZEN_DOCUMENT_FRONT', description: ''},
    ],
    CITIZEN_DOCUMENT_BACK: [
      {certificate_type: 'CITIZEN_DOCUMENT_BACK', description: ''},
    ],
    RUNNING_CERTIFICATION: [],
    RACE_ORGANIZER_CERTIFICATE: [],
    COACHING_LICENSE: [],
    INTERNATIONAL_PASSPORT: [],
    OTHER: [],
    NOTE: [{certificate_type: 'NOTE', description: ''}],
  });

  const [images, setImages] = useState<{
    CITIZEN_DOCUMENT_FRONT: ImageForm | null;
    CITIZEN_DOCUMENT_BACK: ImageForm | null;
  }>({
    CITIZEN_DOCUMENT_FRONT: null,
    CITIZEN_DOCUMENT_BACK: null,
  });

  const [confirmed, setConfirmed] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [currentDialogType, setCurrentDialogType] = useState<CertificateType>('CITIZEN_DOCUMENT_FRONT');

  const formatTypeName = (type: CertificateType) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleAddLink = (
    type: Exclude<
      CertificateType,
      'CITIZEN_DOCUMENT_FRONT' | 'CITIZEN_DOCUMENT_BACK' | 'NOTE'
    >,
  ) => {
    setForms(prev => ({
      ...prev,
      [type]: [...prev[type], {certificate_type: type, description: ''}],
    }));
  };

  const handleRemoveLink = (
    type: Exclude<
      CertificateType,
      'CITIZEN_DOCUMENT_FRONT' | 'CITIZEN_DOCUMENT_BACK' | 'NOTE'
    >,
    index: number,
  ) => {
    setForms(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const handleChangeText = (
    type: CertificateType,
    index: number,
    text: string,
  ) => {
    setForms(prev => ({
      ...prev,
      [type]: prev[type].map((form, i) =>
        i === index ? {...form, description: text} : form,
      ),
    }));
  };

  const showInfoDialog = (type: CertificateType) => {
    setCurrentDialogType(type);
    setDialogVisible(true);
  };

  const closeDialog = () => {
    setDialogVisible(false);
  };

  const openHelpLink = () => {
    Linking.openURL('https://smartrunningcoach.com/help/certificates');
  };

  const pickImage = async (
    type: 'CITIZEN_DOCUMENT_FRONT' | 'CITIZEN_DOCUMENT_BACK',
  ) => {
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
          name: asset.fileName || `document_${Date.now()}.jpg`,
        },
      }));

      if (forms[type][0].description === '') {
        handleChangeText(type, 0, `Uploaded ${formatTypeName(type)}`);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error instanceof Error ? error.message : 'Failed to pick image',
      });
    }
  };

  const removeImage = (
    type: 'CITIZEN_DOCUMENT_FRONT' | 'CITIZEN_DOCUMENT_BACK',
  ) => {
    setImages(prev => ({...prev, [type]: null}));
  };

  const validateSubmission = () => {
    if (!images.CITIZEN_DOCUMENT_FRONT || !images.CITIZEN_DOCUMENT_BACK) {
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
          cert.certificate_type === 'NOTE' || cert.description.trim() !== '',
      );
  
      // Prepare the certificate data with proper file references
      const submissionData = certificatesToSubmit.map(cert => ({
        certificate_type: cert.certificate_type,
        description: cert.description,
        ...(['CITIZEN_DOCUMENT_FRONT', 'CITIZEN_DOCUMENT_BACK'].includes(cert.certificate_type) && {
          uri: images[cert.certificate_type]?.uri,
          type: images[cert.certificate_type]?.type || 'image/jpeg',
          name: images[cert.certificate_type]?.name || `${cert.certificate_type}_${Date.now()}.jpg`,
        }),
      }));
  
      const response = await submitCertificates(submissionData);
  
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Certificates submitted successfully',
      });
  
      navigation.navigate('UserCertificatesSuccessScreen');
    } catch (error) {
      ToastUtil.error('Error', error.message || 'Failed to submit certificates');
    } finally {
      setIsLoading(false);
    }
  };

  const renderImageUpload = (
    type: 'CITIZEN_DOCUMENT_FRONT' | 'CITIZEN_DOCUMENT_BACK',
  ) => {
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
      </View>
    );
  };

  const renderCertificateSection = (
    type: CertificateType,
    maxLinks: number = 1,
  ) => {
    const isSingle = maxLinks === 1;
    const canAddMore = forms[type].length < maxLinks;
    const isRequired = type === 'CITIZEN_DOCUMENT_FRONT' || type === 'CITIZEN_DOCUMENT_BACK';

    if (type === 'CITIZEN_DOCUMENT_FRONT' || type === 'CITIZEN_DOCUMENT_BACK') {
      return (
        <View key={type} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {capitalizeFirstLetter(formatTypeName(type), true)}
              {isRequired && <Text style={styles.requiredAsterisk}> *</Text>}
            </Text>
            <TouchableOpacity
              onPress={() => showInfoDialog(type)}
              style={styles.infoButton}>
              <Icon
                name="information-circle"
                size={20}
                color="black"
              />
            </TouchableOpacity>
          </View>
          {renderImageUpload(type)}
        </View>
      );
    }

    return (
      <View key={type} style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {capitalizeFirstLetter(formatTypeName(type), true)}
            {isRequired && <Text style={styles.requiredAsterisk}> *</Text>}
          </Text>
          <TouchableOpacity
            onPress={() => showInfoDialog(type)}
            style={styles.infoButton}>
            <Icon
              name="information-circle"
              size={20}
              color="black"
            />
          </TouchableOpacity>
        </View>

        {forms[type].map((form, index) => (
          <View key={`${type}-${index}`} style={styles.inputContainer}>
            {(type !== 'CITIZEN_DOCUMENT_FRONT' && type !== 'CITIZEN_DOCUMENT_BACK') && (
              type === 'NOTE' ? (
                <View style={styles.noteContainer}>
                  <TextInput
                    style={styles.noteInput}
                    placeholder="Enter your note here..."
                    value={form.description}
                    onChangeText={(text) => handleChangeText(type, index, text)}
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
                  onChangeText={(text) => handleChangeText(type, index, text)}
                  keyboardType="url"
                />
              )
            )}

            {!isSingle && forms[type].length > 1 && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() =>
                  handleRemoveLink(
                    type as Exclude<
                      CertificateType,
                      | 'CITIZEN_DOCUMENT_FRONT'
                      | 'CITIZEN_DOCUMENT_BACK'
                      | 'NOTE'
                    >,
                    index,
                  )
                }>
                <Icon name="remove" size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>
        ))}

        {!isSingle && canAddMore && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() =>
              handleAddLink(
                type as Exclude<
                  CertificateType,
                  'CITIZEN_DOCUMENT_FRONT' | 'CITIZEN_DOCUMENT_BACK' | 'NOTE'
                >,
              )
            }>
            <Icon name="add" size={20} color="white" style={styles.addIcon} />
            <Text style={styles.addButtonText}>Add link</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View
        style={styles.header}>
        <BackButton />

        <View style={styles.headerContent}>
          <Icon
            name="cloud-upload"
            size={24}
            color="black"
            style={styles.headerIcon}
          />
          <Text style={styles.title}>Submit Certificates</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>
          Provide all required documents to verify your expert status
        </Text>

        {renderCertificateSection('CITIZEN_DOCUMENT_FRONT')}
        {renderCertificateSection('CITIZEN_DOCUMENT_BACK')}
        {renderCertificateSection('RUNNING_CERTIFICATION', 10)}
        {renderCertificateSection('RACE_ORGANIZER_CERTIFICATE', 10)}
        {renderCertificateSection('COACHING_LICENSE', 10)}
        {renderCertificateSection('INTERNATIONAL_PASSPORT', 10)}
        {renderCertificateSection('OTHER', 10)}
        {renderCertificateSection('NOTE')}

        <View style={styles.helpContainer}>
          <TouchableOpacity onPress={openHelpLink} style={styles.helpButton}>
            <Icon name="help-circle" size={20} color={theme.colors.primary} />
            <Text style={styles.helpText}>Need help with documents?</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.confirmationContainer}>
          <CustomCheckbox value={confirmed} onValueChange={setConfirmed} />
          <Text style={styles.confirmationText}>
            I confirm all documents are authentic and belong to me
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!confirmed ||
              !images.CITIZEN_DOCUMENT_FRONT ||
              !images.CITIZEN_DOCUMENT_BACK ||
              isLoading) &&
              styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={
            !confirmed ||
            !images.CITIZEN_DOCUMENT_FRONT ||
            !images.CITIZEN_DOCUMENT_BACK ||
            isLoading
          }>
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

      <CommonDialog
        visible={dialogVisible}
        onClose={closeDialog}
        title={documentInfo[currentDialogType].title}
        content={<Text>{documentInfo[currentDialogType].content}</Text>}
        actionButtons={[
          {
            label: 'Got it',
            variant: 'contained',
            color: theme.colors.primaryDark,
            handler: closeDialog
          }
        ]}
      />
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
    marginLeft: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: 'black',
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
  requiredAsterisk: {
    color: 'red',
    fontSize: 16,
    fontWeight: '600',
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