import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Modal, Animated} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { theme } from '../../../contants/theme';
import {capitalizeFirstLetter} from '../../../utils/utils_format';

type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  points: number;
  user_level: string;
  roles: string[];
};

type SessionInfo = {
  id: string;
  status: string;
  other_user: User;
  initiated_by_you: boolean;
  archived_by_you: boolean;
};

const RoleBadge = ({roles}: {roles: string[]}) => {
  const isExpert = roles.includes('expert');
  const isRunner = roles.includes('runner') && !isExpert;

  if (isExpert) {
    return (
      <View style={[styles.roleBadge, styles.expertBadge]}>
        <Icon name="trophy" size={12} color="white" />
      </View>
    );
  }

  if (isRunner) {
    return (
      <View style={[styles.roleBadge, styles.runnerBadge]}>
        <Icon name="footsteps" size={12} color="white" />
      </View>
    );
  }

  return null;
};

export const CRMessageInfoPanel = ({
  sessionInfo,
  visible,
  onClose,
}: {
  sessionInfo: SessionInfo | null;
  visible: boolean;
  onClose: () => void;
}) => {
  const slideAnim = React.useRef(new Animated.Value(300)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }

  }, [visible]);

  if (!sessionInfo) return null;

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
          style={[
            styles.panel,
            {
              transform: [{translateX: slideAnim}],
            },
          ]}>
          <View style={styles.header}>
            <Text style={styles.headerText}>User Information</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={theme.colors.primaryDark} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarPlaceholder}>
                <Icon name="person" size={40} color="white" />
              </View>
              <RoleBadge roles={sessionInfo.other_user.roles} />
            </View>

            <Text style={styles.userName}>{sessionInfo.other_user.name}</Text>
            <Text style={styles.username}>@{sessionInfo.other_user.username}</Text>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Icon name="trophy" size={20} color="#FFD700" />
                <Text style={styles.infoText}>
                  {sessionInfo.other_user.points} points
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Icon name="star" size={20} color="#FFD700" />
                <Text style={styles.infoText}>
                  {capitalizeFirstLetter(sessionInfo.other_user.user_level)}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.archiveButton} onPress={() => {}}>
            <Text style={styles.archiveButtonText}>Archive this chat</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  panel: {
    width: '80%',
    height: '100%',
    backgroundColor: 'white',
    position: 'absolute',
    right: 0,
    borderLeftWidth: 1,
    borderLeftColor: '#E5E5EA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  runnerBadge: {
    backgroundColor: theme.colors.success,
  },
  expertBadge: {
    backgroundColor: theme.colors.warning,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 16,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  archiveButton: {
    backgroundColor: theme.colors.error,
    padding: 16,
    margin: 20,
    borderRadius: 8,
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
  },
  archiveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});