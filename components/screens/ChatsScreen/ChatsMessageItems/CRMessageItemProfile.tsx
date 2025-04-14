import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {theme} from '../../../contants/theme';
import Icon from '@react-native-vector-icons/ionicons';

type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  points: number;
  user_level: string;
  roles: string[];
  avatar?: string;
};

type ProfileMessage = {
  id: string;
  message: string;
  created_at: string;
  user_id: string;
  User: User;
  type: 'PROFILE';
  height?: string;
  weight?: string;
  running_level?: string;
  running_goal?: string;
};

const ProfileField = ({
  iconName,
  label,
  value,
}: {
  iconName: string;
  label: string;
  value?: string;
}) => {
  if (!value) return null;

  return (
    <View style={styles.profileField}>
      <Icon name={iconName} size={20} color={theme.colors.primaryDark} />
      <View style={styles.profileFieldText}>
        <Text style={styles.profileFieldLabel}>{label}</Text>
        <Text style={styles.profileFieldValue}>{value}</Text>
      </View>
    </View>
  );
};

export const CRMessageItemProfile = ({message}: {message: ProfileMessage}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerName}>{message.User.name}</Text>
        <Text style={styles.headerUsername}>@{message.User.username}</Text>
      </View>

      <View style={styles.content}>
        <ProfileField
          iconName="body"
          label="Height"
          value={message.height ? `${message.height} cm` : undefined}
        />
        <ProfileField
          iconName="barbell"
          label="Weight"
          value={message.weight ? `${message.weight} kg` : undefined}
        />
        <ProfileField
          iconName="speedometer"
          label="Running Level"
          value={message.running_level}
        />
        <ProfileField
          iconName="flag"
          label="Running Goal"
          value={message.running_goal}
        />
      </View>

      <Text style={styles.time}>
        {new Date(message.created_at).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 16,
    marginVertical: 8,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 8,
  },
  headerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primaryDark,
    marginRight: 8,
  },
  headerUsername: {
    fontSize: 14,
    color: '#757575',
  },
  content: {
    marginBottom: 8,
  },
  profileField: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileFieldText: {
    marginLeft: 12,
  },
  profileFieldLabel: {
    fontSize: 12,
    color: '#757575',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  profileFieldValue: {
    fontSize: 16,
    color: '#212121',
    marginTop: 2,
  },
  time: {
    fontSize: 10,
    color: '#9E9E9E',
    textAlign: 'right',
  },
});