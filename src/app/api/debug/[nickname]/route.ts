import { NextRequest, NextResponse } from 'next/server';
import { fetchOcid, fetchCharacterFullData } from '@/lib/nexon-api';
import { getBestPresetEquipment } from '@/lib/utils/equipment';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ nickname: string }> },
) {
  const { nickname } = await params;
  const decodedNickname = decodeURIComponent(nickname);
  const steps: string[] = [];

  try {
    steps.push('1. fetchOcid start');
    const ocid = await fetchOcid(decodedNickname);
    steps.push(`2. fetchOcid ok: ${ocid}`);

    steps.push('3. fetchCharacterFullData start');
    const charData = await fetchCharacterFullData(ocid);
    steps.push(`4. fetchCharacterFullData ok, keys: ${Object.keys(charData).join(',')}`);

    steps.push('5. getBestPresetEquipment start');
    const bestPreset = getBestPresetEquipment(charData.equipment);
    steps.push(`6. getBestPresetEquipment ok, presetNo: ${bestPreset.presetNo}, items: ${bestPreset.equipment.length}`);

    return NextResponse.json({ success: true, steps });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    steps.push(`ERROR: ${message}`);
    return NextResponse.json({ success: false, steps, error: message, stack }, { status: 500 });
  }
}
