import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Animated,
  LayoutAnimation,
} from 'react-native';
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

type ExpertRecommendation = {
  message_id: string;
  content: string;
  is_accepted: boolean;
  created_at: string;
};

type LatestProfile = {
  message_id: string;
  height: number;
  weight: number;
  issues?: string;
  type?: string;
  is_filled: boolean;
  height_change: number;
  weight_change: number;
};

type SessionInfoData = {
  session: {
    id: string;
    status: string;
    created_at: string;
    accepted_at: string;
    is_expert_session: boolean;
    expert_rating_allowed: boolean;
    user1_archived: boolean;
    user2_archived: boolean;
    is_initiator: boolean;
    initial_message?: string;
  };
  other_user: {
    id: string;
    name: string;
    username: string;
    email?: string;
    image?: {url: string} | null;
    points?: number;
    user_level?: string;
    roles?: string[];
  };
  expert_recommendations?: ExpertRecommendation[];
  latest_profile?: LatestProfile | null;
};

type SectionState = {
  stats: boolean;
  sessionInfo: boolean;
  recommendations: boolean;
  healthProfile: boolean;
};

const SECTION_KEYS = {
  STATS: 'stats',
  SESSION_INFO: 'sessionInfo',
  RECOMMENDATIONS: 'recommendations',
  HEALTH_PROFILE: 'healthProfile',
};

export const CMSSidePanelInfo = ({
  visible,
  onClose,
  userId,
}: SessionInfoProps) => {
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<SessionInfoData | null>(null);
  const [recommendationsLimit, setRecommendationsLimit] = useState(3);
  const [sections, setSections] = useState<SectionState>({
    stats: true,
    sessionInfo: true,
    recommendations: true,
    healthProfile: true,
  });

  useEffect(() => {
    if (visible && userId) {
      const fetchSessionInfo = async () => {
        try {
          setLoading(true);
          const response = await getSessionInfo(userId);
          if (response.status) {
            // Sort recommendations by date (newest first)
            const sortedData = {
              ...response.data,
              expert_recommendations: response.data.expert_recommendations
                ? [...response.data.expert_recommendations].sort(
                    (a, b) =>
                      new Date(b.created_at).getTime() -
                      new Date(a.created_at).getTime(),
                  )
                : undefined,
            };
            setInfo(sortedData);
            setRecommendationsLimit(3); // Reset limit when loading new data
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

  const toggleSection = (section: keyof SectionState) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSections(prev => ({...prev, [section]: !prev[section]}));
  };

  const loadMoreRecommendations = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setRecommendationsLimit(prev => prev + 3);
  };

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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

  const renderStatRow = (
    iconName: string,
    value: string | number,
    unit: string,
  ) => (
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

  const renderRecommendationItem = ({item}: {item: ExpertRecommendation}) => (
    <View style={styles.recommendationItem}>
      <View style={styles.recommendationContent}>
        <Text style={styles.recommendationText}>{item.content}</Text>
        <Text style={styles.recommendationDate}>
          {formatDate(item.created_at)}
        </Text>
      </View>
      <View
        style={[
          styles.recommendationStatus,
          item.is_accepted ? styles.statusAccepted : styles.statusPending,
        ]}>
        <Icon
          name={item.is_accepted ? 'checkmark-circle' : 'time'}
          size={16}
          color="#FFF"
        />
      </View>
    </View>
  );

  const renderProfileStats = () => {
    if (!info?.latest_profile) return null;

    const profile = info.latest_profile;
    return (
      <Animated.View style={sections.healthProfile ? {} : {height: 0}}>
        <View style={styles.profileContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Health Profile</Text>
            <TouchableOpacity
              onPress={() => toggleSection(SECTION_KEYS.HEALTH_PROFILE)}>
              <Icon
                name={sections.healthProfile ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          {sections.healthProfile && (
            <>
              <View style={styles.profileStatsRow}>
                <View style={styles.profileStat}>
                  <Text style={styles.profileStatLabel}>Height</Text>
                  <Text style={styles.profileStatValue}>{profile.height} cm</Text>
                  <View
                    style={[
                      styles.profileStatChange,
                      profile.height_change >= 0
                        ? styles.positiveChange
                        : styles.negativeChange,
                    ]}>
                    <Icon
                      name={profile.height_change >= 0 ? 'arrow-up' : 'arrow-down'}
                      size={12}
                      color="#FFF"
                    />
                    <Text style={styles.profileStatChangeText}>
                      {Math.abs(profile.height_change)} cm
                    </Text>
                  </View>
                </View>

                <View style={styles.profileStat}>
                  <Text style={styles.profileStatLabel}>Weight</Text>
                  <Text style={styles.profileStatValue}>{profile.weight} kg</Text>
                  <View
                    style={[
                      styles.profileStatChange,
                      profile.weight_change >= 0
                        ? styles.positiveChange
                        : styles.negativeChange,
                    ]}>
                    <Icon
                      name={profile.weight_change >= 0 ? 'arrow-up' : 'arrow-down'}
                      size={12}
                      color="#FFF"
                    />
                    <Text style={styles.profileStatChangeText}>
                      {Math.abs(profile.weight_change)} kg
                    </Text>
                  </View>
                </View>
              </View>

              {profile.issues && (
                <View style={styles.profileIssues}>
                  <Text style={styles.profileIssuesLabel}>Health Notes:</Text>
                  <Text style={styles.profileIssuesText}>{profile.issues}</Text>
                </View>
              )}

              {profile.type && (
                <View style={styles.profileType}>
                  <Icon name="walk" size={16} color={theme.colors.primary} />
                  <Text style={styles.profileTypeText}>
                    {capitalizeFirstLetter(profile.type.replace('_', ' '))}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </Animated.View>
    );
  };

  const renderSectionHeader = (title: string, sectionKey: keyof SectionState) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity onPress={() => toggleSection(sectionKey)}>
        <Icon
          name={sections[sectionKey] ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#666"
        />
      </TouchableOpacity>
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
          <ScrollView style={styles.contentContainer}>
            <View style={styles.userHeader}>
              <CommonAvatar uri={info.other_user.image?.url} size={80} />
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
              {renderSectionHeader('Stats', SECTION_KEYS.STATS)}
              {sections.stats && (
                <View style={styles.statContainer}>
                  {renderStatRow('trophy', info.other_user.points || 0, 'points')}
                  {renderStatRow(
                    'medal',
                    capitalizeFirstLetter(
                      info.other_user.user_level || 'No level',
                    ),
                    'level',
                  )}
                </View>
              )}
            </View>

            <View style={styles.infoSection}>
              {renderSectionHeader('Session Info', SECTION_KEYS.SESSION_INFO)}
              {sections.sessionInfo && (
                <>
                  <View style={styles.infoRow}>
                    <Icon name="time" size={16} color="#666666" />
                    <Text style={styles.infoText}>
                      Created: {formatDate(info.session.created_at)}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Icon name="star" size={16} color="#666666" />
                    <Text style={styles.infoText}>
                      {info.session.is_expert_session
                        ? 'Expert session'
                        : 'Regular session'}
                    </Text>
                  </View>
                  {info.session.initial_message && (
                    <View style={styles.initialMessageContainer}>
                      <Text style={styles.initialMessageLabel}>
                        Initial Message:
                      </Text>
                      <Text style={styles.initialMessageText}>
                        {info.session.initial_message}
                      </Text>
                    </View>
                  )}
                </>
              )}
            </View>

            {info.expert_recommendations &&
              info.expert_recommendations.length > 0 && (
                <View style={styles.infoSection}>
                  {renderSectionHeader(
                    'Expert Recommendations',
                    SECTION_KEYS.RECOMMENDATIONS,
                  )}
                  {sections.recommendations && (
                    <>
                      <FlatList
                        data={info.expert_recommendations.slice(
                          0,
                          recommendationsLimit,
                        )}
                        renderItem={renderRecommendationItem}
                        keyExtractor={item => item.message_id}
                        scrollEnabled={false}
                        ItemSeparatorComponent={() => (
                          <View style={styles.recommendationSeparator} />
                        )}
                      />
                      {recommendationsLimit <
                        info.expert_recommendations.length && (
                        <TouchableOpacity
                          style={styles.loadMoreButton}
                          onPress={loadMoreRecommendations}>
                          <Text style={styles.loadMoreText}>Load more</Text>
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                </View>
              )}

            {renderProfileStats()}
          </ScrollView>
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
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
    marginBottom: 16,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    marginBottom: 30
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 4,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primaryDark,
  },
  statContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 25,
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
  initialMessageContainer: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  initialMessageLabel: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 4,
  },
  initialMessageText: {
    fontSize: 14,
    color: '#333333',
  },
  recommendationItem: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recommendationContent: {
    flex: 1,
    marginRight: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  recommendationDate: {
    fontSize: 12,
    color: '#888888',
    marginTop: 4,
  },
  recommendationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPending: {
    backgroundColor: '#979797',
  },
  statusAccepted: {
    backgroundColor: '#00851f',
  },
  recommendationSeparator: {
    height: 8,
  },
  profileContainer: {
    borderRadius: 8,
    marginBottom: 16,
  },
  profileStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  profileStat: {
    alignItems: 'center',
    width: '48%',
  },
  profileStatLabel: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 4,
  },
  profileStatValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  profileStatChange: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  positiveChange: {
    backgroundColor: '#00851f',
  },
  negativeChange: {
    backgroundColor: '#FF0000',
  },
  profileStatChangeText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 2,
  },
  profileIssues: {
    marginTop: 12,
  },
  profileIssuesLabel: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 4,
  },
  profileIssuesText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  profileType: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  profileTypeText: {
    fontSize: 14,
    color: '#333333',
    marginLeft: 8,
  },
  loadMoreButton: {
    padding: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  loadMoreText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
});