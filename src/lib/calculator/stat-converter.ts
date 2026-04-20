import { getJobStatInfo } from '@/lib/constants/job-stat-map';
import type { CharacterStat, CharacterItemEquipment } from '@/lib/nexon-api/types';

/**
 * 캐릭터의 현재 스탯 컨텍스트
 * 환산주스탯 계산에 필요한 모든 수치를 담는다.
 */
export interface StatContext {
  mainStat: number;       // 주스탯 총합
  subStat: number;        // 부스탯 총합
  attackPower: number;     // 총 공격력/마력
  attackPercent: number;   // 공격력/마력 %
  damagePercent: number;   // 데미지 %
  bossDamage: number;      // 보스 데미지 %
  ignoreDefense: number;   // 방어율 무시 %
  critDamage: number;      // 크리티컬 데미지 %
  finalDamage: number;     // 최종 데미지 %
  statPercent: number;     // 주스탯 %
  jobName: string;
}

/**
 * 넥슨 API 데이터에서 StatContext 추출
 */
export function extractStatContext(
  stat: CharacterStat,
  equipment: CharacterItemEquipment,
): StatContext {
  const jobName = stat.character_class;
  const jobInfo = getJobStatInfo(jobName);

  function findStat(name: string): number {
    const item = stat.final_stat.find((s) => s.stat_name === name);
    return item ? parseFloat(item.stat_value) || 0 : 0;
  }

  const mainStatName = jobInfo.mainStat === 'STR' ? 'STR' :
    jobInfo.mainStat === 'DEX' ? 'DEX' :
    jobInfo.mainStat === 'INT' ? 'INT' :
    jobInfo.mainStat === 'LUK' ? 'LUK' : 'HP';

  const subStatName = Array.isArray(jobInfo.subStat) ? jobInfo.subStat[0] :
    jobInfo.subStat === 'STR' ? 'STR' :
    jobInfo.subStat === 'DEX' ? 'DEX' :
    jobInfo.subStat === 'INT' ? 'INT' :
    jobInfo.subStat === 'LUK' ? 'LUK' : 'STR';

  const isAttack = jobInfo.attackType === 'attack_power';

  // 장비에서 무기 정보 추출 (사용하지 않지만 추후 확장 가능)
  const _weapon = equipment.item_equipment?.find(
    (item) => item.item_equipment_part === '무기',
  );

  return {
    mainStat: findStat(mainStatName),
    subStat: findStat(subStatName),
    attackPower: isAttack ? findStat('공격력') : findStat('마력'),
    attackPercent: 0, // API에서 직접 구분하기 어려우므로 기본값
    damagePercent: findStat('데미지'),
    bossDamage: findStat('보스 몬스터 데미지'),
    ignoreDefense: findStat('방어율 무시'),
    critDamage: findStat('크리티컬 데미지'),
    finalDamage: findStat('최종 데미지'),
    statPercent: 0,
    jobName,
  };
}

/**
 * 현재 StatContext를 기준으로 주스탯 1당 데미지 증가분 계산
 *
 * 데미지 ∝ (주스탯 × 4 + 부스탯) × 총공격력 × (1 + 데미지% + 보스뎀%)
 *           × (1 + 최종뎀%) × 방무보정 × 크리보정
 */
function getDamageCoefficient(ctx: StatContext): number {
  const jobInfo = getJobStatInfo(ctx.jobName);
  const statPart = ctx.mainStat * jobInfo.mainStatRatio + ctx.subStat * jobInfo.subStatRatio;
  const dmgMult = 1 + (ctx.damagePercent + ctx.bossDamage) / 100;
  const finalMult = 1 + ctx.finalDamage / 100;
  const critMult = 1 + ctx.critDamage / 100;

  return statPart * ctx.attackPower * dmgMult * finalMult * critMult;
}

/**
 * 특정 스탯 1 증가 시 데미지 증가율 계산
 */
function getDamageIncreaseRate(ctx: StatContext, field: keyof StatContext, amount: number): number {
  const baseDmg = getDamageCoefficient(ctx);
  if (baseDmg === 0) return 0;

  const modified = { ...ctx, [field]: (ctx[field] as number) + amount };
  const newDmg = getDamageCoefficient(modified);

  return (newDmg - baseDmg) / baseDmg;
}

/**
 * 주스탯 1 증가 시 데미지 증가율
 */
function getMainStatIncreaseRate(ctx: StatContext): number {
  return getDamageIncreaseRate(ctx, 'mainStat', 1);
}

/**
 * 전투력 계산 (인게임 공식 기반)
 *
 * 공식: (주스탯×4+부스탯) / 100 × 공격력 × (1+데미지%) × (1+보스뎀%) × (1.35+크뎀%)
 *
 * 데미지%와 보스뎀%는 합산이 아닌 곱연산.
 * 미반영: 최종뎀, 방무, 레벨, 무기숙련도, 스타포스, 아케인포스 등
 */
export function calculateCombatPower(stat: CharacterStat): number {
  const jobName = stat.character_class;
  const jobInfo = getJobStatInfo(jobName);

  function findStat(name: string): number {
    const item = stat.final_stat.find((s) => s.stat_name === name);
    return item ? parseFloat(item.stat_value) || 0 : 0;
  }

  const mainStatName = jobInfo.mainStat === 'HP' ? 'HP' : jobInfo.mainStat;
  const isAttack = jobInfo.attackType === 'attack_power';
  const attackPower = isAttack ? findStat('공격력') : findStat('마력');
  const damage = findStat('데미지');
  const bossDamage = findStat('보스 몬스터 데미지');
  const critDamage = findStat('크리티컬 데미지');

  // 스탯 파트 계산
  let statPart: number;
  if (Array.isArray(jobInfo.subStat)) {
    // 제논 등 다중 부스탯
    let total = findStat(mainStatName) * jobInfo.mainStatRatio;
    for (const sub of jobInfo.subStat) {
      total += findStat(sub) * jobInfo.subStatRatio;
    }
    statPart = total * 0.01;
  } else {
    const mainStat = findStat(mainStatName);
    const subStat = findStat(jobInfo.subStat);
    statPart = (mainStat * jobInfo.mainStatRatio + subStat * jobInfo.subStatRatio) * 0.01;
  }

  const damageMult = 1 + damage / 100;
  const bossMult = 1 + bossDamage / 100;
  const critMult = 1.35 + critDamage / 100;

  return Math.floor(statPart * attackPower * damageMult * bossMult * critMult);
}

/**
 * 각 스탯 옵션을 환산주스탯(주스탯 단위)으로 변환
 */
export function convertToMainStat(
  ctx: StatContext,
  option: {
    mainStat?: number;
    subStat?: number;
    attackPower?: number;
    attackPercent?: number;
    allStat?: number;
    bossDamage?: number;
    ignoreDefense?: number;
    critDamage?: number;
    damage?: number;
  },
): number {
  const baseRate = getMainStatIncreaseRate(ctx);
  if (baseRate === 0) return 0;

  let totalRate = 0;

  // 주스탯
  if (option.mainStat) {
    totalRate += getDamageIncreaseRate(ctx, 'mainStat', option.mainStat);
  }

  // 부스탯
  if (option.subStat) {
    totalRate += getDamageIncreaseRate(ctx, 'subStat', option.subStat);
  }

  // 공격력
  if (option.attackPower) {
    totalRate += getDamageIncreaseRate(ctx, 'attackPower', option.attackPower);
  }

  // 올스탯% → 주스탯 환산
  if (option.allStat) {
    const mainStatGain = ctx.mainStat * option.allStat / 100;
    const subStatGain = ctx.subStat * option.allStat / 100;
    totalRate += getDamageIncreaseRate(ctx, 'mainStat', mainStatGain);
    totalRate += getDamageIncreaseRate(ctx, 'subStat', subStatGain);
  }

  // 보스뎀
  if (option.bossDamage) {
    totalRate += getDamageIncreaseRate(ctx, 'bossDamage', option.bossDamage);
  }

  // 방무
  if (option.ignoreDefense) {
    totalRate += getDamageIncreaseRate(ctx, 'ignoreDefense', option.ignoreDefense);
  }

  // 크뎀
  if (option.critDamage) {
    totalRate += getDamageIncreaseRate(ctx, 'critDamage', option.critDamage);
  }

  // 데미지%
  if (option.damage) {
    totalRate += getDamageIncreaseRate(ctx, 'damagePercent', option.damage);
  }

  // 환산주스탯 = 총 데미지 증가율 / 주스탯 1당 증가율
  return totalRate / baseRate;
}
