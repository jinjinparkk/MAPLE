import type {
  Grade,
  StarforceAnalysis,
  PotentialAnalysis,
  SymbolAnalysis,
  UnionAnalysis,
  HexaAnalysis,
  WrappedData,
} from './types';

export function gradeStarforce(analysis: StarforceAnalysis): Grade {
  const avg = analysis.avgStar;
  if (avg >= 17) return 'S';
  if (avg >= 15) return 'A';
  if (avg >= 13) return 'B';
  if (avg >= 10) return 'C';
  return 'D';
}

export function gradePotential(analysis: PotentialAnalysis): Grade {
  const total = analysis.legendaryCount + analysis.uniqueCount + analysis.epicOrBelow;
  if (total === 0) return 'D';
  const legendaryRatio = analysis.legendaryCount / total;
  if (legendaryRatio >= 0.8) return 'S';
  if (legendaryRatio >= 0.6) return 'A';
  if (legendaryRatio >= 0.4) return 'B';
  if (legendaryRatio >= 0.2) return 'C';
  return 'D';
}

export function gradeSymbol(analysis: SymbolAnalysis): Grade {
  const maxCount = analysis.arcaneMax + analysis.sacredMax;
  if (maxCount >= 10) return 'S';
  if (maxCount >= 7) return 'A';
  if (maxCount >= 4) return 'B';
  if (maxCount >= 2) return 'C';
  return 'D';
}

export function gradeUnion(analysis: UnionAnalysis): Grade {
  const lv = analysis.unionLevel;
  if (lv >= 8000) return 'S';
  if (lv >= 6000) return 'A';
  if (lv >= 4000) return 'B';
  if (lv >= 2000) return 'C';
  return 'D';
}

export function gradeHexa(analysis: HexaAnalysis): Grade {
  const total = analysis.totalCoreLevel;
  if (total >= 50) return 'S';
  if (total >= 35) return 'A';
  if (total >= 20) return 'B';
  if (total >= 10) return 'C';
  return 'D';
}

const GRADE_SCORE: Record<Grade, number> = { S: 100, A: 80, B: 60, C: 40, D: 20, F: 0 };

export function gradeOverall(data: WrappedData): { grade: Grade; score: number } {
  const weights = {
    starforce: 0.3,
    potential: 0.25,
    symbol: 0.2,
    union: 0.15,
    hexa: 0.1,
  };

  const score = Math.round(
    GRADE_SCORE[data.starforce.grade] * weights.starforce +
    GRADE_SCORE[data.potential.grade] * weights.potential +
    GRADE_SCORE[data.symbol.grade] * weights.symbol +
    GRADE_SCORE[data.union.grade] * weights.union +
    GRADE_SCORE[data.hexa.grade] * weights.hexa,
  );

  let grade: Grade;
  if (score >= 90) grade = 'S';
  else if (score >= 70) grade = 'A';
  else if (score >= 50) grade = 'B';
  else if (score >= 30) grade = 'C';
  else grade = 'D';

  return { grade, score };
}
