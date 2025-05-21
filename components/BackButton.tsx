import {Pressable, StyleSheet} from 'react-native';
import React from 'react';
import {useNavigation} from '@react-navigation/native';
import Icon from '@react-native-vector-icons/ionicons';
import {theme} from './contants/theme';

interface BackButtonProps {
  size?: number;
  onBtnPress?: () => void;
}

const BackButton = ({size = 26, onBtnPress}: BackButtonProps) => {
  const navigation = useNavigation();

  const handlePress = () => {
    if (onBtnPress) {
      onBtnPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <Pressable 
      onPress={handlePress} 
      style={({pressed}) => [
        styles.button,
        {
          backgroundColor: pressed 
            ? theme.colors.primaryDark 
            : 'rgba(0,0,0,0.07)',
        }
      ]}
    >
      {({pressed}) => (
        <Icon 
          name="arrow-back" 
          size={size} 
          color={pressed ? 'white' : theme.colors.text} 
        />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 5,
    borderRadius: theme.radius.md,
    backgroundColor: "rgba(0,0,0,0.07)",
  },
});

export default BackButton;