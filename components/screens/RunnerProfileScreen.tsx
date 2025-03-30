import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, SafeAreaView, StatusBar } from "react-native"
import Icon from "@react-native-vector-icons/ionicons"
import BackButton from "../BackButton"
const RunnerProfileScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <BackButton size={24}/>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Image source={{ uri: "https://randomuser.me/api/portraits/women/32.jpg" }} style={styles.profileImage} />
          <Text style={styles.profileName}>Sarah Johnson</Text>
          <Text style={styles.profileBio}>
            Fitness enthusiast | Marathon runner | Helping others achieve their fitness goals
          </Text>
          <View style={styles.locationContainer}>
            <Icon name="location-outline" size={16} color="#64748B" />
            <Text style={styles.locationText}>San Francisco, CA</Text>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>1.2K</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>45.6K</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>328</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
        </View>

        {/* Follow Button */}
        {/* <TouchableOpacity style={styles.followButton}>
          <Text style={styles.followButtonText}>Follow</Text>
        </TouchableOpacity> */}

        {/* Achievements Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsContainer}>
            <View style={styles.achievementItem}>
              <View style={styles.achievementIconContainer}>
                <Icon name="medal" size={24} color="#0F2B5B" />
              </View>
              <Text style={styles.achievementTitle}>Marathon Master</Text>
              <Text style={styles.achievementDescription}>Completed 10 marathons</Text>
            </View>

            <View style={styles.achievementItem}>
              <View style={styles.achievementIconContainer}>
                <Icon name="trophy" size={24} color="#0F2B5B" />
              </View>
              <Text style={styles.achievementTitle}>Top Contributor</Text>
              <Text style={styles.achievementDescription}>1000+ helpful posts</Text>
            </View>

            <View style={styles.achievementItem}>
              <View style={styles.achievementIconContainer}>
                <Icon name="people" size={24} color="#0F2B5B" />
              </View>
              <Text style={styles.achievementTitle}>Community Leader</Text>
              <Text style={styles.achievementDescription}>Most active expert</Text>
            </View>
          </View>
        </View>

        {/* Posts Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Posts</Text>

          {/* Post 1 */}
          <View style={styles.postCard}>
            <Text style={styles.postTitle}>Morning Run Challenge Completed!</Text>
            <Text style={styles.postContent}>
              Completed my 10K morning run with a new personal best! The weather was perfect and I felt great throughout
              the entire run. Thanks to everyone who joined!
            </Text>

            <View style={styles.runStatsContainer}>
              <View style={styles.runStatItem}>
                <Icon name="walk" size={16} color="#64748B" />
                <Text style={styles.runStatText}>10.2km</Text>
              </View>
              <Text style={styles.runStatDot}>•</Text>
              <View style={styles.runStatItem}>
                <Icon name="time" size={16} color="#64748B" />
                <Text style={styles.runStatText}>48:23</Text>
              </View>
              <Text style={styles.runStatDot}>•</Text>
              <View style={styles.runStatItem}>
                <Icon name="speedometer" size={16} color="#64748B" />
                <Text style={styles.runStatText}>4'45"/km</Text>
              </View>
            </View>

            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
              }}
              style={styles.postImage}
            />

            <View style={styles.postEngagement}>
              <View style={styles.engagementItem}>
                <Icon name="arrow-up" size={20} color="#0F2B5B" />
                <Text style={styles.engagementText}>189</Text>
              </View>
              <View style={styles.engagementItem}>
                <Icon name="arrow-down" size={20} color="#64748B" />
                <Text style={styles.engagementText}>8</Text>
              </View>
              <View style={styles.engagementItemRight}>
                <Icon name="chatbubble-outline" size={20} color="#64748B" />
                <Text style={styles.engagementText}>27</Text>
              </View>
            </View>
          </View>

          {/* Post 2 */}
          <View style={styles.postCard}>
            <Text style={styles.postTitle}>Recovery Day Tips</Text>
            <Text style={styles.postContent}>
              Here's how I structure my recovery days to maximize performance and prevent injuries. Remember, rest is
              just as important as training!
            </Text>

            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1474&q=80",
              }}
              style={styles.postImage}
            />

            <View style={styles.postEngagement}>
              <View style={styles.engagementItem}>
                <Icon name="arrow-up" size={20} color="#0F2B5B" />
                <Text style={styles.engagementText}>189</Text>
              </View>
              <View style={styles.engagementItem}>
                <Icon name="arrow-down" size={20} color="#64748B" />
                <Text style={styles.engagementText}>8</Text>
              </View>
              <View style={styles.engagementItemRight}>
                <Icon name="chatbubble-outline" size={20} color="#64748B" />
                <Text style={styles.engagementText}>27</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 8,
  },
  profileBio: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 22,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 14,
    color: "#64748B",
    marginLeft: 4,
  },
  statsSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#F1F5F9",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#64748B",
  },
  statDivider: {
    width: 1,
    height: "60%",
    backgroundColor: "#F1F5F9",
    alignSelf: "center",
  },
  followButton: {
    backgroundColor: "#0F2B5B",
    borderRadius: 8,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 16,
    alignItems: "center",
  },
  followButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  sectionContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 16,
  },
  achievementsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  achievementItem: {
    alignItems: "center",
    width: "30%",
  },
  achievementIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E0E7FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
  },
  postCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    overflow: "hidden",
  },
  postTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
    padding: 16,
    paddingBottom: 8,
  },
  postContent: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  runStatsContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  runStatItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  runStatText: {
    fontSize: 14,
    color: "#64748B",
    marginLeft: 4,
  },
  runStatDot: {
    fontSize: 14,
    color: "#64748B",
    marginHorizontal: 8,
  },
  postImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  postEngagement: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  engagementItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  engagementItemRight: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
  },
  engagementText: {
    fontSize: 14,
    color: "#64748B",
    marginLeft: 4,
  },
})

export default RunnerProfileScreen

