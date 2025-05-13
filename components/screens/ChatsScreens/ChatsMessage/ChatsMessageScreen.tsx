import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {
  useRoute,
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';
import ToastUtil from '../../../utils/utils_toast';
import {
  createOrGetSession,
  sendNormalMessage,
  getSessionMessages,
  sendImageMessage,
  respondToSession,
  markSessionMessagesAsRead,
} from '../../../utils/useChatsAPI';
import {useLoginStore} from '../../../utils/useLoginStore';
import {theme} from '../../../contants/theme';
import {CMSMessageControl} from './CMSMessageControl';
import ChatsPanelRunner from './ChatsMessagePanel/ChatsPanelRunner';
import ChatsPanelExpertPOVRunner from './ChatsMessagePanel/ChatsPanelExpertPOVRunner';
import ChatsPanelExpertPOVExpert from './ChatsMessagePanel/ChatsPanelExpertPOVExpert';
import * as ImagePicker from 'react-native-image-picker';
import {CMSMessageContainer} from './CMSMessageContainer';
import {CMSHeader} from './CMSHeader';
import {CMSSidePanelInfo} from './CMSSidePanelInfo';
import {getSocket, disconnectSocket} from '../../../utils/socket';

type MessageItem = {
  id: string;
  message_type: string;
  sender: {id: string};
  created_at: string;
  content: any;
};

type OtherUser = {
  id: string;
  name: string;
  username: string;
  image?: {url: string};
  roles?: string[];
  points?: number;
  user_level?: string;
};

export default function ChatsMessageScreen() {
  const route = useRoute() as any;
  const navigation = useNavigation();
  const {profile} = useLoginStore();
  const {userId, initialMessage} = route.params;

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [messageText, setMessageText] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [sessionStatus, setSessionStatus] = useState('');
  const [isInitiator, setIsInitiator] = useState(false);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [panelVisible, setPanelVisible] = useState(false);
  const [infoPanelVisible, setInfoPanelVisible] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<any>(null);
  const shouldScrollToEnd = useRef(false);

  const getPanelComponent = useCallback(() => {
    const isExpertSession =
      otherUser?.roles?.includes('expert') ||
      profile?.roles?.includes('expert');
    return !isExpertSession
      ? ChatsPanelRunner
      : profile?.roles?.includes('expert')
      ? ChatsPanelExpertPOVExpert
      : ChatsPanelExpertPOVRunner;
  }, [otherUser, profile]);

  const setupSocketListeners = useCallback(() => {
    if (!sessionId || !socketRef.current) return;

    const socket = socketRef.current;
    socket.on('typingMessage', () => {
      setIsTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
    });

    socket.on('newMessage', (message: MessageItem) => {
      setMessages(prev => [...prev, message]);
      shouldScrollToEnd.current = true;
      setIsTyping(false);
    });

    return () => {
      socket.off('typingMessage');
      socket.off('newMessage');
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [sessionId]);

  const initSocket = useCallback(() => {
    if (!sessionId) return;

    const socket = getSocket();
    socketRef.current = socket;
    socket.emit('joinSession', sessionId);
    return setupSocketListeners();
  }, [sessionId, setupSocketListeners]);

  const loadInitialMessages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getSessionMessages(userId, 5000);
      if (response.status) {
        setMessages(
          response.data.messages.sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime(),
          ),
        );
        if (response.data.session?.status === 'PENDING' && !isInitiator) {
          setSessionStatus(response.data.session.status);
        }
        shouldScrollToEnd.current = true;
      }
      setShowContent(true);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, isInitiator]);

  const handleSendMessage = async () => {
    if (!sessionId) return ToastUtil.error('Error', 'Session not initialized');

    const socket = socketRef.current;
    if (socket)
      socket.emit('typingMessage', {sessionId, toUserId: otherUser?.id});

    try {
      const response = selectedImage
        ? await sendImageMessage(sessionId, selectedImage)
        : messageText.trim()
        ? await sendNormalMessage(sessionId, messageText)
        : {status: false};

      if (response.status) {
        setSelectedImage(null);
        setMessageText('');
      } else {
        ToastUtil.error('Error', response.data.message || 'Failed to send');
      }
    } catch (error) {
      console.error('Error sending:', error);
      ToastUtil.error('Error', 'Failed to send');
    }
  };

  useFocusEffect(
    useCallback(() => {
      const initChat = async () => {
        const response = await createOrGetSession(userId, initialMessage);
        if (response.status) {
          setSessionId(response.data.session.id);
          setSessionStatus(response.data.session.status);
          setIsInitiator(response.data.session.is_initiator);
          setOtherUser(response.data.other_user);
          await loadInitialMessages();
          await markSessionMessagesAsRead(userId);
        }
      };
      initChat();

      return () => {
        if (socketRef.current) {
          socketRef.current.emit('leaveSession', sessionId);
          socketRef.current.off('typingMessage');
          socketRef.current.off('newMessage');
        }
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      };
    }, [userId, initialMessage]),
  );

  useEffect(() => initSocket(), [initSocket]);

  const handleImagePress = async () => {
    try {
      const result = await ImagePicker.launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      });
      if (!result.didCancel && result.assets?.[0]?.uri) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      ToastUtil.error('Error', 'Failed to select image');
    }
  };

  const handleUpdateMessage = useCallback(
    (messageId: string, updates: Partial<MessageItem>) => {
      setMessages(prev =>
        prev.map(msg => (msg.id === messageId ? {...msg, ...updates} : msg)),
      );
    },
    [],
  );

  const handleRespondToSession = async (accept: boolean) => {
    try {
      const response = await respondToSession(sessionId, accept);
      if (response.status) {
        accept
          ? (ToastUtil.success('Success', 'Session accepted'),
            setSessionStatus('ACCEPTED'))
          : (ToastUtil.success('Success', 'Session rejected'),
            navigation.goBack());
      }
    } catch (error) {
      console.error('Error responding to session:', error);
      ToastUtil.error('Error', 'Failed to respond to session');
    }
  };

  const PanelComponent = getPanelComponent();

  return (
    <SafeAreaView style={styles.container}>
      <CMSHeader
        otherUser={otherUser}
        onBackPress={() => navigation.goBack()}
        onSearchPress={() =>
          navigation.navigate('ChatsSessionMessageSearch', {sessionId})
        }
        onInfoPress={() => setInfoPanelVisible(true)}
      />

      {sessionStatus === 'PENDING' && (
        <View
          style={[
            styles.pendingNotice,
            isInitiator
              ? styles.pendingNoticeWaiting
              : styles.pendingNoticeAction,
          ]}>
          <Icon
            name="information-circle"
            size={16}
            color={isInitiator ? theme.colors.warning : theme.colors.white}
            style={styles.pendingIcon}
          />
          <Text
            style={[
              styles.pendingNoticeText,
              isInitiator
                ? styles.pendingNoticeTextWaiting
                : styles.pendingNoticeTextAction,
            ]}>
            {isInitiator
              ? 'Waiting for other party to accept this chat'
              : 'Accept this chat request?'}
          </Text>

          {!isInitiator && (
            <View style={styles.pendingActions}>
              <TouchableOpacity
                style={[styles.pendingButton, styles.pendingButtonDeny]}
                onPress={() => handleRespondToSession(false)}>
                <Icon name="close" size={16} color={theme.colors.white} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.pendingButton, styles.pendingButtonAccept]}
                onPress={() => handleRespondToSession(true)}>
                <Icon name="checkmark" size={16} color={theme.colors.white} />
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.pendingNote}>
            {isInitiator
              ? 'You can send a message to remind them'
              : 'Sending a message will automatically accept'}
          </Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primaryDark} />
        </View>
      ) : showContent ? (
        <CMSMessageContainer
          messages={messages}
          profileId={profile?.id || ''}
          showContent={true}
          shouldScrollToEnd={shouldScrollToEnd.current}
          sessionId={sessionId}
          onUpdateMessage={handleUpdateMessage}
        />
      ) : null}

      <CMSMessageControl
        messageText={messageText}
        setMessageText={text => {
          setMessageText(text);
          if (socketRef.current && text) {
            socketRef.current.emit('typingMessage', {
              sessionId,
              toUserId: otherUser?.id,
            });
          }
        }}
        typingUsername={otherUser?.username}
        handleSendMessage={handleSendMessage}
        onImagePress={handleImagePress}
        selectedImage={selectedImage}
        onRemoveImage={() => setSelectedImage(null)}
        disabled={loading || (sessionStatus === 'PENDING' && isInitiator)}
        setPanelVisible={setPanelVisible}
        showTyping={isTyping}
      />

      <PanelComponent
        visible={panelVisible}
        onClose={() => setPanelVisible(false)}
        sessionId={sessionId}
      />

      <CMSSidePanelInfo
        visible={infoPanelVisible}
        onClose={() => setInfoPanelVisible(false)}
        userId={userId}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  pendingNotice: {
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  pendingNoticeWaiting: {
    backgroundColor: '#FFF3E0',
  },
  pendingNoticeAction: {
    backgroundColor: theme.colors.primary,
  },
  pendingIcon: {
    marginRight: 6,
  },
  pendingNoticeText: {
    fontSize: 12,
    marginRight: 8,
  },
  pendingNoticeTextWaiting: {
    color: '#000',
  },
  pendingNoticeTextAction: {
    color: theme.colors.white,
  },
  pendingNote: {
    fontSize: 10,
    width: '100%',
    textAlign: 'center',
    marginTop: 4,
    color: '#000000',
  },
  pendingActions: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  pendingButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  pendingButtonAccept: {
    backgroundColor: theme.colors.success,
  },
  pendingButtonDeny: {
    backgroundColor: theme.colors.error,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
