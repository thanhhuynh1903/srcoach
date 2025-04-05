import HomeScreen from '../screens/HomeScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import WelcomeInfoScreen from '../screens/WelcomeInfoScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import RecordScreen from '../screens/RecordScreen';
import SearchResultsScreen from '../screens/SearchScreenResult';
// import ExercisesScreen from '../screens/ExercisesScreen';
import ExpertChatScreen from '../screens/ExpertChatScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SearchScreen from '../screens/SearchScreen';
import ErrorScreen from '../screens/ErrorScreen';
import ManageNotification from '../screens/ManageNotification';
import DevicesScreen from '../screens/DevicesScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import SPo2Screen from '../screens/DashboardScreens/SPo2Screen';
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
import CommunityUpdatePostScreen from '../screens/CommunityScreens/CommunityUpdatePostScreen';
import AddScheduleScreen from '../screens/AddScheduleScreen';
import PasswordRecoveryScreen from '../screens/AuthenciationScreens/PasswordRecoveryScreen';
import PasswordRecoveryCodeScreen from '../screens/AuthenciationScreens/PasswordRecoveryCodeScreen';
import PasswordRecoveryNewScreen from '../screens/AuthenciationScreens/PasswordRecoveryNewScreen';
import PasswordRecoverySuccessScreen from '../screens/AuthenciationScreens/PasswordRecoverySuccessScreen';
import RunnerProfileScreen from '../screens/RunnerProfileScreen';
import LeaderBoardScreen from '../screens/LeaderBoardScreen';
// import AuthLoadingScreen from '../screens/AuthLoadingScreen/AuthLoadingScreen';
// Configuration for Stack Navigator
export const stackScreens = [
  { name: 'WelcomeScreen', component: WelcomeScreen },
  { name: 'WelcomeInfoScreen', component: WelcomeInfoScreen },
  { name: 'LoginScreen', component: LoginScreen },
  { name: 'RegisterScreen', component: RegisterScreen },
  { name: 'ErrorScreen', component: ErrorScreen },
  { name: 'VerifyScreen', component: VerifyScreen },
  { name: 'VerifyLoginScreen', component: VerifyLoginScreen },
  { name: 'ManageNotificationsScreen', component: ManageNotification },
  { name: 'DevicesScreen', component: DevicesScreen },
  { name: 'EditProfileScreen', component: EditProfileScreen },
  { name: 'SPo2Screen', component: SPo2Screen },
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
  { name: 'SearchScreen', component: SearchResultsScreen },
  { name: 'SearchResultsScreen', component: SearchResultsScreen },
  { name: 'DeviceNotificationsScreen', component: DeviceNotificationScreen },
  { name: 'CaloriesScreen', component: CaloriesScreen },
  { name: 'GenerateScheduleScreen', component: GenerateScheduleScreen },
  { name: 'CalendarScreen', component: CalendarScreen },
  { name: 'ScheduleHistoryScreen', component: HistoryScheduleScreen },
  { name: 'AddScheduleScreen', component: AddScheduleScreen },
  { name : 'RunnerProfileScreen'  , component: RunnerProfileScreen},
  { name : 'LeaderBoardScreen'  , component: LeaderBoardScreen},
  //Authenciation Screens
  { name: "PasswordRecoveryScreen", component: PasswordRecoveryScreen },
  { name: "PasswordRecoveryCodeScreen", component: PasswordRecoveryCodeScreen},
  { name: "PasswordRecoveryNewScreen", component: PasswordRecoveryNewScreen},
  { name: "PasswordRecoverySuccessScreen", component: PasswordRecoverySuccessScreen},

  // Community Screens
  { name: 'CommunityNewsDetailScreen', component: CommunityNewsDetailScreen },
  { name: 'CommunityPostDetailScreen', component: CommunityPostDetailScreen },
  { name: 'CommunityCreatePostScreen', component: CommunityPostCreateScreen },
  { name: 'CommunityUpdatePostScreen', component: CommunityUpdatePostScreen },

  // About Screens
  { name: 'PrivacyPolicyScreen', component: PrivacyPolicyScreen },
  { name: 'TermsOfServiceScreen', component: TermsOfServiceScreen },
];

// Cấu hình cho Tab Navigator
export const tabScreens = [
  { name: 'Home', component: HomeScreen },
  { name: 'Records', component: RecordScreen },
  { name: 'Risk', component: RiskWarningListScreen },
  { name: 'Community', component: CommunityScreen },
  { name: 'Chat', component: ExpertChatScreen },
  { name: 'Settings', component: SettingsScreen },
];

// Cấu hình cho Home Stack ( bao gồm tab navigator )
export const homeStackScreens = [
  { name: 'HomeMain', component: HomeScreen },
];