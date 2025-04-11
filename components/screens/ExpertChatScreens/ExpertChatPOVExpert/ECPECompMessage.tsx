import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';

type User = {
  id: string;
  name: string;
  username: string;
  is_expert: boolean;
  points: number;
  user_level: string;
};

type Message = {
  id: string;
  type: 'MESSAGE' | 'EXPERT_RECOMMENDATION' | 'PROFILE';
  message?: string;
  created_at: string;
  user_id?: string;
  expert_id?: string;
  weight?: number;
  height?: number;
  running_level?: string;
  running_goal?: string;
  User?: User;
};

type ECPECompMessageProps = {
  item: Message;
  isCurrentUser: boolean;
  isExpert: boolean;
};

const ECPECompMessage = ({ item, isCurrentUser, isExpert }: ECPECompMessageProps) => {
  const isExpertRecommendation = item.type === 'EXPERT_RECOMMENDATION';
  const isProfile = item.type === 'PROFILE';

  if (isExpertRecommendation) {
    return (
      <View style={[styles.messageContainer, styles.expertContainer]}>
        <View style={styles.expertHeader}>
          <Icon name="ribbon" size={16} color="#FFC107" />
          <Text style={styles.expertTitle}>Expert Recommendation</Text>
        </View>
        <Text style={styles.expertMessage}>{item.message}</Text>
        <Text style={styles.messageTime}>
          {new Date(item.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    );
  }

  if (isProfile) {
    return (
      <View style={[styles.messageContainer, styles.profileContainer]}>
        <View style={styles.profileHeader}>
          <Icon name="person-circle" size={16} color="#4CAF50" />
          <Text style={styles.profileTitle}>Profile Update</Text>
        </View>
        <View style={styles.profileDetails}>
          {item.weight && (
            <Text style={styles.profileText}>Weight: {item.weight} kg</Text>
          )}
          {item.height && (
            <Text style={styles.profileText}>Height: {item.height} cm</Text>
          )}
          {item.running_level && (
            <Text style={styles.profileText}>Level: {item.running_level}</Text>
          )}
          {item.running_goal && (
            <Text style={styles.profileText}>Goal: {item.running_goal}</Text>
          )}
        </View>
        <Text style={styles.messageTime}>
          {new Date(item.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.messageContainer,
        isCurrentUser 
          ? styles.currentUserMessage 
          : isExpert 
            ? styles.expertUserMessage 
            : styles.otherUserMessage,
      ]}>
      {isExpert && !isCurrentUser && (
        <View style={styles.expertBadge}>
          <Icon name="ribbon" size={12} color="#FFD700" />
          <Text style={styles.expertBadgeText}>Expert</Text>
        </View>
      )}
      <Text style={
        isCurrentUser 
          ? styles.currentUserText 
          : isExpert 
            ? styles.expertUserText 
            : styles.otherUserText
      }>
        {item.message}
      </Text>
      <Text style={[
        styles.messageTime,
        isExpert && !isCurrentUser && { color: '#FFD700' }
      ]}>
        {new Date(item.created_at).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    position: 'relative',
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4B7BE5',
    borderTopRightRadius: 0,
  },
  currentUserText: {
    color: '#fff',
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderTopLeftRadius: 0,
  },
  expertUserMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF9E6',
    borderColor: '#FFD700',
    borderWidth: 1,
    borderTopLeftRadius: 0,
  },
  otherUserText: {
    color: '#333',
  },
  expertUserText: {
    color: '#5D4037',
  },
  messageTime: {
    fontSize: 10,
    color: '#dedede',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  expertContainer: {
    alignSelf: 'center',
    backgroundColor: '#FFF9C4',
    borderColor: '#FFC107',
    borderWidth: 1,
    width: '90%',
    marginVertical: 8,
  },
  expertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  expertTitle: {
    marginLeft: 4,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  expertMessage: {
    color: '#5D4037',
  },
  profileContainer: {
    alignSelf: 'center',
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
    borderWidth: 1,
    width: '90%',
    marginVertical: 8,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  profileTitle: {
    marginLeft: 4,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  profileDetails: {
    marginTop: 4,
  },
  profileText: {
    color: '#1B5E20',
    marginBottom: 2,
  },
  expertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: -10,
    left: 0,
    backgroundColor: '#FFD700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    zIndex: 1,
  },
  expertBadgeText: {
    fontSize: 10,
    color: '#5D4037',
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default ECPECompMessage;