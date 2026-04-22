import type { EquipmentItem } from '@/lib/nexon-api/types';
import Card from '@/components/common/Card';
import EquipmentCard from './EquipmentCard';

interface Props {
  equipment: EquipmentItem[];
  presetNo?: number;
  presetLabel?: string;
}

/** 인게임 장비창 슬롯 배치 (3열 × 8행 + 하단) */
const SLOT_LAYOUT: [string, string, string][] = [
  ['반지1', '모자', '엠블렘'],
  ['반지2', '얼굴장식', '펜던트'],
  ['반지3', '눈장식', '펜던트2'],
  ['반지4', '귀고리', '훈장'],
  ['포켓 아이템', '상의', '뱃지'],
  ['벨트', '하의', '어깨장식'],
  ['장갑', '신발', '망토'],
  ['무기', '기계 심장', '보조무기'],
];

const BOTTOM_SLOTS = ['메달', '안드로이드', '칭호'];

/** 1:1 매핑되는 표준 부위명 (반지/펜던트/무기/보조무기 제외) */
const SINGLE_PARTS = new Set([
  '모자', '얼굴장식', '눈장식', '귀고리', '상의', '하의', '신발',
  '장갑', '망토', '훈장', '벨트', '어깨장식', '포켓 아이템',
  '기계 심장', '뱃지', '엠블렘', '메달', '안드로이드', '칭호',
]);

/** equipment 배열 → 슬롯 키 Map 변환 (중복 부위, 직업별 부위명 처리) */
function buildEquipMap(equipment: EquipmentItem[]): Map<string, EquipmentItem> {
  const map = new Map<string, EquipmentItem>();
  let ringIdx = 1;
  let pendantIdx = 1;
  const unknowns: EquipmentItem[] = [];

  for (const item of equipment) {
    // item_equipment_slot은 표준 슬롯명 (무기, 보조무기 등), item_equipment_part는 직업별로 다를 수 있음
    const slot = item.item_equipment_slot;
    const part = item.item_equipment_part;

    if (slot === '반지1' || slot === '반지2' || slot === '반지3' || slot === '반지4') {
      map.set(slot, item);
    } else if (part === '반지') {
      if (ringIdx <= 4) map.set(`반지${ringIdx++}`, item);
    } else if (slot === '펜던트' || slot === '펜던트2') {
      map.set(slot, item);
    } else if (part === '펜던트') {
      map.set(pendantIdx === 1 ? '펜던트' : '펜던트2', item);
      pendantIdx++;
    } else if (slot === '무기' || part === '무기') {
      map.set('무기', item);
    } else if (slot === '보조무기' || part === '보조무기') {
      map.set('보조무기', item);
    } else if (SINGLE_PARTS.has(slot)) {
      map.set(slot, item);
    } else if (SINGLE_PARTS.has(part)) {
      map.set(part, item);
    } else {
      unknowns.push(item);
    }
  }

  // 알 수 없는 부위 → 무기 → 보조무기 순으로 빈 슬롯에 배치
  for (const item of unknowns) {
    if (!map.has('무기')) {
      map.set('무기', item);
    } else if (!map.has('보조무기')) {
      map.set('보조무기', item);
    }
  }

  return map;
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

  const equipMap = buildEquipMap(equipment);

  // 하단 슬롯 중 장비가 있는 것만 표시
  const activeBottomSlots = BOTTOM_SLOTS.filter((slot) => equipMap.has(slot));

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

      {/* 메인 3열 × 8행 그리드 */}
      <div className="grid grid-cols-3 gap-1">
        {SLOT_LAYOUT.flatMap((row) =>
          row.map((slot) => {
            const item = equipMap.get(slot);
            return item ? (
              <EquipmentCard key={slot} item={item} />
            ) : (
              <div
                key={slot}
                className="flex items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-1 min-h-[52px]"
              >
                <span className="text-[10px] text-gray-400 text-center leading-tight">
                  {slot}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* 하단 추가 슬롯 */}
      {activeBottomSlots.length > 0 && (
        <div className="grid grid-cols-3 gap-1 mt-1">
          {activeBottomSlots.map((slot) => (
            <EquipmentCard key={slot} item={equipMap.get(slot)!} />
          ))}
        </div>
      )}
    </Card>
  );
}
