import {Text, View, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import useScheduleStore from '../../utils/useScheduleStore';
import {useCallback, useEffect, useState} from 'react';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScheduleCard({navigation}: any) {
  const {fetchSelfSchedules} = useScheduleStore();
  const [schedules, setSchedules] = useState<any[]>([]);

  const initData = async () => {
    const data = await fetchSelfSchedules();
    setSchedules(data || []);
  };

  useFocusEffect(
    useCallback(() => {
      initData();
    }, [])
  );

  const getBannerInfo = () => {
    if (!schedules || schedules.length === 0) return null;

    let earliestSchedule = null;
    let earliestTime = null;

    for (const schedule of schedules) {
      if (
        schedule.status === 'UPCOMING' ||
        schedule.status === 'INCOMING' ||
        schedule.status === 'ONGOING'
      ) {
        for (const day of schedule.ScheduleDay) {
          for (const detail of day.ScheduleDetail) {
            const startTime = new Date(detail.start_time);
            if (!earliestTime || startTime < earliestTime) {
              earliestTime = startTime;
              earliestSchedule = {...detail, parentStatus: schedule.status};
            }
          }
        }
      }
    }

    return earliestSchedule;
  };

  const bannerInfo = getBannerInfo();

  const formatDateTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'UTC',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    };
    return date.toLocaleString('en-US', options).replace(',', '');
  };

  const getBannerStyleAndText = () => {
    if (!bannerInfo) return {style: {}, text: ''};

    const status = bannerInfo.parentStatus;
    const startTime = new Date(bannerInfo.start_time);
    const formattedDateTime = formatDateTime(startTime);

    if (status === 'UPCOMING' || status === 'INCOMING') {
      return {
        style: styles.darkBlueBanner,
        text: `You have a schedule ${status.toLowerCase()} on ${formattedDateTime}`,
      };
    } else if (status === 'ONGOING') {
      return {
        style: styles.limeGreenBanner,
        text: `There is a schedule going on on ${formattedDateTime}`,
      };
    }
    return {style: {}, text: ''};
  };

  const {style: bannerStyle, text: bannerText} = getBannerStyleAndText();

  return (
    <View style={styles.container}>
      {bannerInfo && (
        <TouchableOpacity
          style={[styles.banner, bannerStyle]}
          onPress={() => navigation.navigate('GeneralScheduleScreen')}>
          <Icon
            name="calendar-outline"
            size={24}
            color="#FFFFFF"
            style={styles.icon}
          />
          <Text style={styles.bannerText}>{bannerText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
  },
  darkBlueBanner: {
    backgroundColor: '#1E3A8A',
  },
  limeGreenBanner: {
    backgroundColor: '#65A30D',
  },
  icon: {
    marginRight: 8,
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
