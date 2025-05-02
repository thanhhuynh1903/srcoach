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
import {CRMessageHeader} from './CRMessageHeader';
import {CRMessageInfoPanel} from './CRMessageInfoPanel';
import {CRMessageActionsPanel} from './CRMessageActionsPanel';
import {CRMessageProfilePanel} from './CRMessageProfilePanel';
import {theme} from '../../../contants/theme';
import Icon from '@react-native-vector-icons/ionicons';
import {CRMessageRunRecordPanel} from './CRMessageRunRecordPanel';
import {getSocket, disconnectSocket} from '../../../utils/socket';

const SkeletonMessageItem = ({isCurrentUser}: any) => {
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
}: any) => {
  const renderItem = ({item}: any) => (
    <CRMessageItemNormal
      message={item}
      isCurrentUser={item.user_id === userId}
      onMessageArchived={onMessageArchived}
    />
  );

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
      keyExtractor={(item: any) => item.id}
      contentContainerStyle={styles.messagesContainer}
      onContentSizeChange={() => {
        if (!isLoading && messages.length > 0) {
          flatListRef.current?.scrollToEnd({animated: false});
        }
      }}
      onLayout={() => {
        if (!isLoading && messages.length > 0) {
          flatListRef.current?.scrollToEnd({animated: false});
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

const TypingIndicator = ({name}: any) => {
  return (
    <View style={styles.typingIndicatorContainer}>
      <View style={styles.typingIndicatorBubble}>
        <Text style={styles.typingIndicatorText}>{name} is typing...</Text>
      </View>
    </View>
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
  onTyping,
}: any) => {
  const typingTimeoutRef = useRef<any>(null);

  const handleChangeText = (text: string) => {
    setInputMessage(text);
    if (text.trim().length > 0) {
      onTyping();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        onTyping();
      }, 1500);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

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
        onChangeText={handleChangeText}
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

export default function ChatsRunnerMessageScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const {sessionId} = route.params as any;
  const {profile} = useLoginStore();
  const userId = profile?.id;

  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [showActionsPanel, setShowActionsPanel] = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [showRunRecordPanel, setShowRunRecordPanel] = useState(false);
  const [isInputDisabled, setIsInputDisabled] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<any>(null);
  const typingTimeoutRef = useRef<any>(null);

  const flatListRef = useRef<any>(null);

  const fetchSessionInfo = async () => {
    try {
      const response = await getSessionInfo(sessionId);
      if (response.status) {
        setSessionInfo(response.data);
      } else {
        ToastUtil.error('Failed to fetch session info', response.message);
      }
    } catch (error) {
      ToastUtil.error('Failed to fetch session info', 'An exception occured.');
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await getMessages(sessionId);
      if (response.status) {
        setMessages(response.data.messages);
        // Wait for layout to update and scroll to bottom
        setTimeout(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({animated: false});
          }
          setIsLoading(false);
          setIsInitialLoad(false);
        }, 100);
      } else {
        ToastUtil.error('Failed to fetch messages', response.message);
        setIsLoading(false);
        setIsInitialLoad(false);
      }
    } catch (error) {
      ToastUtil.error('Failed to fetch messages', 'An exception occured.');
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    setIsInitialLoad(true);
    await fetchSessionInfo();
    await fetchMessages();
  };

  const handleMessageArchived = (messageId: string) => {
    setMessages((prevMessages: any) =>
      prevMessages.map((msg: any) =>
        msg.id === messageId ? {...msg, message: null, archive: true} : msg,
      ),
    );
  };

  const handleTypingEvent = (data: any) => {
    if (data.userId !== userId) {
      setTypingUser(data.user);
      setIsTyping(true);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        setTypingUser(null);
      }, 3000);
    }
  };

  const handleSendTypingEvent = () => {
    if (!sessionInfo) return;
    const socket = getSocket();
    socket.emit('typingMessage', {
      sessionId,
      userId,
      user: {
        id: userId,
        name: profile?.name,
        username: profile?.username,
      },
    });
  };

  useEffect(() => {
    loadData();
    const socket = getSocket();
    socket.emit('joinSession', sessionId);

    const handleNewMessage = (data: any) => {
      setMessages((prevMessages: any) => [...prevMessages, data]);
      setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({animated: true});
        }
      }, 100);

      if (data.user_id !== userId) {
        setIsTyping(false);
        setTypingUser(null);
      }
    };

    const handleDeleteMessage = (data: any) => {
      handleMessageArchived(data.messageId);
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('deleteMessage', handleDeleteMessage);
    socket.on('typingMessage', handleTypingEvent);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('deleteMessage', handleDeleteMessage);
      socket.off('typingMessage', handleTypingEvent);
      socket.emit('leaveSession', sessionId);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [sessionId]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    setIsSending(true);
    setIsInputDisabled(true);
    try {
      const response = profile?.roles.includes('expert')
        ? await sendExpertRecommendation(sessionId, inputMessage)
        : await sendMessage(sessionId, inputMessage);

      if (!response.status) {
        ToastUtil.error('Failed to send message', response.message);
      } else {
        setInputMessage('');
        setIsTyping(false);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
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

  const handleProfileSubmit = async (profileData: any) => {
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
          <Text style={styles.loadingText}>Please wait...</Text>
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
      {isTyping && typingUser && <TypingIndicator name={typingUser.name} />}
      <MessageInput
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        handleSend={handleSendMessage}
        isSending={isSending}
        isExpert={profile?.roles.includes('expert') || false}
        onMenuPress={() => setShowActionsPanel(true)}
        isInputDisabled={isInputDisabled}
        onTyping={handleSendTypingEvent}
      />
      <CRMessageInfoPanel
        sessionInfo={sessionInfo}
        visible={showUserInfo}
        onClose={() => setShowUserInfo(false)}
      />
      <CRMessageActionsPanel
        visible={showActionsPanel}
        onClose={() => setShowActionsPanel(false)}
        onSelectProfileStats={handleProfileStatsSubmit}
        onSelectRunRecord={handleRunRecordSubmit}
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.primaryDark,
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
  typingIndicatorContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  typingIndicatorBubble: {
    backgroundColor: '#E5E5EA',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  typingIndicatorText: {
    fontSize: 14,
    color: '#7b7b7b',
  },
});