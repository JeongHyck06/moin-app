import { useEffect, useState } from 'react';
import { Alert, Linking, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Camera,
  CommonResolutions,
  useCameraDevice,
  useCameraPermission,
  useMicrophonePermission,
  useVideoOutput,
} from 'react-native-vision-camera';
import type { RootStackParamList } from '../navigation';
import Button from '../components/Button';
import RecordButton from '../components/RecordButton';
import TopBar from '../components/TopBar';

const DURATION = 3; // 초, 서버는 길이를 검증하지 않으므로 여기서 보장
const BG = '#17171A';

// Figma Camera Idle (47:445) / Recording (47:473), 탭 한 번에 3초 녹화 후 미리보기로
export default function CameraScreen({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'Camera'>) {
  const { groupId, name } = route.params;
  const insets = useSafeAreaInsets();
  const cam = useCameraPermission();
  const mic = useMicrophonePermission();
  const [position, setPosition] = useState<'front' | 'back'>('front');
  // 시뮬레이터에는 카메라가 없어 undefined 가 나온다, 그때는 미리보기 대신 안내만
  const device = useCameraDevice(position);
  const [remaining, setRemaining] = useState<number | null>(null); // null 이면 대기
  const videoOutput = useVideoOutput({
    targetResolution: CommonResolutions.HD_16_9,
    enableAudio: mic.hasPermission,
    fileType: 'mp4', // iOS 기본은 mov, 서버는 둘 다 받지만 하나로 통일
  });

  useEffect(() => {
    if (cam.canRequestPermission) {
      cam.requestPermission();
    }
    if (mic.canRequestPermission) {
      mic.requestPermission();
    }
  }, [cam, mic]);

  const record = async () => {
    setRemaining(DURATION);
    const tick = setInterval(() => setRemaining(r => Math.max(0, (r ?? 1) - 1)), 1000);
    const done = () => {
      clearInterval(tick);
      setRemaining(null);
    };
    try {
      // maxDuration 이 차면 recorder 가 스스로 멈추고 onRecordingFinished 를 부름
      const recorder = await videoOutput.createRecorder({ maxDuration: DURATION });
      await recorder.startRecording(
        path => {
          done();
          navigation.replace('Preview', { groupId, name, path });
        },
        error => {
          done();
          Alert.alert('녹화 실패', error.message);
        },
      );
    } catch (e) {
      done();
      Alert.alert('녹화 실패', (e as Error).message);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <TopBar title={name} onClose={() => navigation.goBack()} onFlip={() => setPosition(p => (p === 'front' ? 'back' : 'front'))} />
      <View style={styles.preview}>
        {device === undefined ? (
          <>
            <Text style={styles.placeholder}>이 기기에서는 카메라를 쓸 수 없어요</Text>
            <Button label="닫기" variant="secondary" style={styles.placeholderButton} onPress={() => navigation.goBack()} />
          </>
        ) : cam.hasPermission ? (
          // orientationSource 기본값 device 는 가속도계를 구독해서 시뮬레이터에서 터진다, 앱이 세로 고정이라 추적할 이유도 없음
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive
            outputs={[videoOutput]}
            orientationSource="custom"
          />
        ) : (
          <>
            <Text style={styles.placeholder}>카메라 권한이 필요해요</Text>
            {!cam.canRequestPermission && <Button label="설정 열기" variant="secondary" style={styles.placeholderButton} onPress={() => Linking.openSettings()} />}
          </>
        )}
      </View>
      {device !== undefined && (
        <View style={[styles.controls, { paddingBottom: Math.max(insets.bottom, 48) }]}>
          <Text style={styles.caption}>{remaining === null ? `탭하면 ${DURATION}초 자동 녹화` : `녹화 중 · ${remaining}초`}</Text>
          <RecordButton recording={remaining !== null} duration={DURATION} onPress={record} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },
  preview: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, overflow: 'hidden' },
  placeholder: { fontSize: 13, color: 'rgba(255,255,255,0.35)' },
  // Button 은 화면 폭을 채우는 전제라 가운데 정렬로 쓰면 좌우 여백이 없다
  placeholderButton: { paddingHorizontal: 28 },
  controls: { alignItems: 'center', gap: 16, paddingTop: 16 },
  caption: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
});
