// 카카오 네이티브 앱 키, 비어 있으면 로그인 화면이 개발용 닉네임 로그인으로 동작
//
// 키를 받으면 세 곳을 같은 값으로 채울 것
//   1. 여기 KAKAO_APP_KEY
//   2. android/gradle.properties 의 KAKAO_APP_KEY (manifest 스킴과 문자열 리소스가 여기서 나옴)
//   3. ios/Moin/Info.plist 의 KAKAO_APP_KEY 와 CFBundleURLSchemes 의 "kakao" 뒤
export const KAKAO_APP_KEY = 'be457a6a43d30ee3ea5af761acfded4c';
