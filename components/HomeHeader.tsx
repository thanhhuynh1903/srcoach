import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {useNavigation} from '@react-navigation/native';
const HomeHeader = () => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Date and Notification */}
      <View style={styles.topBar}>
        <Text style={styles.dateText}>{currentDate}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ManageNotificationsScreen' as never)}>
          <Icon name="notifications-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* User Profile */}
      <TouchableOpacity style={styles.profileSection}>
        <View style={styles.profileLeft}>
          <Image
            source={{
              uri: 'https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg',
            }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.greeting}>Hi, Dekomori! 👋</Text>
            <View style={styles.membershipContainer}>
              <Icon name="star" size={12} color="#FFD700" />
              <Text style={styles.membershipText}>Pro Member</Text>
            </View>
          </View>
        </View>
        <Icon name="chevron-forward-outline" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      {/* Search Bar */}
      <TouchableOpacity
        style={styles.searchContainer}
        onPress={() => {
          navigation.navigate('SearchScreen' as never);
        }}>
        <Icon name="search" size={20} color="#9CA3AF" />
        <Text style={styles.searchInput}>Search Experts</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1F2937',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  membershipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  membershipText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#9CA3AF',
    fontSize: 14,
    padding: 0, // Remove default padding
  },
});

export default HomeHeader;
