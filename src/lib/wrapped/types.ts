export type Grade = 'S' | 'A' | 'B' | 'C' | 'D';

export interface StarforceAnalysis {
  totalStars: number;
  maxStar: number;
  maxStarItem: string;
  avgStar: number;
  count22plus: number;
  count25plus: number;
  grade: Grade;
}

export interface PotentialAnalysis {
  legendaryCount: number;
  uniqueCount: number;
  epicOrBelow: number;
  bestPotential: string;
  bestPotentialItem: string;
  addiLegendaryCount: number;
  addiUniqueCount: number;
  grade: Grade;
}

export interface SymbolAnalysis {
  arcaneTotal: number;
  arcaneMax: number;
  sacredTotal: number;
  sacredMax: number;
  totalForce: number;
  grade: Grade;
}

export interface UnionAnalysis {
  unionLevel: number;
  unionGrade: string;
  artifactLevel: number;
  grade: Grade;
}

export interface HexaAnalysis {
  totalCoreLevel: number;
  maxedCores: number;
  totalStatCoreLevel: number;
  grade: Grade;
}

export interface WrappedData {
  nickname: string;
  level: number;
  jobName: string;
  worldName: string;
  guildName: string | null;
  characterImage: string;
  starforce: StarforceAnalysis;
  potential: PotentialAnalysis;
  symbol: SymbolAnalysis;
  union: UnionAnalysis;
  hexa: HexaAnalysis;
  overallGrade: Grade;
  overallScore: number;
}
