import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  TextStyle,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import BackButton from '../BackButton';
const RateScheduleScreen = () => {
  const [overallRating, setOverallRating] = useState(0);
  const [difficultyRating, setDifficultyRating] = useState(0);
  const [structureRating, setStructureRating] = useState(0);
  const [resultsRating, setResultsRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const renderStars = (
    size: TextStyle,
    rating: number,
    setRating: (rating: number) => void,
  ) => {
    return (
      <View style={[styles.starsContainer, size]}>
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <Icon
              name={star <= rating ? 'star' : 'star-outline'}
              size={size.fontSize}
              color={star <= rating ? '#FFB800' : '#E2E8F0'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <BackButton size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rate Schedule</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        {/* Schedule Info */}
        <View style={styles.scheduleInfo}>
          <Image
            source={{uri: 'https://randomuser.me/api/portraits/women/32.jpg'}}
            style={styles.coachImage}
          />
          <View style={styles.scheduleDetails}>
            <Text style={styles.scheduleTitle}>5K Training Plan - Week 3</Text>
            <Text style={styles.coachName}>Coach Sarah Mitchell</Text>
            <Text style={styles.scheduleDate}>March 15-21, 2024</Text>
            <View style={styles.tagContainer}>
              <Text style={styles.tag}>Running</Text>
            </View>
          </View>
        </View>

        {/* Metrics */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricRow}>
            <View style={styles.metric}>
              <Icon name="location-outline" size={20} color="#3B82F6" />
              <View>
                <Text style={styles.metricLabel}>Distance</Text>
                <Text style={styles.metricValue}>25.5 km</Text>
              </View>
            </View>
            <View style={styles.metric}>
              <Icon name="time-outline" size={20} color="#3B82F6" />
              <View>
                <Text style={styles.metricLabel}>Duration</Text>
                <Text style={styles.metricValue}>3h 45min</Text>
              </View>
            </View>
          </View>
          <View style={styles.metricRow}>
            <View style={styles.metric}>
              <Icon name="calendar-outline" size={20} color="#3B82F6" />
              <View>
                <Text style={styles.metricLabel}>Sessions</Text>
                <Text style={styles.metricValue}>4 workouts</Text>
              </View>
            </View>
            <View style={styles.metric}>
              <Icon name="barbell" size={20} color="#3B82F6" />
              <View>
                <Text style={styles.metricLabel}>Difficulty</Text>
                <Text style={styles.metricValue}>Intermediate</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Rating Section */}
        <View
          style={{
            borderWidth: 1,
            borderColor: '#E2E8F0',
            padding:12,
            margin:16,
            borderRadius: 8,
          }}>
          <View style={styles.ratingSection}>
            <Text style={styles.ratingTitle}>Rate your experience</Text>
            <View style={{flexDirection: 'row', justifyContent: 'center'}}>
              <View>
                {renderStars({fontSize: 30}, overallRating, setOverallRating)}
              </View>
            </View>
            <View style={styles.ratingLabels}>
              <Text style={styles.ratingLabel}>Poor</Text>
              <Text style={styles.ratingLabel}>Excellent</Text>
            </View>
          </View>

          {/* Rating Categories */}
          <View style={styles.ratingCategories}>
            <View style={styles.ratingCategory}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>Difficulty Level</Text>
                <Text style={styles.categoryScore}>{difficultyRating}/5</Text>
              </View>
              {renderStars(
                {fontSize: 24},
                difficultyRating,
                setDifficultyRating,
              )}
            </View>

            <View style={styles.ratingCategory}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>Schedule Structure</Text>
                <Text style={styles.categoryScore}>{structureRating}/5</Text>
              </View>
              {renderStars({fontSize: 24}, structureRating, setStructureRating)}
            </View>

            <View style={styles.ratingCategory}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>Results Achieved</Text>
                <Text style={styles.categoryScore}>{resultsRating}/5</Text>
              </View>
              {renderStars({fontSize: 24}, resultsRating, setResultsRating)}
            </View>
          </View>
        </View>
        {/* Quick Feedback Tags */}
        <View style={styles.feedbackTags}>
          <View style={styles.tagRow}>
            <TouchableOpacity
              style={[
                styles.feedbackTag,
                selectedTags.includes('Too Intense') && styles.selectedTag,
              ]}
              onPress={() => toggleTag('Too Intense')}>
              <Text style={styles.feedbackTagText}>Too Intense</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.feedbackTag,
                selectedTags.includes('Perfect Pace') && styles.selectedTag,
              ]}
              onPress={() => toggleTag('Perfect Pace')}>
              <Text style={styles.feedbackTagText}>Perfect Pace</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tagRow}>
            <TouchableOpacity
              style={[
                styles.feedbackTag,
                selectedTags.includes('Well Structured') && styles.selectedTag,
              ]}
              onPress={() => toggleTag('Well Structured')}>
              <Text style={styles.feedbackTagText}>Well Structured</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.feedbackTag,
                selectedTags.includes('Need More Rest') && styles.selectedTag,
              ]}
              onPress={() => toggleTag('Need More Rest')}>
              <Text style={styles.feedbackTagText}>Need More Rest</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tagRow}>
            <TouchableOpacity
              style={[
                styles.feedbackTag,
                selectedTags.includes('Good Variety') && styles.selectedTag,
              ]}
              onPress={() => toggleTag('Good Variety')}>
              <Text style={styles.feedbackTagText}>Good Variety</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.feedbackTag,
                selectedTags.includes('Too Easy') && styles.selectedTag,
              ]}
              onPress={() => toggleTag('Too Easy')}>
              <Text style={styles.feedbackTagText}>Too Easy</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Submit Rating</Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  headerRight: {
    width: 24,
  },
  content: {
    flex: 1,
  },
  scheduleInfo: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  coachImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  scheduleDetails: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  coachName: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  scheduleDate: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  tagContainer: {
    flexDirection: 'row',
  },
  tag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    color: '#2563EB',
    fontSize: 14,
  },
  metricsContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    gap: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  metricLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  ratingSection: {
    padding: 16,
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  ratingLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  ratingCategories: {
    padding: 16,
    gap: 16,
  },
  ratingCategory: {
    gap: 8,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 14,
    color: '#000000',
  },
  categoryScore: {
    fontSize: 14,
    color: '#64748B',
  },
  feedbackTags: {
    padding: 16,
    gap: 12,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 12,
  },
  feedbackTag: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  selectedTag: {
    backgroundColor: '#EFF6FF',
  },
  feedbackTagText: {
    fontSize: 14,
    color: '#64748B',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  submitButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RateScheduleScreen;
