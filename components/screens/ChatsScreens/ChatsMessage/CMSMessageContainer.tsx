import React, {useCallback, useRef, useEffect} from 'react';
import {ListRenderItemInfo, View, StyleSheet, FlatList} from 'react-native';
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
};

export const CMSMessageContainer = React.memo(
  ({
    messages,
    profileId,
    showContent,
    onExerciseRecordPress,
    shouldScrollToEnd,
    sessionId,
  }: CMSMessageContainerProps) => {
    const navigation = useNavigation();
    const flatListRef = useRef<FlatList>(null);
    const isInitialScrollDone = useRef(false);
    const shouldAutoScroll = useRef(shouldScrollToEnd);

    useEffect(() => {
      shouldAutoScroll.current = shouldScrollToEnd;
    }, [shouldScrollToEnd]);

    useEffect(() => {
      if (messages.length > 0 && shouldAutoScroll.current) {
        const timer = setTimeout(() => {
          flatListRef.current?.scrollToEnd({animated: isInitialScrollDone.current});
          isInitialScrollDone.current = true;
        }, 100);

        return () => clearTimeout(timer);
      }
    }, [messages]);

    useEffect(() => {
      if (messages.length > 0 && shouldAutoScroll.current && isInitialScrollDone.current) {
        flatListRef.current?.scrollToEnd({animated: true});
      }
    }, [messages.length]);

    const getMessageKey = useCallback((item: MessageItem) => {
      return `${item.id}_${item.created_at}`;
    }, []);

    const getItemLayout = useCallback(
      (_: ArrayLike<MessageItem> | null | undefined, index: number) => {
        const item = messages[index];
        let height = 100;

        switch (item?.message_type) {
          case 'IMAGE':
            height = 160;
            break;
          case 'EXERCISE_RECORD':
            height = 200;
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

    const renderMessage = useCallback(
      ({item}: ListRenderItemInfo<MessageItem>) => {
        const isMe = item.sender.id === profileId;

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
                onViewMap={() => {
                  console.log("BEFORE: " + item.content?.exercise_session_record_id);
                  navigation.navigate('CMSMessageViewMap', {id: item.content?.exercise_session_record_id});
                }}
              />
            );
          case 'EXPERT_RECOMMENDATION':
            return (
              <CMIExpertRecommendation
                message={item}
                isMe={isMe}
                onRefresh={() => {}}
              />
            );
          case 'IMAGE':
            return <CMIImage message={item} isMe={isMe} />;
          default:
            return <CMINormal message={item} isMe={isMe} />;
        }
      },
      [profileId, showContent, onExerciseRecordPress, sessionId],
    );

    return (
      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={getMessageKey}
          contentContainerStyle={styles.messagesContainer}
          getItemLayout={getItemLayout}
          initialNumToRender={20}
          maxToRenderPerBatch={10}
          windowSize={21}
          removeClippedSubviews={true}
          inverted={false}
          onContentSizeChange={() => {
            if (shouldAutoScroll.current) {
              flatListRef.current?.scrollToEnd({animated: true});
            }
          }}
          onLayout={() => {
            if (shouldAutoScroll.current && !isInitialScrollDone.current) {
              flatListRef.current?.scrollToEnd({animated: false});
              isInitialScrollDone.current = true;
            }
          }}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
          }}
        />
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