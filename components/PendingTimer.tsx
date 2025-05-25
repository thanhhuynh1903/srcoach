import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { differenceInSeconds, addMinutes } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PendingTimerProps {
    startDate: string;
    status: string;
}

const COUNTDOWN_KEY = 'pending_timer_start';

const PendingTimer = ({ startDate, status }: PendingTimerProps) => {
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [isExpired, setIsExpired] = useState(false);

    const formatTime = (seconds: number) => {
        if (seconds <= 0) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        let timer: NodeJS.Timeout;
        let targetDate: Date;

        const setupCountdown = async () => {
            if (status === 'PENDING') {
                // Lấy timestamp bắt đầu từ AsyncStorage
                const stored = await AsyncStorage.getItem(COUNTDOWN_KEY);
                let startTimestamp = stored ? parseInt(stored, 10) : null;

                // Nếu chưa có, lưu thời điểm hiện tại
                if (!startTimestamp) {
                    startTimestamp = Date.now();
                    await AsyncStorage.setItem(COUNTDOWN_KEY, startTimestamp.toString());
                }

                targetDate = addMinutes(new Date(startTimestamp), 30);

                const calculateTimeLeft = () => {
                    const now = new Date();
                    const diff = differenceInSeconds(targetDate, now);
                    setTimeLeft(diff > 0 ? diff : 0);
                    setIsExpired(diff <= 0);
                };

                calculateTimeLeft();
                timer = setInterval(calculateTimeLeft, 1000);
            } else {
                // Nếu không phải PENDING, xóa timestamp
                await AsyncStorage.removeItem(COUNTDOWN_KEY);
            }
        };

        setupCountdown();

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [status]);

    if (status !== 'PENDING') return null;

    return (
        <View style={styles.container}>
            <View style={styles.timerCard}>
                <View style={styles.timerContent}>
                    <Icon
                        name="time-outline"
                        size={16}
                        color={isExpired ? '#EF4444' : timeLeft < 300 ? '#F59E0B' : '#3B82F6'}
                        style={styles.icon}
                    />
                    <Text style={styles.label}>Expired in:</Text>
                    <Text style={[
                        styles.timerText,
                        isExpired && styles.expired,
                        timeLeft < 300 && !isExpired && styles.warning
                    ]}>
                        {!isExpired && formatTime(timeLeft)}
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'flex-start',
        alignSelf: 'flex-start',
    },
    timerCard: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 8,
        alignSelf: 'flex-start',
    },
    timerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    icon: {
        marginRight: 4,
    },
    label: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
    },
    timerText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3B82F6',
    },
    warning: {
        color: '#F59E0B',
    },
    expired: {
        color: '#EF4444',
    },
});

export default PendingTimer;