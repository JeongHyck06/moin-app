import { useState } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { LoginResponse } from './src/api';
import TabBar from './src/components/TabBar';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import { colors } from './src/theme';

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
const Stack = createNativeStackNavigator();

// 렌더 안에서 컴포넌트를 만들면 탭바가 매번 리마운트됨
const renderTabBar = (props: BottomTabBarProps) => <TabBar {...props} />;

// Phase 5 에서 교체
function MyPageScreen() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>마이페이지</Text>
    </View>
  );
}

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
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={theme}>
        <StatusBar barStyle="light-content" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {/* 로그인 여부로 스택 전환, 토큰은 메모리에만 있어 앱을 껐다 켜면 다시 로그인 */}
          {user ? (
            <Stack.Screen name="Main" component={MainTabs} />
          ) : (
            <Stack.Screen name="Login">{() => <LoginScreen onLogin={setUser} />}</Stack.Screen>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.canvas },
  placeholderText: { color: colors.textSecondary },
});

export default App;
