import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
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
  const [funFact, setFunFact] = React.useState<FunFact>(getRandomFunFact());

  const refreshFunFact = () => {
    setFunFact(getRandomFunFact());
  };

  const handleOpenUrl = () => {
    if (funFact?.url) {
      Linking.openURL(funFact.url);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      refreshFunFact();
    }, [])
  );

  useEffect(() => {
    refreshFunFact();
  }, []);

  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Icon name="sparkles" size={20} color={theme.colors.primary} />
          <Text style={styles.title}>Fun Fact</Text>
        </View>
      </View>
      <Text style={styles.factText}>{funFact?.content}</Text>
      {funFact?.url && (
        <TouchableOpacity 
          style={styles.readMoreButton} 
          onPress={handleOpenUrl}
          activeOpacity={0.7}
        >
          <Text style={styles.readMoreText}>More info</Text>
          <Icon name="open-outline" size={16} color={theme.colors.primaryDark} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
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
  refreshButton: {
    padding: 4,
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
});

export default HomeFunFactCard;