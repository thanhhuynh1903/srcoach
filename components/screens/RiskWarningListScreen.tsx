import { useState, useMemo, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  Alert,
} from "react-native"
import Icon from "@react-native-vector-icons/ionicons"
import { useNavigation } from "@react-navigation/native"
import useAiRiskStore from "../utils/useAiRiskStore"

const filters = ["All", "High", "Moderate", "Normal"]
const { width, height } = Dimensions.get("window")
const guidelineBaseWidth = 350
const guidelineBaseHeight = 680

const scale = (size: number) => (width / guidelineBaseWidth) * size
const verticalScale = (size: number) => (height / guidelineBaseHeight) * size
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor

const RiskWarningListScreen = () => {
  const [activeFilter, setActiveFilter] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const navigation = useNavigation()

  // Lấy state và hàm từ store
  const { healthAlerts, isLoadingAlerts, error, fetchHealthAlerts, deleteHealthAlert, isLoading, status, message } =
    useAiRiskStore()

  // Fetch dữ liệu khi component mount
  useEffect(() => {
    const fetchAlerts = async () => {
      await fetchHealthAlerts()
    }
    fetchAlerts()
  }, [])

  // Xử lý xóa cảnh báo
  const handleDeleteAlert = (alertId: string) => {
    Alert.alert(
      "Delete Health Alert",
      "Are you sure you want to delete this health alert? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const success = await deleteHealthAlert(alertId)
              if (success) {
                Alert.alert("Success", "Health alert deleted successfully")
              } else {
                Alert.alert("Error", message || "Failed to delete health alert")
              }
            } catch (error) {
              console.error("Error deleting health alert:", error)
              Alert.alert("Error", "An unexpected error occurred")
            }
          },
        },
      ],
      { cancelable: true },
    )
  }

  // Chuyển đổi severity thành màu sắc
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
        return "#EF4444"
      case "moderate":
        return "#F97316"
      case "low":
        return "#22C55E"
      default:
        return "#64748B"
    }
  }

  // Lọc danh sách theo bộ lọc đang hoạt động và từ khóa tìm kiếm
  const filteredRiskItems = useMemo(() => {
    if (!healthAlerts || healthAlerts.length === 0) return []

    // Lọc theo từ khóa tìm kiếm trước
    let filtered = healthAlerts.filter(
      (item) =>
        item.alert_message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.AIHealthAlertType.type_name.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    // Sau đó lọc theo mức độ nghiêm trọng
    if (activeFilter !== "All") {
      filtered = filtered.filter((item) => item.severity === activeFilter)
    }

    return filtered
  }, [activeFilter, searchQuery, healthAlerts])

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Hiển thị loading
  if (isLoadingAlerts) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity>
            <Icon name="menu" size={moderateScale(24)} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Risk Analysis</Text>
          <TouchableOpacity>
            <Icon name="plus" size={moderateScale(24)} color="#2563EB" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading health alerts...</Text>
        </View>
      </SafeAreaView>
    )
  }

  // Hiển thị lỗi
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity>
            <Icon name="menu" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Risk Analysis</Text>
          <TouchableOpacity>
            <Icon name="plus" size={24} color="#2563EB" />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyState}>
          <Icon name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.emptyStateTitle}>Error</Text>
          <Text style={styles.emptyStateDescription}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchHealthAlerts}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Icon name="menu" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health Risk Analysis</Text>
        <TouchableOpacity>
          <Icon name="plus" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={moderateScale(20)} color="#64748B" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search health alerts"
          placeholderTextColor="#64748B"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Icon name="close-circle" size={moderateScale(20)} color="#64748B" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScrollView}
        contentContainerStyle={styles.filtersContainer}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterTab, activeFilter === filter && styles.filterTabActive]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>{filter}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Risk List */}
      <ScrollView style={styles.riskList}>
        {filteredRiskItems.length > 0 ? (
          filteredRiskItems.map((item) => (
            <View key={item.id} style={styles.riskItemContainer}>
              <TouchableOpacity
                style={styles.riskItem}
                onPress={() => {
                  navigation.navigate("RiskWarningScreen" as never, { alertId: item.id } as never)
                }}
              >
                <View style={styles.riskHeader}>
                  <Text style={styles.riskTitle}>{item.alert_message}</Text>
                </View>
                <Text style={styles.riskDescription}>
                  {item.AIHealthAlertType.type_name} - {item.AIHealthAlertType.description}
                </Text>
                <View style={styles.riskFooter}>
                  <Text style={styles.date}>{formatDate(item.alert_date)}</Text>
                  <View style={styles.riskStatus}>
                    <Text style={[styles.riskLevel, { color: getSeverityColor(item.severity) }]}>
                      {item.severity} Risk
                    </Text>
                    {item.score !== undefined && item.score !== null && (
                      <Text
                        style={[
                          styles.score,
                          {
                            backgroundColor:
                              Number(item.score) < 30 ? "#4CAF50" : Number(item.score) < 60 ? "#FFA000" : "#FF4444",
                          },
                        ]}
                      >
                        {item.score}/100
                      </Text>
                    )}
                  </View>
                </View>

                {/* Updated delete button */}
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteAlert(item.id)}
                  disabled={isLoading}
                >
                  {isLoading && status === "loading" ? (
                    <ActivityIndicator size="small" color="#EF4444" />
                  ) : (
                    <Icon name="trash-outline" size={moderateScale(16)} color="#EF4444" />
                  )}
                </TouchableOpacity>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Icon name="search-outline" size={moderateScale(48)} color="#CBD5E1" />
            <Text style={styles.emptyStateTitle}>No results found</Text>
            <Text style={styles.emptyStateDescription}>
              Try adjusting your search or filter to find what you're looking for
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

// Styling the delete button to make it more native and improve UI/UX
// Update the riskItemContainer and riskItem styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: moderateScale(16),
    paddingVertical: verticalScale(12),
  },
  headerTitle: {
    fontSize: moderateScale(16),
    fontWeight: "600",
    color: "#000000",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: moderateScale(16),
    marginVertical: verticalScale(12),
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(12),
    backgroundColor: "#F8FAFC",
    gap: moderateScale(8),
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(16),
    color: "#000000",
    padding: 0,
  },
  filtersScrollView: {
    maxHeight: verticalScale(40),
  },
  filtersContainer: {
    paddingHorizontal: moderateScale(16),
    gap: moderateScale(12),
    marginBottom: verticalScale(16),
    flexDirection: "row",
  },
  filterTab: {
    backgroundColor: "#F8FAFC",
    borderRadius: moderateScale(20),
    justifyContent: "center",
    paddingHorizontal: moderateScale(16),
    height: verticalScale(25),
  },
  filterTabActive: {
    backgroundColor: "#2563EB",
    shadowColor: "#2563EB",
    shadowOffset: {
      width: 0,
      height: moderateScale(2),
    },
    shadowOpacity: 0.15,
    shadowRadius: moderateScale(4),
    elevation: 3,
  },
  filterText: {
    fontSize: moderateScale(14),
    color: "#64748B",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  riskList: {
    flex: 1,
    paddingHorizontal: moderateScale(16),
  },
  riskItemContainer: {
    marginBottom: verticalScale(12),
    position: "relative", // Add this to position the delete button
  },

  riskItem: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: moderateScale(2),
    },
    shadowOpacity: 0.05,
    shadowRadius: moderateScale(4),
    elevation: 2,
  },
  riskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(8),
  },
  riskTitle: {
    fontSize: moderateScale(16),
    fontWeight: "600",
    color: "#000000",
    flex: 1,
    marginRight: moderateScale(12),
  },
  statusDot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
  },
  riskDescription: {
    fontSize: moderateScale(14),
    color: "#64748B",
    marginBottom: verticalScale(12),
    lineHeight: moderateScale(20),
  },
  riskFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: {
    fontSize: moderateScale(10),
    color: "#64748B",
  },
  riskStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(8),
  },
  riskLevel: {
    fontSize: moderateScale(10),
    fontWeight: "500",
  },
  score: {
    fontSize: moderateScale(10),
    color: "#FFFFFF",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: moderateScale(8),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(12),
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(60),
    paddingHorizontal: moderateScale(20),
  },
  emptyStateTitle: {
    fontSize: moderateScale(18),
    fontWeight: "600",
    color: "#0F172A",
    marginTop: verticalScale(16),
    marginBottom: verticalScale(8),
  },
  emptyStateDescription: {
    fontSize: moderateScale(14),
    color: "#64748B",
    textAlign: "center",
    lineHeight: moderateScale(20),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: verticalScale(12),
    fontSize: moderateScale(16),
    color: "#64748B",
  },
  retryButton: {
    marginTop: verticalScale(16),
    backgroundColor: "#2563EB",
    paddingHorizontal: moderateScale(24),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(8),
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  // Update the delete button style
  deleteButton: {
    position: "absolute",
    top: moderateScale(10),
    right: moderateScale(10),
    backgroundColor: "rgba(239, 68, 68, 0.1)", // Lighter red background
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16), // Make it circular
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10, // Ensure it's above other elements
  },
})

export default RiskWarningListScreen
