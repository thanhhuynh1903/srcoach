import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import CommonPanel from '../../../../commons/CommonPanel';
import {theme} from '../../../../contants/theme';
import ChatsPanelSendExerciseRecord from './ChatsPanelSendExerciseRecord';
import ChatsPanelExpertRecommendation from './ChatsPanelExpertRecommendation';
import ChatsPanelExpertTrainingPlan from './ChatsPanelExpertTrainingPlan';
import ChatsPanelProfileConfirm from './ChatsPanelProfileConfirm';
import ToastUtil from '../../../../utils/utils_toast';
import { sendProfileMessage } from '../../../../utils/useChatsAPI';

interface ChatsPanelExpertPOVExpertProps {
  visible: boolean;
  onClose: () => void;
  sessionId: string;
  otherUser: any;
  onSendSuccess: () => void;
}

const ChatsPanelExpertPOVExpert: React.FC<ChatsPanelExpertPOVExpertProps> = ({
  visible,
  onClose,
  sessionId,
  otherUser,
  onSendSuccess,
}) => {
  const [showExercisePanel, setShowExercisePanel] = useState(false);
  const [showRecommendationPanel, setShowRecommendationPanel] = useState(false);
  const [showTrainingPlanPanel, setShowTrainingPlanPanel] = useState(false);
  const [showProfileConfirmDialog, setShowProfileConfirmDialog] = useState(false);

  const handleProfileRequest = () => {
    setShowProfileConfirmDialog(true);
    onClose();
  };

  const handleProfileConfirm = async () => {
    await sendProfileMessage(sessionId);
    ToastUtil.success('Success', 'Profile sent to user successfully');
    setShowProfileConfirmDialog(false);
  };

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
              onPress={() => {
                onClose();
                setShowTrainingPlanPanel(true);
              }}
              activeOpacity={0.7}>
              <Icon
                name="calendar"
                size={25}
                color={theme.colors.primaryDark}
              />
              <Text style={styles.actionButtonText}>Send Training Plan</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowRecommendationPanel(true)}
              activeOpacity={0.7}>
              <Icon name="medkit" size={25} color={theme.colors.primaryDark} />
              <Text style={styles.actionButtonText}>
                Send Expert Recommendation
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowExercisePanel(true)}
              activeOpacity={0.7}>
              <Icon name="walk" size={25} color={theme.colors.primaryDark} />
              <Text style={styles.actionButtonText}>View Exercise Records</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleProfileRequest}
              activeOpacity={0.7}>
              <Icon name="person-circle-outline" size={25} color={theme.colors.primaryDark} />
              <Text style={styles.actionButtonText}>
                Request for profile submission
              </Text>
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
      <ChatsPanelExpertTrainingPlan
        visible={showTrainingPlanPanel}
        onClose={() => setShowTrainingPlanPanel(false)}
        otherUser={otherUser}
        onSendSuccess={onSendSuccess}
      />
      <ChatsPanelProfileConfirm
        visible={showProfileConfirmDialog}
        onClose={() => setShowProfileConfirmDialog(false)}
        onConfirm={handleProfileConfirm}
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