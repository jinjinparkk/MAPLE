import type { EquipmentItem } from '@/lib/nexon-api/types';

interface Props {
  item: EquipmentItem;
}

const GRADE_COLORS: Record<string, string> = {
  '레전드리': 'border-green-500 bg-green-50',
  '유니크': 'border-yellow-500 bg-yellow-50',
  '에픽': 'border-purple-500 bg-purple-50',
  '레어': 'border-blue-500 bg-blue-50',
};

export default function EquipmentCard({ item }: Props) {
  const grade = item.potential_option_grade ?? '';
  const gradeStyle = GRADE_COLORS[grade] ?? 'border-gray-200 bg-white';
  const starCount = parseInt(item.starforce) || 0;

  return (
    <div className={`rounded-lg border-2 p-2 ${gradeStyle}`}>
      <div className="flex items-start gap-2">
        {item.item_icon && (
          <img src={item.item_icon} alt={item.item_name} width={40} height={40} />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-900 truncate">{item.item_name}</p>
          <p className="text-xs text-gray-500">{item.item_equipment_part}</p>
          {starCount > 0 && (
            <p className="text-xs text-yellow-600 font-medium">{starCount}성</p>
          )}
        </div>
      </div>
    </div>
  );
}
