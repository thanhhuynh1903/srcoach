"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Image,
    StyleSheet,
    Animated,
    Dimensions,
    Vibration,
} from "react-native"
import CommonDialog from "./commons/CommonDialog"
import Icon from "@react-native-vector-icons/ionicons"
import LinearGradient from "react-native-linear-gradient"
import { listSessions } from "./utils/useChatsAPI"
const { width: screenWidth } = Dimensions.get("window")

interface Runner {
    id: string
    name: string
    avatar: string
    email: string
    status?: "online" | "offline" | "busy"
    rating?: number
}

interface ExpertSchedulePopupProps {
    visible: boolean
    onClose: () => void
    onCreateForRunner: (runner: Runner) => void
    onCreateForSelf: () => void
}

const mockRunners: Runner[] = [
    {
        id: "1",
        name: "John Smith",
        avatar: "https://i.pravatar.cc/100?img=1",
        email: "john.smith@example.com",
    },
    {
        id: "2",
        name: "Sarah Johnson",
        avatar: "https://i.pravatar.cc/100?img=2",
        email: "sarah.johnson@example.com",
    },
    {
        id: "3",
        name: "Michael Brown",
        avatar: "https://i.pravatar.cc/100?img=3",
        email: "michael.brown@example.com",
    },
    {
        id: "4",
        name: "Emily Davis",
        avatar: "https://i.pravatar.cc/100?img=4",
        email: "emily.davis@example.com",
    },
]

const ExpertSchedulePopup: React.FC<ExpertSchedulePopupProps> = ({
    visible,
    onClose,
    onCreateForRunner,
    onCreateForSelf,
}) => {
    const [showRunners, setShowRunners] = useState(false);
    const [selectedRunner, setSelectedRunner] = useState<Runner | null>(null);
    const [runners, setRunners] = useState<Runner[]>([]);
    const [loading, setLoading] = useState(false);
    const scaleAnim = new Animated.Value(1)

    useEffect(() => {
        if (visible) {
            setLoading(true);
            listSessions(null)
                .then(res => {
                    if (res.status && Array.isArray(res.data)) {
                        const runnerList = res.data
                            .filter((s: any) => s.status === "ACCEPTED" && s.other_user?.roles?.includes("runner"))
                            .map((s: any) => ({
                                id: s.other_user.id,
                                name: s.other_user.name,
                                avatar: s.other_user.image?.url || "",
                                email: s.other_user.email,
                            }));
                        setRunners(runnerList);
                    } else {
                        setRunners([]);
                    }
                })
                .catch(() => setRunners([]))
                .finally(() => setLoading(false));
        } else {
            setRunners([]);
        }
    }, [visible]);

    const handleRunnerSelect = (runner: Runner) => {
        setSelectedRunner(runner)
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start()
    }

    const handleCreateForRunner = () => {
        if (selectedRunner) {
            onCreateForRunner(selectedRunner)
            setShowRunners(false)
            setSelectedRunner(null)
        }
    }

    const handleClose = () => {
        setShowRunners(false)
        setSelectedRunner(null)
        onClose()
    }

    const handleCreateForSelf = () => {
        Vibration.vibrate(50) // Light haptic feedback
        onCreateForSelf()
        handleClose()
    }

    const getStatusColor = (status?: string) => {
        switch (status) {
            case "online":
                return "#10B981"
            case "busy":
                return "#F59E0B"
            case "offline":
                return "#6B7280"
            default:
                return "#6B7280"
        }
    }

    const renderOptionCard = (
        title: string,
        subtitle: string,
        iconName: string,
        colors: string[],
        onPress: () => void,
        badge?: string,
    ) => (
        <TouchableOpacity
            style={styles.optionCardCustom}
            onPress={onPress}
            activeOpacity={0.8}
            delayPressIn={0}
        >
            <LinearGradient
                colors={colors}
                style={styles.optionGradientCustom}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.optionContentCustom}>
                    <View style={styles.iconContainerCustom}>
                        <Icon name={iconName as any} size={38} color="#fff" />
                    </View>
                    <Text style={styles.optionTitleCustom}>{title}</Text>
                    <Text style={styles.optionSubtitleCustom}>{subtitle}</Text>
                    {badge && (
                        <View style={styles.badgeCustom}>
                            <Text style={styles.badgeTextCustom}>{badge}</Text>
                        </View>
                    )}
                </View>
            </LinearGradient>
        </TouchableOpacity>
    )

    const renderRunnerItem = ({ item }: { item: Runner }) => {
        const isSelected = selectedRunner?.id === item.id
        return (
            <Animated.View style={{ transform: [{ scale: isSelected ? scaleAnim : 1 }] }}>
                <TouchableOpacity
                    style={[styles.runnerItem, isSelected && styles.runnerItemSelected]}
                    onPress={() => handleRunnerSelect(item)}
                    activeOpacity={0.7}
                >
                    <View style={styles.runnerContent}>
                        <View style={styles.avatarContainer}>
                            <Image source={{ uri: item.avatar }} style={styles.avatar} />
                            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]} />
                        </View>

                        <View style={styles.runnerInfo}>
                            <View style={styles.runnerHeader}>
                                <Text style={styles.runnerName}>{item.name}</Text>
                                {item.rating && (
                                    <View style={styles.ratingContainer}>
                                        <Icon name="star" size={14} color="#F59E0B" />
                                        <Text style={styles.rating}>{item.rating}</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.runnerEmail}>{item.email}</Text>

                        </View>

                        {isSelected && (
                            <View style={styles.checkContainer}>
                                <LinearGradient colors={["#10B981", "#059669"]} style={styles.checkIcon}>
                                    <Icon name="checkmark" size={16} color="#FFFFFF" />
                                </LinearGradient>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </Animated.View>
        )
    }

    return (
        <CommonDialog
            visible={visible}
            onClose={handleClose}
            title="Create New Schedule"
            subtitle={showRunners ? "Select a runner to assign the task" : "Choose the type of schedule you want to create"}
            content={
                <View style={styles.container}>
                    {!showRunners ? (
                        <View style={styles.optionsContainer}>
                            <Text style={styles.questionText}>Who would you like to create a schedule for?</Text>

                            <View style={styles.optionsGrid}>
                                {renderOptionCard(
                                    "Assign to Runner",
                                    "Delegate task to a runner",
                                    "people-outline",
                                    ["#3B82F6", "#1D4ED8"],
                                    () => setShowRunners(true),
                                    `${runners?.length} runners`,
                                )}

                                {renderOptionCard(
                                    "Do It Myself",
                                    "Create schedule for yourself",
                                    "person-outline",
                                    ["#10B981", "#059669"],
                                    handleCreateForSelf,
                                    "Personal schedule",
                                )}
                            </View>
                        </View>
                    ) : (
                        <View style={styles.runnersContainer}>
                            {loading ? (
                                <Text style={styles.loadingText}>Loading...</Text>
                            ) : runners.length === 0 ? (
                                <View style={styles.emptyContainer}>
                                    <Icon name="people-outline" size={48} color="#CBD5E1" style={{ marginBottom: 12 }} />
                                    <Text style={styles.emptyText}>You do not have any runner yet.</Text>
                                </View>
                            ) : (
                                <>
                                    <FlatList
                                        data={runners}
                                        keyExtractor={(item) => item.id}
                                        renderItem={renderRunnerItem}
                                        showsVerticalScrollIndicator={false}
                                        contentContainerStyle={styles.runnersList}
                                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                                    />
                                    {selectedRunner && (
                                        <View style={styles.selectedRunnerCard}>
                                            <LinearGradient colors={["#EBF4FF", "#DBEAFE"]} style={styles.selectedRunnerGradient}>
                                                <View style={styles.selectedRunnerContent}>
                                                    <Icon name="checkmark-circle" size={20} color="#3B82F6" />
                                                    <Text style={styles.selectedRunnerText}>
                                                        Selected: <Text style={styles.selectedRunnerName}>{selectedRunner.name}</Text>
                                                    </Text>
                                                </View>
                                            </LinearGradient>
                                        </View>
                                    )}
                                </>
                            )}
                        </View>
                    )}
                </View>
            }
            actionButtons={
                !showRunners
                    ? [
                        {
                            label: "Close",
                            variant: "outlined",
                            handler: handleClose,
                            iconName: "close-outline",
                        },
                    ]
                    : [
                        {
                            label: "Back",
                            variant: "outlined",
                            handler: () => {
                                setShowRunners(false)
                                setSelectedRunner(null)
                            },
                            iconName: "arrow-back-outline",
                        },
                        {
                            label: "Create Schedule",
                            variant: "gradient",
                            handler: handleCreateForRunner,
                            disabled: !selectedRunner,
                            iconName: "calendar-outline",
                        },
                    ]
            }
        />
    )
}

const styles = StyleSheet.create({
    container: {
        minHeight: 200,
    },
    optionsContainer: {
        alignItems: "center",
    },
    questionText: {
        fontSize: 18,
        color: "#1F2937",
        marginBottom: 24,
        textAlign: "center",
        fontWeight: "600",
        lineHeight: 24,
    },
    optionsGrid: {
        flexDirection: "row",
        gap: 16,
        width: "100%",
    },
    optionCardCustom: {
        flex: 1,
        borderRadius: 24,
        overflow: "hidden",
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 16,
        marginHorizontal: 2,
        minHeight: 200,
        marginBottom: 8,
        backgroundColor: "#fff",
    },
    optionGradientCustom: {
        flex: 1,
        paddingVertical: 28,
        paddingHorizontal: 12,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
    },
    optionContentCustom: {
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
    },
    iconContainerCustom: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "rgba(255,255,255,0.18)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    optionTitleCustom: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 6,
        marginTop: 2,
    },
    optionSubtitleCustom: {
        color: "rgba(255,255,255,0.95)",
        fontSize: 14,
        textAlign: "center",
        marginBottom: 14,
        fontWeight: "500",
    },
    badgeCustom: {
        backgroundColor: "rgba(255,255,255,0.7)",
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
        alignSelf: "center",
        marginTop: 2,
    },
    badgeTextCustom: {
        color: "#059669",
        fontWeight: "bold",
        fontSize: 13,
    },
    runnersContainer: {
        maxHeight: 400,
    },
    runnersList: {
        paddingBottom: 16,
    },
    separator: {
        height: 12,
    },
    runnerItem: {
        borderRadius: 16,
        backgroundColor: "#FFFFFF",
        borderWidth: 2,
        borderColor: "#F1F5F9",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    runnerItemSelected: {
        borderColor: "#3B82F6",
        backgroundColor: "#F8FAFF",
        elevation: 6,
        shadowColor: "#3B82F6",
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    runnerContent: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
    },
    avatarContainer: {
        position: "relative",
        marginRight: 16,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#E5E7EB",
    },
    statusIndicator: {
        position: "absolute",
        bottom: -2,
        right: -2,
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: "#FFFFFF",
    },
    runnerInfo: {
        flex: 1,
    },
    runnerHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 4,
    },
    runnerName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
        flex: 1,
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
    },
    rating: {
        fontSize: 12,
        fontWeight: "600",
        color: "#F59E0B",
    },
    runnerEmail: {
        fontSize: 13,
        color: "#6B7280",
        marginBottom: 6,
    },
    statusContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "500",
    },
    checkContainer: {
        marginLeft: 12,
    },
    checkIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
    },
    emptyText: {
        color: "#64748B",
        fontSize: 16,
        fontWeight: "500",
        textAlign: "center",
    },
    loadingText: {
        color: "#64748B",
        fontSize: 16,
        fontWeight: "500",
        textAlign: "center",
        paddingVertical: 40,
    },
    selectedRunnerCard: {
        marginTop: 16,
        borderRadius: 12,
        overflow: "hidden",
    },
    selectedRunnerGradient: {
        padding: 12,
    },
    selectedRunnerContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    selectedRunnerText: {
        fontSize: 14,
        color: "#1E40AF",
        marginLeft: 8,
        fontWeight: "500",
    },
    selectedRunnerName: {
        fontWeight: "700",
    },
})

export default ExpertSchedulePopup
