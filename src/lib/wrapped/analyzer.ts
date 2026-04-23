import type { CharacterFullData, EquipmentItem } from '@/lib/nexon-api/types';
import { getBestPresetEquipment } from '@/lib/utils/equipment';
import type {
  WrappedData,
  PetInfo,
  StarforceAnalysis,
  PotentialAnalysis,
  SymbolAnalysis,
  UnionAnalysis,
  HexaAnalysis,
} from './types';
import {
  gradeStarforce,
  gradePotential,
  gradeSymbol,
  gradeUnion,
  gradeHexa,
  gradeOverall,
} from './grader';

function analyzeStarforce(items: EquipmentItem[]): StarforceAnalysis {
  let totalStars = 0;
  let maxStar = 0;
  let maxStarItem = '';
  let count22plus = 0;
  let count25plus = 0;
  let equipCount = 0;

  for (const item of items) {
    const star = parseInt(item.starforce) || 0;
    if (star === 0 && !item.starforce) continue;
    totalStars += star;
    equipCount++;
    if (star > maxStar) {
      maxStar = star;
      maxStarItem = item.item_name;
    }
    if (star >= 22) count22plus++;
    if (star >= 25) count25plus++;
  }

  const avgStar = equipCount > 0 ? Math.round((totalStars / equipCount) * 10) / 10 : 0;

  const analysis: StarforceAnalysis = {
    totalStars,
    maxStar,
    maxStarItem,
    avgStar,
    count22plus,
    count25plus,
    grade: 'D',
  };
  analysis.grade = gradeStarforce(analysis);
  return analysis;
}

const POTENTIAL_GRADE_PRIORITY: Record<string, number> = {
  '레전드리': 3,
  '유니크': 2,
  '에픽': 1,
  '레어': 0,
};

function analyzePotential(items: EquipmentItem[]): PotentialAnalysis {
  let legendaryCount = 0;
  let uniqueCount = 0;
  let epicOrBelow = 0;
  let addiLegendaryCount = 0;
  let addiUniqueCount = 0;
  let bestPotential = '';
  let bestPotentialItem = '';
  let bestPotentialPriority = -1;

  for (const item of items) {
    const grade = item.potential_option_grade;
    if (grade) {
      if (grade === '레전드리') legendaryCount++;
      else if (grade === '유니크') uniqueCount++;
      else epicOrBelow++;

      const priority = POTENTIAL_GRADE_PRIORITY[grade] ?? 0;
      if (priority > bestPotentialPriority) {
        bestPotentialPriority = priority;
        const options = [
          item.potential_option_1,
          item.potential_option_2,
          item.potential_option_3,
        ].filter(Boolean);
        bestPotential = options.join(' / ');
        bestPotentialItem = item.item_name;
      }
    }

    const addiGrade = item.additional_potential_option_grade;
    if (addiGrade) {
      if (addiGrade === '레전드리') addiLegendaryCount++;
      else if (addiGrade === '유니크') addiUniqueCount++;
    }
  }

  const analysis: PotentialAnalysis = {
    legendaryCount,
    uniqueCount,
    epicOrBelow,
    bestPotential,
    bestPotentialItem,
    addiLegendaryCount,
    addiUniqueCount,
    grade: 'D',
  };
  analysis.grade = gradePotential(analysis);
  return analysis;
}

function analyzeSymbol(data: CharacterFullData): SymbolAnalysis {
  let arcaneTotal = 0;
  let arcaneMax = 0;
  let sacredTotal = 0;
  let sacredMax = 0;
  let totalForce = 0;

  const symbols = data.symbol?.symbol ?? [];
  for (const sym of symbols) {
    const level = sym.symbol_level;
    const force = parseInt(sym.symbol_force) || 0;
    totalForce += force;

    const name = sym.symbol_name;
    if (name.includes('아케인심볼')) {
      arcaneTotal += level;
      if (level >= 20) arcaneMax++;
    } else {
      // 그랜드심볼 or 어센틱심볼
      sacredTotal += level;
      if (level >= 11) sacredMax++;
    }
  }

  const analysis: SymbolAnalysis = {
    arcaneTotal,
    arcaneMax,
    sacredTotal,
    sacredMax,
    totalForce,
    grade: 'D',
  };
  analysis.grade = gradeSymbol(analysis);
  return analysis;
}

function analyzeUnion(data: CharacterFullData): UnionAnalysis {
  const analysis: UnionAnalysis = {
    unionLevel: data.union?.union_level ?? 0,
    unionGrade: data.union?.union_grade ?? '',
    artifactLevel: data.union?.union_artifact_level ?? 0,
    grade: 'D',
  };
  analysis.grade = gradeUnion(analysis);
  return analysis;
}

function analyzeHexa(data: CharacterFullData): HexaAnalysis {
  let totalCoreLevel = 0;
  let maxedCores = 0;

  const cores = data.hexaMatrix?.character_hexa_core_equipment ?? [];
  for (const core of cores) {
    totalCoreLevel += core.hexa_core_level;
    if (core.hexa_core_level >= 30) maxedCores++;
  }

  let totalStatCoreLevel = 0;
  const statCores = data.hexaMatrixStat?.character_hexa_stat_core ?? [];
  for (const stat of statCores) {
    totalStatCoreLevel += stat.main_stat_level + stat.sub_stat_level_1 + stat.sub_stat_level_2;
  }

  const analysis: HexaAnalysis = {
    totalCoreLevel,
    maxedCores,
    totalStatCoreLevel,
    grade: 'D',
  };
  analysis.grade = gradeHexa(analysis);
  return analysis;
}

export function analyzeCharacter(data: CharacterFullData): WrappedData {
  const { equipment: bestEquipment } = getBestPresetEquipment(data.equipment);

  const starforce = analyzeStarforce(bestEquipment);
  const potential = analyzePotential(bestEquipment);
  const symbol = analyzeSymbol(data);
  const union = analyzeUnion(data);
  const hexa = analyzeHexa(data);

  // 이스터에그: 뚜둡 올 F
  if (data.basic.character_name === '뚜둡') {
    starforce.grade = 'F';
    potential.grade = 'F';
    symbol.grade = 'F';
    union.grade = 'F';
    hexa.grade = 'F';
  }

  // 캐릭터 생성일 + D+일수
  const createDate = data.basic.character_date_create || null;
  let daysWithMaple: number | null = null;
  if (createDate) {
    const created = new Date(createDate);
    const now = new Date();
    daysWithMaple = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  }

  // 펫 정보
  const pets: PetInfo[] = [];
  const pet = data.petEquipment;
  if (pet) {
    for (const n of [1, 2, 3] as const) {
      const name = pet[`pet_${n}_name`];
      const icon = pet[`pet_${n}_icon`];
      if (name && icon) {
        pets.push({ name, nickname: pet[`pet_${n}_nickname`], icon });
      }
    }
  }

  const partial: WrappedData = {
    nickname: data.basic.character_name,
    level: data.basic.character_level,
    jobName: data.basic.character_class,
    worldName: data.basic.world_name,
    guildName: data.basic.character_guild_name,
    characterImage: data.basic.character_image,
    characterCreateDate: createDate,
    daysWithMaple,
    pets,
    starforce,
    potential,
    symbol,
    union,
    hexa,
    overallGrade: 'D',
    overallScore: 0,
  };

  const { grade, score } = gradeOverall(partial);
  partial.overallGrade = grade;
  partial.overallScore = score;

  return partial;
}
