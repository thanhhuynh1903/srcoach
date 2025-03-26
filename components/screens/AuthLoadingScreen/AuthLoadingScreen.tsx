// Tạo file mới AuthLoadingScreen.tsx
import React, { useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthLoadingScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
console.log('authToken', AsyncStorage.getItem('authToken'));
console.log('accessTokenExpiresAt', AsyncStorage.getItem('accessTokenExpiresAt'));

    const checkAuthStatus = async () => {
      try {
        const [token, expiresAt] = await AsyncStorage.multiGet([
          'authToken',
          'accessTokenExpiresAt',
        ]);

        const currentTime = Date.now();
        const expirationTime = parseInt(expiresAt[1] || '0', 10);

        if (token[1] && currentTime < expirationTime) {
          navigation.navigate('HomeTabs' as never);
        } else {
          navigation.navigate('WelcomeScreen' as never);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        navigation.navigate('WelcomeScreen' as never);
      }
    };

    checkAuthStatus();
  }, [navigation]);

  return <ActivityIndicator size="large" />;
};

export default AuthLoadingScreen;