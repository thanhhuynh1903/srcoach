import React, {useCallback, useRef, useEffect} from 'react';
import {View, StyleSheet, ScrollView, Text, findNodeHandle, UIManager} from 'react-native';
import ContentLoader, {Rect, Circle} from 'react-content-loader/native';
import {CMINormal} from './ChatsMessageItem/CMINormal';
import {CMIProfile} from './ChatsMessageItem/CMIProfile';
import {CMIExerciseRecord} from './ChatsMessageItem/CMIExerciseRecord';
import {CMIExpertRecommendation} from './ChatsMessageItem/CMIExpertRecommendation';
import {CMIImage} from './ChatsMessageItem/CMIImage';
import {MessageItem} from './ChatsMessageScreen';
import {useNavigation} from '@react-navigation/native';
import {CommonAvatar} from '../../../commons/CommonAvatar';
import { CMIExpertSchedule } from './ChatsMessageItem/CMIExpertSchedule';

type CMSMessageContainerProps = {
  otherUser: any;
  messages: MessageItem[];
  profileId: string;
  showContent: boolean;
  onExerciseRecordPress: (recordId: string) => void;
  shouldScrollToEnd: boolean;
  sessionId: string;
  onUpdateMessage?: (messageId: string, updates: Partial<MessageItem>) => void;
  onProfileSubmit?: (data: any) => void;
  isLoading?: boolean;
  teleportToMessageId?: string;
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
    <Text style={styles.termsText}>By continuing, you agree to our Terms of Service and Privacy Policy.</Text>
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
    onProfileSubmit,
    isLoading = false,
    teleportToMessageId,
  }: CMSMessageContainerProps) => {
    const navigation = useNavigation();
    const scrollViewRef = useRef<ScrollView>(null);
    const messageRefs = useRef<{[key: string]: View}>({});
    const isInitialScrollDone = useRef(false);
    const shouldAutoScroll = useRef(shouldScrollToEnd);

    useEffect(() => {
      shouldAutoScroll.current = shouldScrollToEnd;
    }, [shouldScrollToEnd]);

    const scrollToEnd = (animated: boolean) => {
      scrollViewRef.current?.scrollToEnd({animated});
    };

    const scrollToMessage = (messageId: string) => {
      const messageRef = messageRefs.current[messageId];
      if (messageRef) {
        const handle = findNodeHandle(messageRef);
        if (handle && scrollViewRef.current) {
          UIManager.measureLayout(
            handle,
            findNodeHandle(scrollViewRef.current),
            () => {},
            (x, y) => {
              scrollViewRef.current?.scrollTo({y, animated: true});
            }
          );
        }
      }
    };

    useEffect(() => {
      if (isLoading || !showContent) return;

      if (teleportToMessageId) {
        const timer = setTimeout(() => scrollToMessage(teleportToMessageId), 100);
        return () => clearTimeout(timer);
      } else if (messages.length > 0 && shouldAutoScroll.current) {
        const timer = setTimeout(() => {
          scrollToEnd(false);
          isInitialScrollDone.current = true;
        }, 100);
        return () => clearTimeout(timer);
      }
    }, [messages, isLoading, showContent, teleportToMessageId]);

    const getMessageKey = (item: MessageItem) => `${item.id}_${item.created_at}`;

    const renderMessage = useCallback(
      (item: MessageItem) => {
        const isMe = item.sender.id === profileId;
        if (!showContent) return null;

        const commonProps = {
          key: getMessageKey(item),
          message: item,
          isMe,
        };

        switch (item.message_type) {
          case 'PROFILE':
            return <CMIProfile {...commonProps} key={item.id} onProfileSubmit={onProfileSubmit} />;
          case 'EXERCISE_RECORD':
            return <CMIExerciseRecord {...commonProps} key={item.id} onViewMap={() => navigation.navigate('CMSMessageViewMap', {
              id: item.content?.exercise_session_record_id,
            })} />;
          case 'EXPERT_RECOMMENDATION':
            return <CMIExpertRecommendation {...commonProps} key={item.id} onUpdateMessage={onUpdateMessage} />;
          case 'IMAGE':
            return <CMIImage {...commonProps} key={item.id} />;
          case 'EXPERT_SCHEDULE':
            return <CMIExpertSchedule {...commonProps} key={item.id} onUpdateMessage={onUpdateMessage} />;
          default:
            return <CMINormal {...commonProps} key={item.id} />;
        }
      },
      [profileId, showContent, onExerciseRecordPress, sessionId, onUpdateMessage],
    );

    return (
      <View style={styles.container}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.messagesContainer}
          onContentSizeChange={() => shouldAutoScroll.current && scrollToEnd(false)}
          onLayout={() => shouldAutoScroll.current && !isInitialScrollDone.current && scrollToEnd(false)}>
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