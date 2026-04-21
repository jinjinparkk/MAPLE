import type { EquipmentItem } from '@/lib/nexon-api/types';
import Card from '@/components/common/Card';
import EquipmentCard from './EquipmentCard';

interface Props {
  equipment: EquipmentItem[];
  presetNo?: number;
  presetLabel?: string;
}

/** 메이플스토리 장비창 슬롯 순서 (위→아래, 좌→우) */
const SLOT_ORDER: { label: string; slots: string[] }[] = [
  {
    label: '악세서리',
    slots: ['반지1', '반지2', '반지3', '반지4', '펜던트', '펜던트2', '얼굴장식', '눈장식', '귀고리', '벨트'],
  },
  {
    label: '방어구',
    slots: ['모자', '상의', '하의', '어깨장식'],
  },
  {
    label: '장갑/망토/신발',
    slots: ['장갑', '망토', '신발'],
  },
  {
    label: '무기',
    slots: ['무기'],
  },
  {
    label: '보조무기',
    slots: ['보조무기'],
  },
  {
    label: '엠블렘',
    slots: ['엠블렘'],
  },
  {
    label: '포켓/심장',
    slots: ['포켓 아이템', '기계 심장', '안드로이드'],
  },
  {
    label: '훈장',
    slots: ['훈장'],
  },
  {
    label: '뱃지',
    slots: ['뱃지'],
  },
  {
    label: '메달',
    slots: ['메달'],
  },
];

/** 모든 슬롯을 플랫 배열로 */
const FLAT_SLOT_ORDER = SLOT_ORDER.flatMap((g) => g.slots);

function sortEquipment(equipment: EquipmentItem[]): { label: string; items: EquipmentItem[] }[] {
  const groups: { label: string; items: EquipmentItem[] }[] = [];

  for (const group of SLOT_ORDER) {
    const items = group.slots
      .map((slot) => equipment.find((e) => e.item_equipment_slot === slot))
      .filter((e): e is EquipmentItem => e != null);
    if (items.length > 0) {
      groups.push({ label: group.label, items });
    }
  }

  // SLOT_ORDER에 없는 장비가 있으면 '기타'에 추가
  const unmapped = equipment.filter((e) => !FLAT_SLOT_ORDER.includes(e.item_equipment_slot));
  if (unmapped.length > 0) {
    const existing = groups.find((g) => g.label === '기타');
    if (existing) {
      existing.items.push(...unmapped);
    } else {
      groups.push({ label: '기타', items: unmapped });
    }
  }

  return groups;
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

  const groups = sortEquipment(equipment);

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
      <div className="space-y-4">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">{group.label}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {group.items.map((item) => (
                <EquipmentCard key={item.item_equipment_slot} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
