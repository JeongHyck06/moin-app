import { useEffect, useState } from 'react';
import { Linking, Modal, Platform, StyleSheet, Text, View } from 'react-native';
import { api, type AppVersion } from '../api';
import { isOutdated } from '../version';
import { version as currentVersion } from '../../package.json';
import Button from './Button';
import { colors, radius, spacing } from '../theme';

type Mode = 'force' | 'suggest';

// 앱 시작 시 한 번 검사, min 미만이면 닫을 수 없는 안내, latest 미만이면 넘어갈 수 있는 안내
export default function UpdateGate() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [store, setStore] = useState('');

  useEffect(() => {
    api<AppVersion>('GET', '/app/version')
      .then(v => {
        setStore(Platform.OS === 'ios' ? v.iosStoreUrl : v.androidStoreUrl);
        if (isOutdated(currentVersion, v.minVersion)) {
          setMode('force');
        } else if (isOutdated(currentVersion, v.latestVersion)) {
          setMode('suggest');
        }
      })
      .catch(() => {
        // 버전 확인 실패로 앱을 막지 않음
      });
  }, []);

  const force = mode === 'force';
  return (
    <Modal visible={mode !== null} transparent animationType="fade" onRequestClose={() => {
        if (!force) {
          setMode(null);
        }
      }}>
      <View style={styles.dim}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{force ? '업데이트가 필요해요' : '새 버전이 나왔어요'}</Text>
          <Text style={styles.body}>
            {force ? '계속 사용하려면 최신 버전으로 업데이트해 주세요' : '지금 업데이트하면 새 기능을 바로 쓸 수 있어요'}
          </Text>
          <Button label="업데이트" onPress={() => Linking.openURL(store)} />
          {!force && <Button label="나중에" variant="secondary" onPress={() => setMode(null)} />}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  dim: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: spacing.lg },
  sheet: { width: '100%', backgroundColor: colors.surface, borderRadius: radius.card, padding: spacing.lg, gap: 12 },
  title: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  body: { fontSize: 15, color: colors.textSecondary, paddingBottom: 4 },
});
