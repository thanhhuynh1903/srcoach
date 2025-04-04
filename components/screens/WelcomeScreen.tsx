import React, {useEffect} from 'react';
import {StyleSheet, View, Text, Image} from 'react-native'
import {useNavigation} from '@react-navigation/native';
import { startSyncData } from '../utils/utils_healthconnect';

const WelcomeScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    setTimeout(() => {
      navigation.navigate('WelcomeInfoScreen' as never);
    }, 2000);
  }, [navigation]);

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
