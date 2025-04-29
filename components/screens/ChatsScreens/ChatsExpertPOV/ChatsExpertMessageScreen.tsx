import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {useLoginStore} from '../../../utils/useLoginStore';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  getMessages,
  sendMessage,
  getSessionInfo,
  sendExpertRecommendation,
  sendProfile,
} from '../../../utils/useChatsAPI';
import Toast from 'react-native-toast-message';
import ToastUtil from '../../../utils/utils_toast';
import {CRMessageItemNormal} from '../ChatsMessageItems/CRMessageItemNormal';
import {CRMessageHeader} from '../ChatsRunnerPOV/CRMessageHeader';
import {CRMessageInfoPanel} from '../ChatsRunnerPOV/CRMessageInfoPanel';
import {CEMessageActionsPanel} from './CEMessageActionsPanel';
import {CRMessageProfilePanel} from '../ChatsRunnerPOV/CRMessageProfilePanel';
import {theme} from '../../../contants/theme';
import Icon from '@react-native-vector-icons/ionicons';
import {CRMessageRunRecordPanel} from '../ChatsRunnerPOV/CRMessageRunRecordPanel';
import {getSocket, disconnectSocket} from '../../../utils/socket';
import { CEMessageExpertRecommendationPanel } from './CEMessageExpertRecommendationPanel';

type Message = {
  id: string;
  message?: string;
  created_at: string;
  user_id: string;
  User: User;
  type: 'MESSAGE' | 'EXPERT_RECOMMENDATION' | 'PROFILE' | 'EXERCISE_RECORD';
  height?: number;
  weight?: number;
  running_level?: string;
  running_goal?: string;
  metrics?: {
    distance: number;
    calories: number;
    steps: number;
    avg_heart_rate: number;
    min_heart_rate: number;
    max_heart_rate: number;
    start_time: string;
    end_time: string;
    exercise_type: number;
  };
  imageId?: string;
  image_url?: string;
  archive?: boolean;
};

type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  points: number;
  user_level: string;
  roles: string[];
};

type SessionInfo = {
  id: string;
  status: string;
  other_user: User;
  initiated_by_you: boolean;
  archived_by_you: boolean;
};

const SkeletonMessageItem = ({isCurrentUser}: {isCurrentUser: boolean}) => {
  return (
    <View
      style={[
        styles.skeletonContainer,
        isCurrentUser ? styles.skeletonCurrentUser : styles.skeletonOtherUser,
      ]}>
      {!isCurrentUser && <View style={styles.skeletonAvatar} />}
      <View style={styles.skeletonBubble} />
      {isCurrentUser && <View style={styles.skeletonAvatar} />}
    </View>
  );
};

const MessageList = ({
  messages,
  userId,
  flatListRef,
  isLoading,
  onMessageArchived,
}: {
  messages: Message[];
  userId: string;
  flatListRef: React.RefObject<FlatList>;
  isLoading: boolean;
  onMessageArchived: (messageId: string) => void;
}) => {
  const renderItem = ({item}: {item: Message}) => {
    return (
      <CRMessageItemNormal
        message={item}
        isCurrentUser={item.user_id === userId}
        onMessageArchived={onMessageArchived}
      />
    );
  };

  const renderSkeleton = () => {
    return (
      <>
        <SkeletonMessageItem isCurrentUser={false} />
        <SkeletonMessageItem isCurrentUser={true} />
        <SkeletonMessageItem isCurrentUser={false} />
        <SkeletonMessageItem isCurrentUser={true} />
        <SkeletonMessageItem isCurrentUser={false} />
      </>
    );
  };

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.messagesContainer}
      onContentSizeChange={() => {
        if (!isLoading) {
          flatListRef.current?.scrollToEnd({animated: true});
        }
      }}
      onLayout={() => {
        if (!isLoading) {
          flatListRef.current?.scrollToEnd({animated: true});
        }
      }}
      ListEmptyComponent={
        isLoading ? (
          <View style={styles.skeletonList}>{renderSkeleton()}</View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet</Text>
          </View>
        )
      }
    />
  );
};

const MessageInput = ({
  inputMessage,
  setInputMessage,
  handleSend,
  isSending,
  isExpert,
  onMenuPress,
  isInputDisabled,
}: {
  inputMessage: string;
  setInputMessage: (text: string) => void;
  handleSend: () => void;
  isSending: boolean;
  isExpert: boolean;
  onMenuPress: () => void;
  isInputDisabled: boolean;
}) => {
  return (
    <View style={styles.inputContainer}>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={onMenuPress}
        disabled={isInputDisabled}>
        <Icon
          name="ellipsis-horizontal"
          size={24}
          color={isInputDisabled ? theme.colors.gray : theme.colors.primaryDark}
        />
      </TouchableOpacity>
      <TextInput
        style={[styles.input, isInputDisabled && styles.disabledInput]}
        placeholder={
          isInputDisabled ? 'Sending message...' : 'Type a message...'
        }
        placeholderTextColor="#8E8E93"
        value={inputMessage}
        onChangeText={setInputMessage}
        multiline
        editable={!isInputDisabled}
      />
      <TouchableOpacity
        style={[
          styles.sendButton,
          isInputDisabled && styles.disabledSendButton,
        ]}
        onPress={handleSend}
        disabled={isSending || !inputMessage.trim() || isInputDisabled}>
        {isSending ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Icon name="send" size={20} color="white" />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default function ChatsExpertMessageScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const {sessionId} = route.params as {sessionId: string};
  const {profile} = useLoginStore();
  const userId = profile?.id;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [showActionsPanel, setShowActionsPanel] = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [showRunRecordPanel, setShowRunRecordPanel] = useState(false);
  const [showExpertRecommendationPanel, setShowExpertRecommendationPanel] =
    useState(false);
  const [isInputDisabled, setIsInputDisabled] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const flatListRef = useRef<FlatList>(null);

  const fetchSessionInfo = async () => {
    try {
      const response = await getSessionInfo(sessionId);
      if (response.status) {
        setSessionInfo(response.data);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.message,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch session info',
      });
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await getMessages(sessionId);
      if (response.status) {
        setMessages(response.data.messages);
      } else {
        ToastUtil.error('Failed to fetch messages', response.message);
      }
    } catch (error) {
      ToastUtil.error('Failed to fetch messages', 'An exception occured.');
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setIsInitialLoad(false);
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({animated: true});
        }
      }, 300);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    setIsInitialLoad(true);
    await fetchSessionInfo();
    await fetchMessages();
  };

  const handleMessageArchived = (messageId: string) => {
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === messageId ? {...msg, message: null, archive: true} : msg
      )
    );
  };

  useEffect(() => {
    loadData();
    const socket = getSocket();
    socket.emit('joinSession', sessionId);

    const handleNewMessage = (data: any) => {
      setMessages(prevMessages => [...prevMessages, data]);
      setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({animated: true});
        }
      }, 100);
    };

    const handleDeleteMessage = (data: {messageId: string}) => {
      handleMessageArchived(data.messageId);
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('deleteMessage', handleDeleteMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('deleteMessage', handleDeleteMessage);
      socket.emit('leaveSession', sessionId);
    };
  }, [sessionId]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    setIsSending(true);
    setIsInputDisabled(true);
    try {
      const response = await sendMessage(sessionId, inputMessage);

      if (!response.status) {
        ToastUtil.error('Failed to send message', response.message);
      } else {
        setInputMessage('');
      }
    } catch (error) {
      ToastUtil.error('Failed to send message', 'An exception occured.');
    } finally {
      setIsSending(false);
      setIsInputDisabled(false);
    }
  };

  const handleProfileStatsSubmit = () => {
    setShowActionsPanel(false);
    setShowProfilePanel(true);
  };

  const handleProfileSubmit = async (profileData: {
    height: string;
    weight: string;
    running_level: string;
    running_goal: string;
  }) => {
    try {
      setIsInputDisabled(true);
      const response = await sendProfile(sessionId, profileData);
      if (response.status) {
        ToastUtil.success('Profile submitted successfully');
        setShowProfilePanel(false);
      } else {
        ToastUtil.error('Failed to submit profile', response.message);
      }
    } catch (error) {
      ToastUtil.error('Failed to submit profile', 'An exception occurred.');
    } finally {
      setIsInputDisabled(false);
    }
  };

  const handleRunRecordSubmit = () => {
    setShowActionsPanel(false);
    setShowRunRecordPanel(true);
  };

  const handleExpertRecommendationSubmit = async (recommendation: string) => {
    try {
      setIsInputDisabled(true);
      const response = await sendExpertRecommendation(
        sessionId,
        recommendation,
      );
      if (response.status) {
        ToastUtil.success('Recommendation submitted successfully');
        setShowExpertRecommendationPanel(false);
      } else {
        ToastUtil.error('Failed to submit recommendation', response.message);
      }
    } catch (error) {
      ToastUtil.error(
        'Failed to submit recommendation',
        'An exception occurred.',
      );
    } finally {
      setIsInputDisabled(false);
    }
  };

  if (isLoading && isInitialLoad) {
    return (
      <View style={styles.container}>
        <CRMessageHeader
          sessionInfo={null}
          navigation={navigation}
          onInfoPress={() => {}}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
      <CRMessageHeader
        sessionInfo={sessionInfo}
        navigation={navigation}
        onInfoPress={() => setShowUserInfo(true)}
      />
      <MessageList
        messages={messages}
        userId={userId}
        flatListRef={flatListRef}
        isLoading={isLoading && isInitialLoad}
        onMessageArchived={handleMessageArchived}
      />
      <MessageInput
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        handleSend={handleSendMessage}
        isSending={isSending}
        isExpert={profile?.roles.includes('expert') || false}
        onMenuPress={() => setShowActionsPanel(true)}
        isInputDisabled={isInputDisabled}
      />
      <CRMessageInfoPanel
        sessionInfo={sessionInfo}
        visible={showUserInfo}
        onClose={() => setShowUserInfo(false)}
      />
      <CEMessageActionsPanel
        visible={showActionsPanel}
        onClose={() => setShowActionsPanel(false)}
        onSelectProfileStats={handleProfileStatsSubmit}
        onSelectRunRecord={handleRunRecordSubmit}
        onSelectExpertRecommendation={() => {
          setShowActionsPanel(false);
          setShowExpertRecommendationPanel(true);
        }}
        disabled={isInputDisabled}
      />
      <CRMessageProfilePanel
        visible={showProfilePanel}
        onClose={() => setShowProfilePanel(false)}
        onSubmit={handleProfileSubmit}
        disabled={isInputDisabled}
      />
      <CRMessageRunRecordPanel
        visible={showRunRecordPanel}
        sessionId={sessionId}
        onClose={() => setShowRunRecordPanel(false)}
        onSubmitSuccess={() => {
          setShowRunRecordPanel(false);
        }}
        disabled={isInputDisabled}
      />
      <CEMessageExpertRecommendationPanel
        visible={showExpertRecommendationPanel}
        onClose={() => setShowExpertRecommendationPanel(false)}
        onSubmit={handleExpertRecommendationSubmit}
        disabled={isInputDisabled}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFEFF4',
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  menuButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    marginHorizontal: 8,
    fontSize: 16,
  },
  disabledInput: {
    backgroundColor: '#E5E5EA',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledSendButton: {
    backgroundColor: theme.colors.gray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeletonList: {
    padding: 16,
    paddingBottom: 80,
  },
  skeletonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  skeletonCurrentUser: {
    justifyContent: 'flex-end',
  },
  skeletonOtherUser: {
    justifyContent: 'flex-start',
  },
  skeletonAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 8,
  },
  skeletonBubble: {
    maxWidth: '70%',
    minHeight: 40,
    borderRadius: 20,
    backgroundColor: '#E5E5EA',
    padding: 12,
    marginHorizontal: 8,
  },
});