import {View, Text} from 'react-native';
import React from 'react';
import {PropsWithChildren} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
const ScreenWrapper = ({children, bg}: PropsWithChildren<{bg: any}>) => {
  const {top} = useSafeAreaInsets();
  const paddingTop = top > 0 ? top + 5 : 15;
  return (
    <View style={{flex: 1, paddingTop, backgroundColor: bg}}>{children}</View>
  );
};

export default ScreenWrapper;
