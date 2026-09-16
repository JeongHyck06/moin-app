/* eslint-env jest */
// 카메라·영상은 네이티브 모듈이라 jest 에서는 빈 구현으로 대체
jest.mock('react-native-vision-camera', () => ({
  Camera: () => null,
  CommonResolutions: { HD_16_9: { width: 720, height: 1280 } },
  useCameraPermission: () => ({ hasPermission: true, canRequestPermission: false, requestPermission: async () => true }),
  useMicrophonePermission: () => ({ hasPermission: true, canRequestPermission: false, requestPermission: async () => true }),
  useVideoOutput: () => ({ createRecorder: async () => ({ startRecording: async () => {}, stopRecording: async () => {} }) }),
}));
jest.mock('react-native-video', () => ({ __esModule: true, default: () => null }));

// 패키지가 제공하는 mock 은 ESM 이라 babel 변환 뒤 default 로 들어옴
jest.mock('@react-native-async-storage/async-storage', () => {
  const mock = require('@react-native-async-storage/async-storage/jest');
  return mock.default ?? mock;
});

// Firebase 는 네이티브 앱 초기화가 필요해 jest 에서는 비어 있는 상태로 둠
jest.mock('@react-native-firebase/app', () => ({ getApps: () => [] }));
jest.mock('@react-native-firebase/messaging', () => ({
  getMessaging: () => ({}),
  getToken: async () => 'token',
  onTokenRefresh: () => () => {},
  onNotificationOpenedApp: () => () => {},
  getInitialNotification: async () => null,
  setBackgroundMessageHandler: () => {},
  requestPermission: async () => 1,
}));

// svg 는 네이티브 뷰라 jest 에서는 렌더링만 통과시킴
jest.mock('react-native-svg', () => {
  const React = require('react');
  const stub = (name) => (props) => React.createElement(name, props, props.children);
  return { __esModule: true, default: stub('Svg'), Svg: stub('Svg'), Circle: stub('Circle') };
});
