/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { getApps } from '@react-native-firebase/app';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

// 백그라운드 핸들러는 앱 등록 전에 걸어야 한다, 표시는 OS 가 하므로 여기서는 resolve 만
if (getApps().length > 0) {
  setBackgroundMessageHandler(getMessaging(), async () => {});
}

AppRegistry.registerComponent(appName, () => App);
