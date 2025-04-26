import React from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {PieChart} from 'react-native-gifted-charts';
import {CommonAvatar} from '../../commons/CommonAvatar';
import {theme} from '../../contants/theme';
import {capitalizeFirstLetter} from '../../utils/utils_format';

interface LeaderboardItem {
  id: string;
  name: string;
  username: string;
  currentLevel: string;
  nextLevel: string | null;
  pointsPercentage: number;
  pointsToNextLevel: number;
  totalPoints: number;
  avatar?: string | null;
}

interface LBLeaderboardTableProps {
  data: LeaderboardItem[];
  currentUserId?: string;
  activeTab: 'All Time' | 'Daily' | 'Weekly' | 'Monthly';
  page: number;
  limit: number;
  onPageChange: (direction: 'prev' | 'next') => void;
}

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

const renderRankIndicator = (rank: number) => {
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

const LeaderboardItem = ({
  item,
  index,
  isProfile,
}: {
  item: LeaderboardItem;
  index: number;
  isProfile: boolean;
}) => {
  return (
    <View style={[styles.leaderboardItem, isProfile && styles.profileItem]}>
      <View style={styles.leaderboardItemLeft}>
        <View style={styles.rankIndicator}>
          {renderRankIndicator(index + 1)}
        </View>
        <CommonAvatar uri={item?.avatar || undefined} size={35} />
        <View style={styles.userInfo}>
          <View style={styles.nameContainer}>
            <Text style={styles.userName}>
              {isProfile ? 'You' : item.name || 'Anonymous'}
            </Text>
            {!isProfile && (
              <Text style={styles.userUsername}>@{item.username}</Text>
            )}
          </View>
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

export const LBLeaderboardTable = ({
  data,
  currentUserId,
  activeTab,
  page,
  limit,
  onPageChange,
}: LBLeaderboardTableProps) => {
  return (
    <View style={styles.leaderboardContainer}>
      <FlatList
        data={data}
        renderItem={({item, index}) => (
          <LeaderboardItem
            item={item}
            index={index}
            isProfile={item.id === currentUserId}
          />
        )}
        keyExtractor={item => item.id}
        scrollEnabled={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No leaderboard data available</Text>
        }
      />
      {activeTab === 'All Time' && (
        <View style={styles.paginationContainer}>
          <View style={styles.paginationButton}>
            <Icon
              name="chevron-back"
              size={20}
              color={page === 1 ? '#9CA3AF' : '#4B5563'}
              onPress={() => onPageChange('prev')}
            />
          </View>

          <Text style={styles.pageText}>Page {page}</Text>

          <View style={styles.paginationButton}>
            <Icon
              name="chevron-forward"
              size={20}
              color={data.length < limit ? '#9CA3AF' : '#4B5563'}
              onPress={() => onPageChange('next')}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  userUsername: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
    fontWeight: '300',
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
  pageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginHorizontal: 8,
  },
});