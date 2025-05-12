import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Image,
  Linking,
  ActivityIndicator
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { useLoginStore } from '../../../utils/useLoginStore';
import { theme } from '../../../contants/theme';
import { getSelfCertificates, Certificate, CertificateType, CertificateStatus } from '../../../utils/useUserCertificatesAPI';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import BackButton from '../../../BackButton';
import CommonDialog from '../../../commons/CommonDialog';

export default function UserCertificatesExpertScreen() {
  const navigation = useNavigation();
  const { profile } = useLoginStore();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showResubmitDialog, setShowResubmitDialog] = useState(false);
  const [groupedCertificates, setGroupedCertificates] = useState<Record<string, Certificate[]>>({});

  const isExpert = profile?.roles?.includes('expert');

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setIsLoading(true);
        const certs = await getSelfCertificates();
        setCertificates(certs);
        
        // Group certificates by type
        const grouped = certs.reduce((acc, cert) => {
          const key = cert.certificate_type;
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(cert);
          return acc;
        }, {} as Record<string, Certificate[]>);
        
        setGroupedCertificates(grouped);
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load certificates',
          visibilityTime: 4000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  const getStatusColor = (status: CertificateStatus) => {
    switch (status) {
      case 'ACCEPTED':
        return theme.colors.success;
      case 'REJECTED':
        return theme.colors.error;
      case 'PENDING':
        return theme.colors.warning;
      default:
        return theme.colors.gray;
    }
  };

  const getStatusIcon = (status: CertificateStatus) => {
    switch (status) {
      case 'ACCEPTED':
        return 'checkmark-circle';
      case 'REJECTED':
        return 'close-circle';
      case 'PENDING':
        return 'time';
      default:
        return 'help-circle';
    }
  };

  const getTypeIcon = (type: CertificateType) => {
    switch (type) {
      case 'CITIZEN_DOCUMENT_FRONT':
      case 'CITIZEN_DOCUMENT_BACK':
        return 'document';
      case 'RUNNING_CERTIFICATION':
        return 'ribbon';
      case 'RACE_ORGANIZER_CERTIFICATE':
        return 'trophy';
      case 'COACHING_LICENSE':
        return 'school';
      case 'INTERNATIONAL_PASSPORT':
        return 'passport';
      case 'OTHER':
        return 'document-attach';
      case 'NOTE':
        return 'document-text';
      default:
        return 'document';
    }
  };

  const formatTypeName = (type: CertificateType) => {
    const names = {
      CITIZEN_DOCUMENT_FRONT: 'Citizen Document (Front)',
      CITIZEN_DOCUMENT_BACK: 'Citizen Document (Back)',
      RUNNING_CERTIFICATION: 'Running Certification',
      RACE_ORGANIZER_CERTIFICATE: 'Race Organizer Certificate',
      COACHING_LICENSE: 'Coaching License',
      INTERNATIONAL_PASSPORT: 'International Passport',
      OTHER: 'Other Certificate',
      NOTE: 'Note',
    };
    return names[type] || type;
  };

  const renderCertificateContent = (cert: Certificate) => {
    switch (cert.certificate_type) {
      case 'CITIZEN_DOCUMENT_FRONT':
      case 'CITIZEN_DOCUMENT_BACK':
        return (
          <TouchableOpacity onPress={() => cert.description && Linking.openURL(cert.description)}>
            <Image
              source={{ uri: cert.description }}
              style={styles.certificateImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        );
      case 'NOTE':
        return (
          <View style={styles.noteContainer}>
            <Text style={styles.noteText}>{cert.description}</Text>
          </View>
        );
      default:
        return (
          <TouchableOpacity 
            style={styles.urlContainer}
            onPress={() => cert.description && Linking.openURL(cert.description)}
          >
            <Icon name="link" size={16} color={theme.colors.primary} />
            <Text style={styles.urlText} numberOfLines={1}>
              {cert.description}
            </Text>
          </TouchableOpacity>
        );
    }
  };

  const renderCertificateGroup = (type: CertificateType, certs: Certificate[]) => {
    return (
      <View key={type} style={styles.certificateContainer}>
        <View style={styles.certificateHeader}>
          <Icon
            name={getTypeIcon(type)}
            size={20}
            color={theme.colors.primary}
          />
          <Text style={styles.certificateTitle}>
            {formatTypeName(type)}
          </Text>
        </View>

        {certs.map((cert, index) => (
          <View key={cert.id} style={styles.certificateItem}>
            <View style={styles.certificateItemHeader}>
              <Text style={styles.certificateItemNumber}>Document {index + 1}</Text>
              <View style={styles.statusBadge}>
                <Icon
                  name={getStatusIcon(cert.status)}
                  size={16}
                  color={getStatusColor(cert.status)}
                />
                <Text style={[styles.statusText, { color: getStatusColor(cert.status) }]}>
                  {cert.status.charAt(0) + cert.status.slice(1).toLowerCase()}
                </Text>
              </View>
            </View>

            {renderCertificateContent(cert)}

            {cert.reject_reason && (
              <View style={styles.rejectReasonContainer}>
                <Text style={styles.rejectReasonLabel}>Rejection Reason:</Text>
                <Text style={styles.rejectReasonText}>{cert.reject_reason}</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

  const handleResubmit = () => {
    setShowResubmitDialog(true);
  };

  const confirmResubmit = () => {
    setShowResubmitDialog(false);
    navigation.navigate('UserCertificatesSubmitScreen');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton size={24} style={styles.backButton} />
        <Text style={styles.title}>My Certificates</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Expert Status Banner */}
          {isExpert ? (
            <View style={[styles.statusBanner, styles.expertBanner]}>
              <Icon name="checkmark-circle" size={24} color={theme.colors.success} />
              <View style={styles.statusBannerContent}>
                <Text style={styles.statusBannerTitle}>Verified Expert</Text>
                <Text style={styles.statusBannerText}>
                  Your expert status has been verified. You can now access all expert features.
                </Text>
              </View>
            </View>
          ) : (
            <View style={[styles.statusBanner, styles.notExpertBanner]}>
              <Icon name="alert-circle" size={24} color={theme.colors.warning} />
              <View style={styles.statusBannerContent}>
                <Text style={styles.statusBannerTitle}>Not an Expert</Text>
                <Text style={styles.statusBannerText}>
                  You are not currently registered as an expert. Submit your documents to apply.
                </Text>
              </View>
            </View>
          )}

          {/* Certificates */}
          {Object.keys(groupedCertificates).length > 0 ? (
            Object.entries(groupedCertificates).map(([type, certs]) => 
              renderCertificateGroup(type as CertificateType, certs)
            )
          ) : (
            <View style={styles.noCertificates}>
              <Icon name="document" size={40} color={theme.colors.gray} />
              <Text style={styles.noCertificatesText}>
                No certificates submitted yet
              </Text>
            </View>
          )}

          {/* Resubmit Button */}
          {certificates.length > 0 && (
            <TouchableOpacity 
              style={styles.resubmitButton}
              onPress={handleResubmit}
            >
              <Text style={styles.resubmitButtonText}>Resubmit Verification</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      {/* Resubmit Confirmation Dialog */}
      <CommonDialog
        visible={showResubmitDialog}
        onClose={() => setShowResubmitDialog(false)}
        title="Resubmit Documents"
        content={
          <View>
            <Text style={styles.dialogText}>
              Are you sure you want to resubmit your documents?
            </Text>
            <Text style={styles.dialogText}>
              - Your current verification process will be cancelled
            </Text>
            <Text style={styles.dialogText}>
              - You'll need to wait another 3-5 days for review
            </Text>
          </View>
        }
        actionButtons={[
          {
            label: 'Cancel',
            variant: 'outlined',
            handler: () => setShowResubmitDialog(false),
            color: theme.colors.textSecondary,
          },
          {
            label: 'Confirm',
            variant: 'contained',
            handler: confirmResubmit,
            color: theme.colors.primaryDark,
          },
        ]}
      />
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
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGray,
    gap: 12,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  expertBanner: {
    backgroundColor: theme.colors.successLight,
  },
  notExpertBanner: {
    backgroundColor: theme.colors.warningLight,
  },
  statusBannerContent: {
    flex: 1,
    marginLeft: 12,
  },
  statusBannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusBannerText: {
    fontSize: 14,
    lineHeight: 20,
  },
  certificateContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  certificateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  certificateTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.textDark,
    marginLeft: 8,
  },
  certificateItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGray,
  },
  certificateItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  certificateItemNumber: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  certificateImage: {
    width: '100%',
    height: 200,
    borderRadius: 4,
    backgroundColor: theme.colors.lightGray,
  },
  noteContainer: {
    backgroundColor: theme.colors.lightGray,
    padding: 12,
    borderRadius: 4,
  },
  noteText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  urlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: theme.colors.lightGray,
    borderRadius: 4,
  },
  urlText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.primary,
    marginLeft: 8,
    textDecorationLine: 'underline',
  },
  rejectReasonContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.lightGray,
  },
  rejectReasonLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.error,
    marginBottom: 4,
  },
  rejectReasonText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  noCertificates: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noCertificatesText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  resubmitButton: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  resubmitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  dialogText: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
});