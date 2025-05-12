import axios, {AxiosInstance, AxiosResponse} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';
import {MASTER_URL} from './zustandfetchAPI';
import ToastUtil from './utils_toast';

export type CertificateType =
  | 'CITIZEN_DOCUMENT_FRONT'
  | 'CITIZEN_DOCUMENT_BACK'
  | 'RUNNING_CERTIFICATION'
  | 'RACE_ORGANIZER_CERTIFICATE'
  | 'COACHING_LICENSE'
  | 'INTERNATIONAL_PASSPORT'
  | 'OTHER'
  | 'NOTE';

export type CertificateStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface Certificate {
  id: string;
  certificate_type: CertificateType;
  description?: string;
  status: CertificateStatus;
  reject_reason?: string;
  created_at: string;
  updated_at?: string;
  images: string[];
}

export interface SubmitCertificateRequest {
  certificate_type: CertificateType;
  description?: string;
  uri?: string;
  name?: string;
  type?: string;
}

const createAPI = async (): Promise<AxiosInstance> => {
  const authToken = await AsyncStorage.getItem('authToken');
  const api = axios.create({
    baseURL: MASTER_URL + '/user-certificates',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && {Authorization: `Bearer ${authToken}`}),
    },
  });

  api.interceptors.response.use(
    response => response,
    async error => {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('authToken');
      }
      return Promise.reject(error);
    },
  );

  return api;
};

export const getSelfCertificates = async (): Promise<Certificate[]> => {
  const api = await createAPI();
  const response: AxiosResponse<{data: Certificate[]}> = await api.get('/self');
  return response.data.data;
};

export const submitCertificates = async (
  certificates: SubmitCertificateRequest[],
): Promise<Certificate[]> => {
  const api = await createAPI();
  const formData = new FormData();

  // Separate ID documents from other certificates
  const idDocuments = certificates.filter(cert => 
    ['CITIZEN_DOCUMENT_FRONT', 'CITIZEN_DOCUMENT_BACK'].includes(cert.certificate_type) &&
    cert.uri
  );

  const otherCertificates = certificates.filter(cert => 
    !['CITIZEN_DOCUMENT_FRONT', 'CITIZEN_DOCUMENT_BACK'].includes(cert.certificate_type) &&
    (cert.description || cert.certificate_type === 'NOTE')
  );

  // Add non-file certificates as JSON
  formData.append('certificates', JSON.stringify(otherCertificates));

  // Add ID document files to FormData with proper field names
  idDocuments.forEach(cert => {
    if (cert.uri) {
      const fileExtension = cert.uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${cert.certificate_type}%${Date.now()}.${fileExtension}`;
      
      formData.append('images', {
        uri: cert.uri,
        name: fileName,
        type: cert.type || `image/${fileExtension}`,
      });
    }
  });

  try {
    const response: AxiosResponse<{
      data: Certificate[];
      status: boolean;
      message: string;
    }> = await api.post('/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      transformRequest: () => formData, // Important for FormData
    });

    if (!response.data.status) {
      throw new Error(response.data.message || 'Failed to submit certificates');
    }

    return response.data.data;
  } catch (error) {
    console.error('Certificate submission error:', error);
    throw error;
  }
};

export const isCertificatePending = (certificate: Certificate): boolean => {
  return certificate.status === 'PENDING';
};

export const isCertificateRejected = (certificate: Certificate): boolean => {
  return certificate.status === 'REJECTED';
};

export const getCertificateDisplayName = (type: CertificateType): string => {
  const names: Record<CertificateType, string> = {
    CITIZEN_DOCUMENT_FRONT: 'Citizen Document (Front)',
    CITIZEN_DOCUMENT_BACK: 'Citizen Document (Back)',
    RUNNING_CERTIFICATION: 'Running Certification',
    RACE_ORGANIZER_CERTIFICATE: 'Race Organizer Certificate',
    COACHING_LICENSE: 'Coaching License',
    INTERNATIONAL_PASSPORT: 'International Passport',
    OTHER: 'Other Certificate',
    NOTE: 'Note',
  };
  return names[type];
};

export const validateCertificate = (
  certificate: SubmitCertificateRequest,
): string | null => {
  if (!certificate.certificate_type) return 'Certificate type is required';

  // Validate ID documents
  if (
    ['CITIZEN_DOCUMENT_FRONT', 'CITIZEN_DOCUMENT_BACK'].includes(
      certificate.certificate_type,
    )
  ) {
    if (!certificate.uri) return 'Document image is required';
    return null;
  }

  // Validate note
  if (certificate.certificate_type === 'NOTE') {
    if (certificate.description && certificate.description.length > 2000) {
      return 'Note must be less than 2000 characters';
    }
    return null;
  }

  // Validate URL certificates
  if (certificate.certificate_type !== 'NOTE' && !certificate.description) {
    return 'Certificate URL is required';
  }

  // Validate URL format
  if (certificate.description) {
    try {
      new URL(certificate.description);
    } catch {
      return 'Invalid URL format';
    }
  }

  return null;
};
