import React, {useState, useMemo, useEffect, useRef} from 'react';
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
  RefreshControl,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {useNavigation} from '@react-navigation/native';
import useAiRiskStore from '../utils/useAiRiskStore';
import {theme} from '../contants/theme';
import CommonDialog from '../commons/CommonDialog';
import ContentLoader, {Rect} from 'react-content-loader/native';
import {formatDate} from '../utils/utils_format';

const filters = ['All', 'High', 'Moderate', 'Normal'];
const {width} = Dimensions.get('window');

const RiskWarningListScreen = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [dialogMessage, setDialogMessage] = useState('');
  const navigation = useNavigation();
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // Step 1: Add sort state

  const {
    healthAlerts,
    isLoadingAlerts,
    error,
    fetchHealthAlerts,
    deleteHealthAlert,
    isLoading,
    status,
    message,
    searchHealthAlerts,
  } = useAiRiskStore();

  useEffect(() => {
    fetchHealthAlerts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHealthAlerts();
    setRefreshing(false);
  };

  const debouncedSearch = (query: string, filter: string) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(
      () => searchHealthAlerts(query, filter),
      500,
    );
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    debouncedSearch(searchQuery, filter);
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    debouncedSearch(text, activeFilter);
  };

  const handleDeleteAlert = (alertId: string) => {
    setSelectedAlertId(alertId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteAlert = async () => {
    if (!selectedAlertId) return;

    try {
      const success = await deleteHealthAlert(selectedAlertId);
      setShowDeleteDialog(false);

      if (success) {
        setDialogMessage('Health alert deleted successfully');
        setShowSuccessDialog(true);
      } else {
        setDialogMessage(message || 'Failed to delete health alert');
        setShowErrorDialog(true);
      }
    } catch (error) {
      console.error('Error deleting health alert:', error);
      setDialogMessage('An unexpected error occurred');
      setShowErrorDialog(true);
    } finally {
      setSelectedAlertId(null);
    }
  };

  const getSeverityColor = (severity: string) => {
    const severityLower = severity.toLowerCase();
    if (severityLower.includes('high')) return theme.colors.error;
    if (severityLower.includes('moderate')) return theme.colors.warning;
    if (severityLower.includes('normal')) return theme.colors.success;
    return theme.colors.gray;
  };

  const getSeverityIcon = (severity: string) => {
    const severityLower = severity.toLowerCase();
    if (severityLower.includes('high')) return 'alert-circle';
    if (severityLower.includes('moderate')) return 'warning';
    if (severityLower.includes('normal')) return 'checkmark-circle';
    return 'information-circle';
  };

  const getActivityIcon = (type: string) => {
    const typeLower = type.toLowerCase();
    if (typeLower.includes('biking')) return 'bicycle';
    if (typeLower.includes('running')) return 'walk';
    if (typeLower.includes('swimming')) return 'water';
    return 'fitness';
  };

  const filteredRiskItems = useMemo(() => {
    if (!healthAlerts?.length) return [];

    const query = searchQuery.toLowerCase();
    let filtered = healthAlerts.filter(
      item =>
        item.alert_message.toLowerCase().includes(query) ||
        item.AIHealthAlertType.type_name.toLowerCase().includes(query),
    );

    if (activeFilter !== 'All') {
      filtered = filtered.filter(
        item => item.severity.toLowerCase() === activeFilter.toLowerCase(),
      );
    }

    filtered = [...filtered].sort((a, b) => {
      const scoreA = a.score || 0;
      const scoreB = b.score || 0;
      return sortOrder === 'asc' ? scoreA - scoreB : scoreB - scoreA;
    });

    return filtered;
  }, [activeFilter, searchQuery, healthAlerts, sortOrder]);

  const renderLoadingSkeletons = () => (
    <View style={styles.loadingContainer}>
      {Array(5)
        .fill(0)
        .map((_, index) => (
          <ContentLoader
            key={index}
            speed={1.5}
            width={width - 32}
            height={120}
            viewBox={`0 0 ${width - 32} 120`}
            backgroundColor="#f3f3f3"
            foregroundColor="#ecebeb"
            style={styles.skeletonItem}>
            <Rect x="0" y="0" rx="8" ry="8" width={width - 32} height={120} />
            <Rect x={16} y={16} rx="4" ry="4" width="60%" height={20} />
            <Rect x={16} y={44} rx="4" ry="4" width="80%" height={16} />
            <Rect x={16} y={68} rx="4" ry="4" width="30%" height={14} />
            <Rect x={16} y={90} rx="4" ry="4" width={100} height={16} />
            <Rect
              x={width - 132}
              y={90}
              rx="4"
              ry="4"
              width={100}
              height={16}
            />
          </ContentLoader>
        ))}
    </View>
  );

  const renderRiskItem = (item: any) => (
    <View
      key={item.id}
      style={[
        styles.riskItemContainer,
        {
          borderLeftColor: getSeverityColor(item.severity),
        },
      ]}>
      <View style={styles.riskHeader}>
        <View style={styles.activityTag}>
          <Icon
            name={getActivityIcon(item.AIHealthAlertType.type_name)}
            size={14}
            color={theme.colors.primaryDark}
          />
          <Text style={styles.activityTagText}>
            {item.AIHealthAlertType.type_name}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteAlert(item.id)}
          disabled={isLoading}>
          {isLoading && status === 'loading' ? (
            <ActivityIndicator size="small" color="#EF4444" />
          ) : (
            <Icon name="trash-outline" size={16} color="#EF4444" />
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.riskContent}
        onPress={() =>
          navigation.navigate(
            'RiskWarningScreen' as never,
            {alertId: item.id} as never,
          )
        }>
        <Text style={styles.riskTitle} numberOfLines={2}>
          {item.AIHealthAlertType.type_name} Result:
        </Text>
        <Text style={styles.riskDescription} numberOfLines={2}>
          {item.alert_message}
        </Text>

        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Icon
              name="map-outline"
              size={14}
              color={theme.colors.primaryDark}
            />
            <Text style={styles.metricText}>{item.distance} km</Text>
          </View>
          <View style={styles.metricItem}>
            <Icon name="footsteps" size={14} color={theme.colors.primaryDark} />
            <Text style={styles.metricText}>{item.step} steps</Text>
          </View>
          <View style={styles.metricItem}>
            <Icon
              name="speedometer-outline"
              size={14}
              color={theme.colors.primaryDark}
            />
            <Text style={styles.metricText}>{item.pace} min/km</Text>
          </View>
          <View style={styles.metricItem}>
            <Icon
              name="heart-outline"
              size={14}
              color={theme.colors.primaryDark}
            />
            <Text style={styles.metricText}>{item.heart_rate_max} bpm</Text>
          </View>
        </View>

        <View style={styles.riskFooter}>
          <View style={styles.dateContainer}>
            <Icon name="calendar" size={14} color="#64748B" />
            <Text style={styles.dateText}>{formatDate(item.alert_date)}</Text>
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
                      Number(item.score) < 30
                        ? theme.colors.success
                        : Number(item.score) < 60
                        ? theme.colors.warning
                        : theme.colors.error,
                  },
                ]}>
                {item.score}/100
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name="warning" size={24} color={theme.colors.primaryDark} />
          <Text style={styles.headerTitle}>Risk analysis</Text>
          <TouchableOpacity
            onPress={() => setShowInfoDialog(true)}
            style={styles.infoButton}>
            <Icon
              name="information-circle-outline"
              size={20}
              color={theme.colors.primaryDark}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('ManageNotificationsScreen' as never)
            }>
            <Icon
              name="notifications-outline"
              size={24}
              color={theme.colors.primaryDark}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('LeaderBoardScreen' as never)}>
            <Icon
              name="trophy-outline"
              size={24}
              color={theme.colors.primaryDark}
            />
          </TouchableOpacity>
        </View>
      </View>

      <CommonDialog
        visible={showInfoDialog}
        onClose={() => setShowInfoDialog(false)}
        title="AI Risk Analysis"
        content={
          <View>
            <Text style={styles.dialogText}>
              Our AI analyzes your running data to identify potential health
              risks and performance insights.
            </Text>
            <Text
              style={[styles.dialogText, {marginTop: 12, fontWeight: 'bold'}]}>
              Key factors analyzed:
            </Text>
            <View style={styles.dialogBullet}>
              <Text style={styles.dialogText}>
                • Distance and duration trends
              </Text>
              <Text style={styles.dialogText}>• Heart rate patterns</Text>
              <Text style={styles.dialogText}>
                • Step cadence and consistency
              </Text>
              <Text style={styles.dialogText}>• Average pace fluctuations</Text>
              <Text style={styles.dialogText}>
                • Route difficulty and elevation
              </Text>
              <Text style={styles.dialogText}>
                • Recovery time between runs
              </Text>
            </View>
          </View>
        }
        actionButtons={[
          {
            label: 'Got it',
            variant: 'contained',
            color: theme.colors.primaryDark,
            handler: () => setShowInfoDialog(false),
          },
        ]}
      />

      <CommonDialog
        visible={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        title="Delete Health Alert"
        content={
          <Text style={styles.dialogText}>
            Are you sure you want to delete this health alert? This action
            cannot be undone.
          </Text>
        }
        actionButtons={[
          {
            label: 'Cancel',
            variant: 'outlined',
            color: theme.colors.primaryDark,
            handler: () => setShowDeleteDialog(false),
          },
          {
            label: 'Delete',
            variant: 'contained',
            color: theme.colors.error,
            handler: confirmDeleteAlert,
          },
        ]}
      />

      <CommonDialog
        visible={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        title="Success"
        content={<Text style={styles.dialogText}>{dialogMessage}</Text>}
        actionButtons={[
          {
            label: 'OK',
            variant: 'contained',
            color: theme.colors.primaryDark,
            handler: () => setShowSuccessDialog(false),
          },
        ]}
      />

      <CommonDialog
        visible={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        title="Error"
        content={<Text style={styles.dialogText}>{dialogMessage}</Text>}
        actionButtons={[
          {
            label: 'OK',
            variant: 'contained',
            color: theme.colors.error,
            handler: () => setShowErrorDialog(false),
          },
        ]}
      />
      <View style={{flexDirection: 'row', marginHorizontal: 16, gap: 10,  marginVertical: 8}}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search health alerts"
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={handleSearchChange}
          />
          {searchQuery && (
            <TouchableOpacity onPress={() => handleSearchChange('')}>
              <Icon name="close-circle" size={18} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
        >
          <Icon name={sortOrder === "asc" ? "filter" : "filter-outline"} size={22} color="#64748B" />
        </TouchableOpacity>
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

      <ScrollView
        style={styles.riskList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primaryDark]}
            tintColor={theme.colors.primaryDark}
          />
        }>
        {isLoadingAlerts ? (
          renderLoadingSkeletons()
        ) : error ? (
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
        ) : filteredRiskItems.filter(item => !item.is_deleted).length > 0 ? (
          filteredRiskItems.filter(item => !item.is_deleted).map(renderRiskItem)
        ) : (
          <View style={styles.emptyState}>
            <Icon name="search-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyStateTitle}>No results found</Text>
            <Text style={styles.emptyStateDescription}>
              Try adjusting your search or filter to find what you're looking
              for
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 10,
    color: '#000',
  },
  infoButton: {
    marginLeft: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000000",
    paddingVertical: 0,
    marginLeft: 8,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filtersWrapper: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    gap: 12,
    flexDirection: 'row',
  },
  filterTab: {
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 80,
  },
  filterTabActive: {
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
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
    marginRight: 6,
  },
  filterText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  riskList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    paddingVertical: 8,
  },
  skeletonItem: {
    marginBottom: 16,
  },
  riskItemContainer: {
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderLeftWidth: 4,
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  activityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 111, 165, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activityTagText: {
    fontSize: 12,
    color: theme.colors.primaryDark,
    fontWeight: '500',
    marginLeft: 4,
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  riskContent: {
    flex: 1,
  },
  riskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    lineHeight: 22,
  },
  riskDescription: {
    color: '#000000b7',
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '48%',
  },
  metricText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  riskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 13,
    color: '#64748B',
  },
  riskStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  riskLevel: {
    fontSize: 13,
    fontWeight: '600',
  },
  score: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: theme.colors.primaryDark,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dialogText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  dialogBullet: {
    marginLeft: 16,
    marginTop: 8,
  },
});

export default RiskWarningListScreen;
