import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  Animated,
  Image,
  Alert,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import BackButton from '../../../BackButton';
import ChatAPI from '../../../utils/useChatAPI';
import ContentLoader, {Rect, Circle} from 'react-content-loader/native';
import ECInfo from './ExpertChatboxScreens/ECPEInfo';
import ECNotes from './ExpertChatboxScreens/ECPENotes';
import {useNavigation, useRoute} from '@react-navigation/native';
import {theme} from '../../../contants/theme';
import useChatExpertAPI from '../../../utils/useChatExpertAPI';
import ECPEScheduleModal from './ExpertChatboxScreens/ECPEScheduleModal';
import ECPERecommendationModal from './ExpertChatboxScreens/ECPERecommendationModal';
import ECPEMessageContainer from './ExpertChatboxScreens/ECPEMessageContainer';

export default function ECPEChatbox() {
  const [newMessage, setNewMessage] = useState<any>('');
  const [showInfoModal, setShowInfoModal] = useState<any>(false);
  const [showNotesModal, setShowNotesModal] = useState<any>(false);
  const [showProfileModal, setShowProfileModal] = useState<any>(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [isSubmittingRecommendation, setIsSubmittingRecommendation] =
    useState(false);
  const [profileData, setProfileData] = useState<any>({
    height: '',
    weight: '',
    age: '',
    runningLevel: '',
    goal: '',
    weeklyDistance: '',
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState<any>(false);
  const [isLoading, setIsLoading] = useState<any>(false);
  const [error, setError] = useState<any>(null);
  const [message, setMessage] = useState<any>(null);
  const [recommendationMessages, setRecommendationMessages] = useState<any>(null);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [messages, setMessages] = useState<any>([]);
  const [profile, setProfile] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any>([]);
  const {getChatProfile, createRecommendation} = useChatExpertAPI();

  const scrollViewRef = useRef<ScrollView>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const notesSlideAnim = useRef(new Animated.Value(0)).current;
  const profileSlideAnim = useRef(new Animated.Value(0)).current;

  const route = useRoute();
  const navigation = useNavigation();
  const {sessionId, participant2Id, initialMessage} = route.params as {
    sessionId?: string;
    participant2Id?: string;
    initialMessage?: string;
  };

  const otherParticipant = currentSession?.other_participant;

  useEffect(() => {
    if (initialMessage) {
      setNewMessage(initialMessage);
    }
  }, [initialMessage]);

  // Helper function to handle API responses
  const handleApiResponse = <T,>(
    response: ApiResponse<T>,
    onSuccess: (data: T) => void,
    errorMessage: string,
  ) => {
    if (response.status == 'success') {
      if (response.data) {
        onSuccess(response.data);
      }
    } else {
      setError(response.message || errorMessage);
    }
  };

  const getOrCreateSession = async () => {
    setIsLoading(true);
    try {
      if (sessionId) {
        const response = await ChatAPI.listChatSessions();
        handleApiResponse(
          response,
          data => {
            const session = data.find(s => s.id === sessionId);
            if (session) {
              setCurrentSession(session);
            }
          },
          'Failed to load chat session',
        );
      } else if (participant2Id) {
        const response = await ChatAPI.createOrGetChat(participant2Id);
        handleApiResponse(
          response,
          data => {
            setCurrentSession(data);
            navigation.setParams({sessionId: data.id});
          },
          'Failed to create/load chat session',
        );
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Get messages for the current session
  const getMessages = async (chatSessionId: string) => {
    setIsLoading(true);
    try {
      const response = await ChatAPI.getMessages(chatSessionId);
      handleApiResponse(
        response,
        data => {
          setMessages(data.messages || []);
          setRecommendationMessages(data.recommendations || []);
        },
        'Failed to load messages',
      );
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Send a message
  const sendMessage = async (chatSessionId: string, messageText: string) => {
    try {
      const response = await ChatAPI.sendMessage(chatSessionId, messageText);
      handleApiResponse(
        response,
        async data => {
          setMessage('Message sent successfully');
          await getMessages(chatSessionId);
        },
        'Failed to send message',
      );
    } catch (err) {
      setError('An unexpected error occurred');
    }
  };

  // Get profile for the current session
  const getProfile = async (chatSessionId: string) => {
    try {
      const response = await getChatProfile(chatSessionId);
      handleApiResponse(
        response,
        data => setProfile(data),
        'Failed to load profile',
      );
    } catch (err) {
      setError('An unexpected error occurred');
    }
  };

  // Get recommendations for the current session
  const getRecommendations = async (chatSessionId: string) => {
    try {
      const response = await ChatAPI.getRecommendations(chatSessionId);
      handleApiResponse(
        response,
        data => setRecommendations(data),
        'Failed to load recommendations',
      );
    } catch (err) {
      setError('An unexpected error occurred');
    }
  };

  // Clear error message
  const clearError = () => setError(null);

  // Clear success message
  const clearMessage = () => setMessage(null);

  useEffect(() => {
    getOrCreateSession();
  }, [sessionId, participant2Id]);

  useEffect(() => {
    if (currentSession?.id) {
      getMessages(currentSession.id);
      getProfile(currentSession.id);
      getRecommendations(currentSession.id);
    }
  }, [currentSession?.id]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 3000);
      return () => clearTimeout(timer);
    }
    if (message) {
      const timer = setTimeout(() => clearMessage(), 3000);
      return () => clearTimeout(timer);
    }
  }, [error, message]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({animated: true});
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === '' || !currentSession?.id) return;

    sendMessage(currentSession.id, newMessage);
    setNewMessage('');
  };

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  const toggleInfoModal = () => {
    if (showInfoModal) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowInfoModal(false));
    } else {
      setShowInfoModal(true);
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const toggleNotesModal = () => {
    if (showNotesModal) {
      Animated.timing(notesSlideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowNotesModal(false));
    } else {
      setShowNotesModal(true);
      Animated.timing(notesSlideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const toggleProfileModal = () => {
    if (showProfileModal) {
      Animated.timing(profileSlideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowProfileModal(false));
    } else {
      setShowProfileModal(true);
      Animated.timing(profileSlideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const getRankIcon = () => {
    const points = otherParticipant?.points || 0;
    if (points >= 1000) return 'trophy';
    if (points >= 500) return 'ribbon';
    if (points >= 100) return 'star';
    return 'star-outline';
  };

  const archiveChatSession = async (chatSessionId: string) => {
    try {
      await ChatAPI.archiveChat(chatSessionId);
      navigation.navigate('HomeTabs', {
        screen: 'Chat',
        params: {screen: 'HomeMain'},
      });
      Alert.alert('Success', 'Conversation archived successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to archive conversation');
    }
  };

  const handleTemplateSelect = (template: string) => {
    setNewMessage(template);
    setShowNotesModal(false);
  };

  const handleGenerateSchedule = () => {
    setShowNotesModal(false);
    setShowScheduleModal(true);
  };

  const handleGenerateRecommendation = () => {
    setShowNotesModal(false);
    setShowRecommendationModal(true);
  };

  const handleSubmitSchedule = async () => {
    // Implement schedule generation logic here
    setShowScheduleModal(false);
    Alert.alert('Success', 'Training schedule generated successfully');
  };

  const handleSubmitRecommendation = async (message: string) => {
    try {
      setIsSubmittingRecommendation(true);
      if (!currentSession?.id) return;

      await createRecommendation(currentSession.id, message);
      setShowRecommendationModal(false);
      Alert.alert('Success', 'Recommendation created successfully');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create recommendation');
    } finally {
      setIsSubmittingRecommendation(false);
    }
  };

  if (!currentSession) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>No chat session selected</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header - Show skeleton loader when loading */}
      {isLoading ? (
        <View style={styles.header}>
          <ContentLoader
            speed={1}
            width="100%"
            height={60}
            backgroundColor="#f3f3f3"
            foregroundColor="#ecebeb">
            <Rect x="15" y="15" rx="4" ry="4" width="24" height="24" />
            <Circle cx="70" cy="30" r="20" />
            <Rect x="100" y="15" rx="4" ry="4" width="120" height="16" />
            <Rect x="100" y="35" rx="4" ry="4" width="80" height="12" />
            <Rect x="300" y="15" rx="4" ry="4" width="24" height="24" />
            <Rect x="330" y="15" rx="4" ry="4" width="24" height="24" />
            <Rect x="360" y="15" rx="4" ry="4" width="24" height="24" />
          </ContentLoader>
        </View>
      ) : (
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <BackButton size={24} />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <View style={styles.headerTitle}>
              <Text style={styles.headerName}>{otherParticipant?.name}</Text>
              <Text style={styles.headerUsername}>
                @{otherParticipant?.username}
              </Text>
            </View>
            <View style={styles.headerStatusRow}>
              <View
                style={[
                  styles.statusIndicator,
                  {
                    backgroundColor:
                      currentSession.status === 'ACCEPTED'
                        ? '#22C55E'
                        : '#F59E0B',
                  },
                ]}
              />
              <Text style={styles.headerSubtitle}>
                {capitalizeFirstLetter(otherParticipant?.user_level || '')}
              </Text>
              <Icon
                name={getRankIcon()}
                size={16}
                color="#F59E0B"
                style={styles.rankIcon}
              />
              <Text style={styles.pointsText}>{otherParticipant?.points}</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerActionButton}
              onPress={toggleInfoModal}>
              <Icon name="information-circle" size={20} color="#2563EB" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {message && (
        <View style={styles.messageContainer}>
          <Text style={styles.successText}>{message}</Text>
        </View>
      )}

      {/* Chat Messages - Show skeleton loader when loading */}
      {isLoading ? (
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
      ) : (
        <ECPEMessageContainer
          isLoading={isLoading}
          messages={messages || []}
          recommendationMessages={recommendationMessages || []}
          otherParticipantId={otherParticipant?.id}
          scrollViewRef={scrollViewRef}
        />
      )}

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.notesButton} onPress={toggleNotesModal}>
          <Icon name="document-text" size={24} color="#64748B" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          placeholderTextColor="#64748B"
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSendMessage}
          disabled={newMessage.trim() === ''}>
          <Icon
            name="send"
            size={20}
            color={newMessage.trim() === '' ? '#A1A1AA' : '#2563EB'}
          />
        </TouchableOpacity>
      </View>

      {/* Info Modal */}
      <ECInfo
        isLoading={isLoading}
        otherParticipant={otherParticipant}
        profile={profile}
        recommendations={recommendations}
        showInfoModal={showInfoModal}
        toggleInfoModal={toggleInfoModal}
        chatSessionId={sessionId}
        archiveChatSession={archiveChatSession}
      />

      {/* Notes Modal */}
      <ECNotes
        showNotesModal={showNotesModal}
        toggleNotesModal={toggleNotesModal}
        notesSlideAnim={notesSlideAnim}
        onTemplateSelect={handleTemplateSelect}
        onGenerateSchedule={handleGenerateSchedule}
        onGenerateRecommendation={handleGenerateRecommendation}
      />

      {/* Schedule Generation Modal */}
      <ECPEScheduleModal
        visible={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSubmit={handleSubmitSchedule}
      />

      {/* Recommendation Modal */}
      <ECPERecommendationModal
        visible={showRecommendationModal}
        onClose={() => setShowRecommendationModal(false)}
        onSubmit={handleSubmitRecommendation}
        isLoading={isSubmittingRecommendation}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  headerUsername: {
    fontSize: 14,
    color: '#64748B',
  },
  headerStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginRight: 8,
  },
  rankIcon: {
    marginRight: 4,
  },
  pointsText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerActionButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  errorText: {
    color: '#DC2626',
    textAlign: 'center',
  },
  messageContainer: {
    backgroundColor: '#DCFCE7',
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  successText: {
    color: '#166534',
    textAlign: 'center',
  },
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  notesButton: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 120,
  },
  sendButton: {
    marginLeft: 8,
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  infoModal: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '80%',
    backgroundColor: 'white',
    padding: 16,
  },
  notesModal: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: 32,
  },
  profileModal: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: 32,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  modalContent: {
    flex: 1,
  },
  notesModalContent: {
    gap: 16,
  },
  profileModalContent: {
    paddingBottom: 20,
  },
  noteActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  noteActionText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '500',
  },
  userInfoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  userUsername: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  userLevelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userLevel: {
    fontSize: 14,
    color: '#64748B',
  },
  userPoints: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  profileInfo: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 16,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  profileLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  profileValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  noDataText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    padding: 16,
  },
  recommendationItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 4,
  },
  recommendationDate: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'right',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: theme.colors.primaryDark,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
