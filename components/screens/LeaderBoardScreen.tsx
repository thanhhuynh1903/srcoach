'use client';

import {useState} from 'react';
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
// Mock data for the leaderboard
const leaderboardData = [
  {
    id: '1',
    name: 'Sarah Johnson',
    points: 3850,
    badges: 12,
    percentage: 95,
    avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
  },
  {
    id: '2',
    name: 'Michael Chen',
    points: 3720,
    badges: 10,
    percentage: 92,
    avatar: 'https://randomuser.me/api/portraits/men/44.jpg',
  },
  {
    id: '3',
    name: 'Emily Davis',
    points: 3590,
    badges: 9,
    percentage: 88,
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
  },
  {
    id: '4',
    name: 'Alex Thompson',
    points: 3200,
    badges: 8,
    percentage: 82,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: '5',
    name: 'David Wilson',
    points: 3050,
    badges: 7,
    percentage: 78,
    avatar: 'https://randomuser.me/api/portraits/men/86.jpg',
  },
  {
    id: '6',
    name: 'Lisa Anderson',
    points: 2890,
    badges: 6,
    percentage: 75,
    avatar: 'https://randomuser.me/api/portraits/women/17.jpg',
  },
];

// Current user data
const currentUser = {
  id: '12',
  name: 'You',
  points: 1540,
  achievements: 3,
  avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
};

const LeaderBoardScreen = ({navigation}) => {
  const [activeTab, setActiveTab] = useState('All Time');

  // Replace the CircularProgress component with a PieChart implementation
  const CircularProgress = ({percentage}) => {
    const pieData = [
      {
        value: percentage,
        color: '#5B5FEF',
      },
      {
        value: 100 - percentage,
        color: '#E2E8F0',
      },
    ];

    return (
      <View style={styles.progressCircleContainer}>
        <PieChart
          data={pieData}
          donut
          radius={20}
          innerRadius={15}
          innerCircleColor={'#fff'}
          showGradient={false}
          showText={false}
          textColor={'#5B5FEF'}
          textSize={10}
          fontWeight={'bold'}
        />
        <Text style={styles.progressText}>{percentage}%</Text>
      </View>
    );
  };

  // Render rank indicator (crown, medal, trophy, or number)
  const renderRankIndicator = index => {
    if (index === 0) {
      return <Icon name="ribbon-outline" size={24} color="#FFD700" />;
    } else if (index === 1) {
      return <Icon name="medal-outline" size={24} color="#C0C0C0" />;
    } else if (index === 2) {
      return <Icon name="trophy-outline" size={24} color="#CD7F32" />;
    } else {
      return <Text style={styles.rankNumber}>{index + 1}</Text>;
    }
  };

  // Render leaderboard item
  const renderLeaderboardItem = ({item, index}) => (
    <View style={styles.leaderboardItem}>
      <View style={styles.leaderboardItemLeft}>
        <View style={styles.rankIndicator}>{renderRankIndicator(index)}</View>
        <Image source={{uri: item.avatar}} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userStats}>
            {item.points.toLocaleString()} pts • {item.badges} badges
          </Text>
        </View>
      </View>
      <CircularProgress percentage={item.percentage} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <BackButton size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <View style={styles.shareButton}>
          <Icon name="share-outline" size={24} color="#FFFF" />
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Image
              source={{uri: 'https://randomuser.me/api/portraits/men/22.jpg'}}
              style={styles.profileAvatar}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>John Doe</Text>
              <View style={styles.rankContainer}>
                <Icon name="stats-chart" size={16} color="#fff" />
                <Text style={styles.rankText}>Current Rank #7</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Icon name="trophy" size={20} color="#fff" />
              <Text style={styles.statValue}>2,450 pts</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="star" size={20} color="#fff" />
              <Text style={styles.statValue}>5 Badges</Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
          </View>
        </View>

        {/* Time Filter Tabs */}
        <View style={styles.tabsContainer}>
          {['All Time', 'This Week', 'This Month'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Leaderboard List */}
        <View style={styles.leaderboardContainer}>
          <FlatList
            data={leaderboardData}
            renderItem={renderLeaderboardItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Your Position */}
        <View style={styles.yourPositionContainer}>
          <Text style={styles.yourPositionTitle}>Your Position</Text>
          <View style={styles.yourPositionContent}>
            <View style={styles.yourPositionLeft}>
              <Text style={styles.yourRank}>12</Text>
              <Image source={{uri: currentUser.avatar}} style={styles.avatar} />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{currentUser.name}</Text>
                <View style={styles.achievementsContainer}>
                  <Icon name="time-outline" size={14} color="#6B7280" />
                  <Text style={styles.achievementsText}>
                    {currentUser.achievements} achievements today
                  </Text>
                </View>
              </View>
            </View>
            <Text style={styles.yourPoints}>
              {currentUser.points.toLocaleString()}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  shareButton: {
    padding: 4,
  },
  profileCard: {
    backgroundColor: '#5B5FEF',
    borderRadius: 16,
    padding: 20,
    margin: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    marginLeft: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  progressContainer: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    width: '65%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
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
    backgroundColor: '#F1F5F9',
  },
  activeTab: {
    backgroundColor: '#5B5FEF',
  },
  tabText: {
    fontSize: 14,
    color: '#64748B',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  leaderboardContainer: {
    paddingHorizontal: 16,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  leaderboardItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankIndicator: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 0,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  userStats: {
    fontSize: 14,
    color: '#64748B',
  },
  progressCircleContainer: {
    position: 'relative',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: '600',
    color: '#5B5FEF',
  },
  yourPositionContainer: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 16,
    margin: 16,
    marginTop: 24,
  },
  yourPositionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5B5FEF',
    marginBottom: 12,
  },
  yourPositionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  yourPositionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  yourRank: {
    width: 24,
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
    marginRight: 12,
  },
  achievementsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementsText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4,
  },
  yourPoints: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5B5FEF',
  },
});

export default LeaderBoardScreen;
