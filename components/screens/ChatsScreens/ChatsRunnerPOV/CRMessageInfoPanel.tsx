import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {theme} from '../../../contants/theme';
import {capitalizeFirstLetter} from '../../../utils/utils_format';
import {Easing} from 'react-native';

const {width} = Dimensions.get('window');

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
        <Icon name="trophy" size={14} color="white" />
        <Text style={styles.roleBadgeText}>Expert</Text>
      </View>
    );
  }

  if (isRunner) {
    return (
      <View style={[styles.roleBadge, styles.runnerBadge]}>
        <Icon name="footsteps" size={14} color="white" />
        <Text style={styles.roleBadgeText}>Runner</Text>
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
  const slideAnim = React.useRef(new Animated.Value(width * 0.8)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: width * 0.8,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!sessionInfo) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}>
      <Animated.View style={[styles.modalContainer, {opacity: opacityAnim}]}>
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
              shadowOpacity: opacityAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.2],
              }),
            },
          ]}>
          <View style={styles.header}>
            <Text style={styles.headerText}>User Profile</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
              <Icon name="close" size={24} color={'#000'} />
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
            <Text style={styles.username}>
              @{sessionInfo.other_user.username}
            </Text>

            <View style={styles.divider} />

            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>User Stats</Text>

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <View style={styles.infoIconContainer}>
                    <Icon name="trophy" size={18} color="#FFD700" />
                  </View>
                  <Text style={styles.infoLabel}>Points</Text>
                  <Text style={styles.infoValue}>
                    {sessionInfo.other_user.points}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <View style={styles.infoIconContainer}>
                    <Icon name="medal" size={18} color="#FFD700" />
                  </View>
                  <Text style={styles.infoLabel}>Level</Text>
                  <Text style={styles.infoValue}>
                    {capitalizeFirstLetter(sessionInfo.other_user.user_level)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.archiveButton]}
              onPress={() => {}}>
              <Icon name="archive" size={18} color="white" />
              <Text style={styles.archiveButtonText}>Archive Chat</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  panel: {
    width: '85%',
    height: '100%',
    backgroundColor: 'white',
    position: 'absolute',
    right: 0,
    borderLeftWidth: 1,
    borderLeftColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: {width: -2, height: 0},
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    letterSpacing: 0.5,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  roleBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
    elevation: 2,
  },
  roleBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  runnerBadge: {
    backgroundColor: theme.colors.success,
  },
  expertBadge: {
    backgroundColor: theme.colors.warning,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#767676',
    marginBottom: 4,
    textAlign: 'center',
  },
  username: {
    fontSize: 16,
    color: '#767676',
    marginBottom: 24,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: '#F0F0F0',
    marginVertical: 16,
  },
  infoSection: {
    width: '100%',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#767676',
    marginBottom: 16,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#767676',
    marginBottom: 4,
    textAlign: 'center',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primaryDark,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  archiveButton: {
    backgroundColor: theme.colors.error,
  },
  archiveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});
