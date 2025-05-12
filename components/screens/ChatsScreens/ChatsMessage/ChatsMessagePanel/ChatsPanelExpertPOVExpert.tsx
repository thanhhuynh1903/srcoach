import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import CommonPanel from '../../../../commons/CommonPanel';
import {theme} from '../../../../contants/theme';
import ChatsPanelSendExerciseRecord from './ChatsPanelSendExerciseRecord';
import ChatsPanelExpertRecommendation from './ChatsPanelExpertRecommendation';

interface ChatsPanelExpertPOVExpertProps {
  visible: boolean;
  onClose: () => void;
  sessionId: string;
  onSendSuccess: () => void;
}

const ChatsPanelExpertPOVExpert: React.FC<ChatsPanelExpertPOVExpertProps> = ({
  visible,
  onClose,
  sessionId,
  onSendSuccess,
}) => {
  const [showExercisePanel, setShowExercisePanel] = useState(false);
  const [showRecommendationPanel, setShowRecommendationPanel] = useState(false);

  return (
    <>
      <CommonPanel
        visible={visible && !showExercisePanel && !showRecommendationPanel}
        onClose={onClose}
        title="Expert Actions"
        content={
          <View style={styles.content}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => console.log('Send Training Plan pressed')}
              activeOpacity={0.7}>
              <Icon name="calendar" size={25} color={theme.colors.primaryDark} />
              <Text style={styles.actionButtonText}>Send Training Plan</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowRecommendationPanel(true)}
              activeOpacity={0.7}>
              <Icon name="medkit" size={25} color={theme.colors.primaryDark} />
              <Text style={styles.actionButtonText}>Send Expert Recommendation</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowExercisePanel(true)}
              activeOpacity={0.7}>
              <Icon name="walk" size={25} color={theme.colors.primaryDark} />
              <Text style={styles.actionButtonText}>View Exercise Records</Text>
            </TouchableOpacity>
          </View>
        }
        direction="bottom"
        height="auto"
        borderRadius={16}
        backdropOpacity={0.5}
        contentStyle={{padding: 0}}
      />
      <ChatsPanelSendExerciseRecord
        visible={showExercisePanel}
        onClose={() => setShowExercisePanel(false)}
        sessionId={sessionId}
        onSendSuccess={onSendSuccess}
      />
      <ChatsPanelExpertRecommendation
        visible={showRecommendationPanel}
        onClose={() => setShowRecommendationPanel(false)}
        sessionId={sessionId}
        onSendSuccess={onSendSuccess}
      />
    </>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingBottom: 30,
    minHeight: 50,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.white,
    width: '100%',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.lightGray,
  },
  actionButtonText: {
    marginLeft: 16,
    fontSize: 16,
    color: theme.colors.primaryDark,
    fontWeight: '500',
    flex: 1,
  },
});

export default ChatsPanelExpertPOVExpert;