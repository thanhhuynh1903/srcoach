import type React from "react"
import { View, StyleSheet } from "react-native"
import SkeletonPost from "./SkeletonPost"

interface SkeletonPostCardProps {
  isInput?: boolean
}

const SkeletonPostCard: React.FC<SkeletonPostCardProps> = ({ isInput = false }) => {
  return (
    <View style={[styles.card, isInput && styles.inputCard]}>
      <View style={styles.header}>
        <SkeletonPost width={40} height={40} borderRadius={20} />
        {isInput ? (
          <SkeletonPost width="80%" height={36} style={styles.inputField} borderRadius={18} />
        ) : (
          <View style={styles.headerInfo}>
            <SkeletonPost width={100} height={16} style={styles.username} />
            <SkeletonPost width={60} height={12} style={styles.time} />
          </View>
        )}
        {!isInput && <SkeletonPost width={24} height={24} style={styles.menuIcon} />}
      </View>

      {!isInput && (
        <View style={styles.content}>
          <SkeletonPost width="60%" height={18} style={styles.title} />
          <SkeletonPost width="40%" height={16} style={styles.text} />

          <View style={styles.actions}>
            <View style={styles.actionItem}>
              <SkeletonPost width={20} height={20} style={styles.actionIcon} />
              <SkeletonPost width={20} height={14} />
            </View>
            <View style={styles.actionItem}>
              <SkeletonPost width={20} height={20} style={styles.actionIcon} />
              <SkeletonPost width={20} height={14} />
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inputCard: {
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  username: {
    marginBottom: 4,
  },
  time: {
    marginTop: 4,
  },
  menuIcon: {
    borderRadius: 12,
  },
  inputField: {
    marginLeft: 12,
    borderRadius: 18,
  },
  content: {
    marginTop: 12,
  },
  title: {
    marginBottom: 8,
  },
  text: {
    marginBottom: 16,
  },
  actions: {
    flexDirection: "row",
    marginTop: 8,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
  },
  actionIcon: {
    marginRight: 4,
  },
})

export default SkeletonPostCard
