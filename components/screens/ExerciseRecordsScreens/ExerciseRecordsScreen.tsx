import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import ScreenWrapper from '../../ScreenWrapper';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useCallback, useState, useRef, useMemo} from 'react';
import {
  ExerciseSession,
  fetchExerciseSessionRecords,
  handleSyncButtonPress,
} from '../../utils/utils_healthconnect';
import {format, parseISO} from 'date-fns';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {theme} from '../../contants/theme';
import ToastUtil from '../../utils/utils_toast';
import {ERSContainer} from './ERSContainer';
import {ERSContainerSkeleton} from './ERSContainerSkeleton';
import {ERSInfoDialog} from './ERSInfoDialog';
import CommonDialog from '../../commons/CommonDialog';
import Slider from '@react-native-community/slider';
import {
  getIconFromExerciseType,
  getNameFromExerciseType,
} from '../../contants/exerciseType';

export default function ExerciseRecordsScreen() {
  const navigation = useNavigation();
  const [exerciseSessions, setExerciseSessions] = useState<ExerciseSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [accessDetailNavigation, setAccessDetailNavigation] = useState(true);

  // Filter states
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [minSteps, setMinSteps] = useState<number>(0);
  const [maxSteps, setMaxSteps] = useState<number>(10000);
  const [minDistance, setMinDistance] = useState<number>(0);
  const [maxDistance, setMaxDistance] = useState<number>(10000);
  const [selectedExerciseTypes, setSelectedExerciseTypes] = useState<string[]>([]);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'start' | 'end'>('start');

  // Calculate min/max values from data
  const {allExerciseTypes, stepsRange, distanceRange} = useMemo(() => {
    const types = new Set<string>();
    let minSteps = Infinity;
    let maxSteps = 0;
    let minDistance = Infinity;
    let maxDistance = 0;

    exerciseSessions.forEach(session => {
      types.add(session.exerciseType);
      const steps = session.total_steps || 0;
      const distance = session.total_distance || 0;

      if (steps < minSteps) minSteps = steps;
      if (steps > maxSteps) maxSteps = steps;
      if (distance < minDistance) minDistance = distance;
      if (distance > maxDistance) maxDistance = distance;
    });

    return {
      allExerciseTypes: Array.from(types),
      stepsRange: {
        min: minSteps === Infinity ? 0 : minSteps,
        max: maxSteps === 0 ? 10000 : maxSteps,
      },
      distanceRange: {
        min: minDistance === Infinity ? 0 : minDistance,
        max: maxDistance === 0 ? 10000 : maxDistance,
      },
    };
  }, [exerciseSessions]);

  const showSyncStatus = (message: string) => {
    setSyncStatus(message);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideSyncStatus = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setSyncStatus(null));
  };

  const handleSyncPress = async () => {
    try {
      setIsSyncing(true);
      setAccessDetailNavigation(false);
      showSyncStatus('Syncing data...');
      
      const result = await handleSyncButtonPress();
      
      if (result.type === 'SYNC_SUCCESS') {
        showSyncStatus('Sync completed successfully');
        await readSampleData();
      } else {
        showSyncStatus(result.message);
      }
    } catch (error) {
      showSyncStatus('Sync failed. Please try again');
      ToastUtil.error('Sync Error', 'Failed to sync exercise data');
    } finally {
      setIsSyncing(false);
      setAccessDetailNavigation(true);
      // Don't automatically hide the status - let user dismiss or it will hide on next sync
    }
  };

  const handleActivityPress = (id: string, clientRecordId: string) => {
    navigation.navigate('ExerciseRecordsDetailScreen' as never, {
      id,
      clientRecordId,
    });
  };

  const getFilteredSampleData = () => {
    let filteredSession = exerciseSessions;
    if (selectedExerciseTypes && selectedExerciseTypes.length > 0) {
      filteredSession = exerciseSessions.filter(s =>
        selectedExerciseTypes.includes(s.exerciseType),
      );
    }
    if (maxDistance) {
      filteredSession = filteredSession.filter(
        s => s.total_distance <= maxDistance,
      );
    }
    if (maxSteps) {
      filteredSession = filteredSession.filter(
        s => s.total_steps <= maxSteps,
      );
    }
    if (startDate) {
      filteredSession = filteredSession.filter(
        s => new Date(s.startTime) >= new Date(startDate),
      );
    }
    if (endDate) {
      filteredSession = filteredSession.filter(
        s => new Date(s.startTime) <= new Date(endDate),
      );
    }
    return filteredSession;
  };

  const readSampleData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchExerciseSessionRecords();
      setExerciseSessions(data);
    } catch (error) {
      setError('Failed to load health data');
      ToastUtil.error('An error occurred', 'Failed to load health data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    readSampleData();
  }, [startDate, endDate]);

  useFocusEffect(
    useCallback(() => {
      readSampleData();
    }, [startDate, endDate]),
  );

  const showDatePicker = (mode: 'start' | 'end') => {
    setDatePickerMode(mode);
    setDatePickerVisibility(true);
  };

  const handleDateConfirm = (date: Date) => {
    setDatePickerVisibility(false);
    if (datePickerMode === 'start') {
      setStartDate(date.toISOString());
    } else {
      setEndDate(date.toISOString());
    }
  };

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setMinSteps(0);
    setMaxSteps(stepsRange.max);
    setMinDistance(0);
    setMaxDistance(distanceRange.max);
    setSelectedExerciseTypes([]);
  };

  const applyFilters = () => {
    setShowFilterDialog(false);
    readSampleData();
  };

  const toggleExerciseType = (type: string) => {
    setSelectedExerciseTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type],
    );
  };

  const renderErrorState = () => (
    <View style={styles.emptyState}>
      <Icon name="warning" size={48} color="#FF5252" />
      <Text style={styles.emptyText}>Error loading data</Text>
      <Text style={styles.emptySubtext}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={readSampleData}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFilterBanner = () => {
    const activeFilters = [];
    if (startDate)
      activeFilters.push(`From: ${format(parseISO(startDate), 'MMM d, yyyy')}`);
    if (endDate)
      activeFilters.push(`To: ${format(parseISO(endDate), 'MMM d, yyyy')}`);
    if (minSteps > 0 || maxSteps < stepsRange.max)
      activeFilters.push(`Steps: ${minSteps}-${maxSteps}`);
    if (minDistance > 0 || maxDistance < distanceRange.max)
      activeFilters.push(`Distance: ${minDistance}-${maxDistance}m`);
    if (selectedExerciseTypes.length > 0)
      activeFilters.push(`${selectedExerciseTypes.length} selected types`);

    return (
      <View style={styles.filterBannerContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterBannerScroll}>
          {activeFilters.length > 0 ? (
            activeFilters.map((filter, index) => (
              <View key={index} style={styles.filterPill}>
                <Text style={styles.filterPillText}>{filter}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noFiltersText}>No filters applied</Text>
          )}
        </ScrollView>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterDialog(true)}>
          <Icon name="filter" size={20} color={theme.colors.primaryDark} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderExerciseTypes = () => {
    const halfLength = Math.ceil(allExerciseTypes.length / 2);
    const firstColumn = allExerciseTypes.slice(0, halfLength);
    const secondColumn = allExerciseTypes.slice(halfLength);

    return (
      <View style={styles.exerciseTypeColumnsContainer}>
        <View style={styles.exerciseTypeColumn}>
          {firstColumn.map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.exerciseTypeItem,
                selectedExerciseTypes.includes(type) &&
                  styles.exerciseTypeItemSelected,
              ]}
              onPress={() => toggleExerciseType(type)}>
              <View style={styles.exerciseTypeTextContainer}>
                <Icon name={getIconFromExerciseType(type)} size={24} />
                <Text style={styles.exerciseTypeText}>
                  {getNameFromExerciseType(type)}
                </Text>
              </View>
              {selectedExerciseTypes.includes(type) && (
                <Icon
                  name="checkmark"
                  size={16}
                  color={theme.colors.primaryDark}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.exerciseTypeColumn}>
          {secondColumn.map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.exerciseTypeItem,
                selectedExerciseTypes.includes(type) &&
                  styles.exerciseTypeItemSelected,
              ]}
              onPress={() => toggleExerciseType(type)}>
              <View style={styles.exerciseTypeTextContainer}>
                <Icon name={getIconFromExerciseType(type)} size={24} />
                <Text style={styles.exerciseTypeText}>
                  {getNameFromExerciseType(type)}
                </Text>
              </View>
              {selectedExerciseTypes.includes(type) && (
                <Icon
                  name="checkmark"
                  size={16}
                  color={theme.colors.primaryDark}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper bg={'#FFFFFF'}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name="pulse" size={24} color={theme.colors.primaryDark} />
          <Text style={styles.headerTitle}>Run Records</Text>
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
            onPress={handleSyncPress}
            disabled={isSyncing}>
            <Icon
              name="sync"
              size={24}
              color={isSyncing ? '#cccccc' : theme.colors.primaryDark}
              style={styles.headerIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('ManageNotificationsScreen')}>
            <Icon
              name="notifications-outline"
              size={24}
              color={theme.colors.primaryDark}
              style={styles.headerIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('LeaderBoardScreen')}>
            <Icon
              name="trophy-outline"
              size={24}
              color={theme.colors.primaryDark}
              style={styles.headerIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      {syncStatus && (
        <Animated.View
          style={[
            styles.syncStatusContainer,
            {
              opacity: fadeAnim,
              backgroundColor: syncStatus.includes('failed') || syncStatus.includes('error')
                ? '#FF5252'
                : theme.colors.primaryDark,
            },
          ]}>
          <Text style={styles.syncStatusText}>{syncStatus}</Text>
          <TouchableOpacity 
            style={styles.closeSyncStatusButton}
            onPress={hideSyncStatus}>
            <Icon name="close" size={20} color="white" />
          </TouchableOpacity>
        </Animated.View>
      )}

      {renderFilterBanner()}

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={() => setDatePickerVisibility(false)}
        minimumDate={
          datePickerMode === 'start'
            ? new Date('2025-01-01')
            : startDate
            ? new Date(startDate)
            : new Date('2025-01-01')
        }
        maximumDate={
          datePickerMode === 'end'
            ? new Date()
            : endDate
            ? new Date(endDate)
            : new Date()
        }
      />

      <ERSInfoDialog
        visible={showInfoDialog}
        onClose={() => setShowInfoDialog(false)}
      />

      <CommonDialog
        visible={showFilterDialog}
        onClose={() => setShowFilterDialog(false)}
        title="Filter Records"
        width="90%"
        height="80%"
        content={
          <ScrollView>
            {/* Date Filters */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Date Range</Text>
              <View style={styles.dateFilterRow}>
                <TouchableOpacity
                  style={styles.dateFilterButton}
                  onPress={() => showDatePicker('start')}>
                  <Text style={styles.dateFilterButtonText}>
                    {startDate
                      ? format(parseISO(startDate), 'MMM d, yyyy')
                      : 'Select Start Date'}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.dateFilterToText}>to</Text>
                <TouchableOpacity
                  style={styles.dateFilterButton}
                  onPress={() => showDatePicker('end')}>
                  <Text style={styles.dateFilterButtonText}>
                    {endDate
                      ? format(parseISO(endDate), 'MMM d, yyyy')
                      : 'Select End Date'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Steps Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>
                Steps: {minSteps} - {maxSteps}
              </Text>
              <View style={styles.sliderContainer}>
                <Text>{minSteps}</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={stepsRange.max}
                  step={100}
                  minimumTrackTintColor={theme.colors.primaryDark}
                  maximumTrackTintColor="#d3d3d3"
                  thumbTintColor={theme.colors.primaryDark}
                  value={maxSteps}
                  onValueChange={value => setMaxSteps(value)}
                />
                <Text>{stepsRange.max}</Text>
              </View>
            </View>

            {/* Distance Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>
                Distance (m): {minDistance} - {maxDistance}
              </Text>
              <View style={styles.sliderContainer}>
                <Text>{minDistance}</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={distanceRange.max}
                  step={100}
                  minimumTrackTintColor={theme.colors.primaryDark}
                  maximumTrackTintColor="#d3d3d3"
                  thumbTintColor={theme.colors.primaryDark}
                  value={maxDistance}
                  onValueChange={value => setMaxDistance(value)}
                />
                <Text>{distanceRange.max}</Text>
              </View>
            </View>

            {/* Exercise Type Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Exercise Types</Text>
              {renderExerciseTypes()}
            </View>
          </ScrollView>
        }
        actionButtons={[
          {
            label: 'Clear All',
            variant: 'outlined',
            color: theme.colors.primaryDark,
            handler: clearFilters,
          },
          {
            label: 'Apply',
            variant: 'contained',
            color: theme.colors.primaryDark,
            handler: applyFilters,
          },
        ]}
      />

      <ScrollView
        style={styles.container}
       >
        {loading ? (
          <ERSContainerSkeleton />
        ) : error ? (
          renderErrorState()
        ) : (
          <ERSContainer
            exerciseSessions={getFilteredSampleData()}
            accessDetailNavigation={accessDetailNavigation}
            onPressActivity={handleActivityPress}
          />
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
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
  },
  headerIcon: {
    marginLeft: 20,
  },
  syncStatusContainer: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  syncStatusText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  closeSyncStatusButton: {
    marginLeft: 10,
  },
  filterBannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  filterBannerScroll: {
    flexGrow: 1,
    alignItems: 'center',
  },
  filterPill: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderColor: theme.colors.primaryDark,
    borderWidth: 1,
  },
  filterPillText: {
    color: theme.colors.primaryDark,
    fontSize: 12,
  },
  noFiltersText: {
    color: '#757575',
    fontSize: 12,
    paddingHorizontal: 8,
  },
  filterButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
    padding: 20,
    width: '100%',
  },
  emptyText: {
    fontSize: 18,
    color: '#333333',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#757575',
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#4285F4',
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
  },
  // Filter Dialog Styles
  filterSection: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primaryDark,
    marginBottom: 8,
  },
  dateFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateFilterButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.primaryDark,
    borderRadius: 4,
    padding: 10,
    alignItems: 'center',
  },
  dateFilterButtonText: {
    color: theme.colors.primaryDark,
  },
  dateFilterToText: {
    marginHorizontal: 8,
    color: '#757575',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  slider: {
    flex: 1,
    marginHorizontal: 8,
  },
  exerciseTypeColumnsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  exerciseTypeColumn: {
    width: '48%',
  },
  exerciseTypeItem: {
    width: '100%',
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseTypeItemSelected: {
    borderColor: theme.colors.primaryDark,
    backgroundColor: theme.colors.primaryLight,
  },
  exerciseTypeTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  exerciseTypeText: {
    color: '#333',
  },
});