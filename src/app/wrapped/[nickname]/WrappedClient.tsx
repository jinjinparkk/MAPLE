'use client';

import type { WrappedData } from '@/lib/wrapped/types';
import CardDeck from '@/components/wrapped/CardDeck';
import IntroCard from '@/components/wrapped/IntroCard';
import LevelCard from '@/components/wrapped/LevelCard';
import CombatPowerCard from '@/components/wrapped/CombatPowerCard';
import StarforceCard from '@/components/wrapped/StarforceCard';
import PotentialCard from '@/components/wrapped/PotentialCard';
import SymbolCard from '@/components/wrapped/SymbolCard';
import UnionHexaCard from '@/components/wrapped/UnionHexaCard';
import OverallGradeCard from '@/components/wrapped/OverallGradeCard';
import ShareCard from '@/components/wrapped/ShareCard';

const TOTAL_CARDS = 9;

export default function WrappedClient({ data }: { data: WrappedData }) {
  return (
    <CardDeck totalCards={TOTAL_CARDS}>
      <IntroCard data={data} />
      <LevelCard data={data} />
      <CombatPowerCard data={data} />
      <StarforceCard data={data} />
      <PotentialCard data={data} />
      <SymbolCard data={data} />
      <UnionHexaCard data={data} />
      <OverallGradeCard data={data} />
      <ShareCard data={data} />
    </CardDeck>
  );
}
