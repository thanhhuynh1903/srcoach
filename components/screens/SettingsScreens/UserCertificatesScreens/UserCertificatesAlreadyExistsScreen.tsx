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
import useUserCertificatesStore from '../../../utils/useUserCertificatesStore';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../../contants/theme';
import LinearGradient from 'react-native-linear-gradient';

const UserCertificatesAlreadyExistsScreen = () => {
  const navigation = useNavigation();
  const { clearCertificates } = useUserCertificatesStore();
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const timer = setTimeout(() => {
        clearCertificates();
        navigation.replace('UserCertificatesSubmitScreen');
      }, 1000); // 1 second delay

      return () => clearTimeout(timer);
    }, [])
  );

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header - Maintained from original */}
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

      {/* Loading indicator during the 1-second delay */}
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading application...</Text>
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
    color: theme.colors.textSecondary,
  },
});

export default UserCertificatesAlreadyExistsScreen;