import { Alert, Linking } from 'react-native';
import { BASE_URL } from './api';
export const TERMS_VERSION = '2026-10-01';
export function openLegal(
  page: 'privacy' | 'terms' | 'support' | 'delete-account',
) {
  Linking.openURL(`${BASE_URL}/legal/${page}.html`).catch(() =>
    Alert.alert('페이지 열기 실패', '잠시 후 다시 시도해주세요'),
  );
}
