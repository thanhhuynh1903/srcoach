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
import {useNavigation, useRoute} from '@react-navigation/native';
import RecordSelectionButton from './RecordSelectionButton';
import {fetchDetailRecords} from '../../utils/utils_healthconnect';
import type {ExerciseRecord} from './RecordSelectionModal';
import type {ExerciseSession} from '../../utils/utils_healthconnect';
import {format, parseISO} from 'date-fns';

interface CommunityPostUpdateScreenProps {
  route?: {
    params: {
      postId: string;
    };
  };
}

const CommunityPostUpdateScreen: React.FC<
  CommunityPostUpdateScreenProps
> = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const postId = route.params?.postId;

  const [title, setTitle] = useState('');
  const [session, setSession] = useState<ExerciseSession | null>(null);
  const [content, setContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [tags, setTags] = useState('');
  const [displayTags, setDisplayTags] = useState<string[]>([]);
  const [runRecord, setRunRecord] = useState<ExerciseRecord | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const {
    updatePost,
    getDetail,
    getAll,
    currentPost,
    isLoading,
    status,
    message,
  } = usePostStore();

  // Tải dữ liệu bài viết khi màn hình được mở
  useEffect(() => {
    console.log('postId', postId);

    const loadPostData = async () => {
      if (postId) {
        await getDetail(postId);
      }
    };

    loadPostData();
  }, [postId]);

  const loadSession = async (id: any) => {
    try {
      const sessionData: ExerciseSession = await fetchDetailRecords(id);
      console.log('sessionData', sessionData);

      setSession(sessionData);
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  // Cập nhật state từ dữ liệu bài viết hiện tại
  useEffect(() => {
    console.log('currentPost', currentPost);

    if (currentPost) {
      setTitle(currentPost.title || '');
      setContent(currentPost.content || '');

      // Xử lý tags
      if (
        currentPost.tags &&
        Array.isArray(currentPost.tags) &&
        currentPost.tags.length > 0
      ) {
        setTags(currentPost.tags.join(', '));
        setDisplayTags([...currentPost.tags]);
      } else {
        setTags('');
        setDisplayTags([]);
      }

      // Xử lý exercise record
      if (currentPost.exercise_session_record_id) {
        console.log('currentPost', currentPost.exercise_session_record_id);
        loadSession(currentPost.exercise_session_record_id);
      } else {
        setRunRecord(null);
      }

      // Lưu trữ ảnh hiện có
      if (currentPost.images && currentPost.images.length > 0) {
        setExistingImages([...currentPost.images]);
      } else {
        setExistingImages([]);
      }

      // Reset ảnh mới được chọn khi tải bài viết mới
      setSelectedImages([]);

      setInitialLoading(false);
    }
  }, [currentPost]);

  // Cập nhật runRecord khi session thay đổi
  useEffect(() => {
    console.log('session', session);

    if (session && currentPost?.exercise_session_record_id) {
      try {
        const tempRecord = {
          id: currentPost.exercise_session_record_id,
          clientRecordId: '',
          exerciseType: 'com.google.walking',
          startTime: session.start_time,
          endTime: session.end_time,
          duration_minutes: session.duration_minutes,
          total_distance: session.total_distance,
          total_steps: 0,
        };
        setRunRecord(tempRecord);
      } catch (error) {
        console.error('Error setting run record:', error);
      }
    }
  }, [session, currentPost]);

  // Cập nhật displayTags khi tags thay đổi
  useEffect(() => {
    if (tags && typeof tags === 'string') {
      const tagsArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');
      if (tagsArray.length > 0) {
        setDisplayTags(tagsArray);
      } else {
        setDisplayTags([]);
      }
    } else {
      setDisplayTags([]);
    }
  }, [tags]);

  const handleAddImage = () => {
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
          'Lỗi',
          response.errorMessage || 'Đã xảy ra lỗi khi chọn ảnh',
        );
      } else if (response.assets && response.assets.length > 0) {
        // Thêm ảnh mới vào danh sách
        setSelectedImages([...selectedImages, response.assets[0]]);
      }
    });
  };

  const handleRemoveNewImage = (index: number) => {
    const updatedImages = [...selectedImages];
    updatedImages.splice(index, 1);
    setSelectedImages(updatedImages);
  };

  const handleRemoveExistingImage = (index: number) => {
    const updatedImages = [...existingImages];
    updatedImages.splice(index, 1);
    setExistingImages(updatedImages);
    console.log('Ảnh hiện có sau khi xóa:', updatedImages);
  };

  const handleSelectRecord = (record: ExerciseRecord) => {
    setRunRecord(record);
  };

  const handleUpdate = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert(
        'Thông tin không đầy đủ',
        'Vui lòng nhập cả tiêu đề và nội dung',
      );
      return;
    }

    try {
      // Xử lý tags an toàn
      const tagsArray =
        typeof tags === 'string'
          ? tags
              .split(',')
              .map(tag => tag.trim())
              .filter(tag => tag !== '')
          : [];

      // Tách riêng ảnh cũ và ảnh mới theo yêu cầu API
      const oldImageUrls = existingImages; // Mảng chứa các URL ảnh cũ muốn giữ lại
      const newImages = selectedImages; // Mảng chứa file ảnh mới upload lên

      await updatePost(postId, {
        title: title.trim(),
        content: content.trim(),
        tags: tagsArray,
        oldImageUrls: oldImageUrls, // Truyền riêng ảnh cũ
        images: newImages, // Chỉ truyền ảnh mới
        exerciseSessionRecordId: runRecord ? runRecord.id : null, // Truyền ID của record
      });

      if (status !== 'error') {
        getAll();
        Alert.alert('Success', 'The article has been updated successfully.', [
          {text: 'OK', onPress: () => navigation.goBack()},
        ]);
      } else {
        Alert.alert('Error', message || 'Unable to update post');
      }
    } catch (error: any) {
      console.error('Error updating post:', error);
      Alert.alert('Error', error.message || 'Unable to update post');
    }
  };

  const isUpdateButtonEnabled = title.trim() !== '' && content.trim() !== '';

  // Hiển thị trạng thái đang tải ban đầu
  if (initialLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#002366" />
        <Text style={styles.loadingText}>Loading content posts...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackButton size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit post</Text>
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
              placeholder="Input title..."
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
              placeholder="Write your content here..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={content}
              onChangeText={setContent}
            />
          </View>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Current images</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.imagesContainer}>
                {existingImages.map((imageUrl, index) => (
                  <View key={`existing-${index}`} style={styles.imageContainer}>
                    <Image source={{uri: imageUrl}} style={styles.image} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => handleRemoveExistingImage(index)}>
                      <Icon name="close-circle" size={22} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* New Images */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              {existingImages.length > 0 ? 'Add new images' : 'Images'}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.imagesContainer}>
              <TouchableOpacity
                style={styles.addImageButton}
                onPress={handleAddImage}>
                <Icon name="add" size={24} color="#999" />
                <Text style={styles.addImageText}>Add</Text>
              </TouchableOpacity>

              {selectedImages.map((image, index) => (
                <View key={`new-${index}`} style={styles.imageContainer}>
                  <Image source={{uri: image.uri}} style={styles.image} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => handleRemoveNewImage(index)}>
                    <Icon name="close-circle" size={22} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Tags */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Tags</Text>

            {/* Display Tags */}
            {displayTags.length > 0 && (
              <View style={styles.displayTagsContainer}>
                {displayTags.map((tag, index) => (
                  <View key={index} style={styles.tagChip}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            <TextInput
              style={styles.textInput}
              placeholder="Add tags, separated by commas..."
              placeholderTextColor="#999"
              value={tags}
              onChangeText={setTags}
            />
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

          {/* Error message */}
          {status === 'error' && message && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{message}</Text>
            </View>
          )}

          {/* Spacer for bottom padding */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Update Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.updateButton,
            (!isUpdateButtonEnabled || isLoading) &&
              styles.updateButtonDisabled,
          ]}
          onPress={handleUpdate}
          disabled={!isUpdateButtonEnabled || isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.updateButtonText}>Update</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerRight: {
    width: 40,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 12,
    color: '#ff6b6b',
    fontStyle: 'italic',
    marginBottom: 8,
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
  inputText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  imagesContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  addImageText: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  dimmedImage: {
    opacity: 0.5,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
  // Styles cho display tags
  displayTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tagChip: {
    backgroundColor: '#e0e0e0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#333',
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
  runRecordText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
  },
  chevronIcon: {
    marginLeft: 'auto',
  },
  bottomSpacer: {
    height: 40,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  updateButton: {
    height: 50,
    borderRadius: 8,
    backgroundColor: '#002366',
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateButtonDisabled: {
    backgroundColor: '#002366',
    opacity: 0.6,
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  errorContainer: {
    padding: 12,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
  },
});

export default CommunityPostUpdateScreen;
