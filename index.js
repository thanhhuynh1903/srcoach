/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import { BackgroundService } from './components/services/BackgroundService';

AppRegistry.registerComponent(appName, () => App);
AppRegistry.registerHeadlessTask('BackgroundService', () => BackgroundService);
