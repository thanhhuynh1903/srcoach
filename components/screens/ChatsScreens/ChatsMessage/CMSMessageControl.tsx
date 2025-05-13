import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Text,
  Animated,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {theme} from '../../../contants/theme';

interface CMSMessageControlProps {
  messageText: string;
  showTyping: boolean;
  typingUsername?: string;
  setMessageText: (text: string) => void;
  handleSendMessage: () => void;
  onImagePress: () => void;
  selectedImage: string | null;
  onRemoveImage: () => void;
  setPanelVisible: (visible: boolean) => void;
}

export const CMSMessageControl = ({
  messageText,
  showTyping,
  typingUsername = 'Someone',
  setMessageText,
  handleSendMessage,
  onImagePress,
  selectedImage,
  onRemoveImage,
  setPanelVisible,
}: CMSMessageControlProps) => {
  const typingAnimation = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (showTyping) {
      Animated.timing(typingAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(typingAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [showTyping]);

  const typingIndicatorOpacity = typingAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const typingIndicatorTranslateY = typingAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 0],
  });

  return (
    <View style={styles.container}>
      {showTyping && (
        <Animated.View
          style={[
            styles.typingIndicatorContainer,
            {
              opacity: typingIndicatorOpacity,
              transform: [{translateY: typingIndicatorTranslateY}],
            },
          ]}>
          <Text style={styles.typingIndicatorText}>
            {typingUsername} is typing...
          </Text>
        </Animated.View>
      )}

      {selectedImage && (
        <ScrollView
          horizontal
          style={styles.imagePreviewScrollContainer}
          contentContainerStyle={styles.imagePreviewContentContainer}>
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{uri: selectedImage}}
              style={styles.imagePreview}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={onRemoveImage}>
              <Icon name="close" size={16} color="#000" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setPanelVisible(true)}>
          <Icon name="add" size={24} color={theme.colors.primaryDark} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onImagePress}>
          <Icon name="image" size={24} color="#000" />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          onSubmitEditing={handleSendMessage}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              opacity: messageText.trim() || selectedImage ? 1 : 0.5,
            },
          ]}
          onPress={handleSendMessage}
          disabled={!messageText.trim() && !selectedImage}>
          <Icon name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: 10,
  },
  typingIndicatorContainer: {
    position: 'absolute',
    top: -30,
    left: 0,
    width: '50%',
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginHorizontal: 10,
    borderRadius: 15,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  typingIndicatorText: {
    color: '#333',
    fontSize: 14,
  },
  imagePreviewScrollContainer: {
    maxHeight: 120,
    paddingVertical: 10,
  },
  imagePreviewContentContainer: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  imagePreviewContainer: {
    width: 100,
    height: 100,
    marginRight: 10,
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#fff',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
  },
  actionButton: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: theme.colors.primaryDark,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
