import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, View, Text, Image, Animated, Easing} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useLoginStore} from '../utils/useLoginStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@react-native-vector-icons/ionicons';
import ToastUtil from '../utils/utils_toast';
import {theme} from '../contants/theme';
import NotificationService from '../services/NotificationService';
import {getSocket} from '../utils/socket';

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const {setUserData, fetchUserProfile} = useLoginStore();
  const [loadingStatus, setLoadingStatus] = useState<string>('Loading...');
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [animation] = useState(new Animated.Value(0));
  const [loginSuccess, setLoginSuccess] = useState<boolean>(false);

  // Footstep animation
  useEffect(() => {
    if (!showSuccess) {
      const loopAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(animation, {
            toValue: 1,
            duration: 800,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(animation, {
            toValue: 0,
            duration: 800,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
      );
      loopAnimation.start();
      return () => loopAnimation.stop();
    }
  }, [showSuccess]);

  const dot1Opacity = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1, 0.3],
  });

  const dot2Opacity = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.3, 1],
  });

  const dot3Opacity = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1, 0.3],
  });

  const dot1Scale = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.8, 1.2, 0.8],
  });

  const dot2Scale = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1.2, 0.8, 1.2],
  });

  const dot3Scale = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.8, 1.2, 0.8],
  });

  const socketRef = useRef(null as any);
  const {profile} = useLoginStore();

  useEffect(() => {
    if (loginSuccess) {
      socketRef.current = getSocket();
      socketRef.current.emit('joinUser', {userId: profile.id});
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [loginSuccess]);

  useEffect(() => {
    let isMounted = true;

    const checkTokenAndNavigate = async () => {
      let shouldNotShowWelcome = await AsyncStorage.getItem(
        'shouldNotShowWelcome',
      );
      try {
        setLoadingStatus('Checking authentication...');
        const token = await AsyncStorage.getItem('authToken');
        const tokenTimestamp = await AsyncStorage.getItem('authTokenTimestamp');

        if (token && tokenTimestamp) {
          const loginTime = new Date(parseInt(tokenTimestamp, 10));
          const now = new Date();
          const diff = now.getTime() - loginTime.getTime();

          if (diff < 24 * 60 * 60 * 1000) {
            // Token is valid
            setUserData(token);
            setLoadingStatus('Fetching user profile...');

            // Get user profile
            const profileSuccess = await fetchUserProfile();

            if (profileSuccess) {
              setLoadingStatus('Success');
              setShowSuccess(true);
              setLoginSuccess(true);

              await setupNotifications();
              // Wait a moment to show success state before navigating
              await new Promise(resolve => setTimeout(resolve, 1000));

              if (isMounted) {
                navigation.navigate('HomeTabs' as never);
              }
            } else {
              await AsyncStorage.removeItem('authToken');
              await AsyncStorage.removeItem('authTokenTimestamp');
              setUserData(null);
              if (isMounted) {
                if (shouldNotShowWelcome) {
                  navigation.navigate('LoginScreen' as never);
                } else {
                  navigation.navigate('WelcomeInfoScreen' as never);
                }
              }
            }
          } else {
            // Token expired
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('authTokenTimestamp');
            setUserData(null);
            if (isMounted) {
              if (shouldNotShowWelcome) {
                navigation.navigate('LoginScreen' as never);
              } else {
                navigation.navigate('WelcomeInfoScreen' as never);
              }
            }
          }
        } else {
          // No token found
          if (isMounted) {
            if (shouldNotShowWelcome) {
              navigation.navigate('LoginScreen' as never);
            } else {
              navigation.navigate('WelcomeInfoScreen' as never);
            }
          }
        }
      } catch (error) {
        ToastUtil.error(
          'Authenciation error',
          'An error occurred. Please re-login to continue',
        );
        setLoadingStatus('Error occurred');
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (isMounted) {
          navigation.navigate('WelcomeInfoScreen' as never);
        }
      }
    };

    checkTokenAndNavigate();

    return () => {
      isMounted = false;
    };
  }, [navigation, setUserData, fetchUserProfile]);

  const setupNotifications = async () => {
    try {
      console.log('Đang khởi tạo dịch vụ thông báo...');
      await NotificationService.init();
      console.log('Đã khởi tạo dịch vụ thông báo thành công');
    } catch (error) {
      console.error('Lỗi khi thiết lập thông báo:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <Image
          style={styles.welcomImage}
          resizeMode="contain"
          source={require('../assets/logo.png')}
        />
        <Text style={styles.title}>Smart Running Coach</Text>
        <Text style={styles.description}>
          Your Intelligent AI Health & Wellness Companion.
        </Text>
      </View>
      <View style={styles.loadingContainer}>
        {showSuccess ? (
          <View style={styles.successContainer}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <Text style={styles.successText}>Ready</Text>
          </View>
        ) : (
          <View style={styles.loadingContent}>
            <Text style={styles.loading}>{loadingStatus}</Text>
            <View style={styles.dotsContainer}>
              <Animated.View
                style={[
                  styles.dot,
                  {
                    opacity: dot1Opacity,
                    transform: [{scale: dot1Scale}],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.dot,
                  {
                    opacity: dot2Opacity,
                    transform: [{scale: dot2Scale}],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.dot,
                  {
                    opacity: dot3Opacity,
                    transform: [{scale: dot3Scale}],
                  },
                ]}
              />
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#ffffff',
  },
  centerContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  welcomImage: {
    height: 150,
    width: 200,
  },
  title: {
    color: '#000000',
    fontSize: 32,
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: 16,
  },
  description: {
    textAlign: 'center',
    fontSize: 16,
    color: '#000000',
    marginTop: 8,
    paddingHorizontal: 40,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 40,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loading: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primaryDark,
    marginHorizontal: 4,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  successText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
});

export default WelcomeScreen;
