import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {getSessionInfo} from '../../../utils/useChatsAPI';
import {CommonAvatar} from '../../../commons/CommonAvatar';
import {theme} from '../../../contants/theme';
import ContentLoader from 'react-content-loader/native';
import {Rect, Circle} from 'react-native-svg';

type SessionInfoProps = {
  visible: boolean;
  onClose: () => void;
  userId: string;
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

export const CMSSidePanelInfo = ({visible, onClose, userId}: SessionInfoProps) => {
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<SessionInfoData | null>(null);

  useEffect(() => {
    if (visible && userId) {
      const fetchSessionInfo = async () => {
        try {
          setLoading(true);
          const response = await getSessionInfo(userId);
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
  }, [visible, userId]);

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

  const renderLoadingSkeleton = () => (
    <View style={styles.contentContainer}>
      <ContentLoader
        speed={1}
        width="100%"
        height="100%"
        viewBox="0 0 300 500"
        backgroundColor="#f3f3f3"
        foregroundColor="#ecebeb">
        <Circle cx="40" cy="40" r="40" />
        <Rect x="0" y="100" rx="4" ry="4" width="200" height="20" />
        <Rect x="0" y="130" rx="4" ry="4" width="150" height="16" />
        <Rect x="0" y="170" rx="4" ry="4" width="80" height="16" />
        <Rect x="0" y="210" rx="4" ry="4" width="250" height="16" />
        <Rect x="0" y="240" rx="4" ry="4" width="250" height="16" />
        <Rect x="0" y="280" rx="4" ry="4" width="80" height="16" />
        <Rect x="0" y="320" rx="4" ry="4" width="250" height="16" />
        <Rect x="0" y="350" rx="4" ry="4" width="250" height="16" />
      </ContentLoader>
    </View>
  );

  const renderStatRow = (iconName: string, value: string | number, unit: string) => (
    <View style={styles.statRow}>
      <View style={styles.statIconContainer}>
        <Icon name={iconName} size={20} color={theme.colors.primary} />
      </View>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statUnit}>{unit}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Icon name="close" size={24} color="#000000" />
        </TouchableOpacity>

        {loading ? (
          renderLoadingSkeleton()
        ) : info ? (
          <View style={styles.contentContainer}>
            <View style={styles.userHeader}>
              <CommonAvatar
                uri={info.other_user.image?.url}
                size={80}
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
              {renderStatRow(
                'trophy', 
                info.other_user.points || 0, 
                'points'
              )}
              {renderStatRow(
                'medal', 
                capitalizeFirstLetter(info.other_user.user_level || 'No level'), 
                'level'
              )}
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Session Info</Text>
              <View style={styles.infoRow}>
                <Icon name="time" size={16} color="#666666" />
                <Text style={styles.infoText}>
                  Created: {new Date(info.session.created_at).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="star" size={16} color="#666666" />
                <Text style={styles.infoText}>
                  {info.session.is_expert_session ? 'Expert session' : 'Regular session'}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.errorContainer}>
            <Icon name="warning" size={24} color="#FF0000" />
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
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
    marginBottom: 16,
  },
  contentContainer: {
    flex: 1,
  },
  userHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 12,
  },
  username: {
    fontSize: 14,
    color: '#888888',
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
    backgroundColor: '#00851f',
  },
  expertChip: {
    backgroundColor: theme.colors.warning,
  },
  roleChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
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
    borderBottomColor: '#EEEEEE',
    paddingBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 8,
    color: '#FF0000',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  statUnit: {
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
  },
});