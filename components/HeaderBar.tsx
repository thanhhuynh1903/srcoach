import {StyleSheet, Text, View, Image, TouchableOpacity,StatusBar} from 'react-native';
import React from 'react';
import Icon from '@react-native-vector-icons/ionicons';
import {useNavigation} from '@react-navigation/native';
const HeaderBar = () => {
  const navigate = useNavigation();
  return (
    <View style={styles.container}>
        <StatusBar barStyle="light-content" />
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
        <TouchableOpacity>
          <Icon
            name="notifications-outline"
            size={24}
            color="#4B5563"
            onPress={() => navigate.navigate('ManageNotification' as never)}
          />
        </TouchableOpacity>
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
    gap: 25,
    alignItems: 'center', // Center icon
    justifyContent: 'center',
  },
});
