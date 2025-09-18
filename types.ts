
export enum LinkDirection {
  DL = 'DL',
  UL = 'UL',
}

export enum Numerology {
  N0 = 0, // 15kHz
  N1 = 1, // 30kHz
  N2 = 2, // 60kHz
  N3 = 3, // 120kHz
  N4 = 4, // 240kHz
}

export enum PropagationModel {
  UMa_NLOS = 'Urban Macro 3D-UMa NLOS',
  UMi_NLOS = 'Urban Micro 3D-UMi NLOS',
  RMa_NLOS = 'Rural Macro 3D-RMa NLOS',
}

export enum CoverageType {
    Outdoor = 'Outdoor',
    Indoor = 'Indoor'
}

export interface CalculatorInputs {
  cellRadius: number;
  frequency: number;
  linkDirection: LinkDirection;
  numRB: number;
  numerology: Numerology;
  
  // gNodeB Config
  gNodeBNoiseFigure: number;
  gNodeBTxPower: number; // Added for DL calculation
  targetSINR: number;
  gNodeBCableLoss: number;
  gNodeBAntennaGain: number;

  gNodeBAntennaHeight: number;

  // UT Config
  utTxPower: number;
  utCableLoss: number;
  utAntennaGain: number;
  utAntennaHeight: number;

  // Propagation Model
  propagationModel: PropagationModel;

  // Additional Losses
  bodyLoss: number;
  slowFadingMargin: number;
  foliageLoss: number;
  rainIceMargin: number;
  interferenceMargin: number;
  coverageType: CoverageType;
  buildingPenetrationLoss: number;
}
