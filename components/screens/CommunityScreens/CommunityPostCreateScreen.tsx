import React, { useState } from 'react';
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
import { launchImageLibrary } from 'react-native-image-picker';
import { usePostStore } from '../../utils/usePostStore';
import { useNavigation } from '@react-navigation/native';
import type { ExerciseRecord } from './RecordSelectionModal';
import RecordSelectionButton from './RecordSelectionButton';

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

const CommunityPostCreateScreen: React.FC<CommunityPostCreateScreenProps> = ({
  onPost
}) => {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [tags, setTags] = useState('');
  const [runRecord, setRunRecord] = useState<ExerciseRecord | null>(null);

  const { createPost, isLoading, status,message,getAll,getMyPosts } = usePostStore();

  const handleAddImage = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert('Lỗi', response.errorMessage || 'Đã xảy ra lỗi khi chọn ảnh');
      } else if (response.assets && response.assets.length > 0) {
        // Thêm ảnh mới vào danh sách
        setSelectedImages([...selectedImages, response.assets[0]]);
      }
    });
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = [...selectedImages];
    updatedImages.splice(index, 1);
    setSelectedImages(updatedImages);
  };

  const handleSelectRecord = (record: ExerciseRecord) => {
    setRunRecord(record)
    
  }
  const handlePost = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Enter more info', 'Please enter both title and content');
      return;
    }

    try {
      console.log("Selected exercise record:", runRecord?.id)
      // Nếu có onPost callback (từ props), sử dụng nó
      if (onPost) {
        const postData: PostData = {
          title: title.trim(),
          content: content.trim(),
          images: selectedImages.map(img => img.uri),
          tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
          runRecord: runRecord ? runRecord.id : null,
        };
        onPost(postData);
        return;
      }

      // Ngược lại, sử dụng createPost từ usePostStore
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
      
      
      await createPost({
        title: title.trim(),
        content: content.trim(),
        tags: tagsArray || [],
        exerciseSessionRecordId: runRecord ? runRecord.id : null,
        images: selectedImages || [],
      });
      console.log('status', usePostStore.getState().status);
      // Thành công, quay lại màn hình trước đó
      Alert.alert('Success', 'Create post successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      await getAll();
      await getMyPosts();
    } catch (error: any) {
      console.error('Error creating post:', error);
      Alert.alert('Error', error.message || 'Cannot create post');
    }
  };

  const isPostButtonEnabled = title.trim() !== '' && content.trim() !== '';

  // Hiển thị ảnh mẫu nếu không có ảnh được chọn
  const displayImages = selectedImages.length > 0 
    ? selectedImages.map(img => ({ uri: img.uri })) 
    : [
        { uri: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1.6.3_%20Community%20Post%20Create-po31zKLlrza30Xc8pRZrVOL3SOH9Ve.png' },
        { uri: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1.6.3_%20Community%20Post%20Create-po31zKLlrza30Xc8pRZrVOL3SOH9Ve.png' },
        { uri: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1.6.3_%20Community%20Post%20Create-po31zKLlrza30Xc8pRZrVOL3SOH9Ve.png' }
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
        style={styles.keyboardAvoidView}
      >
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
            <Text style={styles.label}>Image</Text>
            <Text style={{ fontSize: 12, color: '#666',marginBottom: 8 }}>Note: First picture will be displayed on the post</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
              <TouchableOpacity style={styles.addImageButton} onPress={handleAddImage}>
                <Icon name="add" size={24} color="#999" />
                <Text style={styles.addImageText}>Add</Text>
              </TouchableOpacity>

              {displayImages.map((image, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri: image.uri }} style={styles.image} />
                  {selectedImages.length > 0 && (
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => handleRemoveImage(index)}
                    >
                      <Icon name="close-circle" size={22} color="#fff" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Tags */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Tags</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Add tags separated by commas..."
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
          {/* Spacer for bottom padding */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Post Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.postButton,
            (!isPostButtonEnabled || isLoading) && styles.postButtonDisabled
          ]}
          onPress={handlePost}
          disabled={!isPostButtonEnabled || isLoading}
        >
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
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 56, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#000' },
  headerRight: { width: 40 },
  keyboardAvoidView: { flex: 1 },
  scrollView: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '500', color: '#000', marginBottom: 8 },
  selectInput: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 50, paddingHorizontal: 16, backgroundColor: '#f5f5f5', borderRadius: 8 },
  textInput: { height: 50, paddingHorizontal: 16, backgroundColor: '#f5f5f5', borderRadius: 8, fontSize: 16, color: '#333' },
  textArea: { minHeight: 150, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, backgroundColor: '#f5f5f5', borderRadius: 8, fontSize: 16, color: '#333' },
  inputText: { fontSize: 16, color: '#333' },
  placeholderText: { fontSize: 16, color: '#999' },
  imagesContainer: { flexDirection: 'row', marginBottom: 8 },
  addImageButton: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  addImageText: { fontSize: 14, color: '#999', marginTop: 4 },
  imageContainer: { position: 'relative', marginRight: 12 },
  image: { width: 80, height: 80, borderRadius: 8 },
  removeImageButton: { position: 'absolute', top: -8, right: -8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12 },
  runRecordButton: { flexDirection: 'row', alignItems: 'center', height: 50, paddingHorizontal: 16, backgroundColor: '#f5f5f5', borderRadius: 8, marginBottom: 20 },
  runRecordText: { fontSize: 16, color: '#666', marginLeft: 12 },
  chevronIcon: { marginLeft: 'auto' },
  bottomSpacer: { height: 40 },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#f0f0f0', backgroundColor: '#fff' },
  postButton: { height: 50, borderRadius: 8, backgroundColor: '#002366', alignItems: 'center', justifyContent: 'center' },
  postButtonDisabled: { backgroundColor: '#002366', opacity: 0.6 },
  postButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  errorContainer: { 
    padding: 12, 
    backgroundColor: '#ffebee', 
    borderRadius: 8, 
    marginBottom: 20 
  },
  errorText: { 
    color: '#d32f2f', 
    fontSize: 14 
  },
});

export default CommunityPostCreateScreen;
