
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

// --- 5G NR Specific ---

export interface NrCalculatorInputs {
  cellRadius: number;
  frequency: number;
  linkDirection: LinkDirection;
  numRB: number;
  numerology: Numerology;
  
  // gNodeB Config
  gNodeBNoiseFigure: number;
  gNodeBTxPower: number;
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


// --- LTE Specific ---

export enum LteBandwidth {
    BW1_4 = 1.4,
    BW3 = 3,
    BW5 = 5,
    BW10 = 10,
    BW15 = 15,
    BW20 = 20,
}

export enum LtePropagationModel {
    OkumuraHataUrban = 'Okumura-Hata Urban',
    OkumuraHataSuburban = 'Okumura-Hata Suburban',
    COST231HataUrban = 'COST 231 Hata Urban',
    COST231HataSuburban = 'COST 231 Hata Suburban',
}

export interface LteCalculatorInputs {
    cellRadius: number;
    frequency: number;
    linkDirection: LinkDirection;
    bandwidth: LteBandwidth;

    // eNodeB Config
    eNodeBNoiseFigure: number;
    eNodeBTxPower: number;
    targetSINR: number;
    eNodeBCableLoss: number;
    eNodeBAntennaGain: number;
    eNodeBAntennaHeight: number;

    // UE Config
    ueTxPower: number;
    ueCableLoss: number;
    ueAntennaGain: number;
    ueRxAntennaGain: number;
    ueAntennaHeight: number;

    // Propagation Model
    propagationModel: LtePropagationModel;

    // Additional Losses
    bodyLoss: number;
    slowFadingMargin: number;
    foliageLoss: number;
    rainIceMargin: number;
    interferenceMargin: number;
    coverageType: CoverageType;
    buildingPenetrationLoss: number;
}