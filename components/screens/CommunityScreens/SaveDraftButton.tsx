// components/SaveDraftButton.tsx
import React, {useState} from 'react';
import {TouchableOpacity, Text, Alert, ActivityIndicator} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {usePostStore} from '../../utils/usePostStore';
import {theme} from '../../contants/theme';

interface SaveDraftButtonProps {
  postId: string;
  onSave?: () => void;
}

export const SaveDraftButton = ({postId, onSave}: SaveDraftButtonProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const {saveDraft} = usePostStore();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await saveDraft(postId);
      if (success) {
        Alert.alert('Success', 'Post draft saved successfully');
     
      } else {
        Alert.alert('Error', 'Failed to save draft');
 
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while saving');
    } finally {
      setIsSaving(false);
      onSave?.();
    }
  };

  return (
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
};
