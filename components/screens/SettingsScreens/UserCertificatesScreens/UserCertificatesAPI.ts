import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {MASTER_URL} from '../../../utils/zustandfetchAPI';

const API_BASE_URL = MASTER_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

export const UserCertificatesAPI = {
  /**
   * Get current user's certificates
   */
  getSelfCertificates: async () => {
    try {
      const response = await api.get('/user-certificates/self');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get certificates for a specific user (admin only)
   * @param userId - The user ID to get certificates for
   */
  getUserCertificates: async (userId: string) => {
    try {
      const response = await api.get(`/user-certificates/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Submit certificates
   * @param certificates - Array of certificate objects
   * @param images - Array of image files for citizen_document_front and citizen_document_back
   */
  submitCertificates: async (
    certificates: Array<{
      certificate_type_id: string;
      description?: string;
    }>,
    images: any[],
  ) => {
    try {
      const formData = new FormData();

      // Add certificates data
      formData.append('certificates', JSON.stringify(certificates));

      // Add images
      images.forEach((image, index) => {
        formData.append('images', {
          uri: image.uri,
          type: image.type || 'image/jpeg',
          name: `certificate_image_${index}.jpg`,
        });
      });

      const response = await api.patch('/user-certificates/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update certificate status (admin only)
   * @param certificateId - ID of the certificate to update
   * @param status - New status (PENDING, APPROVED, REJECTED)
   */
  updateCertificateStatus: async (certificateId: string, status: string) => {
    try {
      const response = await api.patch(
        `/user-certificates/${certificateId}/status`,
        {status},
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get all certificate types
   */
  getCertificateTypes: async () => {
    try {
      const response = await api.get('/user-certificates/types');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// Helper function to validate certificate submissions
export const validateCertificateSubmission = (
  certificates: any[],
  images: any[],
) => {
  const errors: string[] = [];
  const singleSubmissionTypes = [
    'citizen_document_front',
    'citizen_document_back',
    'note',
  ];
  const MAX_OTHER_CERTIFICATES = 10;
  const NOTE_MAX_LENGTH = 2000;

  // Check for required citizen documents
  const hasFront = certificates.some(
    c => c.certificate_type_id === 'citizen_document_front',
  );
  const hasBack = certificates.some(
    c => c.certificate_type_id === 'citizen_document_back',
  );

  if (!hasFront || !hasBack) {
    errors.push('Both front and back of citizen document are required');
  }

  // Check for duplicate single submission types
  const typeCounts: Record<string, number> = {};
  certificates.forEach(cert => {
    if (singleSubmissionTypes.includes(cert.certificate_type_id)) {
      typeCounts[cert.certificate_type_id] =
        (typeCounts[cert.certificate_type_id] || 0) + 1;
    }
  });

  Object.entries(typeCounts).forEach(([type, count]) => {
    if (count > 1) {
      errors.push(`Only one submission allowed for ${type}`);
    }
  });

  // Validate note length
  const noteCert = certificates.find(c => c.certificate_type_id === 'note');
  if (noteCert?.description && noteCert.description.length > NOTE_MAX_LENGTH) {
    errors.push(`Note must be less than ${NOTE_MAX_LENGTH} characters`);
  }

  // Check count for other certificates
  const otherCertificates = certificates.filter(
    cert => !singleSubmissionTypes.includes(cert.certificate_type_id),
  );

  if (otherCertificates.length > MAX_OTHER_CERTIFICATES) {
    errors.push(`Maximum ${MAX_OTHER_CERTIFICATES} other certificates allowed`);
  }

  // Check image requirements for citizen documents
  const frontImages = images.filter(
    (_, index) =>
      certificates[index]?.certificate_type_id === 'citizen_document_front',
  );
  const backImages = images.filter(
    (_, index) =>
      certificates[index]?.certificate_type_id === 'citizen_document_back',
  );

  if (frontImages.length === 0 || backImages.length === 0) {
    errors.push(
      'Images for both front and back of citizen document are required',
    );
  }

  return errors;
};
