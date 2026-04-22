/**
 * 넥슨 API 잠재능력 텍스트 → 구조화 데이터 파싱
 *
 * API 형식 예시:
 *   "STR : +12%"
 *   "보스 몬스터 공격 시 데미지 : +30%"
 *   "올스탯 : +9%"
 *   "공격력 : +12%"
 *   "크리티컬 데미지 : +8%"
 *   "몬스터 방어율 무시 : +35%"
 *   "데미지 : +12%"
 */

import type { PotentialGrade } from '@/lib/constants/potential-table';
import { parsePotentialGrade } from '@/lib/constants/potential-table';
import { getJobStatInfo } from '@/lib/constants/job-stat-map';
import type { StatType } from '@/lib/constants/job-stat-map';

export type PotentialLineType =
  | 'mainStat_pct'
  | 'subStat_pct'
  | 'atk_pct'
  | 'allStat_pct'
  | 'boss_dmg'
  | 'ied'
  | 'crit_dmg'
  | 'damage_pct'
  | 'other';

export interface ParsedPotentialLine {
  type: PotentialLineType;
  value: number;
  rawText: string;
}

export interface ParsedPotential {
  grade: PotentialGrade | null;
  lines: ParsedPotentialLine[];
}

/** 텍스트에서 % 수치 추출 */
function extractPercent(text: string): number {
  const m = text.match(/[+\s](\d+)\s*%/);
  return m ? parseInt(m[1]) : 0;
}

/** 스탯 키워드 → StatType */
function detectStatType(text: string): StatType | null {
  if (/\bSTR\b/i.test(text)) return 'STR';
  if (/\bDEX\b/i.test(text)) return 'DEX';
  if (/\bINT\b/i.test(text)) return 'INT';
  if (/\bLUK\b/i.test(text)) return 'LUK';
  if (/\bHP\b/i.test(text) || text.includes('최대 HP')) return 'HP';
  return null;
}

function parseLine(text: string, jobName: string): ParsedPotentialLine {
  const value = extractPercent(text);
  const jobInfo = getJobStatInfo(jobName);

  // 보스뎀
  if (text.includes('보스') && text.includes('데미지')) {
    return { type: 'boss_dmg', value, rawText: text };
  }

  // 방무
  if (text.includes('방어율 무시') || text.includes('몬스터 방어율')) {
    return { type: 'ied', value, rawText: text };
  }

  // 크뎀
  if (text.includes('크리티컬') && text.includes('데미지')) {
    return { type: 'crit_dmg', value, rawText: text };
  }

  // 올스탯
  if (text.includes('올스탯') || text.includes('ALL')) {
    return { type: 'allStat_pct', value, rawText: text };
  }

  // 공격력/마력 %
  if ((text.includes('공격력') || text.includes('마력')) && text.includes('%')) {
    return { type: 'atk_pct', value, rawText: text };
  }

  // 데미지 % (보스뎀/크뎀이 아닌 순수 데미지%)
  if (text.includes('데미지') && text.includes('%')) {
    return { type: 'damage_pct', value, rawText: text };
  }

  // 개별 스탯 %
  const stat = detectStatType(text);
  if (stat && text.includes('%')) {
    const mainStat = jobInfo.mainStat;
    if (stat === mainStat) return { type: 'mainStat_pct', value, rawText: text };
    // 부스탯
    const subStats = Array.isArray(jobInfo.subStat) ? jobInfo.subStat : [jobInfo.subStat];
    if (subStats.includes(stat)) return { type: 'subStat_pct', value, rawText: text };
    // 주스탯도 부스탯도 아님 → 기타
    return { type: 'other', value, rawText: text };
  }

  return { type: 'other', value: 0, rawText: text };
}

/**
 * 장비의 잠재능력 3줄을 파싱
 */
export function parsePotential(
  gradeStr: string | null,
  line1: string | null,
  line2: string | null,
  line3: string | null,
  jobName: string,
): ParsedPotential {
  const grade = parsePotentialGrade(gradeStr);
  const lines: ParsedPotentialLine[] = [];

  for (const text of [line1, line2, line3]) {
    if (text) {
      lines.push(parseLine(text, jobName));
    }
  }

  return { grade, lines };
}
