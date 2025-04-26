import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
  Platform,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ContentLoader from 'react-content-loader/native';
import BackButton from '../../BackButton';
import useUserPointsStore from '../../utils/useUserPointsStore';
import {useLoginStore} from '../../utils/useLoginStore';
import {theme} from '../../contants/theme';
import {LBSelfCard} from './LBSelfCard';
import {LBLeaderboardTable} from './LBLeaderboardTable';
import { CommonAvatar } from '../../commons/CommonAvatar';
import Icon from '@react-native-vector-icons/ionicons';
import { capitalizeFirstLetter } from '../../utils/utils_format';
import {Rect, Circle} from 'react-content-loader/native';

const {width} = Dimensions.get('window');

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
        <LBSelfCard
          profile={profile}
          pointsData={pointsData}
          profileRank={profileRank}
        />

        <View style={styles.tabsContainer}>
          {['All Time', 'Daily', 'Weekly', 'Monthly'].map(renderTab)}
        </View>

        {isLoading ? (
          renderLoader()
        ) : (
          <LBLeaderboardTable
            data={currentLeaderboard()}
            currentUserId={profile?.id}
            activeTab={activeTab}
            page={page}
            limit={limit}
            onPageChange={handlePageChange}
          />
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
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  userStats: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
});

export default LeaderBoardScreen;