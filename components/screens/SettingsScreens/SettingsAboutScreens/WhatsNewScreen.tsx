import {View, Text, StyleSheet} from 'react-native';
import useNewsStore from '../../../utils/useNewsStore';
import {useEffect} from 'react';

export default function WhatsNewScreen({navigation}: any) {
  let {getAll} = useNewsStore();

  useEffect(() => {
    getAll().then(res => {
      console.log(res);
    });
  }, []);

  return (
    <View style={style.container}>
      <Text>What's New</Text>
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
