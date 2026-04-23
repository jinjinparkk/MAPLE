export const NEXON_API_BASE = 'https://open.api.nexon.com';

export const ENDPOINTS = {
  /** 닉네임 → OCID 변환 */
  OCID: '/maplestory/v1/id',
  /** 기본 정보 (직업, 레벨 등) */
  BASIC: '/maplestory/v1/character/basic',
  /** 종합 스탯 */
  STAT: '/maplestory/v1/character/stat',
  /** 장비 아이템 */
  ITEM_EQUIPMENT: '/maplestory/v1/character/item-equipment',
  /** 심볼 장비 */
  SYMBOL_EQUIPMENT: '/maplestory/v1/character/symbol-equipment',
  /** 하이퍼스탯 */
  HYPER_STAT: '/maplestory/v1/character/hyper-stat',
  /** 어빌리티 */
  ABILITY: '/maplestory/v1/character/ability',
  /** HEXA 매트릭스 */
  HEXA_MATRIX: '/maplestory/v1/character/hexamatrix',
  /** HEXA 스탯 코어 */
  HEXA_MATRIX_STAT: '/maplestory/v1/character/hexamatrix-stat',
  /** 유니온 */
  UNION: '/maplestory/v1/user/union',
  /** 펫 장비 */
  PET_EQUIPMENT: '/maplestory/v1/character/pet-equipment',
} as const;
