import type { CharacterItemEquipment, EquipmentItem } from '@/lib/nexon-api/types';

/**
 * 장비 목록의 총 스탯 합산 (주스탯 4종 + 공격력 + 마력)
 * 프리셋 비교용 — 가장 강한 프리셋을 자동으로 골라내기 위함
 */
function calcEquipmentPower(items: EquipmentItem[]): number {
  let total = 0;
  for (const item of items) {
    const opt = item.item_total_option;
    if (!opt) continue;
    total += parseInt(opt.str) || 0;
    total += parseInt(opt.dex) || 0;
    total += parseInt(opt.int) || 0;
    total += parseInt(opt.luk) || 0;
    total += (parseInt(opt.attack_power) || 0) * 4; // 공격력은 가중치 높게
    total += (parseInt(opt.magic_power) || 0) * 4;
  }
  return total;
}

export interface PresetResult {
  equipment: EquipmentItem[];
  presetNo: number;
  label: string;
}

/**
 * 프리셋 1/2/3 중 총 스탯이 가장 높은 프리셋을 자동 선택
 * 다른 사이트들처럼 "가장 강한 셋팅"을 알아서 인식
 */
export function getBestPresetEquipment(equipment: CharacterItemEquipment): PresetResult {
  const presets: { items: EquipmentItem[]; no: number }[] = [];

  if (equipment.item_equipment_preset_1?.length > 0) {
    presets.push({ items: equipment.item_equipment_preset_1, no: 1 });
  }
  if (equipment.item_equipment_preset_2?.length > 0) {
    presets.push({ items: equipment.item_equipment_preset_2, no: 2 });
  }
  if (equipment.item_equipment_preset_3?.length > 0) {
    presets.push({ items: equipment.item_equipment_preset_3, no: 3 });
  }

  // 프리셋 데이터가 아예 없으면 현재 착용 장비 사용
  if (presets.length === 0) {
    return {
      equipment: equipment.item_equipment ?? [],
      presetNo: equipment.preset_no ?? 0,
      label: '현재 착용',
    };
  }

  // 총 스탯이 가장 높은 프리셋 선택
  let best = presets[0];
  let bestPower = calcEquipmentPower(best.items);

  for (let i = 1; i < presets.length; i++) {
    const power = calcEquipmentPower(presets[i].items);
    if (power > bestPower) {
      best = presets[i];
      bestPower = power;
    }
  }

  return {
    equipment: best.items,
    presetNo: best.no,
    label: `프리셋 ${best.no} (최강)`,
  };
}

/** 하위호환: getPresetEquipment → getBestPresetEquipment 래핑 */
export function getPresetEquipment(equipment: CharacterItemEquipment): EquipmentItem[] {
  return getBestPresetEquipment(equipment).equipment;
}
