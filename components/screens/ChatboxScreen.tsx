import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  SafeAreaView,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import BackButton from '../BackButton';
// Define user types
const USER_TYPES = {
  EXPERT: 'expert',
  CLIENT: 'client',
};

// Sample messages data
const initialMessages = [
  {
    id: 1,
    sender: USER_TYPES.EXPERT,
    text: "Hello! I've reviewed your health data. Your heart rate and sleep patterns look good, but we could work on increasing your daily activity.",
    timestamp: '10:30 AM',
    read: true,
  },
  {
    id: 2,
    sender: USER_TYPES.CLIENT,
    text: "Thank you! I've been trying to improve my fitness routine. Do you have any specific recommendations?",
    timestamp: '10:31 AM',
    read: true,
  },
  {
    id: 3,
    sender: USER_TYPES.EXPERT,
    text: "Based on your current activity level, I'd recommend starting with a 30-minute daily walk. Would you like me to create a personalized exercise plan?",
    timestamp: '10:32 AM',
    read: true,
  },
];

const ChatboxScreen = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');

  // Function to send a new message
  const sendMessage = () => {
    if (newMessage.trim() === '') return;
    
    const message = {
      id: messages.length + 1,
      sender: USER_TYPES.CLIENT,
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
        <BackButton size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expert Chat</Text>
        <View style={styles.onlineIndicator} />
      </View>

      <ScrollView style={styles.content}>
        {/* Expert Profile */}
        <View style={styles.expertProfile}>
          <Image
            source={{ uri: 'https://randomuser.me/api/portraits/women/32.jpg' }}
            style={styles.expertImage}
          />
          <View style={styles.expertInfo}>
            <Text style={styles.expertName}>Dr. Sarah Wilson</Text>
            <Text style={styles.expertTitle}>Fitness & Health Expert</Text>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={16} color="#FFB800" />
              <Text style={styles.ratingText}>4.9 (200+ reviews)</Text>
            </View>
          </View>
        </View>

        {/* Health Data */}
        <View style={styles.healthDataContainer}>
          <View style={styles.healthDataHeader}>
            <Text style={styles.healthDataTitle}>Health Data</Text>
            <TouchableOpacity style={styles.connectButton}>
              <Icon name="watch" size={16} color="#2563EB" />
              <Text style={styles.connectButtonText}>Connect Watch</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.metricsContainer}>
            <View style={styles.metric}>
              <Icon name="heart-outline" size={20} color="#FF4757" />
              <Text style={styles.metricLabel}>Heart Rate</Text>
              <Text style={styles.metricValue}>72 BPM</Text>
            </View>
            <View style={styles.metric}>
              <Icon name="footsteps-outline" size={20} color="#2563EB" />
              <Text style={styles.metricLabel}>Steps</Text>
              <Text style={styles.metricValue}>8,547</Text>
            </View>
            <View style={styles.metric}>
              <Icon name="moon-outline" size={20} color="#6C63FF" />
              <Text style={styles.metricLabel}>Sleep</Text>
              <Text style={styles.metricValue}>7h 23m</Text>
            </View>
          </View>

          <Text style={styles.syncStatus}>Last synced 5 mins ago</Text>
        </View>

        {/* Chat Messages */}
        <View style={styles.messagesContainer}>
          {messages.map((message) => (
            <View 
              key={message.id} 
              style={[
                message.sender === USER_TYPES.EXPERT 
                  ? styles.expertMessage 
                  : styles.userMessage
              ]}
            >
              <Text 
                style={[
                  message.sender === USER_TYPES.EXPERT 
                    ? styles.messageText 
                    : styles.userMessageText
                ]}
              >
                {message.text}
              </Text>
              
              {message.sender === USER_TYPES.EXPERT ? (
                <Text style={styles.messageTime}>{message.timestamp}</Text>
              ) : (
                <View style={styles.userMessageFooter}>
                  <Text style={styles.userMessageTime}>{message.timestamp}</Text>
                  {message.read && <Icon name="checkmark-done-outline" size={16} color="#FFFFFF" />}
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton}>
          <Icon name="image" size={24} color="#64748B" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          placeholderTextColor="#64748B"
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity 
          style={[
            styles.sendButton, 
            newMessage.trim() === '' && styles.sendButtonDisabled
          ]}
          onPress={sendMessage}
          disabled={newMessage.trim() === ''}
        >
          <Icon 
            name="send" 
            size={20} 
            color={newMessage.trim() === '' ? "#A1A1AA" : "#2563EB"} 
          />
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  expertProfile: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  expertImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 12,
  },
  expertInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  expertName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  expertTitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#64748B',
  },
  healthDataContainer: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  healthDataHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  healthDataTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  connectButtonText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metric: {
    alignItems: 'center',
    gap: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  syncStatus: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  messagesContainer: {
    padding: 16,
    gap: 16,
  },
  expertMessage: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
    maxWidth: '85%',
  },
  messageText: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  userMessage: {
    backgroundColor: '#1E3A8A',
    padding: 16,
    borderRadius: 16,
    maxWidth: '85%',
    alignSelf: 'flex-end',
  },
  userMessageText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  userMessageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  userMessageTime: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 12,
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  sendButton: {
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default ChatboxScreen;