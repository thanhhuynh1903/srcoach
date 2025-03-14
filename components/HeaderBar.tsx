import {StyleSheet, Text, View, Image} from 'react-native';
import React from 'react';
import Icon from '@react-native-vector-icons/ionicons';

const HeaderBar = () => {
  return (
    <View style={styles.container}>
      {/* Logo and App Name */}
      <View style={styles.logoContainer}>
        <Image
          style={styles.tinyLogo}
          source={require('../components/assets/logo.png')}
        />
        <Text style={styles.welcomeText}>SRCoach</Text>
      </View>

      {/* Inbox Icon */}
      <View style={styles.iconContainer}>
        <Icon name="search-outline" size={24} color="#4B5563" />

        <Icon name="notifications-outline" size={24} color="#4B5563" />

        <Icon name={'chatbubbles' as any} size={25} color="#4B5563" />
      </View>
    </View>
  );
};

export default HeaderBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', // Row layout
    alignItems: 'center', // Center items vertically
    justifyContent: 'space-between', // Space between logo and icons
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  logoContainer: {
    flexDirection: 'row', // Row layout for logo and text
    alignItems: 'center', // Center items vertically
  },
  tinyLogo: {
    width: 32, // Slightly larger logo
    height: 32,
    marginRight: 8, // Space between logo and text
  },
  welcomeText: {
    fontSize: 18, // Font size for the app name
    fontWeight: 'bold',
    color: '#000', // Black text color
  },
  iconContainer: {
    flexDirection: 'row',
    gap:25,
    alignItems: 'center', // Center icon
    justifyContent: 'center',
  },
});
