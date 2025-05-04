import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {useRoute, useNavigation} from '@react-navigation/native';
import ToastUtil from '../../../utils/utils_toast';
import {
  createOrGetSession,
  sendNormalMessage,
  getSessionMessages,
} from '../../../utils/useChatsAPI';
import BackButton from '../../../BackButton';
import {
  capitalizeFirstLetter,
  formatTimestampAgo,
} from '../../../utils/utils_format';
import {useLoginStore} from '../../../utils/useLoginStore';
import {CommonAvatar} from '../../../commons/CommonAvatar';
import {theme} from '../../../contants/theme';
import {CMINormal} from './ChatsMessageItem/CMINormal';
import {CMIProfile} from './ChatsMessageItem/CMIProfile';
import {CMIExerciseRecord} from './ChatsMessageItem/CMIExerciseRecord';
import {CMIExpertRecommendation} from './ChatsMessageItem/CMIExpertRecommendation';
import {CMIImage} from './ChatsMessageItem/CMIImage';
import {CMSMessageControl} from './CMSMessageControl';

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
  const {userId} = route.params;
  
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [messageText, setMessageText] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [sessionStatus, setSessionStatus] = useState('');
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [showContent, setShowContent] = useState(false);
  
  const flatListRef = useRef<FlatList<MessageItem>>(null);
  const scrollOffsetRef = useRef(0);
  const contentHeightRef = useRef(0);
  const isScrollingRef = useRef(false);

  // Generate unique key for each message
  const getMessageKey = useCallback((item: MessageItem) => {
    return `${item.id}_${item.created_at}`; // Combine ID and timestamp for uniqueness
  }, []);

  // Estimate height for each item type
  const getItemLayout = useCallback(
    (_: ArrayLike<MessageItem> | null | undefined, index: number) => {
      const item = messages[index];
      let height = 100; // Default height
      
      switch(item?.message_type) {
        case 'IMAGE':
          height = 200;
          break;
        case 'EXERCISE_RECORD':
          height = 150;
          break;
        case 'EXPERT_RECOMMENDATION':
          height = 180;
          break;
        default:
          height = 100;
      }
      
      return {
        length: height,
        offset: height * index,
        index,
      };
    },
    [messages],
  );

  useEffect(() => {
    const initChat = async () => {
      const response = await createOrGetSession(userId);
      if (response.status) {
        setSessionId(response.data.session.id);
        setSessionStatus(response.data.session.status);
        setOtherUser(response.data.other_user);
        loadMessages(response.data.session.id);
      }
    };
    initChat();
  }, [userId]);

  const loadMessages = useCallback(async (sessionId: string, loadMore = false) => {
    try {
      if (loadMore) {
        if (!hasMoreMessages || loadingMore) return;
        setLoadingMore(true);
      } else {
        setLoading(true);
        setShowContent(false);
        setMessages([]);
        setCursor(null);
        setHasMoreMessages(true);
      }

      const response = await getSessionMessages(sessionId, 30, cursor);
      if (response.status) {
        // Ensure messages are unique before adding them
        const newMessages = [...response.data.messages]
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          .filter((message, index, self) => 
            index === self.findIndex(m => 
              m.id === message.id && m.created_at === message.created_at
            )
          );

        if (loadMore) {
          // Prepend older messages and ensure no duplicates
          setMessages(prev => {
            const combined = [...newMessages, ...prev];
            return combined.filter((message, index, self) => 
              index === self.findIndex(m => 
                getMessageKey(m) === getMessageKey(message)
              )
            );
          });
        } else {
          setMessages(newMessages);
        }

        setCursor(response.data.nextCursor);
        setHasMoreMessages(!!response.data.nextCursor);

        setTimeout(() => {
          setShowContent(true);
          if (!loadMore && flatListRef.current && newMessages.length > 0) {
            flatListRef.current.scrollToIndex({
              index: newMessages.length - 1,
              animated: false,
            });
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setShowContent(true);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [cursor, hasMoreMessages, loadingMore, getMessageKey]);

  const handleLoadMore = useCallback(async () => {
    if (!hasMoreMessages || loadingMore) return;
    
    const previousLength = messages.length;
    await loadMessages(sessionId, true);
    
    if (flatListRef.current && messages.length > previousLength) {
      const newIndex = messages.length - previousLength;
      setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToIndex({
            index: newIndex,
            animated: false,
          });
        }
      }, 50);
    }
  }, [hasMoreMessages, loadingMore, loadMessages, messages.length, sessionId]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const {contentOffset, contentSize} = event.nativeEvent;
      scrollOffsetRef.current = contentOffset.y;
      contentHeightRef.current = contentSize.height;

      const scrollPosition = contentOffset.y / contentSize.height;
      if (scrollPosition < 0.2 && hasMoreMessages && !loadingMore && !isScrollingRef.current) {
        handleLoadMore();
      }
    },
    [handleLoadMore, hasMoreMessages, loadingMore],
  );

  const handleScrollBeginDrag = useCallback(() => {
    isScrollingRef.current = true;
  }, []);

  const handleScrollEndDrag = useCallback(() => {
    isScrollingRef.current = false;
  }, []);

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    const response = await sendNormalMessage(sessionId, messageText);
    if (response.status) {
      setMessageText('');
      loadMessages(sessionId);
    }
  };

  const handleScrollToIndexFailed = useCallback((info: {
    index: number;
    highestMeasuredFrameIndex: number;
    averageItemLength: number;
  }) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({
        offset: info.averageItemLength * info.index,
        animated: false,
      });
      setTimeout(() => {
        if (flatListRef.current && messages.length > 0) {
          flatListRef.current.scrollToIndex({
            index: info.index,
            animated: false,
          });
        }
      }, 100);
    }
  }, [messages.length]);

  const renderMessage = useCallback(({item}: ListRenderItemInfo<MessageItem>) => {
    const isMe = item.sender.id === profile?.id;

    if (!showContent) return null;

    switch (item.message_type) {
      case 'NORMAL':
        return <CMINormal message={item} isMe={isMe} />;
      case 'PROFILE':
        return <CMIProfile message={item} isMe={isMe} />;
      case 'EXERCISE_RECORD':
        return (
          <CMIExerciseRecord
            message={item}
            isMe={isMe}
            onPress={() =>
              navigation.navigate('ExerciseDetail', {
                recordId: item.content.exercise_session_record_id,
              })
            }
          />
        );
      case 'EXPERT_RECOMMENDATION':
        return <CMIExpertRecommendation message={item} isMe={isMe} />;
      case 'IMAGE':
        return <CMIImage message={item} isMe={isMe} />;
      default:
        return <CMINormal message={item} isMe={isMe} />;
    }
  }, [navigation, profile?.id, showContent]);

  const LoadingMoreIndicator = useCallback(() => (
    <View style={styles.loadingMoreContainer}>
      <ActivityIndicator size="small" color={theme.colors.primaryDark} />
      <Text style={styles.loadingMoreText}>Loading older messages...</Text>
    </View>
  ), []);

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

        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="search" size={20} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="information-circle" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {sessionStatus === 'PENDING' && (
        <View style={styles.pendingNotice}>
          <Text style={styles.pendingNoticeText}>
            Waiting for other party to accept the chat
          </Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primaryDark} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={getMessageKey} // Use the unique key generator
          contentContainerStyle={styles.messagesContainer}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onScrollBeginDrag={handleScrollBeginDrag}
          onScrollEndDrag={handleScrollEndDrag}
          ListHeaderComponent={loadingMore ? <LoadingMoreIndicator /> : null}
          onContentSizeChange={(w, h) => {
            contentHeightRef.current = h;
          }}
          getItemLayout={getItemLayout}
          onScrollToIndexFailed={handleScrollToIndexFailed}
          initialNumToRender={20}
          maxToRenderPerBatch={10}
          windowSize={21}
          removeClippedSubviews={true}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
          }}
          inverted={false}
        />
      )}

      <CMSMessageControl
        messageText={messageText}
        setMessageText={setMessageText}
        handleSendMessage={handleSendMessage}
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
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 12,
  },
  pendingNotice: {
    backgroundColor: '#FFEB3B',
    padding: 8,
    alignItems: 'center',
  },
  pendingNoticeText: {
    color: '#000',
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    padding: 12,
    paddingBottom: 20,
    minHeight: '100%',
  },
  loadingMoreContainer: {
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingMoreText: {
    marginTop: 5,
    color: theme.colors.gray,
    fontSize: 12,
  },
});