export type StatType = 'STR' | 'DEX' | 'INT' | 'LUK' | 'HP' | 'MAX_HP';
export type AttackType = 'attack_power' | 'magic_power';

export interface JobStatInfo {
  mainStat: StatType;
  subStat: StatType | StatType[];
  attackType: AttackType;
  /** 주스탯 AP 배율 (일반 4, 제논 등 특수) */
  mainStatRatio: number;
  subStatRatio: number;
}

/**
 * 전 직업 → 주스탯/부스탯/공격력 타입 매핑
 * 제논, 데몬어벤저 등 특수 직업 포함
 */
export const JOB_STAT_MAP: Record<string, JobStatInfo> = {
  // ======= 전사 계열 =======
  '히어로': { mainStat: 'STR', subStat: 'DEX', attackType: 'attack_power', mainStatRatio: 4, subStatRatio: 1 },
  '팔라딘': { mainStat: 'STR', subStat: 'DEX', attackType: 'attack_power', mainStatRatio: 4, subStatRatio: 1 },
  '다크나이트': { mainStat: 'STR', subStat: 'DEX', attackType: 'attack_power', mainStatRatio: 4, subStatRatio: 1 },
  '소울마스터': { mainStat: 'STR', subStat: 'DEX', attackType: 'attack_power', mainStatRatio: 4, subStatRatio: 1 },
  '미하일': { mainStat: 'STR', subStat: 'DEX', attackType: 'attack_power', mainStatRatio: 4, subStatRatio: 1 },
  '블래스터': { mainStat: 'STR', subStat: 'DEX', attackType: 'attack_power', mainStatRatio: 4, subStatRatio: 1 },
  '데몬슬레이어': { mainStat: 'STR', subStat: 'DEX', attackType: 'attack_power', mainStatRatio: 4, subStatRatio: 1 },
  '아란': { mainStat: 'STR', subStat: 'DEX', attackType: 'attack_power', mainStatRatio: 4, subStatRatio: 1 },
  '카이저': { mainStat: 'STR', subStat: 'DEX', attackType: 'attack_power', mainStatRatio: 4, subStatRatio: 1 },
  '아델': { mainStat: 'STR', subStat: 'DEX', attackType: 'attack_power', mainStatRatio: 4, subStatRatio: 1 },
  '제로': { mainStat: 'STR', subStat: 'DEX', attackType: 'attack_power', mainStatRatio: 4, subStatRatio: 1 },
  // ======= 마법사 계열 =======
  '아크메이지(불,독)': { mainStat: 'INT', subStat: 'LUK', attackType: 'magic_power', mainStatRatio: 4, subStatRatio: 1 },
  '아크메이지(썬,콜)': { mainStat: 'INT', subStat: 'LUK', attackType: 'magic_power', mainStatRatio: 4, subStatRatio: 1 },
  '비숍': { mainStat: 'INT', subStat: 'LUK', attackType: 'magic_power', mainStatRatio: 4, subStatRatio: 1 },
  '플레임위자드': { mainStat: 'INT', subStat: 'LUK', attackType: 'magic_power', mainStatRatio: 4, subStatRatio: 1 },
  '에반': { mainStat: 'INT', subStat: 'LUK', attackType: 'magic_power', mainStatRatio: 4, subStatRatio: 1 },
  '루미너스': { mainStat: 'INT', subStat: 'LUK', attackType: 'magic_power', mainStatRatio: 4, subStatRatio: 1 },
  '배틀메이지': { mainStat: 'INT', subStat: 'LUK', attackType: 'magic_power', mainStatRatio: 4, subStatRatio: 1 },
  '키네시스': { mainStat: 'INT', subStat: 'LUK', attackType: 'magic_power', mainStatRatio: 4, subStatRatio: 1 },
  '일리움': { mainStat: 'INT', subStat: 'LUK', attackType: 'magic_power', mainStatRatio: 4, subStatRatio: 1 },
  '라라': { mainStat: 'INT', subStat: 'LUK', attackType: 'magic_power', mainStatRatio: 4, subStatRatio: 1 },
  // ======= 궁수 계열 =======
  '보우마스터': { mainStat: 'DEX', subStat: 'STR', attackType: 'attack_power', mainStatRatio: 4, subStatRatio: 1 },
  '신궁': { mainStat: 'DEX', subStat: 'STR', attackType: 'attack_power', mainStatRatio: 4, subStatRatio: 1 },
  '패스파인더': { mainStat: 'DEX', subStat: 'STR', attackType: 'attack_power', mainStatRatio: 4, subStatRatio: 1 },
  '윈드브레이커': { mainStat: 'DEX', subStat: 'STR', attackType: 'attack_power', mainStatRatio: 4, subStatRatio: 1 },
  '와일드헌터': { mainStat: 'DEX', subStat: 'STR', attackType: 'attack_power', mainStatRatio: 4, subStatRatio: 1 },
  '메르세데스': { mainStat: 'DEX', subStat: 'STR', attackType: 'attack_power', mainStatRatio: 4, subStatRatio: 1 },
  '카인': { mainStat: 'DEX', subStat: 'STR', attackType: 'attack_power', mainStatRatio: 4, subStatRatio: 1 },
  '에인절릭버스터': { mainStat: 'DEX', subStat: 'STR', attackType: 'attack_power', mainStatRatio: 4, subStatRatio: 1 },
  // ======= 도적 계열 =======
  '나이트로드': { mainStat: 'LUK', subStat: 'DEX', attackType: 'attack_power', mainStatRatio: 4, subStatRatio: 1 },
  '섀도어': { mainStat: 'LUK', subStat: 'DEX', attackType: 'attack_power', mainStatRatio: 4, subStatRatio: 1 },
  '듀얼블레이드': { mainStat: 'LUK', subStat: 'DEX', attackType: 'attack_power', mainStatRatio: 4, subStatRatio: 1 },
  '나이트워커': { mainStat: 'LUK', subStat: 'DEX', attackType: 'attack_power', mainStatRatio: 4, subStatRatio: 1 },
  '팬텀': { mainStat: 'LUK', subStat: 'DEX', attackType: 'attack_power', mainStatRatio: 4, subStatRatio: 1 },
  '카데나': { mainStat: 'LUK', subStat: 'DEX', attackType: 'attack_power', mainStatRatio: 4, subStatRatio: 1 },
  '칼리': { mainStat: 'LUK', subStat: 'DEX', attackType: 'attack_power', mainStatRatio: 4, subStatRatio: 1 },
  '호영': { mainStat: 'LUK', subStat: 'DEX', attackType: 'attack_power', mainStatRatio: 4, subStatRatio: 1 },
  // ======= 해적 계열 =======
  '바이퍼': { mainStat: 'STR', subStat: 'DEX', attackType: 'attack_power', mainStatRatio: 4, subStatRatio: 1 },
  '캡틴': { mainStat: 'DEX', subStat: 'STR', attackType: 'attack_power', mainStatRatio: 4, subStatRatio: 1 },
  '캐논슈터': { mainStat: 'STR', subStat: 'DEX', attackType: 'attack_power', mainStatRatio: 4, subStatRatio: 1 },
  '스트라이커': { mainStat: 'STR', subStat: 'DEX', attackType: 'attack_power', mainStatRatio: 4, subStatRatio: 1 },
  '메카닉': { mainStat: 'DEX', subStat: 'STR', attackType: 'attack_power', mainStatRatio: 4, subStatRatio: 1 },
  '은월': { mainStat: 'STR', subStat: 'DEX', attackType: 'attack_power', mainStatRatio: 4, subStatRatio: 1 },
  '아크': { mainStat: 'STR', subStat: 'DEX', attackType: 'attack_power', mainStatRatio: 4, subStatRatio: 1 },
  // ======= 특수 직업 =======
  '제논': {
    mainStat: 'STR',
    subStat: ['DEX', 'LUK'],
    attackType: 'attack_power',
    mainStatRatio: 2.8, // 올스탯 적용으로 실질 배율 다름
    subStatRatio: 2.8,
  },
  '데몬어벤져': {
    mainStat: 'HP',
    subStat: 'STR',
    attackType: 'attack_power',
    mainStatRatio: 1, // HP 기반
    subStatRatio: 0,
  },
};

/** 직업명으로 스탯 정보를 찾음 (부분 매칭 지원) */
export function getJobStatInfo(jobName: string): JobStatInfo {
  // 정확한 매칭 시도
  if (JOB_STAT_MAP[jobName]) return JOB_STAT_MAP[jobName];

  // 부분 매칭 (API에서 "히어로(5차)" 형태로 올 수 있음)
  for (const [key, value] of Object.entries(JOB_STAT_MAP)) {
    if (jobName.includes(key) || key.includes(jobName)) return value;
  }

  // 기본값: STR 전사
  return {
    mainStat: 'STR',
    subStat: 'DEX',
    attackType: 'attack_power',
    mainStatRatio: 4,
    subStatRatio: 1,
  };
}
