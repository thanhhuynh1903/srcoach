import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import {theme} from './contants/theme';
import {TextInput} from 'react-native';
import {hp} from './helpers/common';
import Icon from '@react-native-vector-icons/ionicons';

interface InputProps {
  containerStyle?: any;
  icon?: React.ReactNode;
  inputRef?: React.Ref<TextInput>;
  placeholder?: string;
  onChangeText?: (text: string) => void;
  value?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  secureTextEntry?: boolean;
  maxLength?: number;
  isPassword?: boolean;
}

const Input = (props: InputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View
      style={[styles.container, props.containerStyle && props.containerStyle]}>
      {props.icon && props.icon}
      <TextInput
        style={[styles.input, {color: theme.colors.text}]} // Added explicit text color
        placeholderTextColor={theme.colors.textLight}
        ref={props.inputRef && props.inputRef}
        secureTextEntry={
          props.isPassword ? !showPassword : props.secureTextEntry
        }
        {...props}
      />
      {props.isPassword && (
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeIcon}>
          <Icon
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={theme.colors.textLight}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Input;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: hp(7.2),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.4,
    borderColor: theme.colors.text,
    borderRadius: theme.radius.xs,
    borderCurve: 'continuous',
    paddingHorizontal: 18,
    gap: 12,
  },
  input: {
    flex: 1,
    paddingRight: 10,
  },
  eyeIcon: {
    padding: 5,
  },
});
