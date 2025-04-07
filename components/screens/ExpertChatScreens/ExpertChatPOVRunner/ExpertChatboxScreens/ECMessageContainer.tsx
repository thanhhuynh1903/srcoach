import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import ContentLoader from 'react-content-loader/native';
import {Rect, Circle} from 'react-content-loader/native';
import Icon from '@react-native-vector-icons/ionicons';
import { theme } from '../../../../contants/theme';

interface Message {
  id: string;
  message: string;
  created_at: string;
  User: {
    id: string;
  };
}

interface ECMessageContainerProps {
  isLoading: boolean;
  messages: Message[];
  otherParticipantId?: string;
  scrollViewRef: React.RefObject<ScrollView>;
}

const ECMessageContainer: React.FC<ECMessageContainerProps> = ({
  isLoading,
  messages,
  otherParticipantId,
  scrollViewRef,
}) => {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <View style={styles.messagesContainer}>
        <ContentLoader
          speed={1}
          width="100%"
          height={400}
          backgroundColor="#f3f3f3"
          foregroundColor="#ecebeb">
          {/* Received message skeleton */}
          <Rect x="20" y="20" rx="8" ry="8" width="200" height="80" />
          {/* Sent message skeleton */}
          <Rect x="170" y="120" rx="8" ry="8" width="200" height="80" />
          {/* Received message skeleton */}
          <Rect x="20" y="220" rx="8" ry="8" width="150" height="60" />
        </ContentLoader>
      </View>
    );
  }
  
  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.messagesContainer}
      contentContainerStyle={styles.messagesContent}>
      {messages.map(msg => (
        <View
          key={msg.id}
          style={[
            styles.messageBubble,
            msg.User.id === otherParticipantId
              ? styles.receivedMessage
              : styles.sentMessage,
          ]}>
          <Text
            style={[
              styles.messageText,
              msg.User.id === otherParticipantId
                ? styles.receivedText
                : styles.sentText,
            ]}>
            {msg.message}
          </Text>
          <Text
            style={[
              styles.messageTime,
              msg.User.id === otherParticipantId
                ? styles.receivedTime
                : styles.sentTime,
            ]}>
            {formatTime(msg.created_at)}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingBottom: 16,
    justifyContent: 'flex-end',
    flexGrow: 1,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    borderBottomLeftRadius: 0,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.primaryDark,
    borderBottomRightRadius: 0,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  receivedText: {
    color: '#000000',
  },
  sentText: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  receivedTime: {
    color: '#64748B',
    textAlign: 'left',
  },
  sentTime: {
    color: '#E0E7FF',
    textAlign: 'right',
  },
});

export default ECMessageContainer;
