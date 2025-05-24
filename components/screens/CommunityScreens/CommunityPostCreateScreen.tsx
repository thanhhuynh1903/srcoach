import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import BackButton from '../../BackButton';
import {launchImageLibrary} from 'react-native-image-picker';
import {usePostStore} from '../../utils/usePostStore';
import {useNavigation} from '@react-navigation/native';
import type {ExerciseRecord} from './RecordSelectionModal';
import RecordSelectionButton from './RecordSelectionButton';
import image_placeholder from '../../assets/Posts/image_placeholder.jpg';

interface CommunityPostCreateScreenProps {
  onPost?: (postData: PostData) => void;
}

interface PostData {
  title: string;
  content: string;
  images: string[];
  tags: string[];
  runRecord?: string;
}

// Hằng số cho giới hạn
const MAX_IMAGES = 8;
const MAX_TAGS = 10;

const CommunityPostCreateScreen: React.FC<CommunityPostCreateScreenProps> = ({
  onPost,
}) => {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [tags, setTags] = useState('');
  const [runRecord, setRunRecord] = useState<ExerciseRecord | null>(null);
  const [tagCount, setTagCount] = useState(0);
  const [tagError, setTagError] = useState('');

  const {createPost, isLoading, status, message, getAll, getMyPosts} =
    usePostStore();

  // Theo dõi số lượng tags
  useEffect(() => {
    const tagArray = tags.split(',').filter(tag => tag.trim() !== '');
    setTagCount(tagArray.length);

    if (tagArray.length > MAX_TAGS) {
      setTagError(`Maximum ${MAX_TAGS} tags allowed`);
    } else {
      setTagError('');
    }
  }, [tags]);

  const handleAddImage = () => {
    if (selectedImages.length >= MAX_IMAGES) {
      Alert.alert('Photo Limit', `You can only add up to ${MAX_IMAGES} photos`);
      return;
    }

    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert(
          'Error',
          response.errorMessage || 'An error occurred while selecting a photo.',
        );
      } else if (response.assets && response.assets.length > 0) {
        // Thêm ảnh mới vào danh sách nếu chưa vượt quá giới hạn
        if (selectedImages.length < MAX_IMAGES) {
          setSelectedImages([...selectedImages, response.assets[0]]);
        } else {
          Alert.alert(
            'Photo Limit',
            `You can only add up to ${MAX_IMAGES} photos`,
          );
        }
      }
    });
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = [...selectedImages];
    updatedImages.splice(index, 1);
    setSelectedImages(updatedImages);
  };

  const handleSelectRecord = (record: ExerciseRecord) => {
    setRunRecord(record);
  };

  const handleTagsChange = (text: string) => {
    setTags(text);

    // Kiểm tra số lượng tags ngay khi người dùng nhập
    const tagArray = text.split(',').filter(tag => tag.trim() !== '');
    if (tagArray.length > MAX_TAGS) {
      setTagError(`Maximum ${MAX_TAGS} tags allowed`);
    } else {
      setTagError('');
    }
  };

  const handlePost = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Missing information', 'Please enter both title and content');
      return;
    }

    // Kiểm tra số lượng tags
    const tagArray = tags.split(',').filter(tag => tag.trim() !== '');
    if (tagArray.length > MAX_TAGS) {
      Alert.alert('Too many tags', `You can only add up to ${MAX_TAGS} tags`);
      return;
    }

    try {
      console.log('Selected exercise record:', runRecord);
      // Nếu có onPost callback (từ props), sử dụng nó
      if (onPost) {
        const postData: PostData = {
          title: title.trim(),
          content: content.trim(),
          images: selectedImages.map(img => img.uri),
          tags: tagArray,
          runRecord: runRecord ? runRecord.id : null,
        };
        onPost(postData);
        return;
      }

      // Ngược lại, sử dụng createPost từ usePostStore
      await createPost({
        title: title.trim(),
        content: content.trim(),
        tags: tagArray,
        exerciseSessionRecordId: runRecord ? runRecord?.id : null,
        images: selectedImages || [],
      });

      console.log('status', usePostStore.getState().status);
      // Thành công, quay lại màn hình trước đó
      Alert.alert('Success', 'Created post successfully', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
      await getAll();
      await getMyPosts();
    } catch (error: any) {
      console.error('Error creating post:', error);
      Alert.alert(
        'Error',
        error.message || 'Cannot create post. Please try again later.',
      );
    }
  };

  const isPostButtonEnabled =
    title.trim() !== '' && content.trim() !== '' && !tagError;

  // Hiển thị ảnh mẫu nếu không có ảnh được chọn
  const displayImages =
    selectedImages.length > 0
      ? selectedImages.map(img => ({uri: img.uri}))
      : [
          {uri: Image.resolveAssetSource(image_placeholder).uri},
          {uri: Image.resolveAssetSource(image_placeholder).uri},
          {uri: Image.resolveAssetSource(image_placeholder).uri},
        ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <BackButton size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create post</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}>
        <ScrollView style={styles.scrollView}>
          {/* Title */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your title here..."
              placeholderTextColor="#999"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Content */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Content</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Write your post content here..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={content}
              onChangeText={setContent}
            />
          </View>

          {/* Images */}
          <View style={styles.formGroup}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Image</Text>
              <Text style={styles.countIndicator}>
                {selectedImages.length}/{MAX_IMAGES}
              </Text>
            </View>
            <Text style={styles.noteText}>
              Note: First picture will be displayed on the post
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.imagesContainer}>
              <TouchableOpacity
                style={[
                  styles.addImageButton,
                  selectedImages.length >= MAX_IMAGES && styles.disabledButton,
                ]}
                onPress={handleAddImage}
                disabled={selectedImages.length >= MAX_IMAGES}>
                <Icon
                  name="add"
                  size={24}
                  color={selectedImages.length >= MAX_IMAGES ? '#ccc' : '#999'}
                />
                <Text
                  style={[
                    styles.addImageText,
                    selectedImages.length >= MAX_IMAGES && {color: '#ccc'},
                  ]}>
                  Add
                </Text>
              </TouchableOpacity>

              {selectedImages.length > 0
                ? selectedImages.map((image, index) => (
                    <View key={index} style={styles.imageContainer}>
                      <Image source={{uri: image.uri}} style={styles.image} />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => handleRemoveImage(index)}>
                        <Icon name="close-circle" size={22} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))
                : displayImages.map((image, index) => (
                    <View key={index} style={styles.imageContainer}>
                      <Image source={{uri: image.uri}} style={styles.image} />
                    </View>
                  ))}
            </ScrollView>
          </View>

          {/* Tags */}
          <View style={styles.formGroup}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Tags</Text>
              <Text
                style={[
                  styles.countIndicator,
                  tagCount > MAX_TAGS && styles.errorCount,
                ]}>
                {tagCount}/{MAX_TAGS}
              </Text>
            </View>
            <TextInput
              style={[styles.textInput, tagError ? styles.inputError : null]}
              placeholder="Add tags separated by commas..."
              placeholderTextColor="#999"
              value={tags}
              onChangeText={handleTagsChange}
            />
            {tagError ? (
              <Text style={styles.errorText}>{tagError}</Text>
            ) : (
              <Text style={styles.noteText}>
                Separate tags with commas (e.g., running, fitness, marathon)
              </Text>
            )}
          </View>

          {/* Run Record */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Exercise Record</Text>
            <RecordSelectionButton
              onSelectRecord={handleSelectRecord}
              selectedRecord={runRecord}
              buttonStyle={styles.runRecordButton}
            />
          </View>
          {/* Spacer for bottom padding */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Post Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.postButton,
            (!isPostButtonEnabled || isLoading) && styles.postButtonDisabled,
          ]}
          onPress={handlePost}
          disabled={!isPostButtonEnabled || isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.postButtonText}>Create</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {fontSize: 18, fontWeight: '600', color: '#000'},
  headerRight: {width: 40},
  keyboardAvoidView: {flex: 1},
  scrollView: {flex: 1, paddingHorizontal: 16, paddingTop: 16},
  formGroup: {marginBottom: 20},
  label: {fontSize: 16, fontWeight: '500', color: '#000', marginBottom: 8},
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  countIndicator: {
    fontSize: 14,
    color: '#666',
  },
  errorCount: {
    color: '#d32f2f',
    fontWeight: '500',
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  textInput: {
    height: 50,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#d32f2f',
  },
  textArea: {
    minHeight: 150,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
  },
  inputText: {fontSize: 16, color: '#333'},
  placeholderText: {fontSize: 16, color: '#999'},
  imagesContainer: {flexDirection: 'row', marginBottom: 8},
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  disabledButton: {
    backgroundColor: '#f0f0f0',
    opacity: 0.7,
  },
  addImageText: {fontSize: 14, color: '#999', marginTop: 4},
  imageContainer: {position: 'relative', marginRight: 12},
  image: {width: 80, height: 80, borderRadius: 8},
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
  runRecordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 20,
  },
  runRecordText: {fontSize: 16, color: '#666', marginLeft: 12},
  chevronIcon: {marginLeft: 'auto'},
  bottomSpacer: {height: 40},
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  postButton: {
    height: 50,
    borderRadius: 8,
    backgroundColor: '#002366',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postButtonDisabled: {backgroundColor: '#002366', opacity: 0.6},
  postButtonText: {fontSize: 16, fontWeight: '600', color: '#fff'},
  errorContainer: {
    padding: 12,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  noteText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    marginLeft: 4,
  },
});

export default CommunityPostCreateScreen;
