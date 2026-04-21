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

/** 닉네임으로 OCID를 조회 */
export async function fetchOcid(nickname: string): Promise<string> {
  const data = await nexonFetch<OcidResponse>(ENDPOINTS.OCID, {
    character_name: nickname,
  });
  return data.ocid;
}

/** OCID로 모든 캐릭터 데이터를 병렬 조회 */
export async function fetchCharacterFullData(
  ocid: string,
): Promise<CharacterFullData> {
  const params = { ocid };

  const [
    basicResult,
    statResult,
    equipmentResult,
    symbolResult,
    hyperStatResult,
    abilityResult,
    hexaMatrixResult,
    hexaMatrixStatResult,
    unionResult,
  ] = await Promise.allSettled([
    nexonFetch<CharacterBasic>(ENDPOINTS.BASIC, params),
    nexonFetch<CharacterStat>(ENDPOINTS.STAT, params),
    nexonFetch<CharacterItemEquipment>(ENDPOINTS.ITEM_EQUIPMENT, params),
    nexonFetch<CharacterSymbolEquipment>(ENDPOINTS.SYMBOL_EQUIPMENT, params),
    nexonFetch<CharacterHyperStat>(ENDPOINTS.HYPER_STAT, params),
    nexonFetch<CharacterAbility>(ENDPOINTS.ABILITY, params),
    nexonFetch<CharacterHexaMatrix>(ENDPOINTS.HEXA_MATRIX, params),
    nexonFetch<CharacterHexaMatrixStat>(ENDPOINTS.HEXA_MATRIX_STAT, params),
    nexonFetch<UserUnion>(ENDPOINTS.UNION, params),
  ]);

  function unwrap<T>(result: PromiseSettledResult<T>, name: string): T {
    if (result.status === 'fulfilled') return result.value;
    throw new Error(`${name} 조회 실패: ${result.reason}`);
  }

  return {
    basic: unwrap(basicResult, 'basic'),
    stat: unwrap(statResult, 'stat'),
    equipment: unwrap(equipmentResult, 'equipment'),
    symbol: unwrap(symbolResult, 'symbol'),
    hyperStat: unwrap(hyperStatResult, 'hyperStat'),
    ability: unwrap(abilityResult, 'ability'),
    hexaMatrix: unwrap(hexaMatrixResult, 'hexaMatrix'),
    hexaMatrixStat: unwrap(hexaMatrixStatResult, 'hexaMatrixStat'),
    union: unwrap(unionResult, 'union'),
  };
}
