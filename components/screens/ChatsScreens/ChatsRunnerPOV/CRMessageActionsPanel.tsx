import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { theme } from '../../../contants/theme';
import CommonPanel from '../../../commons/CommonPanel';

interface CRMessageActionsPanelProps {
  visible: boolean;
  onClose: () => void;
  onSelectProfileStats: () => void;
  onSelectRunRecord: () => void;
}

export const CRMessageActionsPanel: React.FC<CRMessageActionsPanelProps> = ({
  visible,
  onClose,
  onSelectProfileStats,
  onSelectRunRecord,
}) => {

  const renderContent = () => (
    <View style={styles.actionsContainer}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={onSelectProfileStats}>
        <Icon
          name="person"
          size={20}
          color={theme.colors.primaryDark}
          style={styles.actionIcon}
        />
        <Text style={styles.actionText}>Submit profile stats</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={onSelectRunRecord}>
        <Icon
          name="walk"
          size={20}
          color={theme.colors.primaryDark}
          style={styles.actionIcon}
        />
        <Text style={styles.actionText}>Submit run record</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <CommonPanel
      visible={visible}
      onClose={onClose}
      title="User Actions"
      direction="bottom"
      content={renderContent()}
      closeOnBackdropPress={true}
      swipeToClose={true}
      backdropOpacity={0.5}
      contentStyle={styles.panelContent}
      buttonContainerStyle={styles.panelButtonContainer}
      titleStyle={styles.panelTitle}
    />
  );
};

const styles = StyleSheet.create({
  panelContent: {
    padding: 0,
  },
  panelButtonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionsContainer: {
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  actionIcon: {
    marginRight: 12,
  },
  actionText: {
    fontSize: 16,
    color: theme.colors.primaryDark,
  },
});