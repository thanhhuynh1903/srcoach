import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import BackButton from '../BackButton';
import { useNavigation } from '@react-navigation/native';
import CheckBox from '@react-native-community/checkbox';

const filters = [
  { id: 'all', label: 'All' },
  { id: '10km', label: '10 km', icon: 'heart' },
  { id: '5km', label: '5 km', icon: 'speedometer-outline' },
  { id: 'Long Run', label: 'Long run', icon: 'speedometer-outline' },
];

const goals = [
  {
    id: 1,
    title: 'Run 5km three times a week',
    progress: 66,
    dueDate: 'March 5, 2025',
    timeframe: 'Next week',
    iconColor: '#22C55E',
    icon: 'walk-sharp',
  },
  {
    id: 2,
    title: 'Run 15km three times a week',
    progress: 45,
    dueDate: 'March 5, 2025',
    timeframe: 'This month',
    iconColor: '#EAB308',
    icon: 'checkmark',
  },
  {
    id: 3,
    title: 'Run 15km three times a week',
    progress: 45,
    dueDate: 'March 5, 2025',
    timeframe: 'This month',
    iconColor: '#EAB308',
    icon: 'checkmark',
  },
];

const GoalListScreen = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedGoals, setSelectedGoals] = useState<number[]>([]);
  const navigation = useNavigation();

  const toggleGoalSelection = (goalId: number) => {
    setSelectedGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode);
    if (isDeleteMode) {
      setSelectedGoals([]); // Reset selections when exiting delete mode
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <BackButton size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Goals</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.progressContainer}>
          <View style={styles.progressCircle}>
            <View style={styles.progressInner}>
              <Text style={styles.progressPercentage}>68%</Text>
              <Text style={styles.progressLabel}>Goals on Track</Text>
            </View>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}>
          {filters.map(filter => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                activeFilter === filter.id && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(filter.id)}>
              {filter.icon && (
                <Icon
                  name={filter.icon as any}
                  size={16}
                  color={activeFilter === filter.id ? '#FFFFFF' : '#94A3B8'}
                />
              )}
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter.id && styles.filterTextActive,
                ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.goalsList}>
          {goals.map(goal => (
            <View
              key={goal.id}
              style={styles.goalRow}>
              <View style={[styles.goalCard, { width: isDeleteMode ? '90%' : '100%' }]}>
                <View style={styles.goalHeader}>
                  <View style={styles.goalTitleRow}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: goal.iconColor + '20' },
                      ]}>
                      <Icon
                        name={goal.icon as any}
                        size={20}
                        color={goal.iconColor}
                      />
                    </View>
                    <Text style={styles.goalTitle}>{goal.title}</Text>
                  </View>
                  <Text style={styles.timeframe}>{goal.timeframe}</Text>
                </View>

                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${goal.progress}%`,
                        backgroundColor: goal.iconColor,
                      },
                    ]}
                  />
                </View>

                <View style={styles.goalFooter}>
                  <Text style={styles.progressText}>
                    {goal.progress} % Complete
                  </Text>
                  <Text style={styles.dueDate}>{goal.dueDate}</Text>
                </View>
              </View>
              {isDeleteMode && (
                <View style={styles.checkboxContainer}>
                  <CheckBox
                    value={selectedGoals.includes(goal.id)}
                    onValueChange={() => toggleGoalSelection(goal.id)}
                    tintColors={{ true: '#2563EB', false: '#64748B' }}
                    style={styles.customCheckbox}
                  />
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('SetGoalsScreen' as never)}>
          <Icon name="add-outline" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Goal</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.EditButton,
            isDeleteMode && styles.deleteButtonActive,
          ]}
          onPress={handleDeleteMode}>
          <Icon
            name="trash-outline"
            size={20}
            color={isDeleteMode ? '#FFFFFF' : '#1A1A1A'}
          />
          <Text
            style={[
              styles.EditButtonText,
              isDeleteMode && styles.deleteButtonTextActive,
            ]}>
            {isDeleteMode ? 'Done' : 'Delete'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  content: {
    flex: 1,
  },
  progressContainer: {
    backgroundColor: '#F8FAFC',
    padding: 24,
    margin: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  progressCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 12,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressInner: {
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    marginRight: 8,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
  },
  filterText: {
    fontSize: 14,
    color: '#64748B',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  goalsList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  goalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    flex: 1,
  },
  timeframe: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 12,
  },
  progressBar: {
    height: 2,
    backgroundColor: '#F1F5F9',
    borderRadius: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 1,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    color: '#64748B',
  },
  dueDate: {
    fontSize: 14,
    color: '#64748B',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  EditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  EditButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  deleteButtonActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  deleteButtonTextActive: {
    color: '#FFFFFF',
  },
  checkboxContainer: {
    width: '10%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customCheckbox: {
    width: 24,
    height: 24,
  },
});

export default GoalListScreen;