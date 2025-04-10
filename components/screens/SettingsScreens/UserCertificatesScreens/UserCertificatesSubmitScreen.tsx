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
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import useUserCertificatesStore from '../../../utils/useUserCertificatesStore';
import {useNavigation} from '@react-navigation/native';
import {theme} from '../../../contants/theme';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';

type CertificateForm = {
  certificate_type_id: string;
  description: string;
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
  const {
    submitCertificates,
    getCertificateTypes,
    certificateTypes,
    isLoading,
    clearError,
    clearMessage,
  } = useUserCertificatesStore();

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

  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    getCertificateTypes();
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

  const handleSubmit = async () => {
    if (!confirmed) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please confirm that all documents are authentic',
        visibilityTime: 4000,
      });
      return;
    }

    const allCertificates = Object.values(forms).flat();
    const certificatesToSubmit = allCertificates.filter(
      cert =>
        cert.certificate_type_id === 'note' || cert.description.trim() !== '',
    );

    if (certificatesToSubmit.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please add at least one certificate',
        visibilityTime: 4000,
      });
      return;
    }

    try {
      await submitCertificates(certificatesToSubmit);
      // Only navigate on successful submission
      navigation.navigate('UserCertificatesSuccessScreen');
    } catch (error) {
      // Error is already shown by the store via toast
    } finally {
      clearError();
      clearMessage();
    }
  };

  const renderCertificateSection = (type: string, maxLinks: number = 1) => {
    const isSingle = maxLinks === 1;
    const canAddMore = forms[type].length < maxLinks;

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

        {/* Single document sections */}
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
            (!confirmed || isLoading) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!confirmed || isLoading}>
          <LinearGradient
            colors={[theme.colors.primaryDark, theme.colors.primaryDark]}
            style={styles.gradientButton}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}>
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Submitting...' : 'Submit Certificates'}
            </Text>
            <Icon name="arrow-forward" size={20} color="white" />
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
});

export default UserCertificatesSubmitScreen;