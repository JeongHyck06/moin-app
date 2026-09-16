module.exports = {
  preset: '@react-native/jest-preset',
  // react-navigation 은 ESM 배포라 변환 대상에 포함
  transformIgnorePatterns: ['node_modules/(?!(jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-screens|react-native-safe-area-context)'],
};
