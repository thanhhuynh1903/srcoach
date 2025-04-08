import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import ContentLoader from 'react-content-loader/native';
import {Rect} from 'react-content-loader/native';
import {theme} from '../../../../contants/theme';

interface Message {
  id: string;
  message: string;
  created_at: string;
  User: {
    id: string;
  };
}

interface RecommendationMessage {
  id: string;
  recommendation: string;
  created_at: string;
}

interface ECMessageContainerProps {
  isLoading: boolean;
  messages: Message[];
  recommendationMessages: RecommendationMessage[];
  otherParticipantId?: string;
  scrollViewRef: React.RefObject<ScrollView>;
  onSaveRecommendation?: (id: string) => void;
}

const ECMessageContainer: React.FC<ECMessageContainerProps> = ({
  isLoading,
  messages = [],
  recommendationMessages = [],
  otherParticipantId,
  scrollViewRef,
  onSaveRecommendation,
}) => {
  const formatTime = (dateString: string) => {
    const now = new Date();
    const messageDate = new Date(dateString);
    const diffInDays = Math.floor(
      (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    const timeString = messageDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    if (diffInDays === 0) {
      return timeString;
    } else if (diffInDays === 1) {
      return `Yesterday ${timeString}`;
    } else if (diffInDays < 7) {
      return `${messageDate.toLocaleDateString([], {
        weekday: 'long',
      })} ${timeString}`;
    } else {
      return `${messageDate.toLocaleDateString([], {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })} ${timeString}`;
    }
  };

  // Combine and sort all messages by created_at
  const allMessages = [
    ...messages.map(msg => ({...msg, type: 'message' as const})),
    ...recommendationMessages.map(msg => ({
      ...msg,
      type: 'recommendation' as const,
    })),
  ].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

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
      {allMessages.map(item => {
        if (item.type === 'message') {
          const msg = item as Message;
          return (
            <View
              key={`msg-${msg.id}`}
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
          );
        } else {
          const recommendation = item as RecommendationMessage;
          return (
            <View
              key={`rec-${recommendation.id}`}
              style={styles.recommendationContainer}>
              <View style={styles.recommendationBubble}>
                <Text style={styles.recommendationTitle}>Expert Recommendation:</Text>
                <Text style={styles.recommendationText}>
                  {recommendation.recommendation}
                </Text>
                <Text style={styles.recommendationTime}>
                  {formatTime(recommendation.created_at)}
                </Text>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() => onSaveRecommendation?.(recommendation.id)}>
                  <Text style={styles.saveButtonText}>Save recommendation</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
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
  recommendationContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  recommendationBubble: {
    maxWidth: '90%',
    width: '90%',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#E6FFED',
    alignItems: 'flex-start',
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007519',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  recommendationTime: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#38A169',
    borderRadius: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ECMessageContainer;
