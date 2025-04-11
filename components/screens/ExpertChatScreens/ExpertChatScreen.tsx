import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {theme} from '../../contants/theme';
import ECPRChatList from './ExpertChatPOVRunner/ECPRChatList';
import {useLoginStore} from '../../utils/useLoginStore';
import ECPEChatList from './ExpertChatPOVExpert/ECPEChatList';
import {useNavigation} from '@react-navigation/native';

const ExpertChatScreen = () => {
  const {profile} = useLoginStore();
  const navigation = useNavigation();

  useEffect(() => {}, [profile]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <Text style={styles.title}>Chat Rooms</Text>
          {profile?.roles.includes('expert') && (
            <Text style={styles.expertText}>Expert</Text>
          )}
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('ExpertChatSearchUser')}>
            <Icon
              name="search-outline"
              size={20}
              color={theme.colors.primaryDark}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icon
              name="notifications-outline"
              size={20}
              color={theme.colors.primaryDark}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat List Component */}
      {profile?.roles?.includes('expert') ? <ECPEChatList /> : <ECPRChatList />}
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
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expertText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.primaryDark,
    backgroundColor: '#cadbff',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 12,
  },
});

export default ExpertChatScreen;
