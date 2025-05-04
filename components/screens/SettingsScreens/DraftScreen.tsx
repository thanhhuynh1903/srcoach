import React, {useState, useEffect, useCallback} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
  Dimensions,
} from 'react-native';
import BackButton from '../../BackButton';
import {usePostStore} from '../../utils/usePostStore';
import {useNavigation} from '@react-navigation/native';
import {formatTimeAgo} from '../../utils/utils_format';
import Icon from '@react-native-vector-icons/ionicons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  runOnJS,
  FadeIn,
  FadeOut,
  SlideOutRight,
  Layout,
  LinearTransition,
  Easing,
} from 'react-native-reanimated';
import CommonDialog from '../../commons/CommonDialog';
const {width} = Dimensions.get('window');

interface DraftItem {
  id: string;
  title: string;
  content: string;
  images: {url: string}[];
  created_at: string;
  is_deleted?: boolean;
}

// Animated TouchableOpacity component
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const DraftsScreen: React.FC = () => {
  const navigation = useNavigation();
  const {getDrafts, postDraft, status, isLoading, deleteDraft} = usePostStore();
  const [isEditing, setIsEditing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [localDrafts, setLocalDrafts] = useState<DraftItem[]>([]);
  
  // Sử dụng localDrafts thay vì lọc trực tiếp từ postDraft
  // Điều này cho phép chúng ta cập nhật UI mà không cần reload từ API
 
  // Load drafts on mount
  useEffect(() => {
    const loadData = async () => {
      setShowSkeleton(true);
      await getDrafts();
      // Simulate a minimum loading time for better UX
      setTimeout(() => {
        setShowSkeleton(false);
      }, 1000);
    };

    loadData();
  }, []);
  
  // Cập nhật localDrafts khi postDraft thay đổi
  useEffect(() => {
    setLocalDrafts(postDraft.filter(item => !item.is_deleted));
  }, [postDraft]);

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  const handleDeleteDraft = async (postId: string) => {
    Alert.alert('Delete Draft', 'Are you sure you want to delete this draft?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          // Set the deleting ID to trigger animation
          setDeletingId(postId);
          // Actual deletion happens after animation in the item component
        },
      },
    ]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await getDrafts();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Skeleton loading component
  const SkeletonItem = () => {
    // Animation values for the shimmer effect
    const shimmerPosition = useSharedValue(-width);

    useEffect(() => {
      // Create an infinite shimmer animation
      const startAnimation = () => {
        shimmerPosition.value = -width;
        shimmerPosition.value = withTiming(
          width * 2,
          {
            duration: 2000,
            easing: Easing.ease,
          },
          finished => {
            if (finished) {
              runOnJS(startAnimation)();
            }
          },
        );
      };

      startAnimation();
    }, []);

    // Animated style for the shimmer effect
    const shimmerStyle = useAnimatedStyle(() => ({
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      transform: [{translateX: shimmerPosition.value}],
    }));

    return (
      <Animated.View style={styles.draftItem} entering={FadeIn.duration(300)}>
        <View style={styles.draftContentWrapper}>
          <View style={[styles.draftImage, styles.skeletonBox]} />
          <View style={styles.draftContent}>
            <View style={[styles.skeletonTitle, styles.skeletonBox]} />
            <View style={[styles.skeletonText, styles.skeletonBox]} />
            <View
              style={[styles.skeletonText, styles.skeletonBox, {width: '40%'}]}
            />
            <View style={[styles.skeletonTime, styles.skeletonBox]} />
          </View>
        </View>
        <Animated.View style={shimmerStyle} />
      </Animated.View>
    );
  };

  // Animated draft item component
  const AnimatedDraftItem = ({
    item,
    onDelete,
  }: {
    item: DraftItem;
    onDelete: (id: string) => void;
  }) => {
    const opacity = useSharedValue(1);
    const height = useSharedValue('auto');
    const scale = useSharedValue(1);
    const isDeleting = item.id === deletingId;

    useEffect(() => {
      if (isDeleting) {
        // Start delete animation sequence
        scale.value = withSequence(
          withTiming(0.95, {duration: 100}),
          withTiming(1.02, {duration: 100}),
          withTiming(1, {duration: 100}),
        );

        // After the scale animation, start fade out and collapse
        setTimeout(() => {
          opacity.value = withTiming(0, {duration: 300});
          height.value = withTiming(0, {duration: 300}, finished => {
            if (finished) {
              // When animation is complete, actually delete the item
              runOnJS(onDelete)(item.id);
            }
          });
        }, 300);
      }
    }, [isDeleting]);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      height: height.value,
      transform: [{scale: scale.value}],
      overflow: 'hidden',
    }));

    return (
      <Animated.View
        style={[animatedStyle]}
        layout={Layout.springify()}
        entering={FadeIn.duration(300).delay(200)}>
        <View style={styles.draftItem}>
          <TouchableOpacity
            style={styles.draftContentWrapper}
            onPress={() =>
              isEditing
                ? null
                : navigation.navigate('CommunityPostDetailScreen', {
                    id: item.id,
                  })
            }>
            {item?.images?.length > 0 && (
              <Image
                source={{uri: item.images[0]?.url}}
                style={styles.draftImage}
                resizeMode="cover"
              />
            )}
            <View style={styles.draftContent}>
              <Text style={styles.draftTitle}>{item.title}</Text>
              <Text style={styles.draftPreview} numberOfLines={2}>
                {item.content}
              </Text>
              <Text style={styles.draftTime}>
                {formatTimeAgo(item.created_at)}
              </Text>
            </View>
          </TouchableOpacity>

          {isEditing && (
            <AnimatedTouchable
              style={styles.deleteButton}
              onPress={() => handleDeleteDraft(item.id)}
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(200)}>
              <Icon name="trash-outline" size={20} color="#ff4444" />
            </AnimatedTouchable>
          )}
        </View>
      </Animated.View>
    );
  };

  // Function to actually delete the draft after animation
  const performDelete = async (id: string) => {
    try {
      const success = await deleteDraft(id);
      if (success) {
        // Cập nhật localDrafts thay vì gọi getDrafts
        setLocalDrafts(prevDrafts => prevDrafts.filter(draft => draft.id !== id));
        
        // Reset the deleting ID
        setDeletingId(null);
        
        // Không cần gọi getDrafts() nữa
      } else {
        Alert.alert('Error', 'Failed to delete draft');
        setDeletingId(null);
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while deleting the draft');
      setDeletingId(null);
    }
  };

  // Empty state with animation
  const EmptyState = () => (
    <Animated.View
      style={styles.emptyContainer}
      entering={FadeIn.duration(500).delay(300)}>
      <Icon name="document-text-outline" size={48} color="#999" />
      <Text style={styles.emptyText}>No drafts available</Text>
    </Animated.View>
  );

  // Loading state with skeleton
  if (showSkeleton) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <BackButton size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Drafts</Text>
          <View style={{width: 40}} />
        </View>

        {/* Skeleton Count */}
        <View style={styles.countContainer}>
          <View style={[styles.skeletonBox, {width: 80, height: 16}]} />
        </View>

        {/* Skeleton List */}
        <FlatList
          data={[1, 2, 3, 4, 5]}
          renderItem={() => <SkeletonItem />}
          keyExtractor={(_, index) => `skeleton-${index}`}
          contentContainerStyle={styles.listContainer}
        />
      </SafeAreaView>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <BackButton size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Drafts</Text>
          <View style={{width: 40}} />
        </View>

        <Animated.View
          style={styles.errorContainer}
          entering={FadeIn.duration(500)}>
          <Icon name="alert-circle-outline" size={48} color="red" />
          <Text style={styles.errorText}>Error loading drafts</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // Main content
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <BackButton size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Drafts</Text>
        <TouchableOpacity onPress={toggleEditMode}>
          <Text style={styles.editButton}>
            {localDrafts.length === 0 ? (
              <Text>Edit</Text>
            ) : isEditing ? (
              <Text>Done</Text>
            ) : (
              <Text>Edit</Text>
            )}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Draft Count */}
      <Animated.View style={styles.countContainer} layout={Layout}>
        <Text style={styles.countText}>
          {localDrafts.length} {localDrafts.length === 1 ? 'Draft' : 'Drafts'}
        </Text>
      </Animated.View>

      {/* Drafts List */}
      <FlatList
        data={localDrafts}
        renderItem={({item}) => (
          <AnimatedDraftItem item={item} onDelete={performDelete} />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={EmptyState}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        itemLayoutAnimation={LinearTransition.springify()}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Styles không thay đổi
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  editButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  countContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F8F8',
  },
  countText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  draftItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  draftContentWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  draftImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  draftContent: {
    flex: 1,
    justifyContent: 'center',
  },
  draftTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  draftPreview: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
  draftTime: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 8,
    color: '#007AFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    marginTop: 16,
    color: 'red',
    fontSize: 16,
  },
  retryButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 16,
    color: '#999',
    fontSize: 16,
  },
  // Skeleton styles
  skeletonBox: {
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  skeletonTitle: {
    height: 16,
    width: '80%',
    marginBottom: 8,
  },
  skeletonText: {
    height: 12,
    width: '90%',
    marginBottom: 6,
  },
  skeletonTime: {
    height: 10,
    width: '30%',
    marginTop: 4,
  },
});

export default DraftsScreen;
