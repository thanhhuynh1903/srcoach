import React, {useEffect} from 'react';
import {StyleSheet, View, Text, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {startSyncData} from '../utils/utils_healthconnect';
import {useLoginStore} from '../utils/useLoginStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const {setUserData, fetchUserProfile} = useLoginStore();

  useEffect(() => {
    let isMounted = true;

    const checkTokenAndNavigate = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const tokenTimestamp = await AsyncStorage.getItem('authTokenTimestamp');

        if (token && tokenTimestamp) {
          const loginTime = new Date(parseInt(tokenTimestamp, 10));
          const now = new Date();
          const diff = now.getTime() - loginTime.getTime();

          if (diff < 24 * 60 * 60 * 1000) {
            // Token hợp lệ
            setUserData(token);

            // Lấy thông tin người dùng
            const profileSuccess = await fetchUserProfile();

            if (profileSuccess) {
              // Đồng bộ dữ liệu sức khỏe
              const endDate = new Date();
              const startDate = new Date();
              startDate.setDate(endDate.getDate() - 30);
              startSyncData(startDate.toISOString(), endDate.toISOString());

              if (isMounted) {
                navigation.navigate('HomeTabs' as never);
              }
            } else {
              // Không lấy được profile
              await AsyncStorage.removeItem('authToken');
              await AsyncStorage.removeItem('authTokenTimestamp');
              setUserData(null);
              if (isMounted) {
                navigation.navigate('WelcomeInfoScreen' as never);
              }
            }
          } else {
            // Token hết hạn
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('authTokenTimestamp');
            setUserData(null);
            if (isMounted) {
              navigation.navigate('WelcomeInfoScreen' as never);
            }
          }
        } else {
          // Không có token
          if (isMounted) {
            navigation.navigate('WelcomeInfoScreen' as never);
          }
        }
      } catch (error) {
        console.error('Lỗi kiểm tra token:', error);
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
        <Text style={styles.loading}>Loading...</Text>
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
  },
  centerContent: {
    alignItems: 'center',
  },
  welcomImage: {
    height: 150,
    width: 200,
  },
  title: {
    color: "#000000",
    fontSize: 32,
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: 16,
  },
  description: {
    textAlign: 'center',
    fontSize: 16,
    color: "#000000",
    marginTop: 8,
    paddingHorizontal: 40,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 40,
  },
  loading: {
    fontSize: 16,
    color: "#000000",
  },
});

export default WelcomeScreen;
