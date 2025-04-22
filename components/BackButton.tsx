import {Pressable, StyleSheet} from 'react-native';
import React from 'react';
import {useNavigation} from '@react-navigation/native';
import Icon from '@react-native-vector-icons/ionicons';
import {theme} from './contants/theme';

const BackButton = ({size = 26}: {size?: number}) => {
  const navigation = useNavigation();

  return (
    <Pressable 
      onPress={() => navigation.goBack()} 
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
  },
});

export default BackButton;