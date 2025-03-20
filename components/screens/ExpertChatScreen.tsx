import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {useNavigation} from '@react-navigation/native';


const tabs = ['All', 'Available Now', 'Upcoming', 'Previous'];

// Doctor profile images
const doctorImages = {
  sarahWilson: 'https://randomuser.me/api/portraits/women/32.jpg',
  michaelChen: 'https://randomuser.me/api/portraits/men/44.jpg',
  emilyBrown: 'https://randomuser.me/api/portraits/women/65.jpg',
  jamesMiller: 'https://randomuser.me/api/portraits/men/33.jpg',
  lisaAnderson: 'https://randomuser.me/api/portraits/women/17.jpg',
};

const doctors = [
  {
    id: 1,
    name: 'Dr. Sarah Wilson',
    specialty: 'Cardiologist',
    message: 'Thank you for your consultation',
    time: '10:30 AM',
    image: doctorImages.sarahWilson,
    unread: 2,
    online: false,
  },
  {
    id: 2,
    name: 'Prof. Michael Chen',
    specialty: 'Neurologist',
    message: 'Your next appointment is scheduled',
    time: 'Yesterday',
    image: doctorImages.michaelChen,
    online: false,
  },
  {
    id: 3,
    name: 'Dr. Emily Brown',
    specialty: 'Pediatrician',
    message: 'Please send the test results',
    time: 'Yesterday',
    image: doctorImages.emilyBrown,
    unread: 1,
    online: true,
  },
  {
    id: 4,
    name: 'Dr. James Miller',
    specialty: 'Orthopedist',
    message: 'How are you feeling today?',
    time: '2 days ago',
    image: doctorImages.jamesMiller,
    online: true,
  },
  {
    id: 5,
    name: 'Dr. Lisa Anderson',
    specialty: 'Dermatologist',
    message: 'Your skin condition is improving',
    time: '3 days ago',
    image: doctorImages.lisaAnderson,
    online: false,
  },
];

const ExpertChatScreen = () => {
  const [activeTab, setActiveTab] = React.useState('All');
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Expert Chat</Text>
        <TouchableOpacity>
          <Icon name="settings-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#64748B" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search message..."
          placeholderTextColor="#64748B"
        />
      </View>

      {/* Filter Tabs */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Chat List */}
      <ScrollView style={styles.chatList}>
        {doctors.map(doctor => (
          <TouchableOpacity style={{borderBottomWidth: 1, borderBottomColor: '#F1F5F9'}} onPress={() => {navigation.navigate('ChatboxScreen' as never)}}>
            <View key={doctor.id} style={styles.chatItem}>
              <View style={styles.chatLeft}>
                <View style={styles.avatarContainer}>
                  <Image source={{uri: doctor.image}} style={styles.avatar} />
                </View>
                <View style={styles.chatInfo}>
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Text style={styles.doctorName}>{doctor.name}</Text>
                    {doctor.online && <View style={styles.onlineIndicator} />}
                  </View>
                  <Text style={styles.specialty}>{doctor.specialty}</Text>
                  <Text style={styles.lastMessage}>{doctor.message}</Text>
                </View>
              </View>
              <View style={styles.chatRight}>
                <Text style={styles.timestamp}>{doctor.time}</Text>
                {doctor.unread && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{doctor.unread}</Text>
                  </View>
                )}
              </View>
            </View>
            <View style={{flex:1,alignItems:'flex-end',marginRight:32,marginBottom:10}}>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton} onPress={() => {navigation.navigate('GenerateScheduleScreen' as never)}}>
                <Icon name="share-social-outline" size={20} color="#3B82F6" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => {navigation.navigate('ScheduleScreen' as never)}}>
                <Icon name="calendar-outline" size={20} color="#22C55E" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Icon name="ellipsis-vertical-outline" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    padding: 0,
  },

  tabsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  activeTab: {
    backgroundColor: '#2563EB',
  },
  tabText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  chatLeft: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  onlineIndicator: {
    width: 12,
    height: 12,
    marginLeft: 10,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  specialty: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#64748B',
  },
  chatRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: '#2563EB',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  unreadText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  homeIndicator: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  homeIndicatorBar: {
    width: 134,
    height: 5,
    backgroundColor: '#000000',
    borderRadius: 2.5,
  },
});

export default ExpertChatScreen;
