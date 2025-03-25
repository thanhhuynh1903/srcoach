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
import DeviceNotificationScreen from '../screens/DeviceNotificationScreen';
import CaloriesScreen from '../screens/DashboardScreens/CaloriesScreen';
import VerifyScreen from '../screens/VerifyScreen';
import GenerateScheduleScreen from '../screens/GenerateScheduleScreen';
import CalendarScreen from '../screens/CalendarScreen';
import HistoryScheduleScreen from '../screens/HistoryCalendarScreen';
import VerifyLoginScreen from '../screens/VerifyLoginScreen';
import PrivacyPolicyScreen from '../screens/SettingsAboutScreens/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/SettingsAboutScreens/TermsOfServiceScreen';
import CommunityScreen from '../screens/CommunityScreens/CommunityScreen';
import CommunityNewsDetailScreen from '../screens/CommunityScreens/CommunityNewsDetailScreen';
import CommunityPostDetailScreen from '../screens/CommunityScreens/CommunityPostDetailScreen';
import CommunityPostCreateScreen from '../screens/CommunityScreens/CommunityPostCreateScreen';
import AddScheduleScreen from '../screens/AddScheduleScreen';
import PasswordRecoveryScreen from '../screens/AuthenciationScreens/PasswordRecoveryScreen';
import PasswordRecoveryCodeScreen from '../screens/AuthenciationScreens/PasswordRecoveryCodeScreen';
import PasswordRecoveryNewScreen from '../screens/AuthenciationScreens/PasswordRecoveryNewScreen';
import PasswordRecoverySuccessScreen from '../screens/AuthenciationScreens/PasswordRecoverySuccessScreen';

// Configuration for Stack Navigator
export const stackScreens = [
  { name: 'Welcome', component: WelcomeScreen },
  { name: 'WelcomeInfo', component: WelcomeInfoScreen },
  { name: 'Login', component: LoginScreen },
  { name: 'Register', component: RegisterScreen },
  { name: 'Error', component: ErrorScreen },
  { name: 'Verify', component: VerifyScreen },
  { name: 'VerifyLogin', component: VerifyLoginScreen },
  { name: 'ManageNotifications', component: ManageNotification },
  { name: 'Devices', component: DevicesScreen },
  { name: 'EditProfile', component: EditProfileScreen },
  { name: 'BloodPressure', component: BloodPressureScreen },
  { name: 'Sleep', component: SleepScreen },
  { name: 'HeartRate', component: HeartRateScreen },
  { name: 'RecordDetail', component: RecordDetailScreen },
  { name: 'ChartDetail', component: ChartDetailScreen },
  { name: 'Chatbox', component: ChatboxScreen },
  { name: 'SetGoals', component: SetGoalsScreen },
  { name: 'GoalList', component: GoalListScreen },
  { name: 'Schedule', component: ScheduleScreen },
  { name: 'RateSchedule', component: RateScheduleScreen },
  { name: 'RiskWarning', component: RiskWarningScreen },
  { name: 'Search', component: SearchScreen },
  { name: 'DeviceNotifications', component: DeviceNotificationScreen },
  { name: 'Calories', component: CaloriesScreen },
  { name: 'GenerateSchedule', component: GenerateScheduleScreen },
  { name: 'Calendar', component: CalendarScreen },
  { name: 'ScheduleHistory', component: HistoryScheduleScreen },
  { name: 'AddSchedule', component: AddScheduleScreen },

  //Authenciation Screens
  { name: "PasswordRecovery", component: PasswordRecoveryScreen },
  { name: "PasswordRecoveryCode", component: PasswordRecoveryCodeScreen},
  { name: "PasswordRecoveryNew", component: PasswordRecoveryNewScreen},
  { name: "PasswordRecoverySuccess", component: PasswordRecoverySuccessScreen},

  // Community Screens
  { name: 'CommunityNewsDetail', component: CommunityNewsDetailScreen },
  { name: 'CommunityPostDetail', component: CommunityPostDetailScreen },
  { name: 'CommunityCreatePost', component: CommunityPostCreateScreen },

  // About Screens
  { name: 'PrivacyPolicy', component: PrivacyPolicyScreen },
  { name: 'TermsOfService', component: TermsOfServiceScreen },
];

// Configuration for Tab Navigator
export const tabScreens = [
  { name: 'Home', component: HomeScreen },
  { name: 'Records', component: RecordScreen },
  { name: 'RiskWarnings', component: RiskWarningListScreen },
  { name: 'Community', component: CommunityScreen },
  { name: 'ExpertChat', component: ExpertChatScreen },
  { name: 'Settings', component: SettingsScreen },
];

// Configuration for Home Stack (includes tab navigator)
export const homeStackScreens = [
  { name: 'HomeMain', component: HomeScreen },
];