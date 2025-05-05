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
import {useRoute, useNavigation} from '@react-navigation/native';
import ToastUtil from '../../../utils/utils_toast';
import {
  createOrGetSession,
  sendNormalMessage,
  getSessionMessages,
  sendImageMessage,
  respondToSession,
} from '../../../utils/useChatsAPI';
import BackButton from '../../../BackButton';
import {
  capitalizeFirstLetter,
  formatTimestampAgo,
} from '../../../utils/utils_format';
import {useLoginStore} from '../../../utils/useLoginStore';
import {CommonAvatar} from '../../../commons/CommonAvatar';
import {theme} from '../../../contants/theme';
import {CMSMessageControl} from './CMSMessageControl';
import ChatsPanelRunner from './ChatsMessageItem/ChatsPanelRunner/ChatsPanelRunner';
import * as ImagePicker from 'react-native-image-picker';
import {CMSMessageContainer} from './CMSMessageContainer';

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
  const {userId, sessionId: initialSessionId} = route.params;

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [messageText, setMessageText] = useState('');
  const [sessionId, setSessionId] = useState(initialSessionId || '');
  const [sessionStatus, setSessionStatus] = useState('');
  const [isInitiator, setIsInitiator] = useState(false);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [panelVisible, setPanelVisible] = useState(false);

  const flatListRef = useRef(null);
  const isInitialLoad = useRef(true);
  const shouldScrollToEnd = useRef(false);

  useEffect(() => {
    const initChat = async () => {
      if (initialSessionId) {
        loadMessages(initialSessionId);
      } else {
        const response = await createOrGetSession(userId);
        if (response.status) {
          setSessionId(response.data.session.id);
          setSessionStatus(response.data.session.status);
          setIsInitiator(response.data.session.is_initiator);
          setOtherUser(response.data.other_user);
          loadMessages(response.data.session.id);
        }
      }
    };
    initChat();
  }, [userId, initialSessionId]);

  const loadMessages = useCallback(async (sessionId: string) => {
    try {
      setLoading(true);
      setShowContent(false);
      isInitialLoad.current = true;

      const response = await getSessionMessages(sessionId, 5000);
      if (response.status) {
        const newMessages = response.data.messages;

        setMessages(newMessages.sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        ));

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
  }, [isInitiator]);

  const handleSendMessage = async () => {
    if (!sessionId) {
      ToastUtil.error('Error', 'Session not initialized');
      return;
    }

    if (selectedImage) {
      try {
        setLoading(true);
        const response = await sendImageMessage(sessionId, selectedImage);
        if (response.status) {
          setSelectedImage(null);
          shouldScrollToEnd.current = true;
          loadMessages(sessionId);
        } else {
          ToastUtil.error(
            'Error',
            response.data.message || 'Failed to send image',
          );
        }
      } catch (error) {
        console.error('Error sending image:', error);
        ToastUtil.error('Error', 'Failed to send image');
      } finally {
        setLoading(false);
      }
    } else if (messageText.trim()) {
      try {
        setLoading(true);
        const response = await sendNormalMessage(sessionId, messageText);
        if (response.status) {
          setMessageText('');
          shouldScrollToEnd.current = true;
          loadMessages(sessionId);
        } else {
          ToastUtil.error(
            'Error',
            response.data.message || 'Failed to send message',
          );
        }
      } catch (error) {
        console.error('Error sending message:', error);
        ToastUtil.error('Error', 'Failed to send message');
      } finally {
        setLoading(false);
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

  const handleSendExerciseRecord = () => {
    setPanelVisible(false);
    ToastUtil.info(
      'Feature coming soon',
      'Exercise record sending will be implemented',
    );
  };

  const handleExerciseRecordPress = useCallback(
    (recordId: string) => {
      navigation.navigate('ExerciseDetail', {
        recordId,
      });
    },
    [navigation],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <BackButton size={20} />
        </TouchableOpacity>

        <View style={styles.userInfo}>
          <CommonAvatar
            size={40}
            uri={otherUser?.image?.url}
            mode={otherUser?.roles?.includes('EXPERT') ? 'expert' : 'runner'}
          />

          <View style={styles.userDetails}>
            <View style={styles.userMainInfo}>
              <Text style={styles.userName}>{otherUser?.name}</Text>
              <Text style={styles.userUsername}>@{otherUser?.username}</Text>
            </View>
            <View style={styles.userStats}>
              <View style={styles.statItem}>
                <Icon name="trophy" size={14} color="#FFD700" />
                <Text style={styles.statText}>{otherUser?.points}</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="medal" size={14} color="#FFD700" />
                <Text style={styles.statText}>
                  {capitalizeFirstLetter(otherUser?.user_level)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

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
        />
      )}

      <CMSMessageControl
        messageText={messageText}
        setMessageText={setMessageText}
        handleSendMessage={handleSendMessage}
        onImagePress={handleImagePress}
        selectedImage={selectedImage}
        onRemoveImage={handleRemoveImage}
        disabled={loading || (sessionStatus === 'PENDING' && isInitiator)}
        setPanelVisible={setPanelVisible}
      />

      <ChatsPanelRunner
        visible={panelVisible}
        onClose={() => setPanelVisible(false)}
        sessionId={sessionId}
        onSendSuccess={() => loadMessages(sessionId)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    marginRight: 8,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  userDetails: {
    flex: 1,
    marginLeft: 10,
  },
  userMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 6,
  },
  userUsername: {
    fontSize: 14,
    color: '#666',
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  statText: {
    fontSize: 12,
    marginLeft: 4,
    color: '#666',
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
    color: theme.colors.white,
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