/** OCID 조회 응답 */
export interface OcidResponse {
  ocid: string;
}

/** 캐릭터 기본 정보 */
export interface CharacterBasic {
  date: string;
  character_name: string;
  world_name: string;
  character_gender: string;
  character_class: string;
  character_class_level: string;
  character_level: number;
  character_exp: number;
  character_exp_rate: string;
  character_guild_name: string | null;
  character_image: string;
  character_date_create: string;
  access_flag: string;
  liberation_quest_clear_flag: string;
}

/** 스탯 항목 */
export interface StatItem {
  stat_name: string;
  stat_value: string;
}

/** 캐릭터 스탯 */
export interface CharacterStat {
  date: string;
  character_class: string;
  final_stat: StatItem[];
  remain_ap: number;
}

/** 장비 아이템 옵션 */
export interface ItemOption {
  str: string;
  dex: string;
  int: string;
  luk: string;
  max_hp: string;
  max_mp: string;
  attack_power: string;
  magic_power: string;
  armor: string;
  speed: string;
  jump: string;
  boss_damage: string;
  ignore_monster_armor: string;
  all_stat: string;
  damage: string;
  equipment_level_decrease: number;
  max_hp_rate: string;
  max_mp_rate: string;
  base_equipment_level?: number;
}

/** 장비 아이템 */
export interface EquipmentItem {
  item_equipment_part: string;
  equipment_slot: string;
  item_name: string;
  item_icon: string;
  item_description: string | null;
  item_shape_name: string;
  item_shape_icon: string;
  item_gender: string | null;
  item_total_option: ItemOption;
  item_base_option: ItemOption;
  potential_option_grade: string | null;
  additional_potential_option_grade: string | null;
  potential_option_1: string | null;
  potential_option_2: string | null;
  potential_option_3: string | null;
  additional_potential_option_1: string | null;
  additional_potential_option_2: string | null;
  additional_potential_option_3: string | null;
  equipment_level_increase: number;
  item_exceptional_option: ItemOption;
  item_add_option: ItemOption;
  scroll_upgrade: string;
  cuttable_count: string;
  golden_hammer_flag: string;
  scroll_resilience_count: string;
  scroll_upgradeable_count: string;
  soul_name: string | null;
  soul_option: string | null;
  item_etc_option: ItemOption;
  starforce: string;
  starforce_scroll_flag: string;
  item_starforce_option: ItemOption;
  special_ring_level: number;
  date_expire: string | null;
}

/** 장비 정보 */
export interface CharacterItemEquipment {
  date: string;
  character_gender: string;
  character_class: string;
  preset_no: number;
  item_equipment: EquipmentItem[];
  item_equipment_preset_1: EquipmentItem[];
  item_equipment_preset_2: EquipmentItem[];
  item_equipment_preset_3: EquipmentItem[];
  title: {
    title_name: string;
    title_icon: string;
    title_description: string;
    date_expire: string | null;
    date_option_expire: string | null;
  } | null;
  dragon_equipment: EquipmentItem[];
  mechanic_equipment: EquipmentItem[];
}

/** 심볼 아이템 */
export interface SymbolItem {
  symbol_name: string;
  symbol_icon: string;
  symbol_description: string;
  symbol_force: string;
  symbol_level: number;
  symbol_str: string;
  symbol_dex: string;
  symbol_int: string;
  symbol_luk: string;
  symbol_hp: string;
  symbol_growth_count: number;
  symbol_require_growth_count: number;
}

/** 심볼 장비 */
export interface CharacterSymbolEquipment {
  date: string;
  character_class: string;
  symbol: SymbolItem[];
}

/** 하이퍼스탯 프리셋 항목 */
export interface HyperStatItem {
  stat_type: string;
  stat_point: number | null;
  stat_level: number;
  stat_increase: string | null;
}

/** 하이퍼스탯 */
export interface CharacterHyperStat {
  date: string;
  character_class: string;
  use_preset_no: string;
  use_available_hyper_stat_point: number;
  hyper_stat_preset_1: HyperStatItem[];
  hyper_stat_preset_2: HyperStatItem[];
  hyper_stat_preset_3: HyperStatItem[];
  hyper_stat_preset_1_remain_point: number;
  hyper_stat_preset_2_remain_point: number;
  hyper_stat_preset_3_remain_point: number;
}

/** 어빌리티 항목 */
export interface AbilityItem {
  ability_no: string;
  ability_grade: string;
  ability_value: string;
}

/** 어빌리티 */
export interface CharacterAbility {
  date: string;
  ability_grade: string;
  ability_info: AbilityItem[];
  remain_fame: number;
  preset_no: number;
  ability_preset_1: { ability_info: AbilityItem[]; ability_preset_grade: string } | null;
  ability_preset_2: { ability_info: AbilityItem[]; ability_preset_grade: string } | null;
  ability_preset_3: { ability_info: AbilityItem[]; ability_preset_grade: string } | null;
}

/** HEXA 코어 */
export interface HexaMatrixItem {
  hexa_core_name: string;
  hexa_core_level: number;
  hexa_core_type: string;
  linked_skill: { hexa_skill_id: string }[];
}

export interface CharacterHexaMatrix {
  date: string;
  character_hexa_core_equipment: HexaMatrixItem[];
}

/** HEXA 스탯 코어 */
export interface HexaStatItem {
  slot_id: string;
  main_stat_name: string;
  sub_stat_name_1: string;
  sub_stat_name_2: string;
  main_stat_level: number;
  sub_stat_level_1: number;
  sub_stat_level_2: number;
  stat_grade: number;
}

export interface CharacterHexaMatrixStat {
  date: string;
  character_hexa_stat_core: HexaStatItem[];
  preset_hexa_stat_core: HexaStatItem[];
}

/** 유니온 */
export interface UserUnion {
  date: string;
  union_level: number;
  union_grade: string;
  union_artifact_level: number;
  union_artifact_exp: number;
  union_artifact_point: number;
}

/** 종합 캐릭터 데이터 */
export interface CharacterFullData {
  basic: CharacterBasic;
  stat: CharacterStat;
  equipment: CharacterItemEquipment;
  symbol: CharacterSymbolEquipment;
  hyperStat: CharacterHyperStat;
  ability: CharacterAbility;
  hexaMatrix: CharacterHexaMatrix;
  hexaMatrixStat: CharacterHexaMatrixStat;
  union: UserUnion;
}
