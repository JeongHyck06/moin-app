import { Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Video from 'react-native-video';
import { videoUrl } from '../api';
import { colors } from '../theme';

type Props = {
  done: boolean;
  name?: string;
  progress?: string; // 주 N회 그룹의 "1/2"
  avatarUrl?: string | null;
  videoUrl?: string | null; // 서버 상대 경로, 완료 아바타의 썸네일 자리
  size?: number;
  style?: StyleProp<ViewStyle>;
};

// 완료=액센트 링(영상 첫 프레임), 미완료=회색 실루엣, 빨강/경고 금지 (Figma MemberAvatar 42:62)
// 서버가 썸네일을 만들지 않아 영상 첫 프레임을 멈춘 채로 씀 (BACKEND_DESIGN.md §11)
// ponytail: 한 화면에 멈춘 Video 가 10개를 넘어가면 썸네일 API 를 서버에 요청할 것
export default function MemberAvatar({ done, name, progress, avatarUrl, videoUrl: path, size = 36, style }: Props) {
  const circle = { width: size, height: size, borderRadius: size / 2 };
  const fill = path ? (
    <Video source={{ uri: videoUrl(path) }} style={StyleSheet.absoluteFill} resizeMode="cover" paused muted />
  ) : avatarUrl ? (
    <Image source={{ uri: avatarUrl }} style={StyleSheet.absoluteFill} />
  ) : null;

  return (
    <View style={[styles.wrap, style]}>
      {done ? (
        <View style={[circle, styles.ring, { borderWidth: size / 28 }]}>{fill}</View>
      ) : avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={[circle, styles.dim]} />
      ) : (
        <Image source={require('../assets/avatar-empty.png')} style={circle} />
      )}
      {name !== undefined && <Text style={[styles.name, !done && styles.muted]}>{name}</Text>}
      {progress !== undefined && <Text style={styles.progress}>{progress}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 6 },
  // Figma 36px 기준 링 1.29, 56px 기준 2
  ring: { backgroundColor: colors.fillTertiary, borderColor: colors.accent, overflow: 'hidden' },
  dim: { opacity: 0.4 }, // 미완료는 아바타가 있어도 가라앉혀 완료와 구분
  name: { fontSize: 13, color: colors.textPrimary },
  muted: { color: colors.textTertiary },
  progress: { fontSize: 12, fontWeight: '500', color: colors.textTertiary },
});
