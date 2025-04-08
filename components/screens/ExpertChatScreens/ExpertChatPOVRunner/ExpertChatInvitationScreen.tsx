import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import Icon from '@react-native-vector-icons/ionicons';
import useUserStore from '../../../utils/useUserStore';
import {theme} from '../../../contants/theme';
import ContentLoader from 'react-content-loader/native';
import {Rect, Circle} from 'react-content-loader/native';
import ChatAPI from '../../../utils/useChatAPI';

const ExpertChatInvitationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {expertId} = route.params as {expertId: string};

  const [expert, setExpert] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [initialMessage, setInitialMessage] = useState('');
  const {getUserById} = useUserStore();

  useEffect(() => {
    const fetchExpert = async () => {
      try {
        setIsLoading(true);
        await getUserById(expertId);
        const expertData = useUserStore.getState().viewedUser;
        if (expertData) {
          setExpert(expertData);
        } else {
          setError('Expert not found');
        }
      } catch (err) {
        setError('Failed to load expert information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpert();
  }, [expertId, getUserById]);

  const handleSendRequest = async () => {
    try {
      setIsSending(true);
      setChatError(null);

      const response = await ChatAPI.createOrGetChat(expertId, initialMessage);

      if (!response.status) {
        navigation.navigate('ExpertChatInvitationFailedScreen', {
          expertId,
          error: response.message || 'Chat session already exists',
        });
        return;
      }

      navigation.navigate('ExpertChatInvitationSuccessScreen', {expertId});
    } catch (err: any) {
      setChatError(err.message || 'Failed to send chat request');
      navigation.navigate('ExpertChatInvitationFailedScreen', {
        expertId,
        error: err.message || 'Failed to send chat request',
      });
    } finally {
      setIsSending(false);
    }
  };

  // Determine badge color based on user level
  const getLevelBadgeColor = () => {
    if (!expert?.user_level) return '#607D8B';

    switch (expert.user_level) {
      case 'Unknown':
        return '#607D8B';
      case 'Beginner':
        return '#4CAF50';
      case 'Intermediate':
        return '#2196F3';
      case 'Advanced':
        return '#9C27B0';
      case 'Expert':
        return '#FF9800';
      case 'Master':
        return '#F44336';
      default:
        return '#607D8B';
    }
  };

  const LoadingSkeleton = () => (
    <ContentLoader
      speed={1}
      width="100%"
      height={500}
      viewBox="0 0 400 500"
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb">
      {/* Profile picture */}
      <Circle cx="50" cy="50" r="40" />

      {/* Name */}
      <Rect x="20" y="110" rx="4" ry="4" width="200" height="20" />

      {/* Username */}
      <Rect x="20" y="140" rx="4" ry="4" width="150" height="16" />

      {/* Level badge */}
      <Rect x="20" y="170" rx="8" ry="8" width="80" height="24" />

      {/* Points */}
      <Rect x="110" y="170" rx="8" ry="8" width="100" height="24" />

      {/* Info items */}
      <Rect x="20" y="210" rx="4" ry="4" width="300" height="16" />
      <Rect x="20" y="235" rx="4" ry="4" width="300" height="16" />
      <Rect x="20" y="260" rx="4" ry="4" width="300" height="16" />

      {/* Info box */}
      <Rect x="20" y="300" rx="8" ry="8" width="360" height="180" />
    </ContentLoader>
  );

  return (
    <View style={styles.container}>
      {/* Header - Always visible */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat with Expert</Text>
        <View style={{width: 24}} /> {/* Spacer for alignment */}
      </View>

      {isLoading ? (
        <ScrollView contentContainerStyle={styles.content}>
          <LoadingSkeleton />
        </ScrollView>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : !expert ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Expert information not available</Text>
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={styles.content}
            automaticallyAdjustKeyboardInsets={true}>
            {/* Information Box - Moved to top */}
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxTitle}>Important Information</Text>
              <Text style={styles.infoBoxText}>
                You are about to chat with a certified Running Coach (Expert).
                Please prepare the following information to make the most of
                your session:
              </Text>
              <View style={styles.bulletList}>
                <Text style={styles.bulletPoint}>
                  • Your current running routine
                </Text>
                <Text style={styles.bulletPoint}>
                  • Any recent race times or personal bests
                </Text>
                <Text style={styles.bulletPoint}>
                  • Specific goals you want to achieve
                </Text>
                <Text style={styles.bulletPoint}>
                  • Any injuries or health concerns
                </Text>
              </View>
              <Text style={styles.infoBoxText}>
                The coach will help you create a personalized training plan
                based on your inputs.
              </Text>
            </View>

            {/* Initial Message Input */}
            <View style={styles.messageContainer}>
              <Text style={styles.messageLabel}>
                Initial Message (optional)
              </Text>
              <TextInput
                style={styles.messageInput}
                multiline
                numberOfLines={4}
                placeholder="Briefly introduce yourself and what you're looking for help with..."
                value={initialMessage}
                onChangeText={text => setInitialMessage(text)}
                maxLength={750}
              />
              <Text style={styles.charCount}>
                {initialMessage.length}/750 characters
              </Text>
            </View>

            {/* Expert Profile */}
            <View style={styles.profileContainer}>
              <View>
                <Icon name="person-circle-outline" size={72} color="#555" />
              </View>
              <Text style={styles.name}>
                {expert.name || 'No name provided'}
              </Text>
              <Text style={styles.username}>
                @{expert.username || 'no_username'}
              </Text>

              {/* User Level and Points */}
              <View style={styles.levelContainer}>
                <View
                  style={[
                    styles.levelBadge,
                    {backgroundColor: getLevelBadgeColor()},
                  ]}>
                  <Text style={styles.levelText}>
                    {expert.user_level || 'Member'}
                  </Text>
                </View>
                <View style={styles.pointsContainer}>
                  <Icon name="trophy-outline" size={20} color="#FFD700" />
                  <Text style={styles.pointsText}>
                    {expert.points || 0} points
                  </Text>
                </View>
              </View>

              {/* Additional Info */}
              <View style={styles.infoContainer}>
                {expert.gender && (
                  <View style={styles.infoItem}>
                    <Icon
                      name={
                        expert.gender.toLowerCase() === 'male'
                          ? 'male-outline'
                          : 'female-outline'
                      }
                      size={20}
                      color="#666"
                    />
                    <Text style={styles.infoText}>
                      {expert.gender.charAt(0).toUpperCase() +
                        expert.gender.slice(1).toLowerCase()}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Send Request Button */}
          <View style={styles.buttonContainer}>
            {chatError && <Text style={styles.errorText}>{chatError}</Text>}
            {isSending && <Text style={styles.sendingText}>Sending...</Text>}
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendRequest}
              disabled={isSending}>
              <Icon name="chatbox-ellipses-outline" size={20} color="#fff" />
              <Text style={styles.sendButtonText}>
                {isSending ? 'Sending...' : 'Send Chat Request'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
    paddingBottom: 100, // Extra space for the button
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 16, // Added space between info box and profile
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
    marginTop: 8,
  },
  username: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  levelText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pointsText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  infoContainer: {
    width: '100%',
    paddingHorizontal: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  infoBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  infoBoxTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  infoBoxText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
    lineHeight: 20,
  },
  bulletList: {
    marginLeft: 8,
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
    lineHeight: 20,
  },
  messageContainer: {
    marginBottom: 24,
  },
  messageLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 4,
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#666',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  sendButton: {
    backgroundColor: theme.colors.primaryDark,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sendingText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    opacity: 0.7,
    marginBottom: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
});

export default ExpertChatInvitationScreen;
