import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from '@react-native-vector-icons/ionicons';
import Toast from 'react-native-toast-message';
import WelcomeScreen from './components/screens/WelcomeScreen';
import WelcomeInfoScreen from './components/screens/WelcomeInfoScreen';
import LoginScreen from './components/screens/LoginScreen';
import RegisterScreen from './components/screens/RegisterScreen';
import HomeScreen from './components/screens/HomeScreen';
import ExercisesScreen from './components/screens/ExercisesScreen';
import DevicesScreen from './components/screens/DevicesScreen';
import AIChatScreen from './components/screens/AIChatScreen';
import SettingsScreen from './components/screens/SettingsScreen';
import ExpertListScreen from './components/screens/ExpertListScreen';
import ManageNotification from './components/screens/ManageNotification';
import ErrorScreen from './components/screens/ErrorScreen';
import ChartDetailScreen from './components/screens/ChartDetailScreen';
import RecordScreen from './components/screens/RecordScreen';
import EditProfileScreen from './components/screens/EditProfileScreen';
import HeartRateScreen from './components/screens/DashboardScreens/HeartRateScreen';
import SleepScreen from './components/screens/DashboardScreens/SleepScreen';
import BloodPressureScreen from './components/screens/DashboardScreens/BloodPressureScreen';
import RecordDetailScreen from './components/screens/RecordDetailScreen';
import ExpertChatScreen from './components/screens/ExpertChatScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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
          return <Icon name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#100077',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Records" component={RecordScreen} />
      <Tab.Screen name="Community" component={ExercisesScreen} />
      <Tab.Screen name="Chat" component={ExpertChatScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const App = () => {
  return (
    <>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome">
        <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />

        {/* <Stack.Screen name="HealthConnect" component={HealthConnectPage} options={{ headerShown: false }} />
        <Stack.Screen name="MapView" component={MapViewScreen} options={{ headerShown: true }} /> */}

        <Stack.Screen name="WelcomeInfo" component={WelcomeInfoScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ChartDetailScreen" component={ChartDetailScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="HomeTabs" component={HomeTabs} options={{ headerShown: false }} />
        <Stack.Screen name="ErrorScreen" component={ErrorScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="ManageNotification" component={ManageNotification} options={{ headerShown: false }} />
        <Stack.Screen name="SettingsDevices" component={DevicesScreen} options={{ headerShown: false }} />
        <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} options={{ headerShown: false }} />
        <Stack.Screen name="BloodPressureScreen" component={BloodPressureScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SleepScreen" component={SleepScreen} options={{ headerShown: false }} />
        <Stack.Screen name="HeartRateScreen" component={HeartRateScreen} options={{ headerShown: false }} />
        <Stack.Screen name="RecordDetailScreen" component={RecordDetailScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
    <Toast/>
    </>
  );
};

export default App;