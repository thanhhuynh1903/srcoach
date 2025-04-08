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

const ExpertChatScreen = () => {
  const {profile} = useLoginStore();

  useEffect(() => {}, [profile]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <Text style={styles.title}>Expert Chat</Text>
          {profile?.roles.includes('expert') && (
            <Text style={styles.expertText}>Expert</Text>
          )}
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Icon
              name="notifications-outline"
              size={24}
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
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  expertText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: theme.colors.primaryDark,
    backgroundColor: '#cadbff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 16,
  },
});

export default ExpertChatScreen;
