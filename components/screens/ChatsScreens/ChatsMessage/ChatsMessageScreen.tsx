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
import {useRoute, useNavigation, useFocusEffect} from '@react-navigation/native';
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
import { getSocket, disconnectSocket } from '../../../utils/socket';

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

  const isInitialLoad = useRef(true);
  const shouldScrollToEnd = useRef(false);
  const socketRef = useRef<any>(null);

  // Determine which panel to show based on user roles
  const getPanelComponent = useCallback(() => {
    const isExpertSession =
      otherUser?.roles?.includes('expert') ||
      profile?.roles?.includes('expert');

    if (!isExpertSession) {
      return ChatsPanelRunner;
    }

    return profile?.roles?.includes('expert')
      ? ChatsPanelExpertPOVExpert
      : ChatsPanelExpertPOVRunner;
  }, [otherUser, profile]);

  const setupSocket = useCallback(() => {
    if (!sessionId) return;

    const socket = getSocket();
    socketRef.current = socket;
    
    socket.emit('joinSession', sessionId);

    socket.on('newMessage', (message: MessageItem) => {
      setMessages(prevMessages => [...prevMessages, message]);
      shouldScrollToEnd.current = true;
    });

    return () => {
      socket.emit('leaveSession', sessionId);
      socket.off('newMessage');
    };
  }, [sessionId]);

  const loadInitialMessages = useCallback(async () => {
    try {
      setLoading(true);
      setShowContent(false);

      const response = await getSessionMessages(userId, 5000);
      if (response.status) {
        const newMessages = response.data.messages;

        setMessages(
          newMessages.sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime(),
          ),
        );

        if (response.data.session?.status === 'PENDING' && !isInitiator) {
          setSessionStatus(response.data.session.status);
        }

        setShowContent(true);
        shouldScrollToEnd.current = true;
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setShowContent(true);
    } finally {
      setLoading(false);
    }
  }, [userId, isInitiator]);

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
          socketRef.current.off('newMessage');
        }
      };
    }, [userId])
  );

  useEffect(() => {
    const cleanup = setupSocket();
    return cleanup;
  }, [setupSocket]);

  const handleSendMessage = async () => {
    if (!sessionId) {
      ToastUtil.error('Error', 'Session not initialized');
      return;
    }

    if (selectedImage) {
      try {
        const response = await sendImageMessage(sessionId, selectedImage);
        if (response.status) {
          setSelectedImage(null);
        } else {
          ToastUtil.error(
            'Error',
            response.data.message || 'Failed to send image',
          );
        }
      } catch (error) {
        console.error('Error sending image:', error);
        ToastUtil.error('Error', 'Failed to send image');
      }
    } else if (messageText.trim()) {
      try {
        const response = await sendNormalMessage(sessionId, messageText);
        if (response.status) {
          setMessageText('');
        } else {
          ToastUtil.error(
            'Error',
            response.data.message || 'Failed to send message',
          );
        }
      } catch (error) {
        console.error('Error sending message:', error);
        ToastUtil.error('Error', 'Failed to send message');
      }
    }
  };

  const handleImagePress = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      });

      if (!result.didCancel && result.assets && result.assets.length > 0) {
        const selected = result.assets[0];
        setSelectedImage(selected.uri || null);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      ToastUtil.error('Error', 'Failed to select image');
    }
  }, []);

  const handleRemoveImage = useCallback(() => {
    setSelectedImage(null);
  }, []);

  const handleRespondToSession = async (accept: boolean) => {
    try {
      const response = await respondToSession(sessionId, accept);
      if (response.status) {
        if (accept) {
          ToastUtil.success('Success', 'Session accepted successfully');
          setSessionStatus('ACCEPTED');
        } else {
          ToastUtil.success('Success', 'Session rejected successfully');
          navigation.goBack();
        }
      }
    } catch (error) {
      console.error('Error responding to session:', error);
      ToastUtil.error('Error', 'Failed to respond to session');
    }
  };

  const handleExerciseRecordPress = useCallback(
    (recordId: string) => {
      navigation.navigate('ExerciseDetail', {
        recordId,
      });
    },
    [navigation],
  );

  const handleTypeMessage = function(text: string) {
    const socket = getSocket()

    socket.emit('typingMessage', {
      sessionId: sessionId,
      toUserId: otherUser?.id
    });
    setMessageText(text);
  }

  const PanelComponent = getPanelComponent();

  return (
    <SafeAreaView style={styles.container}>
      <CMSHeader
        otherUser={otherUser}
        onBackPress={() => navigation.goBack()}
        onSearchPress={() => {
          navigation.navigate('ChatsSessionMessageSearch', {sessionId});
        }}
        onInfoPress={() => {
          setInfoPanelVisible(true);
        }}
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
      ) : (
        <CMSMessageContainer
          messages={messages}
          profileId={profile?.id || ''}
          showContent={showContent}
          onExerciseRecordPress={handleExerciseRecordPress}
          shouldScrollToEnd={shouldScrollToEnd.current}
          sessionId={sessionId}
        />
      )}

      <CMSMessageControl
        messageText={messageText}
        setMessageText={handleTypeMessage}
        handleSendMessage={handleSendMessage}
        onImagePress={handleImagePress}
        selectedImage={selectedImage}
        onRemoveImage={handleRemoveImage}
        disabled={loading || (sessionStatus === 'PENDING' && isInitiator)}
        setPanelVisible={setPanelVisible}
        showTyping={true}
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