test('운영 빌드는 카카오 키가 없어도 개발 로그인으로 전환하지 않는다', () => {
  const runtime = globalThis as typeof globalThis & { __DEV__: boolean };
  const mode = jest.replaceProperty(runtime, '__DEV__', false);
  try {
    jest.isolateModules(() => {
      const config = require('../src/config');
      expect(config.KAKAO_APP_KEY).toBe('');
      expect(config.DEV_LOGIN_ENABLED).toBe(false);
    });
    mode.replaceValue(true);
    jest.isolateModules(() => {
      expect(require('../src/config').DEV_LOGIN_ENABLED).toBe(true);
    });
  } finally {
    mode.restore();
  }
});
