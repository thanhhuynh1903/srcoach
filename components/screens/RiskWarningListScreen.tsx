import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
const filters = ['All', 'High Risk', 'Medium Risk', 'Low'];

const riskItems = [
  {
    id: 1,
    title: 'Production Line Safety Assessment',
    description:
      'Comprehensive analysis of manufacturing safety protocols and potential hazards',
    date: 'Jan 15, 2024',
    riskLevel: 'High Risk',
    score: 78,
    status: '',
    color: '#EF4444',
  },
  {
    id: 2,
    title: 'Supply Chain Vulnerability',
    description:
      'Evaluation of potential disruptions and mitigation strategies in supply network',
    date: 'Jan 14, 2024',
    riskLevel: 'Medium Risk',
    score: 50,
    status: '',
    color: '#F97316',
  },
  {
    id: 3,
    title: 'Cybersecurity Assessment',
    description: 'Analysis of system vulnerabilities and security measures',
    date: 'Jan 12, 2024',
    riskLevel: 'High Risk',
    score: '',
    status: 'Completed',
    color: '#EF4444',
  },
  {
    id: 4,
    title: 'Environmental Compliance',
    description: 'Review of environmental impact and regulatory compliance',
    date: 'Jan 10, 2024',
    riskLevel: 'Low Risk',
    score: 3,
    status: '',
    color: '#22C55E',
  },
];

const RiskWarningListScreen = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Icon name="menu" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Risk Analysis</Text>
        <TouchableOpacity>
          <Icon name="plus" size={24} color="#2563EB" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#64748B" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search risk analysis"
          placeholderTextColor="#64748B"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
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
      </View>

      {/* Risk List */}
      <ScrollView style={styles.riskList}>
        <View>
          {riskItems.map(item => (
            <TouchableOpacity key={item.id} style={styles.riskItem}>
              <View style={styles.riskHeader}>
                <Text style={styles.riskTitle}>{item.title}</Text>
                <View
                  style={[styles.statusDot, {backgroundColor: item.color}]}
                />
              </View>
              <Text style={styles.riskDescription}>{item.description}</Text>
              <View style={styles.riskFooter}>
                <Text style={styles.date}>{item.date}</Text>
                <View style={styles.riskStatus}>
                  <Text style={[styles.riskLevel, {color: item.color}]}>
                    {item.riskLevel}
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
                  {item.status && (
                    <Text style={styles.completedStatus}>{item.status}</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    padding: 0,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
    height: 40,
  },
  filterTab: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    justifyContent: 'center',
    paddingHorizontal: 16,
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
});

export default RiskWarningListScreen;
