import React from 'react';
import {useEffect, useRef} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import Icon from '@react-native-vector-icons/ionicons';
import Toast from 'react-native-toast-message';
import {
  homeStackScreens,
  tabScreens,
  stackScreens,
} from './components/routes/routes';
import useAuthStore from './components/utils/useAuthStore';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

const slideAnimation: NativeStackNavigationOptions = {
  animation: 'slide_from_right',
  animationDuration: 50,
};

const HomeStackScreen = () => {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
        ...slideAnimation,
      }}>
      {homeStackScreens.map(screen => (
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
      screenOptions={({route}): any => ({
        tabBarIcon: ({
          focused,
          color,
          size,
        }: {
          focused: boolean;
          color: string;
          size: number;
        }) => {
          let iconName: string;
          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Records':
              iconName = focused ? 'pulse' : 'pulse-outline';
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
      {tabScreens.slice(1).map(screen => (
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
  const {loadToken} = useAuthStore();
  useEffect(() => {
    loadToken();
  }, []);
  return (
    <>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="WelcomeScreen"
          screenOptions={slideAnimation}>
          {stackScreens.map(screen => (
            <Stack.Screen
              key={screen.name}
              name={screen.name}
              component={screen.component as any}
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
