import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Icon from '@react-native-vector-icons/ionicons';
import Toast from 'react-native-toast-message';
import {
  homeStackScreens,
  tabScreens,
  stackScreens,
} from './components/routes/routes';
import AuthLoadingScreen from './components/screens/AuthLoadingScreen/AuthLoadingScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLoginStore } from './components/utils/useLoginStore';
import { useEffect } from 'react';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

const HomeStackScreen = () => {
  return (
    <HomeStack.Navigator screenOptions={{headerShown: false}}>
      {homeStackScreens.map((screen: any) => (
        <HomeStack.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
        />
      ))}
    </HomeStack.Navigator>
  );
};

const HomeTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;
          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Records':
              iconName = focused ? 'add-circle' : 'add-circle-outline';
              break;
            case 'Risk':
              iconName = focused ? 'warning' : 'warning-outline';
              break;
            case 'Community':
              iconName = focused ? 'fitness' : 'fitness-outline';
              break;
            case 'Chat':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'help-circle';
          }
          return <Icon name={iconName as never} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#100077',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}>
      <Tab.Screen name="Home" component={HomeStackScreen} />
      {tabScreens.slice(1).map((screen: any) => (
        <Tab.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
        />
      ))}
    </Tab.Navigator>
  );
};

const App = () => {
  const checkTokenExpiration = async () => {
    const expiresAt = await AsyncStorage.getItem('accessTokenExpiresAt');
    if (expiresAt && Date.now() > parseInt(expiresAt)) {
      await useLoginStore.getState().clearAll();
    }
  };

  useEffect(() => {
    const interval = setInterval(checkTokenExpiration, 60000); // Kiểm tra mỗi phút
    return () => clearInterval(interval);
  }, []);
  return (
    <>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="AuthLoadingScreen">
          <Stack.Screen
            name="AuthLoadingScreen"
            component={AuthLoadingScreen}
            options={{headerShown: false}}
          />
          {stackScreens.map((screen: any) => (
            <Stack.Screen
              key={screen.name}
              name={screen.name}
              component={screen.component}
              options={{headerShown: false}}
            />
          ))}
          <Stack.Screen
            name="HomeTabs"
            component={HomeTabs}
            options={{headerShown: false}}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </>
  );
};

export default App;
