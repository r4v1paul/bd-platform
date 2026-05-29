export type AsphaltCalculationInput = {
  roadLengthM: number;
  roadWidthM: number;
  layerThicknessM: number;
  asphaltDensityTonPerM3: number;
  bitumenContentFraction?: number;
  wasteFactorPercent?: number;
};

export type AsphaltCalculationResult = {
  roadAreaM2: number;
  asphaltVolumeM3: number;
  asphaltMassTon: number;
  bitumenRequiredTon: number;

  // Optional aliases, useful if other pages already use these names
  areaM2: number;
  volumeM3: number;
  baseAsphaltTonnes: number;
  wasteTonnes: number;
  totalAsphaltTonnes: number;
  bitumenTonnes: number;
};

export function calculateAsphalt({
  roadLengthM,
  roadWidthM,
  layerThicknessM,
  asphaltDensityTonPerM3,
  bitumenContentFraction = 0.05,
  wasteFactorPercent = 0,
}: AsphaltCalculationInput): AsphaltCalculationResult {
  const roadAreaM2 = roadLengthM * roadWidthM;
  const asphaltVolumeM3 = roadAreaM2 * layerThicknessM;

  const baseAsphaltTonnes = asphaltVolumeM3 * asphaltDensityTonPerM3;
  const wasteTonnes = baseAsphaltTonnes * (wasteFactorPercent / 100);
  const asphaltMassTon = baseAsphaltTonnes + wasteTonnes;

  const bitumenRequiredTon = asphaltMassTon * bitumenContentFraction;

  return {
    roadAreaM2,
    asphaltVolumeM3,
    asphaltMassTon,
    bitumenRequiredTon,

    areaM2: roadAreaM2,
    volumeM3: asphaltVolumeM3,
    baseAsphaltTonnes,
    wasteTonnes,
    totalAsphaltTonnes: asphaltMassTon,
    bitumenTonnes: bitumenRequiredTon,
  };
}