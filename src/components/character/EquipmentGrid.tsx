import type { EquipmentItem } from '@/lib/nexon-api/types';
import Card from '@/components/common/Card';
import EquipmentCard from './EquipmentCard';

interface Props {
  equipment: EquipmentItem[];
  presetNo?: number;
  presetLabel?: string;
}

export default function EquipmentGrid({ equipment, presetNo, presetLabel }: Props) {
  if (!equipment || equipment.length === 0) {
    return (
      <Card>
        <h2 className="text-lg font-bold text-gray-900 mb-3">장비</h2>
        <p className="text-sm text-gray-500">장비 정보가 없습니다.</p>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-lg font-bold text-gray-900 mb-3">
        장비 ({equipment.length}개)
        {(presetLabel || presetNo) && (
          <span className="ml-2 text-sm font-normal text-orange-600">
            {presetLabel ?? `프리셋 ${presetNo}`}
          </span>
        )}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {equipment.map((item, idx) => (
          <EquipmentCard key={`${item.item_name}-${idx}`} item={item} />
        ))}
      </div>
    </Card>
  );
}
