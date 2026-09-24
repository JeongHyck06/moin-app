import { Platform } from 'react-native';
import { check, request, RESULTS } from 'react-native-permissions';
import { requestTrackingConsent } from '../src/trackingConsent';

jest.mock('react-native', () => ({ Platform: { OS: 'ios' }, AppState: { currentState: 'active' } }));

test('동시 요청은 한 번만 표시하고 거절 후 재요청하거나 Android에서 요청하지 않는다', async () => {
  jest.mocked(check).mockResolvedValue(RESULTS.DENIED);
  jest.mocked(request).mockResolvedValue(RESULTS.BLOCKED);
  await Promise.all([requestTrackingConsent(), requestTrackingConsent()]);
  expect(request).toHaveBeenCalledTimes(1);
  jest.mocked(check).mockResolvedValue(RESULTS.BLOCKED);
  await expect(requestTrackingConsent()).resolves.toBeUndefined();
  expect(request).toHaveBeenCalledTimes(1);
  Platform.OS = 'android';
  await requestTrackingConsent();
  expect(check).toHaveBeenCalledTimes(2);
});
