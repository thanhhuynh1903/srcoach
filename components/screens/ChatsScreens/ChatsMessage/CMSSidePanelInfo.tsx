import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {getSessionInfo} from '../../../utils/useChatsAPI';
import {CommonAvatar} from '../../../commons/CommonAvatar';
import {theme} from '../../../contants/theme';

type SessionInfoProps = {
  visible: boolean;
  onClose: () => void;
  sessionId: string;
};

type SessionInfoData = {
  session: {
    id: string;
    status: string;
    created_at: string;
    is_expert_session: boolean;
    expert_rating_allowed: boolean;
    is_initiator: boolean;
  };
  other_user: {
    id: string;
    name: string;
    username: string;
    image?: {url: string} | null;
    points?: number;
    user_level?: string;
    roles?: string[];
  };
};

export const CMSSidePanelInfo = ({visible, onClose, sessionId}: SessionInfoProps) => {
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<SessionInfoData | null>(null);

  useEffect(() => {
    if (visible && sessionId) {
      const fetchSessionInfo = async () => {
        try {
          setLoading(true);
          const response = await getSessionInfo(sessionId);
          if (response.status) {
            setInfo(response.data);
          }
        } catch (error) {
          console.error('Error fetching session info:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchSessionInfo();
    }
  }, [visible, sessionId]);

  if (!visible) return null;

  const renderRoleChip = (role: string) => {
    const isExpert = role.toLowerCase() === 'expert';
    return (
      <View
        style={[
          styles.roleChip,
          isExpert ? styles.expertChip : styles.runnerChip,
        ]}>
        <Text style={styles.roleChipText}>{capitalizeFirstLetter(role)}</Text>
      </View>
    );
  };

  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Icon name="close" size={24} color={theme.colors.black} />
        </TouchableOpacity>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Icon name="refresh" size={24} color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading info...</Text>
          </View>
        ) : info ? (
          <View style={styles.contentContainer}>
            <View style={styles.userHeader}>
              <CommonAvatar
                source={info.other_user.image?.url}
                size={80}
                style={styles.avatar}
              />
              <Text style={styles.userName}>{info.other_user.name}</Text>
              <Text style={styles.username}>@{info.other_user.username}</Text>
              
              {info.other_user.roles && info.other_user.roles.length > 0 && (
                <View style={styles.rolesContainer}>
                  {info.other_user.roles.map((role, index) => (
                    <React.Fragment key={role}>
                      {renderRoleChip(role)}
                      {index < info.other_user.roles!.length - 1 && (
                        <View style={styles.roleSpacer} />
                      )}
                    </React.Fragment>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Stats</Text>
              <View style={styles.infoRow}>
                <Icon name="trophy" size={16} color={theme.colors.warning} />
                <Text style={styles.infoText}>
                  {info.other_user.points || 0} points
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="medal" size={16} color={theme.colors.warning} />
                <Text style={styles.infoText}>
                  {info.other_user.user_level || 'No level'}
                </Text>
              </View>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Session Info</Text>
              <View style={styles.infoRow}>
                <Icon name="time" size={16} color={theme.colors.darkGray} />
                <Text style={styles.infoText}>
                  Created: {new Date(info.session.created_at).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="chatbubbles" size={16} color={theme.colors.darkGray} />
                <Text style={styles.infoText}>
                  Status: {info.session.status.toLowerCase()}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="star" size={16} color={theme.colors.darkGray} />
                <Text style={styles.infoText}>
                  {info.session.is_expert_session ? 'Expert session' : 'Regular session'}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.errorContainer}>
            <Icon name="warning" size={24} color={theme.colors.error} />
            <Text style={styles.errorText}>Failed to load session info</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  container: {
    width: '80%',
    height: '100%',
    backgroundColor: theme.colors.white,
    padding: 16,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: theme.colors.darkGray,
  },
  contentContainer: {
    flex: 1,
  },
  userHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.black,
  },
  username: {
    fontSize: 14,
    color: theme.colors.darkGray,
    marginTop: 4,
    marginBottom: 8,
  },
  rolesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  roleChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  runnerChip: {
    backgroundColor: theme.colors.successDark,
  },
  expertChip: {
    backgroundColor: theme.colors.warning,
  },
  roleChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.white,
  },
  roleSpacer: {
    width: 8,
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primaryDark,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGray,
    paddingBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    color: theme.colors.darkGray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 8,
    color: theme.colors.error,
  },
});