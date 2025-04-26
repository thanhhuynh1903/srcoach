import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  Animated,
  Dimensions,
  Platform,
  RefreshControl,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {PieChart} from 'react-native-gifted-charts';
import ContentLoader, {Rect, Circle} from 'react-content-loader/native';
import LinearGradient from 'react-native-linear-gradient';
import BackButton from '../../BackButton';
import useUserPointsStore from '../../utils/useUserPointsStore';
import {useLoginStore} from '../../utils/useLoginStore';
import {capitalizeFirstLetter} from '../../utils/utils_format';
import {theme} from '../../contants/theme';
import {CommonAvatar} from '../../commons/CommonAvatar';

const {width} = Dimensions.get('window');

type LeaderboardItem = {
  id: string;
  name: string;
  username: string;
  currentLevel: string;
  nextLevel: string | null;
  pointsPercentage: number;
  pointsToNextLevel: number;
  totalPoints: number;
  avatar?: string | null;
};

const LeaderBoardScreen = ({navigation}: {navigation: any}) => {
  const [activeTab, setActiveTab] = useState<
    'All Time' | 'Daily' | 'Weekly' | 'Monthly'
  >('All Time');
  const [profileRank, setProfileRank] = useState(0);
  const [showFloatingCard, setShowFloatingCard] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const {
    pointsData,
    leaderboard,
    dailyLeaderboard,
    weeklyLeaderboard,
    monthlyLeaderboard,
    isLoading,
    getMyPoints,
    getLeaderboard,
    getDailyLeaderboard,
    getWeeklyLeaderboard,
    getMonthlyLeaderboard,
  } = useUserPointsStore();

  const {profile} = useLoginStore();
  const scrollY = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const currentLeaderboard = () => {
    switch (activeTab) {
      case 'Daily':
        return dailyLeaderboard;
      case 'Weekly':
        return weeklyLeaderboard;
      case 'Monthly':
        return monthlyLeaderboard;
      default:
        return leaderboard;
    }
  };

  const loadData = useCallback(async () => {
    try {
      await getMyPoints();
      switch (activeTab) {
        case 'Daily':
          await getDailyLeaderboard();
          break;
        case 'Weekly':
          await getWeeklyLeaderboard();
          break;
        case 'Monthly':
          await getMonthlyLeaderboard();
          break;
        default:
          await getLeaderboard('', page, limit);
      }
    } catch (error) {
      console.error('Error loading leaderboard data:', error);
    }
  }, [activeTab, page, limit]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (currentLeaderboard().length > 0 && profile?.id) {
      const rank =
        currentLeaderboard().findIndex(user => user.id === profile.id) + 1;
      setProfileRank(rank || currentLeaderboard().length + 1);
    }
  }, [currentLeaderboard(), profile]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  useEffect(() => {
    const listenerId = scrollY.addListener(({value}) => {
      const threshold = 500;
      const shouldShow = value > threshold;

      if (shouldShow !== showFloatingCard) {
        setShowFloatingCard(shouldShow);

        Animated.parallel([
          Animated.timing(translateY, {
            toValue: shouldShow ? 0 : 100,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: shouldShow ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }
    });

    return () => {
      scrollY.removeListener(listenerId);
    };
  }, [showFloatingCard]);

  const handlePageChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && page > 1) {
      setPage(prev => prev - 1);
    } else if (direction === 'next' && currentLeaderboard().length === limit) {
      setPage(prev => prev + 1);
    }
  };

  const CircularProgress = ({percentage}: {percentage: number}) => {
    const pieData = [
      {
        value: percentage,
        color: theme.colors.primaryDark,
        gradientCenterColor: '#9F7AEA',
      },
      {
        value: 100 - percentage,
        color: '#E5E7EB',
      },
    ];

    return (
      <View style={styles.progressCircleContainer}>
        <PieChart
          data={pieData}
          donut
          radius={20}
          innerRadius={15}
          innerCircleColor={'#F9FAFB'}
          showText={false}
          focusOnPress={false}
        />
        <Text style={styles.progressText}>{percentage}%</Text>
      </View>
    );
  };

  const renderRankIndicator = (index: number) => {
    const rank = index + 1;
    if (rank === 1) {
      return <Icon name="trophy" size={24} color="#F59E0B" />;
    } else if (rank === 2) {
      return <Icon name="medal" size={24} color="#9CA3AF" />;
    } else if (rank === 3) {
      return <Icon name="ribbon" size={24} color="#F97316" />;
    } else {
      return (
        <View style={styles.rankNumberContainer}>
          <Text style={styles.rankNumber}>{rank}</Text>
        </View>
      );
    }
  };

  const renderLeaderboardItem = ({
    item,
    index,
  }: {
    item: LeaderboardItem;
    index: number;
  }) => {
    const isProfile = item.id === profile?.id;
    return (
      <View style={[styles.leaderboardItem, isProfile && styles.profileItem]}>
        <View style={styles.leaderboardItemLeft}>
          <View style={styles.rankIndicator}>{renderRankIndicator(index)}</View>
          <CommonAvatar uri={item?.avatar || undefined} size={35} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {isProfile ? 'You' : item.name || item.username || 'Anonymous'}
            </Text>
            <View style={styles.levelContainer}>
              <Icon name="star" size={14} color="#F59E0B" />
              <Text style={styles.levelText}>
                {capitalizeFirstLetter(item.currentLevel)}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.pointsContainer}>
          <View style={styles.totalPointsContainer}>
            <Icon name="trophy" size={14} color="#F59E0B" />
            <Text style={styles.userStats}>
              {item.totalPoints?.toLocaleString() || 0} pts
            </Text>
          </View>
          <CircularProgress percentage={item.pointsPercentage} />
        </View>
      </View>
    );
  };

  const renderTab = (tab: 'All Time' | 'Daily' | 'Weekly' | 'Monthly') => (
    <TouchableOpacity
      key={tab}
      style={[styles.tab, activeTab === tab && styles.activeTab]}
      onPress={() => {
        setActiveTab(tab);
        setPage(1);
      }}>
      <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
        {tab}
      </Text>
    </TouchableOpacity>
  );

  const FloatingPositionCard = () => {
    if (!profile || !pointsData) return null;

    return (
      <Animated.View
        style={[
          styles.floatingCard,
          {
            transform: [{translateY}],
            opacity,
          },
        ]}>
        <LinearGradient
          colors={['#F5F3FF', '#EDE9FE']}
          style={styles.floatingCardGradient}>
          <Text style={styles.floatingCardTitle}>Your Position</Text>
          <View style={styles.floatingCardContent}>
            <Text style={styles.floatingCardRank}>{profileRank}</Text>
            <CommonAvatar uri={pointsData?.avatar || undefined} size={40} />
            <View style={styles.floatingCardUserInfo}>
              <Text style={styles.floatingCardUserName}>You</Text>
              <View style={styles.levelContainer}>
                <Icon name="star" size={14} color="#F59E0B" />
                <Text style={styles.levelText}>
                  {capitalizeFirstLetter(pointsData.currentLevel)}
                </Text>
              </View>
            </View>
            <View style={styles.floatingCardAchievements}>
              <Icon name="trophy" size={14} color="#F59E0B" />
              <Text style={styles.userStats}>
                {pointsData?.points?.toLocaleString() || '0'} pts
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderLoader = () => (
    <View style={styles.leaderboardContainer}>
      {[...Array(5)].map((_, i) => (
        <ContentLoader
          key={i}
          speed={1.5}
          width={width - 32}
          height={72}
          viewBox={`0 0 ${width - 32} 72`}
          backgroundColor="#f3f3f3"
          foregroundColor="#ecebeb">
          <Circle cx="36" cy="36" r="24" />
          <Rect x="72" y="18" rx="4" ry="4" width="120" height="16" />
          <Rect x="72" y="40" rx="4" ry="4" width="80" height="12" />
          <Circle cx={width - 60} cy="36" r="20" />
        </ContentLoader>
      ))}
    </View>
  );

  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      <TouchableOpacity
        style={[styles.paginationButton, page === 1 && styles.disabledButton]}
        onPress={() => handlePageChange('prev')}
        disabled={page === 1}>
        <Icon
          name="chevron-back"
          size={20}
          color={page === 1 ? '#9CA3AF' : '#4B5563'}
        />
      </TouchableOpacity>

      <Text style={styles.pageText}>Page {page}</Text>

      <TouchableOpacity
        style={[
          styles.paginationButton,
          currentLeaderboard().length < limit && styles.disabledButton,
        ]}
        onPress={() => handlePageChange('next')}
        disabled={currentLeaderboard().length < limit}>
        <Icon
          name="chevron-forward"
          size={20}
          color={currentLeaderboard().length < limit ? '#9CA3AF' : '#4B5563'}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      <LinearGradient
        colors={['#FFFFFF', '#F9FAFB']}
        style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <BackButton size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Leaderboard</Text>
        </View>
      </LinearGradient>

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: true},
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primaryDark]}
            tintColor={theme.colors.primaryDark}
          />
        }>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <CommonAvatar uri={profile?.image?.url || undefined} size={64} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {profile?.name || 'Anonymous'}
              </Text>
              <Text style={styles.profileUsername}>
                @{profile?.username || 'anonymous'}
              </Text>
              <View style={styles.rankContainer}>
                <Icon name="stats-chart" size={16} color="#fff" />
                <Text style={styles.rankText}>Rank #{profileRank || '--'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Icon name="trophy" size={20} color={'#FFF'} />
              </View>
              <Text style={styles.statValue}>
                {pointsData?.points?.toLocaleString() || '0'} pts
              </Text>
            </View>
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Icon name="star" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.statValue}>
                Level: {capitalizeFirstLetter(pointsData?.level || 'Unknown')}
              </Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${pointsData?.pointsPercentage || 0}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressLabel}>
              {pointsData?.pointsToNextLevel || 0} pts to rank up to next level
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.tabsContainer}>
          {['All Time', 'Daily', 'Weekly', 'Monthly'].map(renderTab)}
        </View>

        {isLoading ? (
          renderLoader()
        ) : (
          <View style={styles.leaderboardContainer}>
            <FlatList
              data={currentLeaderboard()}
              renderItem={renderLeaderboardItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  No leaderboard data available
                </Text>
              }
            />
            {activeTab === 'All Time' && renderPagination()}
          </View>
        )}
        <View style={{height: 80}} />
      </Animated.ScrollView>

      <FloatingPositionCard />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 12,
  },
  profileCard: {
    borderRadius: 20,
    padding: 24,
    margin: 16,
    marginTop: 8,
    shadowColor: theme.colors.primaryDark,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileInfo: {
    marginLeft: 16,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 1,
  },
  profileUsername: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 5,
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rankText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 6,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  statIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#E5E7EB',
  },
  activeTab: {
    backgroundColor: theme.colors.primaryDark,
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  leaderboardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 50,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  profileItem: {
    backgroundColor: '#F5F3FF',
    borderRadius: 12,
    marginHorizontal: -8,
    paddingHorizontal: 8,
  },
  leaderboardItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankIndicator: {
    width: 32,
    alignItems: 'center',
    marginRight: 8,
  },
  rankNumberContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  userInfo: {
    flex: 1,
    marginLeft: 15,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalPointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  userStats: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  progressCircleContainer: {
    position: 'relative',
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.primaryDark,
  },
  floatingCard: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 20 : 16,
    left: 16,
    right: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 999,
    overflow: 'hidden',
  },
  floatingCardGradient: {
    padding: 16,
  },
  floatingCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primaryDark,
    marginBottom: 12,
  },
  floatingCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  floatingCardRank: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    width: 24,
    textAlign: 'center',
  },
  floatingCardUserInfo: {
    flex: 1,
  },
  floatingCardUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  floatingCardAchievements: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    padding: 16,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  paginationButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  pageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginHorizontal: 8,
  },
});

export default LeaderBoardScreen;
