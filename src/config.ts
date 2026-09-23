import Config from 'react-native-config';

// 카카오 네이티브 앱 키, 키 없는 개발 빌드에서만 닉네임 로그인 허용
// 값은 .env.local (운영 빌드는 .env.prod) 에 넣을 것, 저장소에는 .env.example 만 있다
export const KAKAO_APP_KEY = Config.KAKAO_APP_KEY ?? '';
export const GOOGLE_WEB_CLIENT_ID = Config.GOOGLE_WEB_CLIENT_ID ?? '';
export const GOOGLE_IOS_CLIENT_ID = Config.GOOGLE_IOS_CLIENT_ID ?? '';
export const DEV_LOGIN_ENABLED = __DEV__ && KAKAO_APP_KEY.length === 0 && GOOGLE_WEB_CLIENT_ID.length === 0;
