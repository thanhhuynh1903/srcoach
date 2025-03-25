import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Share,
  Linking,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import Clipboard from '@react-native-clipboard/clipboard';

interface NewsDetailProps {
  onBack: () => void;
}

const CommunityNewsDetailScreen: React.FC<NewsDetailProps> = ({ onBack }) => {
  const articleUrl = 'https://example.com/news/latest-platform-update';

  const handleCopyLink = () => {
    Clipboard.setString(articleUrl);
    // You might want to add a toast message here to confirm the link was copied
    alert('Link copied to clipboard!');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this article: ${articleUrl}`,
        title: 'Introducing Our Latest Platform Update',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>News</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* Featured Image */}
        <Image 
          source={{ uri: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1.6.1_%20Official%20News%20-%20Detail-EreUg0yexLbNvwPF98dDYPnsOsIJ7v.png' }}
          style={styles.featuredImage}
          resizeMode="cover"
        />
        
        {/* Category and Date */}
        <View style={styles.metaContainer}>
          <Text style={styles.categoryText}>Technology</Text>
          <Text style={styles.dateText}>December 15, 2023</Text>
        </View>
        
        {/* Article Title */}
        <Text style={styles.articleTitle}>
          Introducing Our Latest Platform Update: Enhanced User Experience and New Features
        </Text>
        
        {/* Article Content */}
        <Text style={styles.paragraph}>
          We're excited to announce the release of our latest platform update, bringing significant 
          improvements to enhance your experience. This update introduces several new features 
          designed to make your workflow more efficient and enjoyable.
        </Text>
        
        <Text style={styles.paragraph}>
          The new interface has been completely redesigned with a focus on simplicity and ease 
          of use. We've streamlined navigation, improved performance, and added powerful new tools 
          based on your feedback.
        </Text>
        
        <Text style={styles.paragraph}>
          Key highlights of this update include:
        </Text>
        
        {/* Bullet Points */}
        <View style={styles.bulletPointContainer}>
          <View style={styles.bulletPoint}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>
              Redesigned dashboard with customizable widgets
            </Text>
          </View>
          
          <View style={styles.bulletPoint}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>
              Advanced search capabilities with filters
            </Text>
          </View>
          
          <View style={styles.bulletPoint}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>
              Improved mobile responsiveness
            </Text>
          </View>
          
          <View style={styles.bulletPoint}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>
              New collaboration tools
            </Text>
          </View>
        </View>
        
        <Text style={styles.paragraph}>
          These improvements are just the beginning. We're committed to continuously enhancing 
          our platform to better serve your needs and provide the best possible experience.
        </Text>
        
        {/* Tags */}
        <View style={styles.tagsContainer}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>#PlatformUpdate</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>#NewFeatures</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>#Tech</Text>
          </View>
        </View>
        
        {/* Share Options */}
        <View style={styles.shareContainer}>
          <Text style={styles.shareTitle}>Share this article</Text>
          
          <View style={styles.shareOptions}>
            <TouchableOpacity style={styles.shareOption} onPress={handleShare}>
              <Icon name="share-social-outline" size={24} color="#666" />
              <Text style={styles.shareOptionText}>Share</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.shareOption} onPress={handleCopyLink}>
              <Icon name="copy-outline" size={24} color="#666" />
              <Text style={styles.shareOptionText}>Copy Link</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  featuredImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
    marginRight: 16,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  articleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
    marginHorizontal: 16,
    marginBottom: 16,
    color: '#000',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  bulletPointContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bulletDot: {
    fontSize: 16,
    marginRight: 8,
    color: '#333',
  },
  bulletText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#666',
  },
  shareContainer: {
    marginHorizontal: 16,
    marginBottom: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  shareTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
    color: '#000',
  },
  shareOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  shareOption: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '40%',
  },
  shareOptionText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default CommunityNewsDetailScreen;