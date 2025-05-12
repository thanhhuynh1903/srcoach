import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../../contants/theme';
import LinearGradient from 'react-native-linear-gradient';
import { getSelfCertificates } from '../../../utils/useUserCertificatesAPI';

const UserCertificatesAlreadyExistsScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);

  const checkExistingCertificates = async () => {
    try {
      const certificates = await getSelfCertificates();
      
      if (!certificates || certificates.length === 0) {
        // No existing certificates, go to submit screen
        navigation.replace('UserCertificatesSubmitScreen');
      } else {
        // Has existing certificates, go to view screen
        navigation.replace('UserCertificatesExpertsScreen');
      }
    } catch (error) {
      console.error('Error checking certificates:', error);
      // On error, default to submit screen
      navigation.replace('UserCertificatesSubmitScreen');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      checkExistingCertificates();
      return () => {};
    }, [])
  );

  const handleBack = () => {
    navigation.goBack();
  };

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

      {/* Loading indicator during the check */}
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Checking for existing applications</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#000',
  },
});

export default UserCertificatesAlreadyExistsScreen;