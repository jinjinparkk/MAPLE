import type { CharacterBasic } from '@/lib/nexon-api/types';
import Card from '@/components/common/Card';

interface Props {
  basic: CharacterBasic;
}

export default function CharacterProfile({ basic }: Props) {
  return (
    <Card className="flex flex-col sm:flex-row items-center gap-4">
      {basic.character_image && (
        <div className="w-[200px] h-[200px] sm:w-[250px] sm:h-[250px] shrink-0 overflow-hidden rounded-lg border border-gray-200">
          <img
            src={basic.character_image}
            alt={basic.character_name}
            className="w-full h-full object-[center_100%] scale-[2]"
          />
        </div>
      )}
      <div className="text-center sm:text-left">
        <h1 className="text-2xl font-bold text-gray-900">{basic.character_name}</h1>
        <p className="text-gray-600">
          {basic.world_name} | {basic.character_class} | Lv.{basic.character_level}
        </p>
        {basic.character_guild_name && (
          <p className="text-sm text-gray-500">길드: {basic.character_guild_name}</p>
        )}
      </div>
    </Card>
  );
}
