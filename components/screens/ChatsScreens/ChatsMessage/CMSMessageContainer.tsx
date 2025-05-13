import React, {useCallback, useRef, useEffect} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {CMINormal} from './ChatsMessageItem/CMINormal';
import {CMIProfile} from './ChatsMessageItem/CMIProfile';
import {CMIExerciseRecord} from './ChatsMessageItem/CMIExerciseRecord';
import {CMIExpertRecommendation} from './ChatsMessageItem/CMIExpertRecommendation';
import {CMIImage} from './ChatsMessageItem/CMIImage';
import {MessageItem} from './ChatsMessageScreen';
import {useNavigation} from '@react-navigation/native';

type CMSMessageContainerProps = {
  messages: MessageItem[];
  profileId: string;
  showContent: boolean;
  onExerciseRecordPress: (recordId: string) => void;
  shouldScrollToEnd: boolean;
  sessionId: string;
  onUpdateMessage?: (messageId: string, updates: Partial<MessageItem>) => void;
};

export const CMSMessageContainer = React.memo(
  ({
    messages,
    profileId,
    showContent,
    onExerciseRecordPress,
    shouldScrollToEnd,
    sessionId,
    onUpdateMessage,
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
      if (
        messages.length > 0 &&
        shouldAutoScroll.current &&
        isInitialScrollDone.current
      ) {
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
          }}
        >
          {messages.map(renderMessage)}
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
    paddingBottom: 40,
    flexGrow: 1,
  },
});