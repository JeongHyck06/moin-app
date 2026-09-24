import mobileAds, { AdEventType, AdsConsent, MaxAdContentRating, RewardedAd, RewardedAdEventType } from 'react-native-google-mobile-ads';

// 사용자 동의 이후에만 SDK 초기화, 지급은 서버 SSV 콜백에서 처리
export async function watchFreezeAd(unitId: string, session: string): Promise<boolean> {
  const consent = await AdsConsent.gatherConsent();
  if (!consent.canRequestAds) throw new Error('광고 동의 설정을 확인해주세요');
  await mobileAds().setRequestConfiguration({ maxAdContentRating: MaxAdContentRating.G });
  await mobileAds().initialize();
  return new Promise((resolve, reject) => {
    let earned = false;
    let settled = false;
    const ad = RewardedAd.createForAdRequest(unitId, {
      requestNonPersonalizedAdsOnly: true,
      serverSideVerificationOptions: { customData: session },
    });
    const off: (() => void)[] = [];
    const timer = setTimeout(() => finish(new Error('광고를 불러오지 못했어요. 다시 시도해주세요')), 45000);
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      off.forEach(remove => remove());
      if (error) reject(error); else resolve(earned);
    };
    off.push(ad.addAdEventListener(RewardedAdEventType.LOADED, () => { clearTimeout(timer); ad.show().catch(finish); }));
    off.push(ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => { earned = true; }));
    off.push(ad.addAdEventListener(AdEventType.CLOSED, () => finish()));
    off.push(ad.addAdEventListener(AdEventType.ERROR, () => finish(new Error('지금 볼 수 있는 광고가 없어요. 잠시 후 다시 시도해주세요'))));
    ad.load();
  });
}
