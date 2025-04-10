import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {useLoginStore} from '../../../utils/useLoginStore';
import useUserCertificatesStore from '../../../utils/useUserCertificatesStore';
import {theme} from '../../../contants/theme';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';

export default function UserCertificatesExpertScreen() {
  const navigation = useNavigation();
  const { profile } = useLoginStore();
  const {certificates, isLoading, getSelfCertificates, clearCertificates} =
    useUserCertificatesStore();

  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const isExpert = profile?.roles?.includes('expert');

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

  const handleRemoveExpert = async () => {
    setIsRemoving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      clearCertificates();
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'You have been removed from the Expert Coaching platform',
        visibilityTime: 4000,
      });

      setShowRemoveModal(false);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to remove expert status',
        visibilityTime: 4000,
      });
    } finally {
      setIsRemoving(false);
    }
  };

  if (!isExpert) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Expert Verification</Text>
        </View>

        <View style={styles.notExpertContainer}>
          <Icon name="alert-circle" size={50} color={theme.colors.warning} />
          <Text style={styles.notExpertTitle}>Not an Expert</Text>
          <Text style={styles.notExpertText}>
            You are not currently registered as an expert on our platform.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Expert Dashboard</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.statusContainer}>
          <Icon
            name="checkmark-circle"
            size={30}
            color={theme.colors.success}
          />
          <Text style={styles.statusTitle}>You are an Expert!</Text>
          <Text style={styles.statusSubText}>
            Thank you for being part of our Expert Coaching platform.
          </Text>
        </View>

        <View style={styles.documentsContainer}>
          <Text style={styles.sectionTitle}>Your Approved Certificates</Text>

          {certificates.length > 0 ? (
            certificates.map(cert => (
              <View key={cert.id} style={styles.documentItem}>
                <View style={styles.documentInfo}>
                  <Text style={styles.documentName}>
                    {formatTypeName(
                      cert.CertificateType?.type_name ||
                        cert.certificate_type_id,
                    )}
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
                      {backgroundColor: getStatusColor(cert.status)},
                    ]}>
                    <Text style={styles.statusText}>
                      {cert.status.charAt(0) +
                        cert.status.slice(1).toLowerCase()}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.noCertificates}>
              <Text style={styles.noCertificatesText}>
                No certificates found
              </Text>
            </View>
          )}
        </View>

        <View style={styles.removeContainer}>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => setShowRemoveModal(true)}
            disabled={isLoading}>
            <Text style={styles.removeButtonText}>Leave Expert Program</Text>
          </TouchableOpacity>
          <View style={styles.underline} />
        </View>
      </ScrollView>

      {/* Remove Expert Confirmation Modal */}
      <Modal
        visible={showRemoveModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRemoveModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Icon name="warning" size={30} color={theme.colors.warning} />
              <Text style={styles.modalTitle}>Leave Expert Program</Text>
            </View>

            <Text style={styles.modalText}>
              Are you sure you want to leave the Expert Coaching platform?
              {'\n\n'}• You will lose your expert status
              {'\n'}• Your expert profile will be deactivated
              {'\n'}• You'll need to reapply if you want to return
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowRemoveModal(false)}
                disabled={isRemoving}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.confirmButton,
                  isRemoving && {opacity: 0.6},
                ]}
                onPress={handleRemoveExpert}
                disabled={isRemoving}>
                {isRemoving ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

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
    backgroundColor: theme.colors.primary,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  notExpertContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notExpertTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.textDark,
    marginTop: 20,
    marginBottom: 10,
  },
  notExpertText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
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
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.textDark,
    marginTop: 10,
    marginBottom: 5,
  },
  statusSubText: {
    fontSize: 16,
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
    fontSize: 18,
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
    shadowOffset: {width: 0, height: 1},
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
  noCertificates: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
  },
  noCertificatesText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  removeContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  removeButton: {
    padding: 10,
  },
  removeButtonText: {
    color: '#FF0000',
    fontSize: 16,
    fontWeight: '600',
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
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 20,
    lineHeight: 24,
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
    backgroundColor: '#FF0000',
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