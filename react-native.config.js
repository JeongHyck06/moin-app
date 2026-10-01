// 첫 출시는 광고·유료 구매 SDK를 네이티브 빌드에서도 제외
module.exports = {
  dependencies: {
    'react-native-google-mobile-ads': {
      platforms: { ios: null, android: null },
    },
    'react-native-iap': { platforms: { ios: null, android: null } },
  },
};
