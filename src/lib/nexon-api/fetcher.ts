import { unstable_cache } from 'next/cache';
import { nexonFetch } from './client';
import { ENDPOINTS } from './endpoints';
import type {
  OcidResponse,
  CharacterBasic,
  CharacterStat,
  CharacterItemEquipment,
  CharacterSymbolEquipment,
  CharacterHyperStat,
  CharacterAbility,
  CharacterHexaMatrix,
  CharacterHexaMatrixStat,
  UserUnion,
  CharacterFullData,
} from './types';

const THROTTLE_MS = 100;
function wait(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

/** 안전하게 fetch — 실패 시 fallback 반환 */
async function safeFetch<T>(path: string, params: Record<string, string>, fallback: T): Promise<T> {
  try {
    return await nexonFetch<T>(path, params);
  } catch {
    return fallback;
  }
}

/**
 * 닉네임으로 OCID를 조회 (Vercel Data Cache — 24시간)
 * unstable_cache: 성공 시만 캐시, 실패(throw)시 캐시 안 됨
 */
export const fetchOcid = unstable_cache(
  async (nickname: string): Promise<string> => {
    const data = await nexonFetch<OcidResponse>(ENDPOINTS.OCID, {
      character_name: nickname,
    });
    return data.ocid;
  },
  ['ocid'],
  { revalidate: 86400 },
);

/**
 * OCID로 모든 캐릭터 데이터를 조회 (Vercel Data Cache — 10분)
 * - 순차 호출로 rate limit 회피
 * - 핵심 데이터 실패 → throw (캐시 안 됨, 다음 요청에서 재시도)
 * - 부가 데이터 실패 → 기본값 사용 (기본값 포함 결과가 캐시됨)
 */
export const fetchCharacterFullData = unstable_cache(
  async (ocid: string): Promise<CharacterFullData> => {
    const params = { ocid };

    // 핵심 데이터 — 실패하면 throw (호출 사이 throttle)
    const basic = await nexonFetch<CharacterBasic>(ENDPOINTS.BASIC, params);
    await wait(THROTTLE_MS);
    const stat = await nexonFetch<CharacterStat>(ENDPOINTS.STAT, params);
    await wait(THROTTLE_MS);
    const equipment = await nexonFetch<CharacterItemEquipment>(ENDPOINTS.ITEM_EQUIPMENT, params);
    await wait(THROTTLE_MS);
    const symbol = await nexonFetch<CharacterSymbolEquipment>(ENDPOINTS.SYMBOL_EQUIPMENT, params);
    await wait(THROTTLE_MS);

    // 부가 데이터 — 실패해도 기본값 사용
    const hyperStat = await safeFetch<CharacterHyperStat>(ENDPOINTS.HYPER_STAT, params, { date: '', character_class: '', use_preset_no: '0', use_available_hyper_stat_point: 0, hyper_stat_preset_1: [], hyper_stat_preset_2: [], hyper_stat_preset_3: [], hyper_stat_preset_1_remain_point: 0, hyper_stat_preset_2_remain_point: 0, hyper_stat_preset_3_remain_point: 0 });
    await wait(THROTTLE_MS);
    const ability = await safeFetch<CharacterAbility>(ENDPOINTS.ABILITY, params, { date: '', ability_grade: '', ability_info: [], remain_fame: 0, preset_no: 0, ability_preset_1: null, ability_preset_2: null, ability_preset_3: null });
    await wait(THROTTLE_MS);
    const hexaMatrix = await safeFetch<CharacterHexaMatrix>(ENDPOINTS.HEXA_MATRIX, params, { date: '', character_hexa_core_equipment: [] });
    await wait(THROTTLE_MS);
    const hexaMatrixStat = await safeFetch<CharacterHexaMatrixStat>(ENDPOINTS.HEXA_MATRIX_STAT, params, { date: '', character_hexa_stat_core: [], preset_hexa_stat_core: [] });
    await wait(THROTTLE_MS);
    const union = await safeFetch<UserUnion>(ENDPOINTS.UNION, params, { date: '', union_level: 0, union_grade: '', union_artifact_level: 0, union_artifact_exp: 0, union_artifact_point: 0 });

    return { basic, stat, equipment, symbol, hyperStat, ability, hexaMatrix, hexaMatrixStat, union };
  },
  ['character-full-data'],
  { revalidate: 600 },
);
