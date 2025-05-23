import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import BackButton from '../../BackButton';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {theme} from '../../contants/theme';
import useAiRiskStore from '../../utils/useAiRiskStore';
import ContentLoader, { Rect, Circle } from 'react-content-loader/native';

const exerciseTypes = [
  {id: 1, name: 'Jogging', icon: 'walk'},
  {id: 2, name: 'Running', icon: 'walk'},
  {id: 3, name: 'Sprint', icon: 'walk'},
  {id: 4, name: '5K Run', icon: 'walk'},
  {id: 5, name: '10K Run', icon: 'walk'},
  {id: 6, name: 'Marathon', icon: 'walk'},
];

const RiskAnalysisConfirmScreen = () => {
  const route = useRoute();
  const {userActivity} = route.params as {
    userActivity: any;
  };

  const {checkLimit} = useAiRiskStore();
  const navigate = useNavigation();
  const [selectedExercise, setSelectedExercise] = useState(exerciseTypes[0]);
  const [age, setAge] = useState(String(userActivity.age));
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [limitData, setLimitData] = useState<{
    limit: number;
    used: number;
    total_limit: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const handleAnalyze = () => {
    if (limitData && limitData.limit <= 0) return;
    
    const updatedParams = {
      ...userActivity,
      age: parseInt(age, 10) || userActivity.age,
      weight: parseFloat(weight) || 0,
      height: parseFloat(height) || 0,
      exercise_type: selectedExercise.name,
    };

    //@ts-ignore
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
        foregroundColor="#ecebeb"
      >
        {/* Subtitle */}
        <Rect x="0" y="0" rx="4" ry="4" width="300" height="20" />
        
        {/* Exercise Section */}
        <Rect x="0" y="40" rx="4" ry="4" width="200" height="20" />
        <Rect x="0" y="70" rx="4" ry="4" width="250" height="16" />
        {[...Array(6)].map((_, i) => (
          <Rect key={i} x="0" y={110 + i * 70} rx="8" ry="8" width="100%" height="60" />
        ))}
        
        {/* Personal Info Section */}
        <Rect x="0" y="550" rx="4" ry="4" width="200" height="20" />
        <Rect x="0" y="580" rx="4" ry="4" width="250" height="16" />
        <Rect x="0" y="620" rx="8" ry="8" width="48%" height="80" />
        <Rect x="52%" y="620" rx="8" ry="8" width="48%" height="80" />
        <Rect x="0" y="720" rx="8" ry="8" width="48%" height="80" />
        
        {/* Attempts Text */}
        <Rect x="50" y="820" rx="4" ry="4" width="300" height="20" />
        
        {/* Button */}
        <Rect x="0" y="870" rx="8" ry="8" width="100%" height="60" />
      </ContentLoader>
    </View>
  );

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
            <Text style={styles.sectionTitle}>Exercise Type</Text>
            <Text style={styles.sectionDescription}>
              Select the type of running style exercise you were doing
            </Text>

            <View style={styles.exerciseGrid}>
              {exerciseTypes.map(exercise => (
                <TouchableOpacity
                  key={exercise.id}
                  style={[
                    styles.exerciseCard,
                    selectedExercise.id === exercise.id && styles.selectedCard,
                  ]}
                  onPress={() => setSelectedExercise(exercise)}>
                  <Icon
                    name={exercise.icon}
                    size={24}
                    color={
                      selectedExercise.id === exercise.id
                        ? theme.colors.primary
                        : '#64748B'
                    }
                  />
                  <Text
                    style={[
                      styles.exerciseName,
                      selectedExercise.id === exercise.id && styles.selectedText,
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
              </View>
              <View style={styles.inputContainer} />
            </View>
          </View>

          <Text style={styles.attemptsText}>
            {limitData?.limit && limitData.limit > 0
              ? `You currently have ${limitData.limit}/${limitData.total_limit} uses for today`
              : 'You have no more uses for today. Come back tomorrow.'}
          </Text>

          <TouchableOpacity 
            style={[
              styles.primaryButton,
              (limitData?.limit === 0) && styles.disabledButton
            ]} 
            onPress={handleAnalyze}
            disabled={limitData?.limit === 0}
          >
            <Icon name="logo-ionitron" size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Analyze with AI</Text>
          </TouchableOpacity>
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
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
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
  },
  exerciseCard: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
    flexDirection: 'row',
  },
  selectedCard: {
    borderColor: theme.colors.primary,
    backgroundColor: '#EFF6FF',
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
});

export default RiskAnalysisConfirmScreen;