import HomeScreen from '../screens/HomeScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import WelcomeInfoScreen from '../screens/WelcomeInfoScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import RecordScreen from '../screens/RecordScreen';
import ExercisesScreen from '../screens/ExercisesScreen';
import ExpertChatScreen from '../screens/ExpertChatScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SearchScreen from '../screens/SearchScreen';
import ErrorScreen from '../screens/ErrorScreen';
import ManageNotification from '../screens/ManageNotification';
import DevicesScreen from '../screens/DevicesScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import BloodPressureScreen from '../screens/DashboardScreens/BloodPressureScreen';
import SleepScreen from '../screens/DashboardScreens/SleepScreen';
import HeartRateScreen from '../screens/DashboardScreens/HeartRateScreen';
import RecordDetailScreen from '../screens/RecordDetailScreen';
import ChartDetailScreen from '../screens/ChartDetailScreen';
import ChatboxScreen from '../screens/ChatboxScreen';
import SetGoalsScreen from '../screens/SetGoalsScreen';
import GoalListScreen from '../screens/GoalListScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import RateScheduleScreen from '../screens/RateScheduleScreen';
import RiskWarningListScreen from '../screens/RiskWarningListScreen';
import RiskWarningScreen from '../screens/RiskWarningScreen';
// Cấu hình cho Stack Navigator
export const stackScreens = [
  { name: 'Welcome', component: WelcomeScreen },
  { name: 'WelcomeInfo', component: WelcomeInfoScreen },
  { name: 'Login', component: LoginScreen },
  { name: 'Register', component: RegisterScreen },
  { name: 'ErrorScreen', component: ErrorScreen },
  { name: 'ManageNotification', component: ManageNotification },
  { name: 'SettingsDevices', component: DevicesScreen },
  { name: 'EditProfileScreen', component: EditProfileScreen },
  { name: 'BloodPressureScreen', component: BloodPressureScreen },
  { name: 'SleepScreen', component: SleepScreen },
  { name: 'HeartRateScreen', component: HeartRateScreen },
  { name: 'RecordDetailScreen', component: RecordDetailScreen },
  { name: 'ChartDetailScreen', component: ChartDetailScreen },
  { name: 'ChatboxScreen', component: ChatboxScreen },
  { name: 'SetGoalsScreen', component: SetGoalsScreen },
  { name: 'GoalListScreen', component: GoalListScreen },
  { name: 'ScheduleScreen', component: ScheduleScreen },
  { name: 'RateScheduleScreen', component: RateScheduleScreen },
  { name: 'RiskWarningScreen', component: RiskWarningScreen },
];

// Cấu hình cho Tab Navigator
export const tabScreens = [
  { name: 'Home', component: HomeScreen },
  { name: 'Records', component: RecordScreen },
  { name: 'Risk', component: RiskWarningListScreen },
  { name: 'Community', component: ExercisesScreen },
  { name: 'Chat', component: ExpertChatScreen },
  { name: 'Settings', component: SettingsScreen },
];

// Cấu hình cho Home Stack ( bao gồm tab navigator )
export const homeStackScreens = [
  { name: 'HomeMain', component: HomeScreen },
  { name: 'SearchScreen', component: SearchScreen },
];