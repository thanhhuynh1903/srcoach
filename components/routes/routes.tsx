import HomeScreen from '../screens/DashboardScreens/HomeScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import WelcomeInfoScreen from '../screens/WelcomeInfoScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SearchResultsScreen from '../screens/SearchScreenResult';
import SettingsScreen from '../screens/SettingsScreen';
import ErrorScreen from '../screens/ErrorScreen';
import ManageNotification from '../screens/ManageNotification';
import SettingsDevicesScreen from '../screens/SettingsScreens/SettingsDevicesScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import SPo2Screen from '../screens/DashboardScreens/RecordSPo2Screen';
import SleepScreen from '../screens/DashboardScreens/RecordSleepScreen';
import HeartRateScreen from '../screens/DashboardScreens/RecordHeartRateScreen';
import ChartDetailScreen from '../screens/ChartDetailScreen';
import SetGoalsScreen from '../screens/SetGoalsScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import RateScheduleScreen from '../screens/RateScheduleScreen';
import RiskWarningListScreen from '../screens/RiskWarningListScreen';
import RiskWarningScreen from '../screens/RiskWarningScreen';
import DeviceNotificationScreen from '../screens/SettingsScreens/DeviceNotificationScreen';
import CaloriesScreen from '../screens/DashboardScreens/RecordCaloriesScreen';
import VerifyScreen from '../screens/VerifyScreen';
import GenerateScheduleScreen from '../screens/ScheduleScreens/GenerateScheduleScreen';
import CalendarScreen from '../screens/CalendarScreen';
import HistoryScheduleScreen from '../screens/ScheduleScreens/HistoryCalendarScreen';
import VerifyLoginScreen from '../screens/VerifyLoginInactiveScreen';
import PrivacyPolicyScreen from '../screens/SettingsScreens/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/SettingsScreens/TermsOfServiceScreen';
import CommunityScreen from '../screens/CommunityScreens/CommunityScreen';
import CommunityNewsDetailScreen from '../screens/CommunityScreens/CommunityNewsDetailScreen';
import CommunityPostDetailScreen from '../screens/CommunityScreens/CommunityPostDetailScreen';
import CommunityPostCreateScreen from '../screens/CommunityScreens/CommunityPostCreateScreen';
import CommunityUpdatePostScreen from '../screens/CommunityScreens/CommunityUpdatePostScreen';
import AddScheduleScreen from '../screens/ScheduleScreens/AddScheduleScreen';
import PasswordRecoveryScreen from '../screens/AuthenciationScreens/PasswordRecoveryScreen';
import PasswordRecoveryCodeScreen from '../screens/AuthenciationScreens/PasswordRecoveryCodeScreen';
import PasswordRecoveryNewScreen from '../screens/AuthenciationScreens/PasswordRecoveryNewScreen';
import PasswordRecoverySuccessScreen from '../screens/AuthenciationScreens/PasswordRecoverySuccessScreen';
import RunnerProfileScreen from '../screens/RunnerProfileScreen';
import LeaderBoardScreen from '../screens/LeaderboardScreens/LeaderBoardScreen';
import RecordStepsScreen from '../screens/DashboardScreens/RecordStepsScreen';
import RecordDistanceScreen from '../screens/DashboardScreens/RecordDistanceScreen';
import UserCertificatesIntroScreen from '../screens/SettingsScreens/UserCertificatesScreens/UserCertificatesIntroScreen';
import UserCertificatesLegalScreen from '../screens/SettingsScreens/UserCertificatesScreens/UserCertificatesLegalScreen';
import UserCertificatesSubmitScreen from '../screens/SettingsScreens/UserCertificatesScreens/UserCertificatesSubmitScreen';
import UserCertificatesSuccessScreen from '../screens/SettingsScreens/UserCertificatesScreens/UserCertificatesSuccessScreen';
import UserCertificatesAlreadyExistsScreen from '../screens/SettingsScreens/UserCertificatesScreens/UserCertificatesAlreadyExistsScreen';
import UserCertificatesExpertScreen from '../screens/SettingsScreens/UserCertificatesScreens/UserCertificatesExpertsScreen';
import SettingsAboutScreen from '../screens/SettingsScreens/SettingsAboutScreen';
import ScheduleDetailScreen from '../screens/ScheduleDetailScreen';
import ExerciseRecordsScreen from '../screens/ExerciseRecordsScreens/ExerciseRecordsScreen';
import OtherProfileScreen from '../screens/OtherProfileScreen';
import ExerciseRecordsFullMapScreen from '../screens/ExerciseRecordsScreens/ExerciseRecordsFullMapScreen';
import ExerciseRecordsDetailScreen from '../screens/ExerciseRecordsScreens/ExerciseRecordsDetailScreen';
import SettingsRecruitmentsScreen from '../screens/SettingsScreens/SettingsRecruitmentsScreen';
import DraftScreen from '../screens/SettingsScreens/DraftScreen';
import ChatsHomeScreen from '../screens/ChatsScreens/ChatsHome/ChatsHomeScreen';
import ChatsSearchScreen from '../screens/ChatsScreens/ChatsSearch/ChatsSearchScreen';
import ChatsMessageScreen from '../screens/ChatsScreens/ChatsMessage/ChatsMessageScreen';
import ChatsExpertNotiScreen from '../screens/ChatsScreens/ChatsSearch/ChatsExpertNotiScreen';
import ChatsSessionMessageSearch from '../screens/ChatsScreens/ChatsSearch/ChatsSessionMessageSearch';
import ChatsExpertConfirmScreen from '../screens/ChatsScreens/ChatsSearch/ChatsExpertConfirmScreen';
import WhatsNewScreen from '../screens/SettingsScreens/SettingsAboutScreens/WhatsNewScreen';
import UpdateScheduleScreen from '../screens/ScheduleScreens/UpdateScheduleScreen';
import NewsDetailScreen from '../screens/NewsScreens/NewsDetailScreen';
import CMSMessageViewMap from '../screens/ChatsScreens/ChatsMessage/CMSMessageViewMap';
import RiskAnalysisConfirmScreen from '../screens/RiskAnalysisScreens/RiskAnalysisConfirmScreen';
import UserProfileScreen from '../screens/UserProfileScreen';

// import AuthLoadingScreen from '../screens/AuthLoadingScreen/AuthLoadingScreen';
// Configuration for Stack Navigator
export const stackScreens = [
  {name: 'WelcomeScreen', component: WelcomeScreen},
  {name: 'WelcomeInfoScreen', component: WelcomeInfoScreen},
  {name: 'LoginScreen', component: LoginScreen},
  {name: 'RegisterScreen', component: RegisterScreen},
  {name: 'ErrorScreen', component: ErrorScreen},
  {name: 'VerifyScreen', component: VerifyScreen},
  {name: 'VerifyLoginScreen', component: VerifyLoginScreen},
  {name: 'ManageNotificationsScreen', component: ManageNotification},
  {name: 'SettingsDevicesScreen', component: SettingsDevicesScreen},
  {name: 'EditProfileScreen', component: EditProfileScreen},
  {name: 'SPo2Screen', component: SPo2Screen},
  {name: 'DistanceScreen', component: RecordDistanceScreen},
  {name: 'SleepScreen', component: SleepScreen},
  {name: 'HeartRateScreen', component: HeartRateScreen},
  {name: 'ExerciseRecordsDetailScreen', component: ExerciseRecordsDetailScreen},
  {name: 'ChartDetailScreen', component: ChartDetailScreen},
  {name: 'SetGoalsScreen', component: SetGoalsScreen},
  {name: 'ScheduleScreen', component: ScheduleScreen},
  {name: 'RateScheduleScreen', component: RateScheduleScreen},
  {name: 'RiskWarningScreen', component: RiskWarningScreen},
  {name: 'SearchScreen', component: SearchResultsScreen},
  {name: 'SearchResultsScreen', component: SearchResultsScreen},
  {name: 'DeviceNotificationsScreen', component: DeviceNotificationScreen},
  {name: 'StepsScreen', component: RecordStepsScreen},
  {name: 'CaloriesScreen', component: CaloriesScreen},
  {name: 'GenerateScheduleScreen', component: GenerateScheduleScreen},
  {name: 'ScheduleDetailScreen', component: ScheduleDetailScreen},
  {name: 'CalendarScreen', component: CalendarScreen},
  {name: 'ScheduleHistoryScreen', component: HistoryScheduleScreen},
  {name: 'AddScheduleScreen', component: AddScheduleScreen},
  {name: 'UpdateScheduleScreen', component: UpdateScheduleScreen},
  {name: 'RunnerProfileScreen', component: RunnerProfileScreen},
  {name: 'OtherProfileScreen', component: OtherProfileScreen},
  {name: 'LeaderBoardScreen', component: LeaderBoardScreen},
  //Authenciation Screens
  {name: 'PasswordRecoveryScreen', component: PasswordRecoveryScreen},
  {name: 'PasswordRecoveryCodeScreen', component: PasswordRecoveryCodeScreen},
  {name: 'PasswordRecoveryNewScreen', component: PasswordRecoveryNewScreen},
  {
    name: 'PasswordRecoverySuccessScreen',
    component: PasswordRecoverySuccessScreen,
  },

  {
    name: 'ExerciseRecordsFullMapScreen',
    component: ExerciseRecordsFullMapScreen,
  },

  //Risk Analysis Screens
  {name: "RiskAnalysisConfirmScreen", component: RiskAnalysisConfirmScreen},

  // Community Screens
  {name: 'CommunityNewsDetailScreen', component: CommunityNewsDetailScreen},
  {name: 'CommunityPostDetailScreen', component: CommunityPostDetailScreen},
  {name: 'CommunityCreatePostScreen', component: CommunityPostCreateScreen},
  {name: 'CommunityUpdatePostScreen', component: CommunityUpdatePostScreen},

  //News Screens
  {name: 'NewsDetailScreen', component: NewsDetailScreen},

  //Chats Screen
  {name: 'ChatsSearchScreen', component: ChatsSearchScreen},
  {name: 'ChatsMessageScreen', component: ChatsMessageScreen},
  {name: 'ChatsExpertNotiScreen', component: ChatsExpertNotiScreen},
  {name: 'ChatsSessionMessageSearch', component: ChatsSessionMessageSearch},
  {name: 'ChatsExpertConfirmScreen', component: ChatsExpertConfirmScreen},
  {name: "CMSMessageViewMap", component: CMSMessageViewMap},

  // About Screens
  {name: 'PrivacyPolicyScreen', component: PrivacyPolicyScreen},
  {name: 'TermsOfServiceScreen', component: TermsOfServiceScreen},

  //Settings
  {name: 'SettingsAboutScreen', component: SettingsAboutScreen},
  {name: 'SettingsRecruitmentsScreen', component: SettingsRecruitmentsScreen},
  {name: 'DraftScreen', component: DraftScreen},
  {name: 'WhatsNewScreen', component: WhatsNewScreen},

  // Settings - Become Expert (Certificates)
  {name: 'UserCertificatesIntroScreen', component: UserCertificatesIntroScreen},
  {name: 'UserCertificatesLegalScreen', component: UserCertificatesLegalScreen},
  {
    name: 'UserCertificatesSubmitScreen',
    component: UserCertificatesSubmitScreen,
  },
  {
    name: 'UserCertificatesSuccessScreen',
    component: UserCertificatesSuccessScreen,
  },
  {
    name: 'UserCertificatesAlreadyExistsScreen',
    component: UserCertificatesAlreadyExistsScreen,
  },
  {
    name: 'UserCertificatesExpertsScreen',
    component: UserCertificatesExpertScreen,
  },

  //Profile screen
  {
    name: 'UserProfileScreen',
    component: UserProfileScreen
  }
];

// Cấu hình cho Tab Navigator
export const tabScreens = [
  {name: 'Home', component: HomeScreen},
  {name: 'Records', component: ExerciseRecordsScreen},
  {name: 'Risk', component: RiskWarningListScreen},
  {name: 'Community', component: CommunityScreen},
  {name: 'Chat', component: ChatsHomeScreen},
  {name: 'Settings', component: SettingsScreen},
];

// Cấu hình cho Home Stack ( bao gồm tab navigator )
export const homeStackScreens = [{name: 'HomeMain', component: HomeScreen}];
