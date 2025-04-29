import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {theme} from '../../../contants/theme';
import CommonDialog from '../../../commons/CommonDialog';

interface ChatsActionMenuProps {
  visible: boolean;
  onClose: () => void;
  selectedItem: any;
  getOtherUser: (item: any) => any;
  handleBlockUser: (userId: string) => void;
  handleUnblockUser: (userId: string) => void;
  setConfirmationDialogVisible: (visible: boolean) => void;
  setSelectedAction: (action: any) => void;
}

export const ChatsActionMenu = ({
  visible,
  onClose,
  selectedItem,
  getOtherUser,
  handleBlockUser,
  handleUnblockUser,
  setConfirmationDialogVisible,
  setSelectedAction,
}: ChatsActionMenuProps) => {
  const getActionMenuItems = () => {
    if (!selectedItem) return [];
    const isBlocked = 'blockedAt' in selectedItem;
    const otherUser = getOtherUser(selectedItem);

    return isBlocked
      ? [
          {
            title: 'Unblock User',
            icon: 'lock-open-outline',
            color: theme.colors.success,
            handler: () => handleUnblockUser(otherUser.id),
          },
        ]
      : [
          {
            title: 'Block User',
            icon: 'lock-closed-outline',
            color: theme.colors.error,
            handler: () => handleBlockUser(otherUser.id),
          },
          {
            title: 'Archive Chat',
            icon: 'archive-outline',
            color: theme.colors.primaryDark,
            handler: () => {},
          },
        ];
  };

  const items = getActionMenuItems();
  const otherUser = selectedItem ? getOtherUser(selectedItem) : null;

  return (
    <CommonDialog
      visible={visible}
      onClose={onClose}
      title={`Options for ${otherUser?.name || 'User'}`}
      content={
        <View style={styles.actionMenuContent}>
          {items.map((item, index) => (
            <View key={index} style={styles.menuItemContainer}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.actionMenuItem}
                onPress={() => {
                  setSelectedAction(item);
                  onClose();
                  setConfirmationDialogVisible(true);
                }}>
                <Icon
                  name={item.icon}
                  size={20}
                  color={item.color}
                  style={styles.actionMenuIcon}
                />
                <Text style={[styles.actionMenuText, {color: item.color}]}>
                  {item.title}
                </Text>
              </TouchableOpacity>
              {index < items.length - 1 && (
                <View style={styles.divider} />
              )}
            </View>
          ))}
        </View>
      }
      width="80%"
      height="auto"
      closeOnBackdropPress={true}
    />
  );
};

const styles = StyleSheet.create({
  actionMenuContent: {
    width: '100%',
    paddingVertical: 4,
  },
  menuItemContainer: {
    marginBottom: 4,
  },
  actionMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  actionMenuIcon: {
    marginRight: 12,
  },
  actionMenuText: {
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.grayLight,
    marginHorizontal: 16,
    opacity: 0.2,
  },
});