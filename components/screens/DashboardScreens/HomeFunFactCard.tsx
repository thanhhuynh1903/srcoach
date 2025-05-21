import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Animated } from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { getRandomFunFact } from '../../contants/funFacts';
import { theme } from '../../contants/theme';
import { useFocusEffect } from '@react-navigation/native';

interface HomeFunFactCardProps {
  style?: object;
}

interface FunFact {
  content: string;
  url?: string;
}

const HomeFunFactCard: React.FC<HomeFunFactCardProps> = ({ style }) => {
  const [currentFact, setCurrentFact] = useState<FunFact>(getRandomFunFact());
  const [nextFact, setNextFact] = useState<FunFact>(getRandomFunFact());
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const refreshFunFact = () => {
    setNextFact(getRandomFunFact());
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCurrentFact(nextFact);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleOpenUrl = () => {
    if (currentFact?.url) {
      Linking.openURL(currentFact.url);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const intervalId = setInterval(() => refreshFunFact(), 10000);
      return () => clearInterval(intervalId);
    }, [nextFact])
  );

  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Icon name="sparkles" size={20} color={theme.colors.primary} />
          <Text style={styles.title}>Fun Fact</Text>
        </View>
      </View>
      <Animated.View style={{ opacity: fadeAnim, minHeight: 80 }}>
        <Text style={styles.factText}>{currentFact?.content}</Text>
        {currentFact?.url && (
          <TouchableOpacity 
            style={styles.readMoreButton} 
            onPress={handleOpenUrl}
            activeOpacity={0.7}
          >
            <Text style={styles.readMoreText}>More info</Text>
            <Icon name="open-outline" size={16} color={theme.colors.primaryDark} />
          </TouchableOpacity>
        )}
      </Animated.View>
      <TouchableOpacity 
        style={styles.nextButton}
        onPress={refreshFunFact}
        activeOpacity={0.7}
      >
        <Icon name="arrow-forward" size={20} color={theme.colors.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    minHeight: 130,
    borderLeftColor: theme.colors.primary,
    borderLeftWidth: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#000',
  },
  factText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#000000',
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  readMoreText: {
    fontSize: 13,
    color: theme.colors.primaryDark,
    marginRight: 4,
    fontWeight: '500',
  },
  nextButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    padding: 8,
  },
});

export default HomeFunFactCard;