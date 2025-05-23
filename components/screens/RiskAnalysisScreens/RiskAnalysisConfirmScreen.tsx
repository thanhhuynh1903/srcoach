import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from '@react-native-vector-icons/material-design-icons';
import BackButton from '../../BackButton';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {theme} from '../../contants/theme';
import useAiRiskStore from '../../utils/useAiRiskStore';
import ContentLoader, {Rect, Circle} from 'react-content-loader/native';
import CommonDialog from '../../commons/CommonDialog';

const exerciseTypes = [
  {id: 1, name: 'Jogging', icon: 'run', description: 'Light running at a comfortable pace, typically for longer durations.'},
  {id: 2, name: 'Running', icon: 'run-fast', isPopular: true, description: 'Moderate pace running, faster than jogging but not all-out.'},
  {id: 3, name: 'Tempo', icon: 'run-fast', description: 'Sustained faster pace running at "comfortably hard" intensity.'},
  {id: 4, name: 'Interval', icon: 'timer-sand', description: 'Alternating periods of high-intensity running with recovery periods.'},
  {id: 5, name: 'Hill Repeats', icon: 'terrain', description: 'Repeated uphill running segments with recovery periods.'},
  {id: 6, name: 'Marathon', icon: 'map-marker-distance', description: 'Long-distance running training for marathon preparation.'},
  {id: 7, name: 'Recovery', icon: 'speedometer', description: 'Easy running to promote recovery between hard workouts.'},
  {id: 8, name: 'Walk', icon: 'walk', others: true, description: 'Walking as a form of low-impact exercise.'},
];

const RiskAnalysisConfirmScreen = () => {
  const route = useRoute();
  const {userActivity} = route.params as {
    userActivity: any;
  };

  const {checkLimit} = useAiRiskStore();
  const navigate = useNavigation();
  const [selectedExercise, setSelectedExercise] = useState(exerciseTypes[1]);
  const [age, setAge] = useState(String(userActivity.age));
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [limitData, setLimitData] = useState<{
    limit: number;
    used: number;
    total_limit: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAgeWarning, setShowAgeWarning] = useState(false);
  const [showMeasurementWarning, setShowMeasurementWarning] = useState(false);
  const [showExerciseInfoDialog, setShowExerciseInfoDialog] = useState(false);
  const [ageError, setAgeError] = useState<string | null>(null);
  const [weightError, setWeightError] = useState<string | null>(null);
  const [heightError, setHeightError] = useState<string | null>(null);

  useEffect(() => {
    setShowAgeWarning(age !== String(userActivity.age));
    setShowMeasurementWarning(weight === '' || height === '');

    // Age validation
    const ageNum = parseInt(age, 10);
    if (age && !isNaN(ageNum)) {
      if (ageNum < 13) {
        setAgeError('Minimum age for running tracking is 13 years old');
      } else if (ageNum > 150) {
        setAgeError('Maximum age allowed is 150 years');
      } else {
        setAgeError(null);
      }
    } else if (age === '') {
      setAgeError(null);
    }

    // Weight validation
    const weightNum = parseFloat(weight);
    if (weight && !isNaN(weightNum)) {
      if (weightNum <= 20) {
        setWeightError('Weight must be more than 20 kg');
      } else if (weightNum > 500) {
        setWeightError('Maximum weight allowed is 500 kg');
      } else {
        setWeightError(null);
      }
    } else if (weight === '') {
      setWeightError(null);
    }

    // Height validation
    const heightNum = parseFloat(height);
    if (height && !isNaN(heightNum)) {
      if (heightNum <= 20) {
        setHeightError('Height must be more than 20 cm');
      } else if (heightNum > 500) {
        setHeightError('Maximum height allowed is 500 cm');
      } else {
        setHeightError(null);
      }
    } else if (height === '') {
      setHeightError(null);
    }
  }, [age, weight, height]);

  const handleAnalyze = () => {
    if (limitData && limitData.limit <= 0) return;

    if (ageError) {
      Alert.alert('Invalid Age', ageError);
      return;
    }

    if (weightError) {
      Alert.alert('Invalid Weight', weightError);
      return;
    }

    if (heightError) {
      Alert.alert('Invalid Height', heightError);
      return;
    }

    if (weight === '' || height === '') {
      Alert.alert(
        'Incomplete Information',
        'For most accurate results, please provide your weight and height. Would you like to proceed with general analysis?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Proceed',
            onPress: () => navigateToRiskWarning(),
          },
        ],
      );
      return;
    }

    navigateToRiskWarning();
  };

  const navigateToRiskWarning = () => {
    const updatedParams = {
      ...userActivity,
      age: parseInt(age, 10) || userActivity.age,
      weight: parseFloat(weight) || 0,
      height: parseFloat(height) || 0,
      exercise_type: selectedExercise.name,
    };

    navigate.navigate('RiskWarningScreen', {
      params: {
        userActivity: updatedParams,
      },
    });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await checkLimit();
      setLimitData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, []),
  );

  const renderContentLoader = () => (
    <View style={styles.content}>
      <ContentLoader
        speed={1.5}
        width="100%"
        height="100%"
        viewBox="0 0 400 800"
        backgroundColor="#f3f3f3"
        foregroundColor="#ecebeb">
        <Rect x="0" y="0" rx="4" ry="4" width="300" height="20" />
        <Rect x="0" y="40" rx="4" ry="4" width="200" height="20" />
        <Rect x="0" y="70" rx="4" ry="4" width="250" height="16" />
        {[...Array(8)].map((_, i) => (
          <Rect
            key={i}
            x="0"
            y={110 + i * 70}
            rx="8"
            ry="8"
            width="100%"
            height="60"
          />
        ))}
        <Rect x="0" y="650" rx="4" ry="4" width="200" height="20" />
        <Rect x="0" y="680" rx="4" ry="4" width="250" height="16" />
        <Rect x="0" y="720" rx="8" ry="8" width="48%" height="80" />
        <Rect x="52%" y="720" rx="8" ry="8" width="48%" height="80" />
        <Rect x="0" y="820" rx="8" ry="8" width="48%" height="80" />
        <Rect x="50" y="920" rx="4" ry="4" width="300" height="20" />
        <Rect x="0" y="970" rx="8" ry="8" width="100%" height="60" />
      </ContentLoader>
    </View>
  );

  const isButtonDisabled = () => {
    return !!ageError || !!weightError || !!heightError || (limitData?.limit === 0);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <BackButton size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Risk Analysis Additional Info</Text>
      </View>

      {loading ? (
        renderContentLoader()
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.subtitle}>
            Please verify your information for accurate risk assessment
          </Text>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Running Type</Text>
              <TouchableOpacity onPress={() => setShowExerciseInfoDialog(true)}>
                <Icon name="information" size={20} color={theme.colors.primary} style={{marginBottom: 6}} />
              </TouchableOpacity>
            </View>
            <Text style={styles.sectionDescription}>
              Select the type of running that you are/were planning to do
            </Text>

            <View style={styles.exerciseGrid}>
              {exerciseTypes
                .filter(ex => !ex.others)
                .map(exercise => (
                  <TouchableOpacity
                    key={exercise.id}
                    style={[
                      styles.exerciseCard,
                      selectedExercise.id === exercise.id &&
                        styles.selectedCard,
                    ]}
                    onPress={() => setSelectedExercise(exercise)}>
                    <View style={styles.exerciseHeader}>
                      <Icon
                        name={exercise.icon}
                        size={24}
                        color={
                          selectedExercise.id === exercise.id
                            ? theme.colors.primary
                            : '#64748B'
                        }
                      />
                      {exercise.isPopular && (
                        <View style={styles.popularChip}>
                          <Text style={styles.popularChipText}>Popular</Text>
                        </View>
                      )}
                    </View>

                    <Text
                      style={[
                        styles.exerciseName,
                        selectedExercise.id === exercise.id &&
                          styles.selectedText,
                      ]}>
                      {exercise.name}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
            <Text style={styles.sectionTitle}>Others</Text>
            <Text style={styles.sectionDescription}>
              Other running variants not included in typical real-life running
            </Text>
            <View>
              {exerciseTypes
                .filter(ex => ex.others)
                .map(exercise => (
                  <TouchableOpacity
                    key={exercise.id}
                    style={[
                      styles.exerciseCard,
                      selectedExercise.id === exercise.id &&
                        styles.selectedCard,
                    ]}
                    onPress={() => setSelectedExercise(exercise)}>
                    <View style={styles.exerciseHeader}>
                      <Icon
                        name={exercise.icon}
                        size={24}
                        color={
                          selectedExercise.id === exercise.id
                            ? theme.colors.primary
                            : '#64748B'
                        }
                      />
                      {exercise.isPopular && (
                        <View style={styles.popularChip}>
                          <Text style={styles.popularChipText}>Popular</Text>
                        </View>
                      )}
                    </View>

                    <Text
                      style={[
                        styles.exerciseName,
                        selectedExercise.id === exercise.id &&
                          styles.selectedText,
                      ]}>
                      {exercise.name}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <Text style={styles.sectionDescription}>
              Update your details if needed
            </Text>

            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Age</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={age}
                    onChangeText={setAge}
                    keyboardType="numeric"
                    placeholder="Enter age"
                  />
                  <Text style={styles.inputUnit}>years</Text>
                </View>
                {ageError && (
                  <Text style={styles.errorText}>{ageError}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Weight</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="numeric"
                    placeholder="Enter weight"
                  />
                  <Text style={styles.inputUnit}>kg</Text>
                </View>
                {weightError && (
                  <Text style={styles.errorText}>{weightError}</Text>
                )}
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Height</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={height}
                    onChangeText={setHeight}
                    keyboardType="numeric"
                    placeholder="Enter height"
                  />
                  <Text style={styles.inputUnit}>cm</Text>
                </View>
                {heightError && (
                  <Text style={styles.errorText}>{heightError}</Text>
                )}
              </View>
              <View style={styles.inputContainer} />
            </View>
          </View>

          {showAgeWarning && (
            <View style={styles.warningBox}>
              <Icon name="alert-circle" size={16} color={theme.colors.warning} />
              <Text style={styles.warningText}>
                You've changed your age from your account information. This
                analysis will now assess suitability for the specified age range
                that you've picked.
              </Text>
            </View>
          )}

          {showMeasurementWarning && (
            <View style={styles.warningBox}>
              <Icon name="alert-circle" size={16} color={theme.colors.warning} />
              <Text style={styles.warningText}>
                Without weight and height measurements, the analysis will
                provide general results rather than personalized
                recommendations.
              </Text>
            </View>
          )}

          <Text style={styles.attemptsText}>
            {limitData?.limit && limitData.limit > 0
              ? `You currently have ${limitData.limit}/${limitData.total_limit} uses for today`
              : 'You have no more uses for today. Come back tomorrow.'}
          </Text>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              (isButtonDisabled()) && styles.disabledButton,
            ]}
            onPress={handleAnalyze}
            disabled={isButtonDisabled()}>
            <Icon name="robot" size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Analyze with AI</Text>
          </TouchableOpacity>

          <CommonDialog
            visible={showExerciseInfoDialog}
            onClose={() => setShowExerciseInfoDialog(false)}
            title="Exercise Type Information"
            content={
              <View>
                {exerciseTypes.map(exercise => (
                  <View key={exercise.id} style={styles.exerciseInfoItem}>
                    <View style={styles.exerciseInfoHeader}>
                      <Icon name={exercise.icon} size={20} color={theme.colors.primary} />
                      <Text style={styles.exerciseInfoName}>{exercise.name}</Text>
                    </View>
                    <Text style={styles.exerciseInfoDescription}>{exercise.description}</Text>
                  </View>
                ))}
              </View>
            }
            actionButtons={[
              {
                label: 'Got it',
                variant: 'contained',
                handler: () => setShowExerciseInfoDialog(false),
              },
            ]}
          />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEFCE8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  warningText: {
    fontSize: 12,
    color: theme.colors.warningDark,
    flex: 1,
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.error,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  exerciseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  exerciseCard: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  fullWidthCard: {
    width: '100%',
  },
  otherCategoryCard: {
    borderColor: '#A5B4FC',
    backgroundColor: '#EEF2FF',
  },
  selectedCard: {
    borderColor: theme.colors.primary,
    backgroundColor: '#EFF6FF',
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  popularChip: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  popularChipText: {
    fontSize: 10,
    color: '#16A34A',
    fontWeight: '600',
  },
  categoryContainer: {
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: 10,
    color: '#4F46E5',
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#4F46E5',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  categoryDescription: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  exerciseName: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  selectedText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  inputContainer: {
    width: '48%',
  },
  inputLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: 44,
    color: '#000000',
  },
  inputUnit: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 8,
  },
  attemptsText: {
    textAlign: 'center',
    color: '#64748B',
    marginVertical: 16,
  },
  primaryButton: {
    backgroundColor: theme.colors.primaryDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 50,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: '#94a3b8',
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  exerciseInfoItem: {
    marginBottom: 12,
  },
  exerciseInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  exerciseInfoName: {
    fontWeight: '600',
    color: theme.colors.primaryDark,
  },
  exerciseInfoDescription: {
    color: '#64748B',
    fontSize: 14,
    marginLeft: 28, 
  },
});

export default RiskAnalysisConfirmScreen;