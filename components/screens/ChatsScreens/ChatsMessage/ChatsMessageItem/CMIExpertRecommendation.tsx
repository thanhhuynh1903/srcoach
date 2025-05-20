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
  archiveMessage,
} from '../../../../utils/useChatsAPI';
import CommonDialog from '../../../../commons/CommonDialog';

interface CMIExpertRecommendationProps {
  message: {
    id: string;
    content: {
      text: string;
      is_accepted?: boolean;
    } | null;
    created_at: string;
    read_at?: string;
    archived?: boolean;
    sender: {
      name: string;
      image?: {
        url: string;
      };
      roles: string[];
    };
  };
  isMe: boolean;
  onRefresh?: () => void;
  onUpdateMessage?: (messageId: string, updates: Partial<any>) => void;
}

export const CMIExpertRecommendation = ({
  message,
  isMe,
  onRefresh,
  onUpdateMessage,
}: CMIExpertRecommendationProps) => {
  const {profile} = useLoginStore();
  const [showArchiveDialog, setShowArchiveDialog] = React.useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [isArchived, setIsArchived] = React.useState(
    message?.archived || false,
  );

  const isPending = !message.content?.is_accepted;

  const handleAcceptRecommendation = async () => {
    try {
      if (!message.content?.is_accepted) {
        const response = await acceptExpertRecommendation(message.id);
        if (response.status && onUpdateMessage) {
          onUpdateMessage(message.id, {
            content: {
              ...message.content,
              is_accepted: true,
            },
          });
        }
      } else {
        const response = await rejectExpertRecommendation(message.id);
        if (response.status && onUpdateMessage) {
          onUpdateMessage(message.id, {
            content: {
              ...message.content,
              is_accepted: false,
            },
          });
        }
      }
    } catch (error) {
      console.error('Error handling recommendation:', error);
    }
  };

  const handleArchive = async () => {
    setShowArchiveDialog(false);
    const response = await archiveMessage(message.id);
    if (response.status) {
      setIsArchived(true);
      setShowConfirmDialog(false);
      if (onUpdateMessage) {
        onUpdateMessage(message.id, {archived: true});
      }
    }
  };

  const handleLongPress = () => {
    if (isMe && !isArchived) {
      setShowArchiveDialog(true);
    }
  };

  if (isArchived || !message.content) {
    return (
      <View style={styles.centeredContainer}>
        <View style={[styles.container, styles.archivedBubble]}>
          <Text style={styles.archivedText}>
            Expert recommendation deleted{isMe ? ' by you' : ''}
          </Text>
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
  }

  return (
    <>
      <TouchableOpacity
        style={styles.centeredContainer}
        onLongPress={handleLongPress}
        activeOpacity={0.9}>
        <View style={[styles.container, styles.centeredBubble]}>
          <View style={styles.avatarRow}>
            <CommonAvatar
              size={24}
              uri={message.sender.image?.url}
              mode={
                message.sender.roles.includes('EXPERT') ? 'expert' : 'runner'
              }
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

          {!isMe &&
            (isPending ? (
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
            ))}

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
      </TouchableOpacity>

      <CommonDialog
        visible={showArchiveDialog}
        onClose={() => setShowArchiveDialog(false)}
        title="Message Options"
        content={
          <View>
            <Text style={styles.dialogContentText}>
              What would you like to do with this recommendation?
            </Text>
            <TouchableOpacity
              style={styles.dialogActionButton}
              onPress={() => {
                setShowArchiveDialog(false);
                setShowConfirmDialog(true);
              }}>
              <Icon name="archive" size={20} color={theme.colors.primaryDark} />
              <Text style={styles.dialogActionButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <CommonDialog
        visible={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        title="Confirm Delete"
        content={
          <View>
            <Text style={styles.dialogContentText}>
              Are you sure you want to delete this recommendation?
            </Text>
            <View style={styles.dialogButtonGroup}>
              <TouchableOpacity
                style={[styles.dialogButton, styles.dialogCancelButton]}
                onPress={() => setShowConfirmDialog(false)}>
                <Text style={styles.dialogCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dialogButton, styles.dialogConfirmButton]}
                onPress={handleArchive}>
                <Text style={styles.dialogConfirmButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
      />
    </>
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
  archivedBubble: {
    backgroundColor: '#f9f9f9',
    borderColor: '#e0e0e0',
    borderWidth: 1,
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
  archivedText: {
    fontStyle: 'italic',
    color: '#999',
    fontSize: 14,
    marginBottom: 8,
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
  dialogContentText: {
    color: '#000',
    fontSize: 16,
    marginBottom: 20,
  },
  dialogActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
  },
  dialogActionButtonText: {
    color: '#000',
    fontSize: 16,
    marginLeft: 12,
  },
  dialogButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  dialogButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    marginLeft: 10,
  },
  dialogCancelButton: {
    borderWidth: 1,
    borderColor: theme.colors.primaryDark,
  },
  dialogConfirmButton: {
    backgroundColor: '#d30000',
  },
  dialogCancelButtonText: {
    color: theme.colors.primaryDark,
  },
  dialogConfirmButtonText: {
    color: '#fff',
  },
});
