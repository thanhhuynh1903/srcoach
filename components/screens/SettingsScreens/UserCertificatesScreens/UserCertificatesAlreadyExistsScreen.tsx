import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '@react-native-vector-icons/ionicons';
import useUserCertificatesStore from '../../../utils/useUserCertificatesStore';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../../contants/theme';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';

const UserCertificatesAlreadyExistsScreen = () => {
  const navigation = useNavigation();
  const {
    getSelfCertificates,
    certificates,
    isLoading,
    clearCertificates,
  } = useUserCertificatesStore();

  const [analyzing, setAnalyzing] = useState(true);
  const [showResubmitModal, setShowResubmitModal] = useState(false);
  const [confirmedResubmit, setConfirmedResubmit] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const checkCertificates = async () => {
        try {
          await getSelfCertificates();
          setAnalyzing(false);
          
          if (certificates.length === 0) {
            navigation.replace('UserCertificatesSubmitScreen');
          }
        } catch (error) {
          setAnalyzing(false);
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to check certificates status',
            visibilityTime: 4000,
          });
        }
      };

      checkCertificates();

      return () => {
        // Cleanup if needed
      };
    }, [certificates.length])
  );

  const handleResubmit = () => {
    setShowResubmitModal(true);
  };

  const confirmResubmit = () => {
    if (!confirmedResubmit) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please confirm you understand the processing time',
        visibilityTime: 4000,
      });
      return;
    }

    clearCertificates();
    navigation.replace('UserCertificatesSubmitScreen');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return theme.colors.success;
      case 'REJECTED':
        return theme.colors.error;
      case 'PENDING':
        return theme.colors.warning;
      default:
        return theme.colors.gray;
    }
  };

  const formatTypeName = (type: string) => {
    if (!type) return '';
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  if (analyzing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={[theme.colors.primaryDark, theme.colors.primary]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}>
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Icon
              name="document-text"
              size={24}
              color="white"
              style={styles.headerIcon}
            />
            <Text style={styles.title}>Expert Verification</Text>
          </View>
        </LinearGradient>

        <View style={styles.analyzingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.analyzingText}>Analyzing certificates...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.primaryDark, theme.colors.primary]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Icon
            name="document-text"
            size={24}
            color="white"
            style={styles.headerIcon}
          />
          <Text style={styles.title}>Expert Verification</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.statusContainer}>
          <Icon name="time" size={30} color={theme.colors.warning} />
          <Text style={styles.statusTitle}>Application Submitted</Text>
          <Text style={styles.statusSubText}>
            Your expert application is under review. Normal processing time takes between 3-5 business days.
          </Text>
        </View>

        <View style={styles.documentsContainer}>
          <Text style={styles.sectionTitle}>Submitted Documents</Text>
          
          {certificates.map((cert) => (
            <View key={cert.id} style={styles.documentItem}>
              <View style={styles.documentInfo}>
                <Text style={styles.documentName}>
                  {formatTypeName(cert.CertificateType?.type_name || cert.certificate_type_id)}
                </Text>
                {cert.description && (
                  <Text style={styles.documentDescription} numberOfLines={1}>
                    {cert.description}
                  </Text>
                )}
              </View>
              <View style={styles.statusBadge}>
                <View 
                  style={[
                    styles.statusChip,
                    { backgroundColor: getStatusColor(cert.status) }
                  ]}
                >
                  <Text style={styles.statusText}>
                    {cert.status.charAt(0) + cert.status.slice(1).toLowerCase()}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.resubmitButton}
          onPress={handleResubmit}
          disabled={isLoading}
        >
          <LinearGradient
            colors={[theme.colors.primaryDark, theme.colors.primary]}
            style={styles.gradientButton}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}>
            <Text style={styles.resubmitButtonText}>
              {isLoading ? 'Loading...' : 'Resubmit Application'}
            </Text>
            <Icon name="refresh" size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Resubmit Confirmation Modal */}
      <Modal
        visible={showResubmitModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowResubmitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Icon name="warning" size={30} color={theme.colors.warning} />
              <Text style={styles.modalTitle}>Resubmit Application</Text>
            </View>
            
            <Text style={styles.modalText}>
              By resubmitting your application:
              {"\n\n"}• Your previous submission will be replaced
              {"\n"}• You will need to wait another 3-5 business days for processing
              {"\n"}• Your verification status will be reset
            </Text>
            
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setConfirmedResubmit(!confirmedResubmit)}
            >
              <View style={[
                styles.checkbox,
                confirmedResubmit 
                  ? { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                  : { backgroundColor: 'white', borderColor: theme.colors.gray }
              ]}>
                {confirmedResubmit && (
                  <Icon name="checkmark" size={16} color="white" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>
                I understand and want to proceed
              </Text>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowResubmitModal(false);
                  setConfirmedResubmit(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  styles.confirmButton,
                  !confirmedResubmit && { opacity: 0.6 }
                ]}
                onPress={confirmResubmit}
                disabled={!confirmedResubmit}
              >
                <Text style={styles.confirmButtonText}>Confirm Resubmission</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  analyzingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzingText: {
    marginTop: 20,
    fontSize: 18,
    color: theme.colors.textDark,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textDark,
    marginTop: 10,
    marginBottom: 5,
  },
  statusSubText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  documentsContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textDark,
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  documentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  documentInfo: {
    flex: 1,
    marginRight: 10,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.textDark,
    marginBottom: 5,
    textTransform: 'capitalize',
  },
  documentDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  statusBadge: {
    marginLeft: 10,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resubmitButton: {
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 20,
  },
  gradientButton: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resubmitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textDark,
    marginLeft: 10,
  },
  modalText: {
    fontSize: 14,
    color: theme.colors.textDark,
    marginBottom: 20,
    lineHeight: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxLabel: {
    fontSize: 14,
    color: theme.colors.textDark,
    flex: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: theme.colors.lightGray,
  },
  confirmButton: {
    backgroundColor: theme.colors.primary,
  },
  cancelButtonText: {
    color: theme.colors.textDark,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default UserCertificatesAlreadyExistsScreen;