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
