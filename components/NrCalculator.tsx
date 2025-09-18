import React, { useState, useMemo, useEffect } from 'react';
import { NrCalculatorInputs, LinkDirection, Numerology, PropagationModel, CoverageType } from '../types';
import InputSlider from './InputSlider';
import Select from './Select';
import { motion, AnimatePresence } from 'framer-motion';

interface AccordionSectionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border border-slate-700 rounded-lg overflow-hidden bg-slate-800/20">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left font-semibold text-cyan-400 bg-slate-900/50 hover:bg-slate-800/50 transition-colors"
            >
                <span>{title}</span>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </motion.div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 space-y-4">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

interface NrCalculatorProps {
    onCalculate: (results: any, inputs: NrCalculatorInputs) => void;
}


const NUMEROLOGY_CONFIG = {
  [Numerology.N0]: { label: '0: µ:15kHz', scs: 15000 },
  [Numerology.N1]: { label: '1: µ:30kHz', scs: 30000 },
  [Numerology.N2]: { label: '2: µ:60kHz', scs: 60000 },
  [Numerology.N3]: { label: '3: µ:120kHz', scs: 120000 },
  [Numerology.N4]: { label: '4: µ:240kHz', scs: 240000 },
};

const PROPAGATION_MODEL_DESCRIPTIONS = {
  [PropagationModel.UMa_NLOS]: {
    title: 'Urban Macro-cell (UMa) NLOS',
    description: 'Models dense urban areas where the gNodeB is above rooftop level. Ideal for city-wide coverage analysis under Non-Line-of-Sight (NLOS) conditions.',
    params: [
      'Considers 3D distance and antenna heights',
      'Uses a breakpoint distance for path loss exponent change',
      'Based on 3GPP TR 38.901 specifications'
    ]
  },
  [PropagationModel.UMi_NLOS]: {
    title: 'Urban Micro-cell (UMi) NLOS',
    description: 'For urban "street canyon" scenarios with gNodeBs below rooftop level (e.g., on lamp posts). Suitable for capacity hotspots in specific blocks.',
    params: [
      'Considers 3D distance and frequency',
      'Simpler model, no breakpoint distance',
      'Based on 3GPP TR 38.901 specifications'
    ]
  },
  [PropagationModel.RMa_NLOS]: {
    title: 'Rural Macro-cell (RMa) NLOS',
    description: 'Simulates environments with low building density and open spaces. Used for wide-area coverage analysis in rural settings.',
    params: [
      'Considers long distances and antenna heights',
      'Includes breakpoint distance calculation',
      'Based on 3GPP TR 38.901 specifications'
    ]
  }
};

const VENDOR_PRESETS = {
    'Ericsson': {
        gNodeBNoiseFigure: 4.5,
        gNodeBTxPower: 46, // ~40W
        gNodeBCableLoss: 1.5,
        gNodeBAntennaGain: 18,
        utTxPower: 23, // Standard UE power
    },
    'Huawei': {
        gNodeBNoiseFigure: 5.0,
        gNodeBTxPower: 47, // ~50W
        gNodeBCableLoss: 1.2,
        gNodeBAntennaGain: 17.5,
        utTxPower: 23,
    },
    'Nokia': {
        gNodeBNoiseFigure: 4.8,
        gNodeBTxPower: 46.5,
        gNodeBCableLoss: 1.8,
        gNodeBAntennaGain: 18.5,
        utTxPower: 23,
    }
};

type Vendor = 'Custom' | 'Ericsson' | 'Huawei' | 'Nokia';

const NrCalculator: React.FC<NrCalculatorProps> = ({ onCalculate }) => {
  const [inputs, setInputs] = useState<NrCalculatorInputs>({
    cellRadius: 700,
    frequency: 3410,
    linkDirection: LinkDirection.UL,
    numRB: 1,
    numerology: Numerology.N0,
    gNodeBNoiseFigure: 5,
    gNodeBTxPower: 46,
    targetSINR: -6,
    gNodeBCableLoss: 2,
    gNodeBAntennaGain: 17,
    gNodeBAntennaHeight: 23,
    utTxPower: 23,
    utCableLoss: 0,
    utAntennaGain: 0,
    utAntennaHeight: 1.5,
    propagationModel: PropagationModel.UMa_NLOS,
    bodyLoss: 3,
    slowFadingMargin: 7,
    foliageLoss: 8.5,
    rainIceMargin: 0,
    interferenceMargin: 2,
    coverageType: CoverageType.Outdoor,
    buildingPenetrationLoss: 20,
  });

  const [frequencyUnit, setFrequencyUnit] = useState<'MHz' | 'GHz'>('MHz');
  const [distanceUnit, setDistanceUnit] = useState<'m' | 'km'>('m');
  const [vendor, setVendor] = useState<Vendor>('Custom');


  useEffect(() => {
    if (vendor === 'Custom') return;
    const presets = VENDOR_PRESETS[vendor];
    if (presets) {
      setInputs(prev => ({
        ...prev,
        ...presets
      }));
    }
  }, [vendor]);

  const handleInputChange = <K extends keyof NrCalculatorInputs>(field: K, value: NrCalculatorInputs[K]) => {
    const originalValue = inputs[field];
    const finalValue = typeof originalValue === 'number' ? Number(value) : value;

    if (vendor !== 'Custom') {
        const presetFields = Object.keys(VENDOR_PRESETS[vendor]);
        if (presetFields.includes(field as string)) {
            setVendor('Custom');
        }
    }
    
    setInputs(prev => ({ ...prev, [field]: finalValue }));
  };
  
  const calculatedResults = useMemo(() => {
    const { 
        cellRadius, frequency, linkDirection, numRB, numerology,
        gNodeBNoiseFigure, gNodeBTxPower, targetSINR, gNodeBCableLoss, gNodeBAntennaGain, gNodeBAntennaHeight,
        utTxPower, utCableLoss, utAntennaGain, utAntennaHeight,
        propagationModel,
        bodyLoss, slowFadingMargin, foliageLoss, rainIceMargin, interferenceMargin,
        coverageType, buildingPenetrationLoss
    } = inputs;

    const subcarrierQuantity = numRB * 12;
    const subcarrierSpacingHz = NUMEROLOGY_CONFIG[numerology].scs;
    const bandwidthHz = subcarrierQuantity * subcarrierSpacingHz;
    const thermalNoise = -174 + 10 * Math.log10(bandwidthHz);
    const antennaHeightDifference = gNodeBAntennaHeight - utAntennaHeight;
    const fc_GHz = frequency / 1000;
    
    const calculatePathLoss = (distance: number) => {
        const d_2D = distance;
        const d_3D = Math.sqrt(d_2D**2 + (antennaHeightDifference)**2);
        let loss = 0;
        switch(propagationModel) {
            case PropagationModel.UMa_NLOS: {
                const d_BP = 4 * (gNodeBAntennaHeight - 1) * (utAntennaHeight - 1) * (fc_GHz * 1e9) / (3e8);
                const PL1 = 28.0 + 22 * Math.log10(d_3D) + 20 * Math.log10(fc_GHz);
                const PL2 = 28.0 + 40 * Math.log10(d_3D) + 20 * Math.log10(fc_GHz) - 9 * Math.log10((d_BP**2) + (antennaHeightDifference)**2);
                loss = (d_2D < d_BP) ? PL1 : PL2;
                break;
            }
            case PropagationModel.UMi_NLOS:
                loss = 36.7 * Math.log10(d_3D) + 22.7 + 26 * Math.log10(fc_GHz);
                break;
            case PropagationModel.RMa_NLOS: {
                const d_BP = 2 * Math.PI * gNodeBAntennaHeight * utAntennaHeight * (fc_GHz * 1e9) / (3e8);
                 if (d_2D <= d_BP) {
                    loss = 20 * Math.log10(40 * Math.PI * d_3D * fc_GHz / 3) + 10.5 - 0.2 * (utAntennaHeight-1.5) - 0.2*(gNodeBAntennaHeight - 35);
                 } else {
                    loss = 40 * Math.log10(d_3D) - 20*Math.log10(d_BP) + 20*Math.log10(40*Math.PI*d_BP*fc_GHz/3) + 10.5 - 0.2 * (utAntennaHeight-1.5) - 0.2*(gNodeBAntennaHeight - 35);
                 }
                break;
            }
        }
        return loss;
    }

    const propagationLoss = calculatePathLoss(cellRadius);
    const buildingLoss = coverageType === CoverageType.Indoor ? buildingPenetrationLoss : 0;
    const fullPathLoss = propagationLoss + bodyLoss + slowFadingMargin + foliageLoss + rainIceMargin + interferenceMargin + buildingLoss;
    
    let linkBudget, rxSensitivity;
    let baseTxPower, baseTxGain, baseTxCableLoss, baseRxGain, baseRxCableLoss;

    if (linkDirection === LinkDirection.UL) {
        rxSensitivity = gNodeBNoiseFigure + thermalNoise + targetSINR;
        baseTxPower = utTxPower;
        baseTxCableLoss = utCableLoss;
        baseTxGain = utAntennaGain;
        baseRxGain = gNodeBAntennaGain;
        baseRxCableLoss = gNodeBCableLoss;
    } else { // DL
        rxSensitivity = gNodeBNoiseFigure + thermalNoise + targetSINR; 
        baseTxPower = gNodeBTxPower;
        baseTxCableLoss = gNodeBCableLoss;
        baseTxGain = gNodeBAntennaGain;
        baseRxGain = utAntennaGain;
        baseRxCableLoss = utCableLoss;
    }

    linkBudget = baseTxPower - baseTxCableLoss + baseTxGain - fullPathLoss + baseRxGain - baseRxCableLoss;
    const radioChannelStatus: 'Pass' | 'Fail' = linkBudget >= rxSensitivity ? 'Pass' : 'Fail';
    const utTxPowerPerSubcarrier = utTxPower - 10 * Math.log10(subcarrierQuantity);

    return {
        subcarrierQuantity,
        thermalNoise,
        rxSensitivity,
        propagationLoss,
        fullPathLoss,
        linkBudget,
        radioChannelStatus,
        utTxPowerPerSubcarrier,
        antennaHeightDifference,
    };
  }, [inputs]);

  useEffect(() => {
      onCalculate(calculatedResults, inputs);
  }, [calculatedResults, inputs, onCalculate]);


  return (
    <div className="space-y-4">
        <AccordionSection title="Vendor Presets">
            <Select
                label="Select Vendor"
                value={vendor}
                onChange={(v) => setVendor(v as Vendor)}
                options={[
                    { value: 'Custom', label: 'Custom' },
                    { value: 'Ericsson', label: 'Ericsson' },
                    { value: 'Huawei', label: 'Huawei' },
                    { value: 'Nokia', label: 'Nokia' },
                ]}
                tooltip="Select a vendor to apply typical equipment configurations. Modifying a preset value will switch back to 'Custom'."
            />
        </AccordionSection>
        <AccordionSection title="Core Parameters" defaultOpen={true}>
            <div>
                <InputSlider 
                    label="Cell Radius" 
                    unit={distanceUnit} 
                    value={distanceUnit === 'm' ? inputs.cellRadius : parseFloat((inputs.cellRadius / 1000).toFixed(2))} 
                    onChange={v => handleInputChange('cellRadius', distanceUnit === 'm' ? v : v * 1000)} 
                    min={distanceUnit === 'm' ? 10 : 0.01} 
                    max={distanceUnit === 'm' ? 5000 : 5} 
                    step={distanceUnit === 'm' ? 10 : 0.01} 
                />
                  <div className="text-right -mt-2">
                    <button onClick={() => setDistanceUnit('m')} className={`px-2 py-0.5 text-xs rounded-l-md transition-colors ${distanceUnit === 'm' ? 'bg-cyan-600 text-white font-semibold' : 'bg-slate-700 hover:bg-slate-600'}`}>m</button>
                    <button onClick={() => setDistanceUnit('km')} className={`px-2 py-0.5 text-xs rounded-r-md transition-colors ${distanceUnit === 'km' ? 'bg-cyan-600 text-white font-semibold' : 'bg-slate-700 hover:bg-slate-600'}`}>km</button>
                </div>
            </div>
            <div>
                <InputSlider 
                    label="Centre Frequency" 
                    unit={frequencyUnit}
                    value={frequencyUnit === 'MHz' ? inputs.frequency : parseFloat((inputs.frequency / 1000).toFixed(2))}
                    onChange={v => handleInputChange('frequency', frequencyUnit === 'MHz' ? v : v * 1000)}
                    min={frequencyUnit === 'MHz' ? 500 : 0.5}
                    max={frequencyUnit === 'MHz' ? 100000 : 100}
                    step={frequencyUnit === 'MHz' ? 10 : 0.01}
                    tooltip="Supports 0.5–100 GHz"
                />
                  <div className="text-right -mt-2">
                    <button onClick={() => setFrequencyUnit('MHz')} className={`px-2 py-0.5 text-xs rounded-l-md transition-colors ${frequencyUnit === 'MHz' ? 'bg-cyan-600 text-white font-semibold' : 'bg-slate-700 hover:bg-slate-600'}`}>MHz</button>
                    <button onClick={() => setFrequencyUnit('GHz')} className={`px-2 py-0.5 text-xs rounded-r-md transition-colors ${frequencyUnit === 'GHz' ? 'bg-cyan-600 text-white font-semibold' : 'bg-slate-700 hover:bg-slate-600'}`}>GHz</button>
                </div>
            </div>
            <Select label="Direction of Link" value={inputs.linkDirection} onChange={v => handleInputChange('linkDirection', v)} options={Object.values(LinkDirection).map(d => ({ value: d, label: d }))} />
            <InputSlider label="Number of RB" unit="" value={inputs.numRB} onChange={v => handleInputChange('numRB', v)} min={1} max={273} step={1} />
            <Select label="Numerology (SCS)" value={inputs.numerology} onChange={v => handleInputChange('numerology', parseInt(v))} options={Object.values(Numerology).filter(v => typeof v === 'number').map(n => ({ value: n, label: NUMEROLOGY_CONFIG[n as Numerology].label }))} />
        </AccordionSection>
        <AccordionSection title="gNodeB Configuration">
            {inputs.linkDirection === LinkDirection.DL && <InputSlider label="Transmit Power" unit="dBm" value={inputs.gNodeBTxPower} onChange={v => handleInputChange('gNodeBTxPower', v)} min={0} max={60} step={1} />}
            <InputSlider label="Noise Figure" unit="dB" value={inputs.gNodeBNoiseFigure} onChange={v => handleInputChange('gNodeBNoiseFigure', v)} min={0} max={15} step={0.1} />
            <InputSlider label="Target SINR" unit="dB" value={inputs.targetSINR} onChange={v => handleInputChange('targetSINR', v)} min={-20} max={30} step={0.5} />
            <InputSlider label="Cable Loss" unit="dB" value={inputs.gNodeBCableLoss} onChange={v => handleInputChange('gNodeBCableLoss', v)} min={0} max={10} step={0.1} />
            <InputSlider label="gNodeB Antenna Gain" unit="dBi" value={inputs.gNodeBAntennaGain} onChange={v => handleInputChange('gNodeBAntennaGain', v)} min={0} max={30} step={0.5} />
            <InputSlider label="gNodeB Antenna Height" unit="m" value={inputs.gNodeBAntennaHeight} onChange={v => handleInputChange('gNodeBAntennaHeight', v)} min={5} max={150} step={1} />
        </AccordionSection>
        <AccordionSection title="UT Configuration">
            {inputs.linkDirection === LinkDirection.UL && <InputSlider label="Transmit Power" unit="dBm" value={inputs.utTxPower} onChange={v => handleInputChange('utTxPower', v)} min={0} max={30} step={1} />}
            <InputSlider label="Cable Loss" unit="dB" value={inputs.utCableLoss} onChange={v => handleInputChange('utCableLoss', v)} min={0} max={5} step={0.1} />
            <InputSlider label="UT Antenna Gain" unit="dBi" value={inputs.utAntennaGain} onChange={v => handleInputChange('utAntennaGain', v)} min={-5} max={10} step={0.5} />
            <InputSlider label="UT Antenna Height" unit="m" value={inputs.utAntennaHeight} onChange={v => handleInputChange('utAntennaHeight', v)} min={0.5} max={10} step={0.1} />
        </AccordionSection>
        <AccordionSection title="Path Loss & Propagation">
            <Select label="Propagation Model" value={inputs.propagationModel} onChange={v => handleInputChange('propagationModel', v)} options={Object.values(PropagationModel).map(p => ({ value: p, label: p }))} tooltip="5G NR uses 3D propagation models defined in 3GPP 38.901 (0.5–100 GHz)."/>
            <div className="p-3 bg-slate-900/70 rounded-lg border border-slate-700">
                <h4 className="text-sm font-semibold text-cyan-400 mb-2">{PROPAGATION_MODEL_DESCRIPTIONS[inputs.propagationModel].title}</h4>
                <p className="text-xs text-slate-400">{PROPAGATION_MODEL_DESCRIPTIONS[inputs.propagationModel].description}</p>
            </div>
        </AccordionSection>
        <AccordionSection title="Additional Losses">
            <InputSlider label="Body Loss" unit="dB" value={inputs.bodyLoss} onChange={v => handleInputChange('bodyLoss', v)} min={0} max={40} step={0.5} tooltip="Typical Body Loss @3.5GHz: 3-5dB, @28GHz: 8-40dB" />
            <InputSlider label="Slow Fading Margin" unit="dB" value={inputs.slowFadingMargin} onChange={v => handleInputChange('slowFadingMargin', v)} min={0} max={15} step={0.5} tooltip="Source: 3GPP 38.901. O2O Urban: 7dB, O2I Urban: 8dB"/>
            <InputSlider label="Foliage Loss" unit="dB" value={inputs.foliageLoss} onChange={v => handleInputChange('foliageLoss', v)} min={0} max={30} step={0.5} tooltip="Typical Foliage Loss (Dense Tree) @3.5GHz: 8.5dB, @28GHz: 15dB"/>
            <InputSlider label="Rain/Ice Margin" unit="dB" value={inputs.rainIceMargin} onChange={v => handleInputChange('rainIceMargin', v)} min={0} max={10} step={0.1} tooltip="Typical Rain/Ice Margin @3.5GHz: 0dB, @28GHz: 3dB"/>
            <InputSlider label="Interference Margin" unit="dB" value={inputs.interferenceMargin} onChange={v => handleInputChange('interferenceMargin', v)} min={0} max={10} step={0.1} tooltip={"Typical Interference Margin:\n- DL @3.5GHz: 6dB, UL @3.5GHz: 2dB\n- DL @28GHz: 1dB, UL @28GHz: 0.5dB"}/>
            <Select label="Coverage Type" value={inputs.coverageType} onChange={v => handleInputChange('coverageType', v)} options={Object.values(CoverageType).map(c => ({ value: c, label: c }))} />
            {inputs.coverageType === CoverageType.Indoor && (
                <InputSlider label="Building Penetration Loss" unit="dB" value={inputs.buildingPenetrationLoss} onChange={v => handleInputChange('buildingPenetrationLoss', v)} min={0} max={50} step={1} tooltip="Loss from signal passing through exterior walls. Varies by material."/>
            )}
        </AccordionSection>
    </div>
  );
};

export default NrCalculator;
