import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet,ViewStyle } from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { EventRegister } from 'react-native-event-listeners';

interface NotificationBellProps {
    onPress: () => void;
    unreadCountProp?: number; 
    style?: ViewStyle;
    iconColor?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ onPress, unreadCountProp, style,iconColor }) => {
    const [unreadCount, setUnreadCount] = useState(unreadCountProp ?? 0);

    // Nếu muốn đồng bộ với prop từ ngoài (ví dụ lấy từ API)
    useEffect(() => {
        if (typeof unreadCountProp === 'number') {
            setUnreadCount(unreadCountProp);
        }
    }, [unreadCountProp]);

    useEffect(() => {
        // Lắng nghe sự kiện nhận thông báo mới
        const listener = EventRegister.addEventListener('newNotification', () => {
            setUnreadCount(prev => prev + 1);
        });

        // Lắng nghe sự kiện reset badge
        const resetListener = EventRegister.addEventListener('resetNotificationBadge', () => {
            setUnreadCount(0);
        });

        return () => {
            EventRegister.removeEventListener(listener as string);
            EventRegister.removeEventListener(resetListener as string);
        };
    }, []);

    const handlePress = () => {
        setUnreadCount(0);
        EventRegister.emit('resetNotificationBadge');
        onPress();
    };

    return (
        <TouchableOpacity style={[style]} onPress={handlePress}>
            <Icon name="notifications-outline" size={24} color={iconColor ? iconColor : "#003363"} />
            {unreadCount > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    badge: {
        position: 'absolute',
        right: -5,
        top: -5,
        backgroundColor: '#EF4444',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        zIndex: 2,
    },
    badgeText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
});

export default NotificationBell;