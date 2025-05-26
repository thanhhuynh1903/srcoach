import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import useUserPointsStore from '../../utils/useUserPointsStore';
import {theme} from '../../contants/theme';
import Icon from '@react-native-vector-icons/ionicons';
import {format} from 'date-fns';
import BackButton from '../../BackButton';
import {CommonAvatar} from '../../commons/CommonAvatar';
import LinearGradient from 'react-native-linear-gradient';
import ContentLoader, {Rect, Circle} from 'react-content-loader/native';

interface PointHistoryItem {
  id: string;
  user_id: string;
  point_earn: number;
  reason: string;
  created_at: string;
  PointReason: {
    type: string;
    description: string;
  };
}

interface UserData {
  id: string;
  name: string;
  username: string;
  email: string;
  image: {
    url: string;
  };
  points: number;
  user_level: string;
  roles: string[];
}

interface PointsHistoryResponse {
  data: PointHistoryItem[];
  user: UserData;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function UserPointsHistoryScreen() {
  const {getMyPointsHistory} = useUserPointsStore();
  const [historyData, setHistoryData] = useState<PointsHistoryResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const initData = async (page = 1) => {
    try {
      setLoading(true);
      const data = await getMyPointsHistory(page, 10);
      setHistoryData(data);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching points history:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      initData();
      return () => {};
    }, []),
  );

  const renderUserLevelIcon = (level: string) => {
    switch (level) {
      case 'bronze':
        return <Icon name="medal" size={20} color="#cd7f32" />;
      case 'silver':
        return <Icon name="medal" size={20} color="#c0c0c0" />;
      case 'gold':
        return <Icon name="medal" size={20} color="#ffd700" />;
      case 'platinum':
        return <Icon name="medal" size={20} color="#e5e4e2" />;
      default:
        return <Icon name="medal" size={20} color="#cd7f32" />;
    }
  };

  const renderRoleChip = () => {
    if (!historyData?.user?.roles) return null;

    if (historyData.user.roles.includes('expert')) {
      return (
        <View style={[style.chip, style.expertChip]}>
          <Icon name="trophy" size={14} color="#FFD700" />
          <Text style={style.chipText}>Expert</Text>
        </View>
      );
    } else if (historyData.user.roles.includes('runner')) {
      return (
        <View style={[style.chip, style.runnerChip]}>
          <Icon name="walk" size={14} color="#FFF" />
          <Text style={style.chipText}>Runner</Text>
        </View>
      );
    }
    return null;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy hh:mm a');
  };

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const renderLoadingSkeleton = () => (
    <View style={style.scrollContainer}>
      <ContentLoader 
        speed={1.5}
        width="100%"
        height={180}
        viewBox="0 0 400 180"
        backgroundColor="#f3f3f3"
        foregroundColor="#ecebeb"
      >
        <Circle cx="30" cy="30" r="25" />
        <Rect x="70" y="15" rx="4" ry="4" width="150" height="15" />
        <Rect x="70" y="40" rx="4" ry="4" width="100" height="10" />
        <Rect x="0" y="80" rx="4" ry="4" width="120" height="20" />
        <Rect x="280" y="80" rx="4" ry="4" width="80" height="20" />
        <Rect x="0" y="120" rx="4" ry="4" width="100%" height="1" />
        <Rect x="0" y="140" rx="4" ry="4" width="70%" height="15" />
        <Rect x="0" y="160" rx="4" ry="4" width="40%" height="12" />
        <Rect x="320" y="150" rx="4" ry="4" width="60" height="20" />
      </ContentLoader>
    </View>
  );

  return (
    <View style={style.container}>
      <View style={style.header}>
        <BackButton size={24} style={style.backButton} />
        <Text style={style.title}>User Points</Text>
      </View>

      {loading && renderLoadingSkeleton()}

      {historyData && !loading && (
        <ScrollView contentContainerStyle={style.scrollContainer}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryDark]}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            style={style.summaryCard}>
            <View style={style.userInfoRow}>
              <CommonAvatar
                size={50}
                uri={historyData.user?.image?.url}
                style={{marginRight: 10}}
              />
              <View style={style.userTextInfo}>
                <Text style={style.userName}>{historyData.user?.name}</Text>
                <Text style={style.username}>
                  @{historyData.user?.username}
                </Text>
                {renderRoleChip()}
              </View>
            </View>

            <View style={style.pointsRow}>
              <View style={style.pointsContainer}>
                <Icon name="trophy" size={24} color="#FFD700" />
                <Text style={style.pointsText}>
                  {formatNumber(historyData.user?.points)} pts
                </Text>
              </View>
              <View style={style.levelContainer}>
                {renderUserLevelIcon(historyData.user?.user_level)}
                <Text style={style.levelText}>
                  {historyData.user?.user_level.charAt(0).toUpperCase() +
                    historyData.user?.user_level.slice(1)}
                </Text>
              </View>
            </View>
          </LinearGradient>

          <View style={style.historyList}>
            <Text style={style.sectionTitle}>Points History</Text>
            {historyData.data?.map(item => (
              <View key={item.id} style={style.historyItem}>
                <View style={style.historyItemContent}>
                  <Text style={style.historyReason}>
                    {item.PointReason.description}
                  </Text>
                  <Text style={style.historyDate}>
                    {formatDate(item.created_at)}
                  </Text>
                </View>
                <Text
                  style={[
                    style.historyPoints,
                    {color: item.point_earn >= 0 ? '#4CAF50' : '#F44336'},
                  ]}>
                  {item.point_earn >= 0 ? '+' : ''}
                  {formatNumber(item.point_earn)}
                </Text>
              </View>
            ))}
          </View>

          <View style={style.paginationContainer}>
            <TouchableOpacity
              style={[
                style.paginationButton,
                currentPage === 1 && style.disabledButton,
              ]}
              onPress={() => initData(currentPage - 1)}
              disabled={currentPage === 1}>
              <Icon name="chevron-back" size={20} color="#333" />
            </TouchableOpacity>

            <Text style={style.pageText}>
              Page {currentPage} of {historyData.meta?.totalPages}
            </Text>

            <TouchableOpacity
              style={[
                style.paginationButton,
                currentPage === historyData.meta?.totalPages && style.disabledButton,
              ]}
              onPress={() => initData(currentPage + 1)}
              disabled={currentPage === historyData.meta?.totalPages}>
              <Icon name="chevron-forward" size={20} color="#333" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    gap: 10,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userTextInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  username: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    color: '#FFF',
  },
  runnerChip: {
    backgroundColor: '#4CAF50',
  },
  expertChip: {
    backgroundColor: '#FFD700',
  },
  pointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 8,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  levelText: {
    fontSize: 14,
    color: '#ffffff',
    marginLeft: 8,
    textTransform: 'capitalize',
  },
  historyList: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  historyItemContent: {
    flex: 1,
  },
  historyReason: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    color: '#888',
  },
  historyPoints: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  paginationButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  disabledButton: {
    opacity: 0.5,
  },
  pageText: {
    color: '#666',
  },
});