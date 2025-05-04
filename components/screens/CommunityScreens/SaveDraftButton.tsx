// components/SaveDraftButton.tsx
import React, { useState } from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { usePostStore } from '../../utils/usePostStore';
import { theme } from '../../contants/theme';
import CommonDialog from '../../commons/CommonDialog';

interface SaveDraftButtonProps {
  postId: string;
  onSave?: () => void;
}

export const SaveDraftButton = ({ postId, onSave }: SaveDraftButtonProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogContent, setDialogContent] = useState({
    title: '',
    message: '',
    isError: false,
  });
  const { saveDraft } = usePostStore();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await saveDraft(postId);
      if (success) {
        setDialogContent({
          title: 'Success',
          message: 'Post draft saved successfully',
          isError: false,
        });
      } else {
        setDialogContent({
          title: 'Error',
          message: 'Failed to save draft',
          isError: true,
        });
      }
    } catch (error) {
      setDialogContent({
        title: 'Error',
        message: 'An error occurred while saving',
        isError: true,
      });
    } finally {
      setIsSaving(false);
      setDialogVisible(true);
    }
  };

  const handleDialogClose = () => {
    setDialogVisible(false);
    if (!dialogContent.isError) {
      onSave?.();
    }
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
          <>
            <Icon
              name="bookmark-outline"
              size={24}
              color={theme.colors.primaryDark}
            />
            <Text style={styles.modalOptionText}>Save draft</Text>
          </>
        )}
      </TouchableOpacity>

      <CommonDialog
        visible={dialogVisible}
        onClose={handleDialogClose}
        title={dialogContent.title}
        content={
          <Text style={styles.dialogContentText}>{dialogContent.message}</Text>
        }
        actionButtons={
          dialogContent.isError
            ? [
                {
                  label: 'Retry',
                  handler: handleSave,
                  color: theme.colors.primaryDark,
                  variant: 'contained',
                },
                {
                  label: 'Cancel',
                  handler: handleDialogClose,
                  variant: 'outlined',
                },
              ]
            : [
                {
                  label: 'OK',
                  handler: handleDialogClose,
                  color: theme.colors.primaryDark,
                  variant: 'contained',
                },
              ]
        }
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
  modalOptionText: {
    marginLeft: 16,
    fontSize: 16,
    color: '#333',
  },
  dialogContentText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
};