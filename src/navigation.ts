import type { CheckInResult, Frequency, GroupDetail } from './api';

// 그룹 만들기 위자드는 단계마다 파라미터로 입력값 전달, 별도 store 없음
export type CreateGroupStep3Params = { name: string; frequency: Frequency; weeklyTarget?: number };
export type CreateGroupStep4Params = CreateGroupStep3Params & { resetTime: string; reminderTime: string };

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  CreateGroup1: undefined;
  CreateGroup2: { name: string };
  CreateGroup3: CreateGroupStep3Params;
  CreateGroup4: CreateGroupStep4Params;
  CreateGroup5: { group: GroupDetail };
  JoinGroup: undefined;
  GroupDetail: { id: number };
  Camera: { groupId: number; name: string };
  Preview: { groupId: number; name: string; path: string }; // path 는 file:// 없는 파일시스템 경로
  Complete: { result: CheckInResult };
};

declare global {
  namespace ReactNavigation {
    // useNavigation() 이 어디서나 루트 스택 라우트를 알도록
    interface RootParamList extends RootStackParamList {}
  }
}
