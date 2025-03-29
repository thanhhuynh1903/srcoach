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
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import BackButton from '../../BackButton';
import { usePostStore } from '../../utils/usePostStore';
interface CommunityPostCreateScreenProps {
  onPost: (postData: PostData) => void;
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
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1.6.3_%20Community%20Post%20Create-po31zKLlrza30Xc8pRZrVOL3SOH9Ve.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1.6.3_%20Community%20Post%20Create-po31zKLlrza30Xc8pRZrVOL3SOH9Ve.png',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1.6.3_%20Community%20Post%20Create-po31zKLlrza30Xc8pRZrVOL3SOH9Ve.png'
  ]);
  const [tags, setTags] = useState('');
  const [runRecord, setRunRecord] = useState('');
  const { createPost } = usePostStore();
  const handleAddImage = () => {
    // In a real app, this would open the image picker
    console.log('Open image picker');
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);
  };

  const handlePost = () => {
    const postData: PostData = {
      title,
      content,
      images,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
      runRecord: runRecord || undefined
    };

    onPost(postData);
  };

  const isPostButtonEnabled = title.trim() !== '' && content.trim() !== '';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
            <BackButton size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
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
              placeholder="Enter your post title"
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
            <Text style={styles.label}>Images</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
              <TouchableOpacity style={styles.addImageButton} onPress={handleAddImage}>
                <Icon name="add" size={24} color="#999" />
                <Text style={styles.addImageText}>Add</Text>
              </TouchableOpacity>

              {images.map((image, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri: image }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => handleRemoveImage(index)}
                  >
                    <Icon name="close-circle" size={22} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Tags */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Tags</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Add tags separated by comma"
              placeholderTextColor="#999"
              value={tags}
              onChangeText={setTags}
            />
          </View>

          {/* Run Record */}
          <TouchableOpacity style={styles.runRecordButton}>
            <Icon name="fitness-outline" size={20} color="#666" />
            <Text style={styles.runRecordText}>Select run record</Text>
            <Icon name="chevron-forward" size={20} color="#999" style={styles.chevronIcon} />
          </TouchableOpacity>

          {/* Spacer for bottom padding */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Post Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.postButton,
            !isPostButtonEnabled && styles.postButtonDisabled
          ]}
          onPress={handlePost}
          disabled={!isPostButtonEnabled}
        >
          <Text style={styles.postButtonText}>Post</Text>
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
});
export default CommunityPostCreateScreen;