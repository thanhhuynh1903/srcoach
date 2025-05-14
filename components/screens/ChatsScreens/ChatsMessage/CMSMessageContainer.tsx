import React, {useCallback, useRef, useEffect} from 'react';
import {View, StyleSheet, ScrollView, Text} from 'react-native';
import ContentLoader, {Rect, Circle} from 'react-content-loader/native';
import {CMINormal} from './ChatsMessageItem/CMINormal';
import {CMIProfile} from './ChatsMessageItem/CMIProfile';
import {CMIExerciseRecord} from './ChatsMessageItem/CMIExerciseRecord';
import {CMIExpertRecommendation} from './ChatsMessageItem/CMIExpertRecommendation';
import {CMIImage} from './ChatsMessageItem/CMIImage';
import {MessageItem} from './ChatsMessageScreen';
import {useNavigation} from '@react-navigation/native';
import {CommonAvatar} from '../../../commons/CommonAvatar';

type CMSMessageContainerProps = {
  otherUser: any;
  messages: MessageItem[];
  profileId: string;
  showContent: boolean;
  onExerciseRecordPress: (recordId: string) => void;
  shouldScrollToEnd: boolean;
  sessionId: string;
  onUpdateMessage?: (messageId: string, updates: Partial<MessageItem>) => void;
  isLoading?: boolean;
};

const MessageLoader = ({isMe}: {isMe: boolean}) => (
  <View style={[styles.loaderItem, isMe ? styles.loaderRight : styles.loaderLeft]}>
    <ContentLoader
      speed={1.5}
      width={250}
      height={80}
      viewBox="0 0 250 80"
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb">
      {isMe ? (
        <>
          <Rect x="0" y="15" rx="4" ry="4" width="200" height="15" />
          <Rect x="0" y="40" rx="3" ry="3" width="150" height="10" />
        </>
      ) : (
        <>
          <Circle cx="20" cy="20" r="15" />
          <Rect x="45" y="15" rx="4" ry="4" width="200" height="15" />
          <Rect x="45" y="40" rx="3" ry="3" width="150" height="10" />
        </>
      )}
    </ContentLoader>
  </View>
);

const WelcomeMessage = ({otherUser}: {otherUser: any}) => (
  <View style={styles.welcomeContainer}>
    <CommonAvatar uri={otherUser.image?.url} size={60} style={styles.welcomeAvatar} />
    <Text style={styles.welcomeTitle}>Say hello to {otherUser.name}!</Text>
    <Text style={styles.welcomeSubtitle}>@{otherUser.username}</Text>
    <Text style={styles.welcomeText}>
      Have fun chatting! Please remember to be respectful and follow our community guidelines.
    </Text>
    <Text style={styles.termsText}>
      By continuing, you agree to our Terms of Service and Privacy Policy.
    </Text>
  </View>
);

export const CMSMessageContainer = React.memo(
  ({
    otherUser,
    messages,
    profileId,
    showContent,
    onExerciseRecordPress,
    shouldScrollToEnd,
    sessionId,
    onUpdateMessage,
    isLoading = false,
  }: CMSMessageContainerProps) => {
    const navigation = useNavigation();
    const scrollViewRef = useRef<ScrollView>(null);
    const isInitialScrollDone = useRef(false);
    const shouldAutoScroll = useRef(shouldScrollToEnd);

    useEffect(() => {
      shouldAutoScroll.current = shouldScrollToEnd;
    }, [shouldScrollToEnd]);

    useEffect(() => {
      if (messages.length > 0 && shouldAutoScroll.current) {
        const timer = setTimeout(() => {
          scrollToEnd(false);
          isInitialScrollDone.current = true;
        }, 100);
        return () => clearTimeout(timer);
      }
    }, [messages]);

    useEffect(() => {
      if (messages.length > 0 && shouldAutoScroll.current && isInitialScrollDone.current) {
        scrollToEnd(true);
      }
    }, [messages.length]);

    const scrollToEnd = (animated: boolean) => {
      scrollViewRef.current?.scrollToEnd({animated});
    };

    const getMessageKey = (item: MessageItem) => {
      return `${item.id}_${item.created_at}`;
    };

    const renderMessage = useCallback(
      (item: MessageItem) => {
        const isMe = item.sender.id === profileId;

        if (!showContent) return null;

        switch (item.message_type) {
          case 'NORMAL':
            return <CMINormal key={getMessageKey(item)} message={item} isMe={isMe} />;
          case 'PROFILE':
            return <CMIProfile key={getMessageKey(item)} message={item} isMe={isMe} />;
          case 'EXERCISE_RECORD':
            return (
              <CMIExerciseRecord
                key={getMessageKey(item)}
                message={item}
                isMe={isMe}
                onViewMap={() => {
                  navigation.navigate('CMSMessageViewMap', {
                    id: item.content?.exercise_session_record_id,
                  });
                }}
              />
            );
          case 'EXPERT_RECOMMENDATION':
            return (
              <CMIExpertRecommendation
                key={getMessageKey(item)}
                message={item}
                isMe={isMe}
                onUpdateMessage={onUpdateMessage}
              />
            );
          case 'IMAGE':
            return <CMIImage key={getMessageKey(item)} message={item} isMe={isMe} />;
          default:
            return <CMINormal key={getMessageKey(item)} message={item} isMe={isMe} />;
        }
      },
      [profileId, showContent, onExerciseRecordPress, sessionId, onUpdateMessage],
    );

    return (
      <View style={styles.container}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.messagesContainer}
          onContentSizeChange={() => {
            if (shouldAutoScroll.current) {
              scrollToEnd(false);
            }
          }}
          onLayout={() => {
            if (shouldAutoScroll.current && !isInitialScrollDone.current) {
              scrollToEnd(false);
              isInitialScrollDone.current = true;
            }
          }}>
          {isLoading ? (
            <>
              <MessageLoader isMe={false} />
              <MessageLoader isMe={true} />
              <MessageLoader isMe={false} />
              <MessageLoader isMe={true} />
            </>
          ) : (
            <>
              <WelcomeMessage otherUser={otherUser} />
              <View style={styles.spacer} />
              {messages.map(renderMessage)}
            </>
          )}
        </ScrollView>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesContainer: {
    padding: 12,
    paddingTop: 40,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  loaderItem: {
    marginVertical: 8,
  },
  loaderLeft: {
    alignSelf: 'flex-start',
  },
  loaderRight: {
    alignSelf: 'flex-end',
  },
  spacer: {
    flex: 1,
    minHeight: 20,
  },
  welcomeContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    marginHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeAvatar: {
    marginBottom: 12,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
    paddingTop: 5,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  termsText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
    fontStyle: 'italic',
  },
});