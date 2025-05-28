"use client"

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native'
import ContentLoader, {Rect, Circle} from 'react-content-loader/native'
import Icon from '@react-native-vector-icons/ionicons'
import EnhancedScheduleCard from './EnhancedScheduleCard'
import { useNavigation } from '@react-navigation/native'
import BackButton from '../../BackButton'
import useScheduleStore from '../../utils/useScheduleStore'
import CommonDialog from '../../commons/CommonDialog'
import { theme } from '../../contants/theme'
import { useLoginStore } from '../../utils/useLoginStore'

const GeneralScheduleScreen = () => {
  const [activeTab, setActiveTab] = useState('All')
  const [showInfoDialog, setShowInfoDialog] = useState(false)
  const [showActiveDialog, setShowActiveDialog] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const navigation = useNavigation()
  const { schedules, ExpertSchedule, isLoading, error, fetchSelfSchedules, fetchExpertSchedule } = useScheduleStore()
  const { profile } = useLoginStore()

  const combinedSchedules = useMemo(() => {
    const safeSchedules = Array.isArray(schedules) ? schedules : schedules ? [schedules] : []
    const safeExpert = Array.isArray(ExpertSchedule) ? ExpertSchedule : ExpertSchedule ? [ExpertSchedule] : []
    return [...safeSchedules, ...safeExpert]
  }, [schedules, ExpertSchedule])

  const hasActiveSchedule = useMemo(() => {
    const allSchedules = Array.isArray(schedules) ? schedules : schedules ? [schedules] : []
    if (profile?.roles?.includes('runner')) {
      return allSchedules.some(s => s.schedule_type === 'EXPERT' || s.schedule_type === 'USER')
    }
    if (profile?.roles?.includes('expert')) {
      return allSchedules.some(s => s.schedule_type === 'USER' && s.user_id === profile.id)
    }
    return false
  }, [schedules, profile])

  const filteredSchedules = useMemo(() => {
    if (!combinedSchedules) return []
    const safeSchedules = Array.isArray(combinedSchedules) ? combinedSchedules : [combinedSchedules]
    const filters: Record<string, (s: any) => boolean> = {
      "Expert's Choice": s => s.schedule_type === 'EXPERT' && s.status !== "CANCELED" && s.user_id !== s.expert_id,
      'My Schedules': s => s.schedule_type !== 'EXPERT' || s.user_id === s.expert_id,
      'Pending': s => s.status === "PENDING",
      'All': s => s.status !== "CANCELED"
    }
    return safeSchedules.filter(filters[activeTab] || filters['All'])
  }, [combinedSchedules, activeTab])

  const formatTime = (isoString: string) =>
    new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    })

  const formatScheduleData = (schedule: any) => {
    if (!schedule?.ScheduleDay) return null
    const sortedDays = [...schedule.ScheduleDay].sort(
      (a, b) => new Date(a.day).getTime() - new Date(b.day).getTime()
    )
    const startDate = sortedDays[0] ? new Date(sortedDays[0].day).toLocaleDateString('en-GB', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }) : new Date().toLocaleDateString('en-GB')
    return {
      id: schedule.id,
      title: schedule.title,
      description: schedule.description,
      created_at: schedule.created_at,
      startDate,
      days: sortedDays.map(day => new Date(day.day).getDate()),
      daySchedules: sortedDays.map(day => ({
        day: new Date(day.day).getDate(),
        fullDate: day.day,
        workouts: day.ScheduleDetail?.map(detail => ({
          time: `${formatTime(detail.start_time)} - ${formatTime(detail.end_time)}`,
          name: detail.description || 'Session',
          steps: detail.goal_steps || 0,
          distance: detail.goal_distance || 0,
          calories: detail.goal_calories || 0,
          actual_steps: detail.actual_steps || 0,
          actual_distance: detail.actual_distance || 0,
          actual_calories: detail.actual_calories || 0,
          status: detail.status,
          id: detail.id,
          minbpm: detail.goal_minbpms || 0,
          maxbpm: detail.goal_maxbpms || 0,
        })) || [],
      })),
      isExpertChoice: schedule.schedule_type === 'EXPERT',
      status: schedule.status,
      user_id: schedule.user_id,
      runnername: schedule?.user?.name,
      expert_id: schedule.expert_id,
      expertname: schedule?.expert?.name,
      expertavatar: schedule?.expert?.image?.url || null
    }
  }

  const loadData = async () => {
    if (profile?.roles?.includes('expert')) {
      await Promise.all([fetchSelfSchedules(), fetchExpertSchedule()])
    } else {
      await fetchSelfSchedules()
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }, [])

  const handleBlockAddSchedule = () => {
    hasActiveSchedule ? setShowActiveDialog(true) : navigation.navigate('AddScheduleScreen' as never)
  }

  const renderContent = () => {
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={60} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchSelfSchedules}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )
    }

    if (isLoading) {
      return (
        <View style={styles.scrollView}>
          <ContentLoader
            speed={2}
            width={400}
            height={600}
            viewBox="0 0 400 600"
            backgroundColor="#f3f3f3"
            foregroundColor="#ecebeb"
          >
            <Rect x="0" y="0" rx="20" ry="20" width="400" height="200" />
            <Circle cx="50" cy="230" r="18" />
            <Circle cx="100" cy="230" r="18" />
            <Circle cx="150" cy="230" r="18" />
            <Rect x="0" y="260" rx="10" ry="10" width="400" height="100" />
            <Rect x="0" y="380" rx="20" ry="20" width="400" height="200" />
            <Circle cx="50" cy="610" r="18" />
            <Circle cx="100" cy="610" r="18" />
            <Circle cx="150" cy="610" r="18" />
            <Rect x="0" y="640" rx="10" ry="10" width="400" height="100" />
          </ContentLoader>
        </View>
      )
    }

    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredSchedules.length > 0 ? (
          filteredSchedules.map(schedule => {
            const formatted = formatScheduleData(schedule)
            return formatted ? (
              <EnhancedScheduleCard
                key={formatted.id}
                {...formatted}
                selectedDay={formatted.days[0] || 0}
                alarmEnabled={false}
              />
            ) : null
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="calendar-outline" size={60} color="#94A3B8" />
            <Text style={styles.emptyText}>
              {activeTab === 'All' ? 'No training schedules yet.' :
                activeTab === "Expert's Choice" ? 'No expert schedules.' :
                  'No personal schedules created.'}
            </Text>
          </View>
        )}
      </ScrollView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <BackButton size={24} />
          <Text style={styles.headerTitle}>Schedules</Text>
          <TouchableOpacity style={styles.infoButton} onPress={() => setShowInfoDialog(true)}>
            <Icon name="information-circle-outline" size={20} color={theme.colors.primaryDark} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.navigate('CalendarScreen' as never)}>
            <Icon name="calendar" size={24} color={theme.colors.primaryDark} style={styles.headerIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleBlockAddSchedule}>
            <Icon name="add-circle-outline" size={24} color={theme.colors.primaryDark} style={styles.headerIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('ScheduleHistoryScreen' as never)}>
            <Icon name="time-outline" size={24} color={theme.colors.primaryDark} style={styles.headerIcon} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filtersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {['All', "Expert's Choice", 'My Schedules', 'Pending'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {renderContent()}

      <CommonDialog
        visible={showInfoDialog}
        onClose={() => setShowInfoDialog(false)}
        title="Schedule Info"
        content={
          <View>
            <Text style={styles.dialogText}>- Displays all your workout schedules.</Text>
            <Text style={styles.dialogText}>
              - Only one active schedule is allowed. Complete or adjust your current schedule before creating a new one.
            </Text>
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
        visible={showActiveDialog}
        onClose={() => setShowActiveDialog(false)}
        title="A schedule is being active"
        content={<Text>There is already a schedule being active. Please remove them first.</Text>}
        actionButtons={[
          {
            label: 'Got it',
            variant: 'contained',
            color: theme.colors.primaryDark,
            handler: () => setShowActiveDialog(false),
          },
        ]}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
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
  infoButton: { marginLeft: 8 },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: { marginLeft: 20 },
  filtersWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
    paddingVertical: 12,
    backgroundColor: '#FFF',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  activeTab: {
    backgroundColor: '#EBF3FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  tabText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#0F2B5B',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  scrollViewContent: { paddingBottom: 24 },
  emptyContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 20,
    marginBottom: 28,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFF',
  },
  errorText: {
    fontSize: 16,
    color: '#0F172A',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#0F2B5B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#0F2B5B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 15,
  },
  dialogText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 12,
    lineHeight: 22,
  },
})

export default GeneralScheduleScreen