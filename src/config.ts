import Config from 'react-native-config';

// 카카오 네이티브 앱 키, 비어 있으면 로그인 화면이 개발용 닉네임 로그인으로 동작
// 값은 .env.local (dev·prod 는 각 파일) 에 넣을 것, 저장소에는 .env.example 만 있다
export const KAKAO_APP_KEY = Config.KAKAO_APP_KEY ?? '';
