import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../../contants/theme';
import CommonDialog from '../../../commons/CommonDialog';

const CHSHeader = () => {
  const navigation = useNavigation();
  const [showInfoDialog, setShowInfoDialog] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name="chatbubbles" size={24} color={theme.colors.primaryDark} />
          <Text style={styles.headerTitle}>Chats</Text>
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
            onPress={() => navigation.navigate('GeneralScheduleScreen' as never)}>
            <Icon
              name="calendar-outline"
              size={24}
              color={theme.colors.primaryDark}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('ManageNotificationsScreen' as never)}>
            <Icon
              name="notifications-outline"
              size={24}
              color={theme.colors.primaryDark}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('LeaderBoardScreen' as never)}>
            <Icon
              name="trophy-outline"
              size={24}
              color={theme.colors.primaryDark}
            />
          </TouchableOpacity>
        </View>
      </View>

      <CommonDialog
        visible={showInfoDialog}
        onClose={() => setShowInfoDialog(false)}
        title="Chats Information"
        content={
          <View>
            <Text style={styles.dialogText}>
              Here you can manage all your conversations and chat requests.
            </Text>
            <Text style={[styles.dialogText, { marginTop: 12, fontWeight: 'bold' }]}>
              Features:
            </Text>
            <View style={styles.dialogBullet}>
              <Text style={styles.dialogText}>• View and reply to your messages</Text>
              <Text style={styles.dialogText}>• Manage pending chat requests</Text>
              <Text style={styles.dialogText}>• Block unwanted conversations</Text>
              <Text style={styles.dialogText}>• Search for users and chats</Text>
              <Text style={styles.dialogText}>• View your accepted chats</Text>
            </View>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
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
    gap: 20,
  },
  dialogText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  dialogBullet: {
    marginLeft: 16,
    marginTop: 8,
  },
});

export default CHSHeader;