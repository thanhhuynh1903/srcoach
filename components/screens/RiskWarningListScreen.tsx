import React, {useState, useMemo, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {useNavigation} from '@react-navigation/native';
import useAiRiskStore from '../utils/useAiRiskStore';

const filters = ['All', 'High', 'Moderate', 'Low'];

const RiskWarningListScreen = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();
  
  // Lấy state và hàm từ store
  const {
    healthAlerts,
    isLoadingAlerts,
    error,
    fetchHealthAlerts,
  } = useAiRiskStore();
  
  // Fetch dữ liệu khi component mount
  useEffect(() => {
    const fetchAlerts = async () => {
      await fetchHealthAlerts();
    };
    fetchAlerts();
    
  }, []);
  
  // Chuyển đổi severity thành màu sắc
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return '#EF4444';
      case 'moderate':
        return '#F97316';
      case 'low':
        return '#22C55E';
      default:
        return '#64748B';
    }
  };
  
  // Lọc danh sách theo bộ lọc đang hoạt động và từ khóa tìm kiếm
  const filteredRiskItems = useMemo(() => {
    if (!healthAlerts || healthAlerts.length === 0) return [];
    
    // Lọc theo từ khóa tìm kiếm trước
    let filtered = healthAlerts.filter(item => 
      item.alert_message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.AIHealthAlertType.type_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Sau đó lọc theo mức độ nghiêm trọng
    if (activeFilter !== 'All') {
      filtered = filtered.filter(item => item.severity === activeFilter);
    }

    return filtered;
  }, [activeFilter, searchQuery, healthAlerts]);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Hiển thị loading
  if (isLoadingAlerts) {
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading health alerts...</Text>
        </View>
      </SafeAreaView>
    );
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
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchHealthAlerts}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Icon name="menu" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health Risk Analysis</Text>
        <TouchableOpacity>
          <Icon name="plus" size={24} color="#2563EB" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#64748B" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search health alerts"
          placeholderTextColor="#64748B"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={20} color="#64748B" />
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
        {filters.map(filter => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterTab,
              activeFilter === filter && styles.filterTabActive,
            ]}
            onPress={() => setActiveFilter(filter)}>
            <Text
              style={[
                styles.filterText,
                activeFilter === filter && styles.filterTextActive,
              ]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Risk List */}
      <ScrollView style={styles.riskList}>
        {filteredRiskItems.length > 0 ? (
          filteredRiskItems.map(item => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.riskItem} 
              onPress={() => {
                navigation.navigate('RiskWarningScreen' as never, { alertId: item.id } as never);
              }}
            >
              <View style={styles.riskHeader}>
                <Text style={styles.riskTitle}>{item.alert_message}</Text>
                <View
                  style={[styles.statusDot, {backgroundColor: getSeverityColor(item.severity)}]}
                />
              </View>
              <Text style={styles.riskDescription}>
                {item.AIHealthAlertType.type_name} - {item.AIHealthAlertType.description}
              </Text>
              <View style={styles.riskFooter}>
                <Text style={styles.date}>{formatDate(item.alert_date)}</Text>
                <View style={styles.riskStatus}>
                  <Text style={[styles.riskLevel, {color: getSeverityColor(item.severity)}]}>
                    {item.severity} Risk
                  </Text>
                  {item.score && (
                    <Text
                      style={[
                        styles.score,
                        {
                          backgroundColor:
                            Number(item.score) < 30
                              ? '#4CAF50'
                              : Number(item.score) < 60
                              ? '#FFA000'
                              : '#FF4444',
                        },
                      ]}>
                      {item.score}/100
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Icon name="search-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyStateTitle}>No results found</Text>
            <Text style={styles.emptyStateDescription}>
              Try adjusting your search or filter to find what you're looking for
            </Text>
          </View>
        )}
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    padding: 0,
  },
  filtersScrollView: {
    maxHeight: 40,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
    flexDirection: 'row',
  },
  filterTab: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    justifyContent: 'center',
    paddingHorizontal: 16,
    height: 36,
  },
  filterTabActive: {
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  filterText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  riskList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  riskItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  riskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    marginRight: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  riskDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 20,
  },
  riskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 14,
    color: '#64748B',
  },
  riskStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  riskLevel: {
    fontSize: 14,
    fontWeight: '500',
  },
  score: {
    fontSize: 14,
    color: '#FFFFFF',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  completedStatus: {
    fontSize: 14,
    color: '#64748B',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default RiskWarningListScreen;
