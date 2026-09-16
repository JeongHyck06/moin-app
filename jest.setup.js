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
