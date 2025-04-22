import {useState, useMemo, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  Alert,
  StatusBar,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {useNavigation} from '@react-navigation/native';
import useAiRiskStore from '../utils/useAiRiskStore';
import {theme} from '../contants/theme';

const filters = ['All', 'High', 'Moderate', 'Normal'];
const {width, height} = Dimensions.get('window');
const guidelineBaseWidth = 350;
const guidelineBaseHeight = 680;

const scale = (size: number) => (width / guidelineBaseWidth) * size;
const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;
const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

const RiskWarningListScreen = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const navigation = useNavigation();
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const {
    healthAlerts,
    isLoadingAlerts,
    error,
    fetchHealthAlerts,
    deleteHealthAlert,
    isLoading,
    message,
    searchHealthAlerts,
  } = useAiRiskStore();

  useEffect(() => {
    const fetchAlerts = async () => {
      await fetchHealthAlerts();
    };
    fetchAlerts();
  }, []);

  const debouncedSearch = (query: string, filter: string) => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      searchHealthAlerts(query, filter);
    }, 500);
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    debouncedSearch(searchQuery, filter);
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    debouncedSearch(text, activeFilter);
  };

  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  const handleDeleteAlert = (alertId: string) => {
    Alert.alert(
      'Delete Health Alert',
      'Are you sure you want to delete this health alert? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deleteHealthAlert(alertId);
              if (success) {
                Alert.alert('Success', 'Health alert deleted successfully');
              } else {
                Alert.alert(
                  'Error',
                  message || 'Failed to delete health alert',
                );
              }
            } catch (error) {
              console.error('Error deleting health alert:', error);
              Alert.alert('Error', 'An unexpected error occurred');
            }
          },
        },
      ],
      {cancelable: true},
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return '#EF4444';
      case 'moderate':
        return '#F97316';
      case 'low':
      case 'normal':
        return '#22C55E';
      default:
        return '#64748B';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'alert-circle';
      case 'moderate':
        return 'warning';
      case 'low':
      case 'normal':
        return 'checkmark-circle';
      default:
        return 'information-circle';
    }
  };

  const filteredRiskItems = useMemo(() => {
    if (!healthAlerts || healthAlerts.length === 0) return [];

    let filtered = healthAlerts.filter(
      item =>
        item.alert_message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.AIHealthAlertType.type_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
    );

    if (activeFilter !== 'All') {
      filtered = filtered.filter(item => item.severity === activeFilter);
    }

    return filtered;
  }, [activeFilter, searchQuery, healthAlerts]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoadingAlerts) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Icon name="warning" size={24} color={theme.colors.primaryDark} />
            <Text style={styles.headerTitle}>Risk Analysis</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading health alerts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Icon name="warning" size={24} color={theme.colors.primaryDark} />
            <Text style={styles.headerTitle}>Risk Analysis</Text>
          </View>
        </View>
        <View style={styles.emptyState}>
          <Icon name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.emptyStateTitle}>Error</Text>
          <Text style={styles.emptyStateDescription}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchHealthAlerts}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name="warning" size={24} color={theme.colors.primaryDark} />
          <Text style={styles.headerTitle}>Risk Analysis</Text>
        </View>
        <TouchableOpacity
          style={styles.infoButton}
          onPress={() => setShowInfoDialog(true)}>
          <Icon
            name="information-circle-outline"
            size={24}
            color={theme.colors.primaryDark}
          />
        </TouchableOpacity>
      </View>
      <View style={{backgroundColor: '#FFF'}}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={moderateScale(20)} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search health alerts"
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={handleSearchChange}
          />
          {searchQuery ? (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                handleSearchChange('');
              }}>
              <Icon
                name="close-circle"
                size={moderateScale(20)}
                color="#64748B"
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      <View style={styles.filtersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}>
          {filters.map(filter => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterTab,
                activeFilter === filter && styles.filterTabActive,
                filter === 'High' && styles.highRiskFilter,
                filter === 'Moderate' && styles.moderateRiskFilter,
                filter === 'Normal' && styles.normalRiskFilter,
                activeFilter === filter &&
                  filter === 'High' &&
                  styles.highRiskFilterActive,
                activeFilter === filter &&
                  filter === 'Moderate' &&
                  styles.moderateRiskFilterActive,
                activeFilter === filter &&
                  filter === 'Normal' &&
                  styles.normalRiskFilterActive,
              ]}
              onPress={() => handleFilterChange(filter)}>
              {filter !== 'All' && (
                <Icon
                  name={getSeverityIcon(filter)}
                  size={16}
                  color={
                    activeFilter === filter
                      ? '#FFFFFF'
                      : getSeverityColor(filter)
                  }
                  style={styles.filterIcon}
                />
              )}
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter && styles.filterTextActive,
                ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.riskList} showsVerticalScrollIndicator={false}>
        {filteredRiskItems.filter(item => !item.is_deleted).length > 0 ? (
          filteredRiskItems
            .filter(item => !item.is_deleted)
            .map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.riskItemContainer}
                onPress={() => {
                  navigation.navigate(
                    'RiskWarningScreen' as never,
                    {alertId: item.id} as never,
                  );
                }}
                activeOpacity={0.7}>
                <View style={styles.riskItem}>
                  <View
                    style={[
                      styles.severityLine,
                      {backgroundColor: getSeverityColor(item.severity)},
                    ]}
                  />
                  <View style={styles.riskItemHeader}>
                    <Text style={styles.riskTitle}>{item.alert_message}</Text>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={e => {
                        e.stopPropagation();
                        handleDeleteAlert(item.id);
                      }}
                      disabled={isLoading}>
                      {isLoading ? (
                        <ActivityIndicator size="small" color="#EF4444" />
                      ) : (
                        <Icon
                          name="trash-outline"
                          size={moderateScale(16)}
                          color="#EF4444"
                        />
                      )}
                    </TouchableOpacity>
                  </View>

                  <View style={styles.activityMetrics}>
                    <View style={styles.metricItem}>
                      <Icon name="footsteps" size={16} color="#2563EB" />
                      <Text style={styles.riskDescription}>
                        {item.distance} km
                      </Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Icon
                        name="speedometer-outline"
                        size={16}
                        color="#2563EB"
                      />
                      <Text style={styles.riskDescription}>
                        {item.step} steps
                      </Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Icon name="flash" size={16} color="yellow" />
                      <Text style={styles.riskDescription}>
                        {item.AIHealthAlertType.type_name}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.riskFooter}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                      }}>
                      <Icon
                        name="calendar"
                        size={moderateScale(16)}
                        color={'#2563EB'}
                      />
                      <Text style={styles.date}>
                        {formatDate(item.alert_date)}
                      </Text>
                    </View>
                    <View style={styles.riskStatus}>
                      <Text
                        style={[
                          styles.riskLevel,
                          {color: getSeverityColor(item.severity)},
                        ]}>
                        {item.severity} Risk
                      </Text>
                      {item.score !== undefined && item.score !== null && (
                        <Text
                          style={[
                            styles.score,
                            {
                              backgroundColor:
                                Number(item.score) < 45
                                  ? '#4CAF50'
                                  : Number(item.score) < 70
                                  ? '#FFA000'
                                  : '#FF4444',
                            },
                          ]}>
                          {item.score}/100
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
        ) : (
          <View style={styles.emptyState}>
            <Icon
              name="search-outline"
              size={moderateScale(48)}
              color="#CBD5E1"
            />
            <Text style={styles.emptyStateTitle}>No results found</Text>
            <Text style={styles.emptyStateDescription}>
              Try adjusting your search or filter to find what you're looking
              for
            </Text>
          </View>
        )}
        <View style={styles.listFooterPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(16),
    paddingVertical: verticalScale(12),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    marginLeft: moderateScale(10),
    color: '#0F172A',
  },
  infoButton: {
    padding: moderateScale(4),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: moderateScale(16),
    marginVertical: verticalScale(12),
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(12),
    backgroundColor: '#FFFFFF',
    gap: moderateScale(8),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(16),
    color: '#0F172A',
    padding: 0,
  },
  filtersWrapper: {
    backgroundColor: '#FFFFFF',
    paddingVertical: verticalScale(8),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filtersContainer: {
    paddingHorizontal: moderateScale(16),
    gap: moderateScale(12),
    flexDirection: 'row',
  },
  filterTab: {
    backgroundColor: '#F1F5F9',
    borderRadius: moderateScale(20),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: moderateScale(16),
    paddingVertical: verticalScale(6),
    minWidth: moderateScale(80),
  },
  filterTabActive: {
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: {width: 0, height: moderateScale(2)},
    shadowOpacity: 0.15,
    shadowRadius: moderateScale(4),
    elevation: 3,
  },
  highRiskFilter: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  moderateRiskFilter: {
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
  },
  normalRiskFilter: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  highRiskFilterActive: {
    backgroundColor: '#EF4444',
  },
  moderateRiskFilterActive: {
    backgroundColor: '#F97316',
  },
  normalRiskFilterActive: {
    backgroundColor: '#22C55E',
  },
  filterIcon: {
    marginRight: moderateScale(6),
  },
  filterText: {
    fontSize: moderateScale(14),
    color: '#64748B',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  riskList: {
    backgroundColor: '#FFF',
    flex: 1,
    paddingHorizontal: moderateScale(16),
    paddingTop: verticalScale(12),
  },
  riskItemContainer: {
    marginBottom: verticalScale(12),
  },
  riskItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    paddingLeft: moderateScale(20), // Make space for the severity line
    marginLeft: moderateScale(4), // Prevent content clipping
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: moderateScale(2)},
    shadowOpacity: 0.05,
    shadowRadius: moderateScale(4),
    elevation: 2,
  },

  severityLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: moderateScale(4),
    borderTopLeftRadius: moderateScale(12),
    borderBottomLeftRadius: moderateScale(12),
  },

  riskItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  severityIndicator: {
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(14),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(12),
  },
  riskTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
    lineHeight: moderateScale(22),
  },
  activityMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(16),
    marginBottom: verticalScale(8),
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(4),
  },
  riskDescription: {
    fontSize: moderateScale(14),
    color: '#64748B',
    lineHeight: moderateScale(20),
  },
  riskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: verticalScale(8),
  },
  date: {
    fontSize: moderateScale(12),
    color: '#94A3B8',
  },
  riskStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
  },
  riskLevel: {
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  scoreContainer: {
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(8),
    paddingVertical: verticalScale(2),
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  score: {
    fontSize: moderateScale(10),
    color: '#FFFFFF',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: moderateScale(8),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(12),
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(60),
    paddingHorizontal: moderateScale(20),
  },
  emptyStateTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#0F172A',
    marginTop: verticalScale(16),
    marginBottom: verticalScale(8),
  },
  emptyStateDescription: {
    fontSize: moderateScale(14),
    color: '#64748B',
    textAlign: 'center',
    lineHeight: moderateScale(20),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: verticalScale(12),
    fontSize: moderateScale(16),
    color: '#64748B',
  },
  retryButton: {
    marginTop: verticalScale(16),
    backgroundColor: '#2563EB',
    paddingHorizontal: moderateScale(24),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(8),
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(14),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  listFooterPadding: {
    height: verticalScale(20),
  },
});

export default RiskWarningListScreen;
