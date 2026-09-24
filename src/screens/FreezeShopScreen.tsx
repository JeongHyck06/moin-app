import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Config from 'react-native-config';
import { useIAP, ErrorCode, getAvailablePurchases, type Purchase } from 'react-native-iap';
import { AdsConsent } from 'react-native-google-mobile-ads';
import { api, type FreezeWallet } from '../api';
import { watchFreezeAd } from '../freezeAds';
import Header from '../components/Header';
import Button from '../components/Button';
import { card, colors, spacing } from '../theme';

// 미완료 거래는 서버 지급 확인 뒤에만 소모, 앱 종료·재시도에도 같은 거래 중복 지급 방지
function PurchaseItem({ wallet, onUpdated }: { wallet: FreezeWallet; onUpdated: (wallet: FreezeWallet) => void }) {
  const [busy, setBusy] = useState(false);
  const processing = useRef(new Set<string>());
  const [message, setMessage] = useState('');
  const completeRef = useRef<(p: Purchase) => Promise<void>>(async () => {});
  const { connected, products, fetchProducts, requestPurchase, finishTransaction } = useIAP({
    onPurchaseSuccess: p => { completeRef.current(p); },
    onPurchaseError: e => {
      setBusy(false);
      if (e.code !== ErrorCode.UserCancelled) setMessage('구매를 완료하지 못했어요. 잠시 후 다시 시도해주세요');
    },
  });
  const complete = useCallback(async (purchase: Purchase) => {
    if (purchase.productId !== wallet.productId || !purchase.purchaseToken || processing.current.has(purchase.id)) return;
    processing.current.add(purchase.id);
    try {
      const updated = await api<FreezeWallet>('POST', '/me/freezes/purchases', { platform: Platform.OS, token: purchase.purchaseToken });
      await finishTransaction({ purchase, isConsumable: true });
      onUpdated(updated);
      setMessage('프리즈가 보관함에 지급됐어요');
    } catch (e) { setMessage((e as Error).message + '\n추가 결제 없이 구매 확인을 다시 시도할 수 있어요'); }
    finally { processing.current.delete(purchase.id); setBusy(false); }
  }, [finishTransaction, onUpdated, wallet.productId]);
  completeRef.current = complete;
  const recover = useCallback(async () => {
    try { for (const p of await getAvailablePurchases()) await completeRef.current(p); }
    catch { setMessage('구매 내역을 확인하지 못했어요. 다시 시도해주세요'); }
  }, []);
  useEffect(() => {
    if (!connected) return;
    fetchProducts({ skus: [wallet.productId], type: 'in-app' }).catch(() => setMessage('스토어 상품을 불러오지 못했어요'));
    recover();
  }, [connected, fetchProducts, recover, wallet.productId]);
  const product = products.find(p => p.id === wallet.productId);
  const buy = async () => {
    if (busy || !product) return;
    setBusy(true); setMessage('');
    try {
      await requestPurchase({ type: 'in-app', request: {
        apple: { sku: wallet.productId, appAccountToken: wallet.accountToken, quantity: 1 },
        google: { skus: [wallet.productId], obfuscatedAccountId: wallet.accountToken },
      } });
    } catch { setBusy(false); setMessage('구매 요청을 완료하지 못했어요'); }
  };
  return <View style={styles.section}>
    <Text style={styles.title}>프리즈 1개</Text>
    <Text style={styles.body}>구매한 프리즈는 만료 없이 보관해요</Text>
    <Button label={busy ? '구매 확인 중…' : product ? `${product.displayPrice}에 구매` : '스토어 상품 준비 중'} disabled={!product || busy} onPress={buy} />
    {message !== '' && <Text accessibilityLiveRegion="polite" style={styles.body}>{message}</Text>}
    <Pressable accessibilityRole="button" disabled={!connected || busy} style={styles.action} onPress={recover}><Text style={styles.link}>미지급 구매 확인</Text></Pressable>
  </View>;
}

// 월 무료분은 각 모임 캘린더에 표시, 이 보관함에는 계정 공용 구매·광고 수량만 표시
export default function FreezeShopScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [wallet, setWallet] = useState<FreezeWallet | null>(null);
  const [error, setError] = useState('');
  const [watching, setWatching] = useState(false);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const refresh = useCallback(async () => {
    try { const w = await api<FreezeWallet>('GET', '/me/freezes'); if (alive.current) { setWallet(w); setError(''); } return w; }
    catch (e) { if (alive.current) setError((e as Error).message); return null; }
  }, []);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));
  const unit = Platform.OS === 'ios' ? wallet?.iosAdUnit : wallet?.androidAdUnit;
  const adsReady = Config.ADMOB_ENABLED === 'true' && !!unit;
  const watch = async () => {
    if (watching || !adsReady || !unit || !wallet?.adAvailable) return;
    setWatching(true);
    try {
      const session = await api<{ id: string }>('POST', '/me/freezes/ad-sessions');
      if (await watchFreezeAd(unit, session.id)) {
        let granted = false;
        for (let i = 0; i < 10 && alive.current; i++) {
          const updated = await refresh();
          if (updated && !updated.adAvailable) { granted = true; break; }
          await new Promise<void>(resolve => setTimeout(resolve, 2000));
        }
        if (alive.current) Alert.alert(granted ? '프리즈 1개 지급 완료' : '광고 보상 확인 중', granted ? '보관함에서 확인할 수 있어요' : '서버 확인이 끝나면 자동으로 지급돼요. 나중에 보관함을 확인해주세요');
      }
    } catch (e) { if (alive.current) Alert.alert('광고 보상', (e as Error).message); }
    finally { if (alive.current) setWatching(false); }
  };
  return <View style={[styles.screen, { paddingTop: insets.top }]}>
    <View style={styles.heading}><Pressable accessibilityRole="button" accessibilityLabel="뒤로" style={styles.action} onPress={() => navigation.goBack()}><Text style={styles.link}>‹ 뒤로</Text></Pressable><Header title="프리즈 보관함" small /></View>
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) }]}>
      <Text style={styles.balance}>{wallet ? `${wallet.balance}개` : '—'}</Text>
      <Text style={styles.body}>프리즈를 켠 모임의 캘린더에서 날짜를 골라 내 인증 1회를 채워요. 모임별 월 무료 1개를 먼저 사용해요.</Text>
      {error !== '' && <Pressable accessibilityRole="button" onPress={refresh}><Text style={styles.body}>{error} · 다시 시도</Text></Pressable>}
      {!wallet ? <ActivityIndicator color={colors.accent} /> : <>
        {(Platform.OS === 'ios' ? wallet.appleReady : wallet.googleReady) ? <PurchaseItem wallet={wallet} onUpdated={setWallet} /> : <View style={[card, styles.section]}><Text style={styles.title}>프리즈 1개 · 1,000원</Text><Text style={styles.body}>스토어 구매를 준비 중이에요</Text></View>}
        <View style={[card, styles.section]}>
          <Text style={styles.title}>광고 보고 1개 받기</Text>
          <Text style={styles.body}>계정당 주 1회 · 매주 월요일 초기화</Text>
          <Button disabled={watching || !adsReady || !wallet.adAvailable} label={watching ? '광고 보상 확인 중…' : !wallet.adAvailable ? '이번 주 보상 받음' : adsReady ? '광고 보고 받기' : '광고 보상 준비 중'} onPress={watch} />
          {!wallet.adAvailable && <Text style={styles.body}>다음 보상: {wallet.nextAdDate}</Text>}
        </View>
        {adsReady && <Pressable accessibilityRole="button" style={styles.action} onPress={() => AdsConsent.showPrivacyOptionsForm().catch(() => Alert.alert('광고 개인정보 설정', '변경할 수 있는 설정이 없어요'))}><Text style={styles.link}>광고 개인정보 설정</Text></Pressable>}
      </>}
    </ScrollView>
  </View>;
}
const styles = StyleSheet.create({
  heading: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg },
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: spacing.lg, gap: spacing.lg },
  section: { padding: spacing.lg, gap: spacing.md },
  balance: { color: colors.accent, fontSize: 42, fontWeight: '800' },
  title: { color: colors.textPrimary, fontSize: 18, fontWeight: '700' },
  body: { color: colors.textSecondary, fontSize: 14, lineHeight: 21 },
  action: { minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  link: { color: colors.accent, fontSize: 14 },
});
