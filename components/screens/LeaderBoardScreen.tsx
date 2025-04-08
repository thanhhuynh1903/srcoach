import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  ScrollView,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {PieChart} from 'react-native-gifted-charts';
import BackButton from '../BackButton';
import useUserPointsStore from '../utils/useUserPointsStore';
import {useLoginStore} from '../utils/useLoginStore';
import { capitalizeFirstLetter } from '../utils/utils_format';

const LeaderBoardScreen = ({navigation}) => {
  const [activeTab, setActiveTab] = useState('All Time');
  const [profileRank, setprofileRank] = useState(0);
  const {pointsData, leaderboard, isLoading, getMyPoints, getLeaderboard} =
    useUserPointsStore();
  const {profile} = useLoginStore();

  useEffect(() => {
    getMyPoints();
    getLeaderboard();
  }, []);

  useEffect(() => {
    if (leaderboard.length > 0 && profile?.id) {
      const rank = leaderboard.findIndex(user => user.id === profile.id) + 1;
      setprofileRank(rank || leaderboard.length + 1);
    }
  }, [leaderboard, profile]);

  useEffect(() => {
    console.log(pointsData)
  }, [pointsData, profile]);

  // Circular progress component with pie chart
  const CircularProgress = ({percentage}) => {
    const pieData = [
      {
        value: percentage,
        color: '#7E3AF2',
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

  // Render rank indicator with cool icons
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

  // Render leaderboard item with animated styling
  const renderLeaderboardItem = ({item, index}) => {
    const isprofile = item.id === profile?.id;
    return (
      <View style={[styles.leaderboardItem, isprofile && styles.profileItem]}>
        <View style={styles.leaderboardItemLeft}>
          <View style={styles.rankIndicator}>{renderRankIndicator(index)}</View>
          <Image
            source={{
              uri: `https://randomuser.me/api/portraits/${
                index % 2 === 0 ? 'men' : 'women'
              }/${index + 10}.jpg`,
            }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {isprofile ? 'You' : item.name || item.username || 'Anonymous'}
            </Text>
            <View style={styles.totalPointsContainer}>
              <Icon name="trophy" size={14} color="#F59E0B" />
              <Text style={styles.userStats}>
                {item.totalPoints?.toLocaleString() || 0} pts
              </Text>
            </View>
          </View>
        </View>
        <CircularProgress
          percentage={Math.min(
            100,
            Math.floor((item.totalPoints / (leaderboard[0]?.totalPoints || 1)) * 100),
          )}
        />
      </View>
    );
  };

  // Time filter tabs with smooth animation
  const renderTab = (tab: string) => (
    <TouchableOpacity
      key={tab}
      style={[styles.tab, activeTab === tab && styles.activeTab]}
      onPress={() => setActiveTab(tab)}>
      <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
        {tab}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Header with gradient background */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <BackButton size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leaderboard</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Image
              source={{
                uri:
                  profile?.avatar ||
                  'https://randomuser.me/api/portraits/men/1.jpg',
              }}
              style={styles.profileAvatar}
            />
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
                <Icon name="trophy" size={20} color="#7E3AF2" />
              </View>
              <Text style={styles.statValue}>
                {pointsData?.points?.toLocaleString() || '0'} pts
              </Text>
            </View>
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Icon name="star" size={20} color="#7E3AF2" />
              </View>
              <Text style={styles.statValue}>
                Level: {capitalizeFirstLetter(pointsData?.level || '') || 'Unknown'}
              </Text>
            </View>
          </View>

          {/* Animated progress bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(
                      100,
                      Math.floor(
                        (pointsData?.points / (pointsData?.points + pointsData?.pointsToNextLevel || 1)) * 100,
                      ),
                    )}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressLabel}>
              {pointsData?.pointsToNextLevel|| 0} pts to next level
            </Text>
          </View>
        </View>

        {/* Time Filter Tabs */}
        <View style={styles.tabsContainer}>
          {['All Time', 'This Week', 'This Month'].map(renderTab)}
        </View>

        {/* Leaderboard List */}
        <View style={styles.leaderboardContainer}>
          {isLoading && leaderboard.length === 0 ? (
            <Text style={styles.loadingText}>Loading leaderboard...</Text>
          ) : (
            <FlatList
              data={leaderboard}
              renderItem={renderLeaderboardItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  No leaderboard data available
                </Text>
              }
            />
          )}
        </View>

        {/* Current User Position */}
        {profile && (
          <View style={styles.yourPositionContainer}>
            <Text style={styles.yourPositionTitle}>Your Position</Text>
            <View style={styles.yourPositionContent}>
              <View style={styles.yourPositionLeft}>
                <Text style={styles.yourRank}>{profileRank}</Text>
                <Image
                  source={{
                    uri:
                      profile.avatar ||
                      'https://randomuser.me/api/portraits/men/1.jpg',
                  }}
                  style={styles.avatar}
                />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>You</Text>
                  <View>
                    <Icon name="trophy" size={14} color="#F59E0B" />
                    <Text style={styles.userStats}>
                      {pointsData?.points?.toLocaleString() || '0'} pts
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>
                  {capitalizeFirstLetter(pointsData?.level) || 'Beginner'}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  profileCard: {
    backgroundColor: '#7E3AF2',
    borderRadius: 20,
    padding: 24,
    margin: 16,
    marginTop: 8,
    shadowColor: '#7E3AF2',
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
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
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
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#E5E7EB',
  },
  activeTab: {
    backgroundColor: '#7E3AF2',
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
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    color: '#7E3AF2',
  },
  yourPositionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  yourPositionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7E3AF2',
    marginBottom: 16,
  },
  yourPositionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  yourPositionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
    overflow: 'hidden',
  },
  yourRank: {
    width: 28,
    fontSize: 16,
    fontWeight: '700',
    color: '#4B5563',
    textAlign: 'center',
    marginRight: 12,
  },
  levelBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexShrink: 0,
    marginLeft: 8,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7E3AF2',
  },
  loadingText: {
    textAlign: 'center',
    color: '#6B7280',
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    padding: 16,
  },
});

export default LeaderBoardScreen;
