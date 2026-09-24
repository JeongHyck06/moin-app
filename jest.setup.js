/* eslint-env jest */
// 카메라·영상은 네이티브 모듈이라 jest 에서는 빈 구현으로 대체
jest.mock('react-native-vision-camera', () => ({
  Camera: () => null,
  CommonResolutions: { HD_16_9: { width: 720, height: 1280 } },
  useCameraDevice: () => ({ id: 'test-camera' }),
  useCameraPermission: () => ({ hasPermission: true, canRequestPermission: false, requestPermission: async () => true }),
  useMicrophonePermission: () => ({ hasPermission: true, canRequestPermission: false, requestPermission: async () => true }),
  useVideoOutput: () => ({ createRecorder: async () => ({ startRecording: async () => {}, stopRecording: async () => {} }) }),
}));
jest.mock('react-native-video', () => ({ __esModule: true, default: () => null, ViewType: { TEXTURE: 0, SURFACE: 1 } }));

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
  isDeviceRegisteredForRemoteMessages: () => true,
  registerDeviceForRemoteMessages: async () => {},
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
  return { __esModule: true, default: stub('Svg'), Svg: stub('Svg'), Circle: stub('Circle'), Path: stub('Path') };
});

// 카카오 SDK 는 네이티브 모듈, 키가 없으면 호출되지도 않음
jest.mock('@react-native-seoul/kakao-login', () => ({
  login: async () => ({ accessToken: 'kakao-access-token' }),
  logout: async () => 'ok',
}));

// env 는 네이티브 빌드가 주입하는 값이라 jest 에서는 .env.local 과 같은 값을 넣어준다
// 카카오 키는 비워서 키 없는 경로(개발용 닉네임 로그인)를 그대로 타게 둔다
jest.mock('react-native-config', () => ({
  __esModule: true,
  default: { KAKAO_APP_KEY: '', API_BASE_URL: 'http://localhost:8080' },
}));

// OS 로그인 창은 테스트에서 열지 않고 SDK 경계만 대체
jest.mock('@react-native-google-signin/google-signin', () => {
  const GoogleSigninButton = () => null;
  GoogleSigninButton.Size = { Wide: 1 };
  GoogleSigninButton.Color = { Light: 0 };
  return {
    GoogleSigninButton,
    GoogleSignin: { configure: jest.fn(), hasPlayServices: jest.fn(), signIn: jest.fn() },
    isSuccessResponse: response => response.type === 'success',
    isErrorWithCode: error => typeof error?.code === 'string',
    statusCodes: { SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED' },
  };
});
jest.mock('@invertase/react-native-apple-authentication', () => {
  const AppleButton = () => null;
  AppleButton.Style = { WHITE: 0 };
  AppleButton.Type = { SIGN_IN: 0 };
  return {
    AppleButton,
    appleAuth: {
      isSupported: true,
      Operation: { LOGIN: 1 },
      Scope: { FULL_NAME: 0, EMAIL: 1 },
      Error: { CANCELED: '1001' },
      performRequest: jest.fn(),
    },
  };
});
