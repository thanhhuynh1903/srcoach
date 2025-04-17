"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  StatusBar,
} from "react-native"
import Icon from "@react-native-vector-icons/Ionicons"
import { launchImageLibrary, launchCamera } from "react-native-image-picker"

interface ProfileImageUpdateProps {
  currentImageUrl?: string
  onImageSelected?: (imageUri: string) => void
  onImageUploaded?: (imageUrl: string) => void
  onCancel?: () => void
}

const ProfileImageUpdate: React.FC<ProfileImageUpdateProps> = ({
  currentImageUrl,
  onImageSelected,
  onImageUploaded,
  onCancel,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showOptions, setShowOptions] = useState(false)

  useEffect(() => {
    // Initialize with current image if available
    if (currentImageUrl) {
      setSelectedImage(currentImageUrl)
    }
  }, [currentImageUrl])

  const selectFromGallery = () => {
    const options = {
      mediaType: "photo" as const,
      includeBase64: false,
      maxHeight: 1200,
      maxWidth: 1200,
      quality: 0.8,
    }

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log("User cancelled image picker")
      } else if (response.errorCode) {
        console.log("ImagePicker Error: ", response.errorMessage)
        Alert.alert("Error", "There was an error selecting the image.")
      } else if (response.assets && response.assets.length > 0) {
        const imageUri = response.assets[0].uri
        if (imageUri) {
          setSelectedImage(imageUri)
          setShowOptions(false)
          if (onImageSelected) {
            onImageSelected(imageUri)
          }
        }
      }
    })
  }

  const takePhoto = () => {
    const options = {
      mediaType: "photo" as const,
      includeBase64: false,
      maxHeight: 1200,
      maxWidth: 1200,
      quality: 0.8,
      saveToPhotos: true,
    }

    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log("User cancelled camera")
      } else if (response.errorCode) {
        console.log("Camera Error: ", response.errorMessage)
        Alert.alert("Error", "There was an error taking the photo.")
      } else if (response.assets && response.assets.length > 0) {
        const imageUri = response.assets[0].uri
        if (imageUri) {
          setSelectedImage(imageUri)
          setShowOptions(false)
          if (onImageSelected) {
            onImageSelected(imageUri)
          }
        }
      }
    })
  }

  const removePhoto = () => {
    Alert.alert(
      "Remove Photo",
      "Are you sure you want to remove your profile photo?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setSelectedImage(null)
            setShowOptions(false)
          },
        },
      ],
      { cancelable: true },
    )
  }

  const uploadImage = async () => {
    if (!selectedImage) {
      Alert.alert("Error", "Please select an image first.")
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        const newProgress = prev + 10
        if (newProgress >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return newProgress
      })
    }, 300)

    try {
      // Simulate API call to upload image
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Mock response with a fake URL
      const uploadedImageUrl = "https://example.com/profile-images/user123.jpg"

      if (onImageUploaded) {
        onImageUploaded(uploadedImageUrl)
      }

      Alert.alert("Success", "Profile image updated successfully!")
    } catch (error) {
      console.error("Error uploading image:", error)
      Alert.alert("Error", "Failed to upload image. Please try again.")
    } finally {
      clearInterval(progressInterval)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onCancel}>
          <Icon name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Update Profile Photo</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.imageContainer}>
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.placeholderContainer}>
              <Icon name="person" size={80} color="#94A3B8" />
            </View>
          )}

          <TouchableOpacity style={styles.editButton} onPress={() => setShowOptions(true)} disabled={isUploading}>
            <Icon name="camera" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.helpText}>
          Tap the camera icon to update your profile photo. Choose a clear photo of your face to help others recognize
          you.
        </Text>

        {isUploading && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
            </View>
            <Text style={styles.progressText}>Uploading... {uploadProgress}%</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.saveButton, (!selectedImage || isUploading) && styles.disabledButton]}
          onPress={uploadImage}
          disabled={!selectedImage || isUploading}
        >
          {isUploading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Save Profile Photo</Text>
          )}
        </TouchableOpacity>
      </View>

      {showOptions && (
        <View style={styles.optionsOverlay}>
          <View style={styles.optionsContainer}>
            <Text style={styles.optionsTitle}>Update Profile Photo</Text>

            <TouchableOpacity style={styles.optionItem} onPress={takePhoto}>
              <Icon name="camera-outline" size={24} color="#0F172A" />
              <Text style={styles.optionText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem} onPress={selectFromGallery}>
              <Icon name="image-outline" size={24} color="#0F172A" />
              <Text style={styles.optionText}>Choose from Gallery</Text>
            </TouchableOpacity>

            {selectedImage && (
              <TouchableOpacity style={styles.optionItem} onPress={removePhoto}>
                <Icon name="trash-outline" size={24} color="#EF4444" />
                <Text style={[styles.optionText, styles.removeText]}>Remove Current Photo</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowOptions(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 24,
  },
  profileImage: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeholderContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#0F2B5B",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  helpText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  progressContainer: {
    width: "100%",
    marginBottom: 24,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#0F2B5B",
  },
  progressText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
  },
  saveButton: {
    backgroundColor: "#0F2B5B",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#94A3B8",
  },
  optionsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    zIndex: 1000,
  },
  optionsContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 24,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  optionText: {
    fontSize: 16,
    color: "#0F172A",
    marginLeft: 16,
  },
  removeText: {
    color: "#EF4444",
  },
  cancelButton: {
    marginTop: 8,
    paddingVertical: 16,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748B",
  },
})

export default ProfileImageUpdate
