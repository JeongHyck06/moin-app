import { useEffect, useRef, useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DarkTheme, NavigationContainer, type NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { api, loadToken, onTokenChange, type LoginResponse, type Profile } from './src/api';
import { observeAppleRevocation } from './src/socialLogin';
import { registerPushToken } from './src/push';
import { useNotificationOpen } from './src/useNotificationOpen';
import UpdateGate from './src/components/UpdateGate';
import type { RootStackParamList } from './src/navigation';
import TabBar from './src/components/TabBar';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import CreateGroup1Screen from './src/screens/CreateGroup1Screen';
import CreateGroup2Screen from './src/screens/CreateGroup2Screen';
import CreateGroup3Screen from './src/screens/CreateGroup3Screen';
import CreateGroup4Screen from './src/screens/CreateGroup4Screen';
import CreateGroup5Screen from './src/screens/CreateGroup5Screen';
import JoinGroupScreen from './src/screens/JoinGroupScreen';
import GroupDetailScreen from './src/screens/GroupDetailScreen';
import CameraScreen from './src/screens/CameraScreen';
import PreviewScreen from './src/screens/PreviewScreen';
import CompleteScreen from './src/screens/CompleteScreen';
import FeedScreen from './src/screens/FeedScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import MyPageScreen from './src/screens/MyPageScreen';
import NotificationSettingsScreen from './src/screens/NotificationSettingsScreen';
import EditGroupNameScreen from './src/screens/EditGroupNameScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import { colors } from './src/theme';
import FreezeShopScreen from './src/screens/FreezeShopScreen';
import { SeenCheckInsProvider } from './src/SeenCheckInsProvider';

const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.accent,
    background: colors.canvas,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.separator,
  },
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

// 렌더 안에서 컴포넌트를 만들면 탭바가 매번 리마운트됨
const renderTabBar = (props: BottomTabBarProps) => <TabBar {...props} />;

function MainTabs() {
  return (
    <Tab.Navigator tabBar={renderTabBar} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: '홈' }} />
      <Tab.Screen name="MyPage" component={MyPageScreen} options={{ title: '마이페이지' }} />
    </Tab.Navigator>
  );
}

function App() {
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [ready, setReady] = useState(false);
  const nav = useRef<NavigationContainerRef<RootStackParamList>>(null);
  useNotificationOpen(nav, user !== null);
  useEffect(observeAppleRevocation, []);

  useEffect(() => {
    // 저장된 토큰으로 프로필을 받아오면 로그인 상태 복원, 만료면 request 가 토큰을 지움
    loadToken()
      .then(t => (t === null ? null : api<Profile>('GET', '/me')))
      .then(me => me && setUser({ token: '', userId: me.id, nickname: me.nickname, avatarUrl: me.avatarUrl }))
      .catch(() => {}) // 오프라인이면 토큰을 그대로 두고 다음 실행에 다시 시도
      .finally(() => setReady(true));
    return onTokenChange(t => {
      if (t === null) {
        setUser(null);
      }
    });
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }
    // 로그인 뒤에야 Authorization 헤더가 붙어 토큰을 등록할 수 있음
    let off = () => {};
    let cancelled = false;
    registerPushToken().then(unsubscribe => {
      if (cancelled) unsubscribe();
      else off = unsubscribe;
    });
    return () => { cancelled = true; off(); };
  }, [user]);

  if (!ready) {
    // 스플래시 디자인이 없어 캔버스 색으로만 채움
    return <View style={styles.splash} />;
  }

  return (
    <SafeAreaProvider>
      <SeenCheckInsProvider userId={user?.userId ?? null}>
      <NavigationContainer theme={theme} ref={nav}>
        <StatusBar barStyle="light-content" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {/* 로그인 여부로 스택 전환, 토큰은 AsyncStorage 에 남아 재시작해도 유지 */}
          {user ? (
            <>
              <Stack.Screen name="Main" component={MainTabs} />
              <Stack.Screen name="FreezeShop" component={FreezeShopScreen} />
              <Stack.Screen name="CreateGroup1" component={CreateGroup1Screen} />
              <Stack.Screen name="CreateGroup2" component={CreateGroup2Screen} />
              <Stack.Screen name="CreateGroup3" component={CreateGroup3Screen} />
              <Stack.Screen name="CreateGroup4" component={CreateGroup4Screen} />
              <Stack.Screen name="CreateGroup5" component={CreateGroup5Screen} />
              <Stack.Screen name="JoinGroup" component={JoinGroupScreen} />
              <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
              <Stack.Screen name="Camera" component={CameraScreen} options={{ animation: 'slide_from_bottom' }} />
              <Stack.Screen name="Preview" component={PreviewScreen} />
              <Stack.Screen name="Complete" component={CompleteScreen} options={{ gestureEnabled: false }} />
              <Stack.Screen name="Feed" component={FeedScreen} options={{ animation: 'fade' }} />
              <Stack.Screen name="Calendar" component={CalendarScreen} />
              <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
              <Stack.Screen name="EditGroupName" component={EditGroupNameScreen} />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            </>
          ) : (
            <Stack.Screen name="Login">{() => <LoginScreen onLogin={setUser} />}</Stack.Screen>
          )}
        </Stack.Navigator>
        <UpdateGate />
      </NavigationContainer>
      </SeenCheckInsProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: colors.canvas },
});

export default App;
