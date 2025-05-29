import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { addMinutes, format } from 'date-fns';

interface PendingTimerProps {
    startDate: string;
    status: string;
}

const PendingTimer = ({ startDate, status }: PendingTimerProps) => {
    const [endTime, setEndTime] = useState<string>('');
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        if (status === 'PENDING' && startDate) {
            const startTime = new Date(startDate);
            if (isNaN(startTime.getTime())) {
                console.error('Invalid startDate');
                return;
            }
            const endDate = addMinutes(startTime, 30);
            const formattedEndTime = format(endDate, 'h:mm a');
            setEndTime(formattedEndTime);

            const now = new Date();
            setIsExpired(now >= endDate);
        } else {
            setEndTime('');
            setIsExpired(false);
        }
    }, [startDate, status]);

    if (status !== 'PENDING' || !endTime) return null;

    return (
        <View style={styles.container}>
            <View style={styles.timerCard}>
                <View style={styles.timerContent}>
                    <Icon
                        name="time-outline"
                        size={16}
                        color={isExpired ? '#EF4444' : '#3B82F6'}
                        style={styles.icon}
                    />
                    <Text style={styles.label}>
                        {isExpired ? 'Expired at:' : 'Expires at:'}
                    </Text>
                    <Text style={[
                        styles.timerText,
                        isExpired && styles.expired
                    ]}>
                        {endTime}
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
    expired: {
        color: '#EF4444',
    },
});

export default PendingTimer;