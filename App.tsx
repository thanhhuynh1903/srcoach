import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from '@react-native-vector-icons/ionicons';
import Toast from 'react-native-toast-message';
import { homeStackScreens,tabScreens,stackScreens } from './components/routes/routes';
import { useLoginStore } from './components/utils/useLoginStore';
import { View,ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

const HomeStackScreen = () => {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      {homeStackScreens.map((screen : any) => (
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
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
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
          return <Icon name={iconName as never}  size={size} color={color} />;
        },
        tabBarActiveTintColor: '#100077',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStackScreen} />
      {tabScreens.slice(1).map((screen : any) => (
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
  const [loading, setLoading] = useState(true);
  const { userdata, setUserData } = useLoginStore();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const tokenTimestamp = await AsyncStorage.getItem('authTokenTimestamp');
        if (token && tokenTimestamp) {
          const loginTime = new Date(parseInt(tokenTimestamp, 10));
          const now = new Date();
          // Kiểm tra khoảng cách giữa thời điểm hiện tại và thời điểm đăng nhập
          const diff = now.getTime() - loginTime.getTime();
          // Nếu token tồn tại dưới 1 ngày (24h)
          if (diff < 24 * 60 * 60 * 1000) {
            setUserData(token); // Giữ token, hoặc có thể lấy lại dữ liệu user từ API nếu cần
          } else {
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('userdata');
            await AsyncStorage.removeItem('authTokenTimestamp');
            setUserData(null);
          }
        } else {
          setUserData(null);
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      }
      setLoading(false);
    };

    checkLoginStatus();
  }, []);


  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#100077" />
      </View>
    );
  }
  return (
    <>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={userdata ? 'HomeTabs' : 'WelcomeScreen'}>
          {stackScreens.map((screen : any) => (
            <Stack.Screen
              key={screen.name}
              name={screen.name}
              component={screen.component}
              options={{ headerShown: false }}
            />
          ))}
          <Stack.Screen
            name="HomeTabs"
            component={HomeTabs}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </>
  );
};

export default App;