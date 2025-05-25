import React, { useState } from 'react';
import { TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { usePostStore } from '../../utils/usePostStore';
import { theme } from '../../contants/theme';
import CommonDialog from '../../commons/CommonDialog';
import { Text } from 'react-native';
interface SaveDraftButtonProps {
  postId: string;
  isSaved?: boolean;
  onSave?: (newSavedState: boolean) => void;
}

export const SaveDraftButton = ({ postId, isSaved, onSave }: SaveDraftButtonProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogContent, setDialogContent] = useState({
    title: '',
    message: '',
    isError: false,
  });
  const { saveDraft, deleteDraft } = usePostStore();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let success;
      let newSavedState = !isSaved;

      if (isSaved) {
        success = await deleteDraft(postId);
      } else {
        success = await saveDraft(postId);
      }

      if (success) {
        setDialogContent({
          title: 'Success',
          message: newSavedState ? 'Saved to drafts' : 'Removed from drafts',
          isError: false,
        });
        onSave?.(newSavedState); // Update parent state with new saved status
      } else {
        setDialogContent({
          title: 'Error',
          message: newSavedState ? 'Failed to save draft' : 'Failed to remove from drafts',
          isError: true,
        });
      }
    } catch (error) {
      setDialogContent({
        title: 'Error',
        message: 'An error occurred',
        isError: true,
      });
    } finally {
      setIsSaving(false);
      setDialogVisible(true);
    }
  };

  const handleDialogClose = () => {
    setDialogVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.modalOption}
        onPress={handleSave}
        disabled={isSaving}>
        {isSaving ? (
          <ActivityIndicator size={24} color={theme.colors.primaryDark} />
        ) : (
          <Icon
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color={theme.colors.primaryDark}
          />
        )}
      </TouchableOpacity>

      <CommonDialog
        visible={dialogVisible}
        onClose={handleDialogClose}
        title={dialogContent.title}
        content={
          <Text style={styles.dialogContentText}>{dialogContent.message}</Text>
        }
        actionButtons={[
          {
            label: 'OK',
            handler: handleDialogClose,
            color: theme.colors.primaryDark,
            variant: 'contained',
          },
        ]}
      />
    </>
  );
};

const styles = {
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  dialogContentText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
};