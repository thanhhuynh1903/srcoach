import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {CommonAvatar} from '../../../../commons/CommonAvatar';
import {theme} from '../../../../contants/theme';
import {formatTimestampAgo} from '../../../../utils/utils_format';
import {useLoginStore} from '../../../../utils/useLoginStore';
import {
  acceptExpertRecommendation,
  rejectExpertRecommendation,
} from '../../../../utils/useChatsAPI';

interface CMIExpertRecommendationProps {
  message: any;
  isMe: boolean;
  onRefresh?: () => void;
}

export const CMIExpertRecommendation = ({
  message,
  isMe,
  onRefresh,
}: CMIExpertRecommendationProps) => {
  const {profile} = useLoginStore();
  const isPending = !message.content.is_accepted;

  const handleAcceptRecommendation = () => {
    if (isPending) {
      acceptExpertRecommendation(message.id).then(() => {
        onRefresh?.();
      });
    } else {
      rejectExpertRecommendation(message.id).then(() => {
        onRefresh?.();
      });
    }
  };

  return (
    <View style={styles.centeredContainer}>
      <View style={[styles.container, styles.centeredBubble]}>
        <View style={styles.avatarRow}>
          <CommonAvatar
            size={24}
            uri={message.sender.image?.url}
            mode={message.sender.roles.includes('EXPERT') ? 'expert' : 'runner'}
          />
          {isMe ? (
            <Text style={styles.myText}>You</Text>
          ) : (
            <Text style={styles.senderName}>{message.sender.name}</Text>
          )}
          <Text style={styles.headerText}>
            {isMe ? 'have' : 'has'} sent an Expert Recommendation
          </Text>
        </View>

        <View style={styles.contentBox}>
          <Text style={styles.contentText}>{message.content.text}</Text>
        </View>

        {isPending ? (
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={handleAcceptRecommendation}
            activeOpacity={0.7}>
            <Text style={styles.acceptButtonText}>Save Recommendation</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.status, styles.accepted]}
            onPress={handleAcceptRecommendation}
            activeOpacity={0.7}>
            <Text style={styles.statusText}>Remove Recommendation</Text>
          </TouchableOpacity>
        )}

        <View style={styles.footer}>
          <Text style={styles.timeText}>
            {formatTimestampAgo(message.created_at)}
          </Text>
          {message.read_at && (
            <Icon
              name="checkmark-done"
              size={14}
              color={theme.colors.primaryDark}
              style={styles.icon}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 16,
  },
  container: {
    width: '90%',
    maxWidth: 400,
  },
  centeredBubble: {
    backgroundColor: '#e1ffe2',
    borderColor: '#32ca00',
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  myText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#048100',
  },
  senderName: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '700',
    color: '#048100',
  },
  headerText: {
    fontSize: 14,
    marginLeft: 5,
    color: '#048100',
  },
  contentBox: {
    backgroundColor: 'rgba(50, 202, 0, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  contentText: {
    fontSize: 14,
    color: '#048100',
    lineHeight: 20,
  },
  acceptButton: {
    backgroundColor: theme.colors.primaryDark,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  status: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    marginBottom: 12,
  },
  accepted: {
    backgroundColor: '#e90000',
  },
  statusText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
  icon: {
    marginLeft: 4,
  },
});
