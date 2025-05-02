import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Platform,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {theme} from '../../../contants/theme';

interface CEMessageActionsPanelProps {
  visible: boolean;
  onClose: () => void;
  onSelectProfileStats: () => void;
  onSelectRunRecord: () => void;
  onSelectExpertRecommendation: () => void;
  disabled?: boolean;
}


export const CEMessageActionsPanel: React.FC<CEMessageActionsPanelProps> = ({
  visible,
  onClose,
  onSelectProfileStats,
  onSelectRunRecord,
  onSelectExpertRecommendation, // Add this
  disabled = false,
}) => {
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[styles.panelContainer, {transform: [{translateY}]}]}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Expert Actions</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={theme.colors.primaryDark} />
            </TouchableOpacity>
          </View>
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, disabled && styles.disabledButton]}
              onPress={onSelectProfileStats}
              disabled={disabled}>
              <Icon
                name="person"
                size={20}
                color={disabled ? theme.colors.gray : theme.colors.primaryDark}
                style={styles.actionIcon}
              />
              <Text style={[styles.actionText, disabled && styles.disabledText]}>
                Submit profile stats
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, disabled && styles.disabledButton]}
              onPress={onSelectRunRecord}
              disabled={disabled}>
              <Icon
                name="walk"
                size={20}
                color={disabled ? theme.colors.gray : theme.colors.primaryDark}
                style={styles.actionIcon}
              />
              <Text style={[styles.actionText, disabled && styles.disabledText]}>
                Submit run record
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, disabled && styles.disabledButton]}
              onPress={onSelectExpertRecommendation}
              disabled={disabled}>
              <Icon
                name="ribbon"
                size={20}
                color={disabled ? theme.colors.gray : theme.colors.primaryDark}
                style={styles.actionIcon}
              />
              <Text style={[styles.actionText, disabled && styles.disabledText]}>
                Submit Expert Recommendation
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  panelContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primaryDark,
  },
  actionsContainer: {
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
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
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: theme.colors.gray,
  },
});
