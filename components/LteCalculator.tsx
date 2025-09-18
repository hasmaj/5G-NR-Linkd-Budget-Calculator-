import React, { useState, useMemo, useEffect } from 'react';
import { LteCalculatorInputs, LinkDirection, LteBandwidth, LtePropagationModel, CoverageType } from '../types';
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

interface LteCalculatorProps {
    onCalculate: (results: any, inputs: LteCalculatorInputs) => void;
}


const LTE_BANDWIDTH_CONFIG = {
    [LteBandwidth.BW1_4]: { label: '1.4 MHz', numRB: 6 },
    [LteBandwidth.BW3]: { label: '3 MHz', numRB: 15 },
    [LteBandwidth.BW5]: { label: '5 MHz', numRB: 25 },
    [LteBandwidth.BW10]: { label: '10 MHz', numRB: 50 },
    [LteBandwidth.BW15]: { label: '15 MHz', numRB: 75 },
    [LteBandwidth.BW20]: { label: '20 MHz', numRB: 100 },
};

const LTE_PROPAGATION_MODEL_DESCRIPTIONS = {
  [LtePropagationModel.OkumuraHataUrban]: {
    title: 'Okumura-Hata (Urban)',
    description: 'A widely used empirical model for urban macro-cellular environments. Best suited for frequencies between 150-1500 MHz and distances from 1-20 km.',
  },
  [LtePropagationModel.OkumuraHataSuburban]: {
    title: 'Okumura-Hata (Suburban)',
    description: 'A correction to the urban Hata model for use in suburban areas, which typically have lower building densities and more open spaces.',
  },
  [LtePropagationModel.COST231HataUrban]: {
    title: 'COST 231 Hata (Urban)',
    description: 'An extension of the Okumura-Hata model for higher frequencies (1500-2000 MHz), commonly used for DCS 1800 / PCS 1900 systems.',
  },
  [LtePropagationModel.COST231HataSuburban]: {
    title: 'COST 231 Hata (Suburban)',
    description: 'The suburban adaptation of the COST 231 Hata model, for frequencies between 1500-2000 MHz.',
  }
};

const LTE_BANDS = {
    'Band 28 (700 MHz)': 700,
    'Band 20 (800 MHz)': 800,
    'Band 3 (1800 MHz)': 1800,
    'Band 1 (2100 MHz)': 2100,
    'Band 7 (2600 MHz)': 2600,
};

const VENDOR_PRESETS = {
    'Ericsson': {
        eNodeBNoiseFigure: 4.0,
        eNodeBTxPower: 46,
        eNodeBCableLoss: 1.5,
        eNodeBAntennaGain: 17,
        ueTxPower: 23,
    },
    'Huawei': {
        eNodeBNoiseFigure: 4.5,
        eNodeBTxPower: 46,
        eNodeBCableLoss: 1.2,
        eNodeBAntennaGain: 16.5,
        ueTxPower: 23,
    },
    'Nokia': {
        eNodeBNoiseFigure: 4.2,
        eNodeBTxPower: 46,
        eNodeBCableLoss: 1.8,
        eNodeBAntennaGain: 17.2,
        ueTxPower: 23,
    }
};

type Vendor = 'Custom' | 'Ericsson' | 'Huawei' | 'Nokia';

const LteCalculator: React.FC<LteCalculatorProps> = ({ onCalculate }) => {
  const [inputs, setInputs] = useState<LteCalculatorInputs>({
    cellRadius: 1000,
    frequency: 1800,
    linkDirection: LinkDirection.UL,
    bandwidth: LteBandwidth.BW10,
    eNodeBNoiseFigure: 5,
    eNodeBTxPower: 46,
    targetSINR: -5,
    eNodeBCableLoss: 2,
    eNodeBAntennaGain: 17,
    eNodeBAntennaHeight: 30,
    ueTxPower: 23,
    ueCableLoss: 0,
    ueAntennaGain: 0,
    ueRxAntennaGain: 0,
    ueAntennaHeight: 1.5,
    propagationModel: LtePropagationModel.COST231HataUrban,
    bodyLoss: 2,
    slowFadingMargin: 8,
    foliageLoss: 5,
    rainIceMargin: 0,
    interferenceMargin: 3,
    coverageType: CoverageType.Outdoor,
    buildingPenetrationLoss: 20,
  });

  const [distanceUnit, setDistanceUnit] = useState<'m' | 'km'>('m');
  const [vendor, setVendor] = useState<Vendor>('Custom');
  const [selectedBand, setSelectedBand] = useState<string>('Band 3 (1800 MHz)');

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

  useEffect(() => {
    const { frequency, propagationModel } = inputs;
    const isSuburban = propagationModel.includes('Suburban');
    const shouldBeCost231 = frequency > 1500;
    const isCurrentlyCost231 = propagationModel.startsWith('COST 231 Hata');
    if (shouldBeCost231 !== isCurrentlyCost231) {
      let newModel: LtePropagationModel;
      if (shouldBeCost231) {
        newModel = isSuburban ? LtePropagationModel.COST231HataSuburban : LtePropagationModel.COST231HataUrban;
      } else {
        newModel = isSuburban ? LtePropagationModel.OkumuraHataSuburban : LtePropagationModel.OkumuraHataUrban;
      }
      setInputs(prev => ({ ...prev, propagationModel: newModel }));
    }
  }, [inputs.frequency, inputs.propagationModel]);

  const handleInputChange = <K extends keyof LteCalculatorInputs>(field: K, value: LteCalculatorInputs[K]) => {
     const originalValue = inputs[field];
     const finalValue = typeof originalValue === 'number' ? Number(value) : value;
     if (vendor !== 'Custom') {
        const presetFields = Object.keys(VENDOR_PRESETS[vendor]);
        if (presetFields.includes(field as string)) {
            setVendor('Custom');
        }
    }
    if (field === 'frequency') {
        const matchingBand = Object.keys(LTE_BANDS).find(key => LTE_BANDS[key as keyof typeof LTE_BANDS] === (finalValue as number));
        setSelectedBand(matchingBand || 'Custom');
    }
    setInputs(prev => ({ ...prev, [field]: finalValue }));
  };

  const handleBandChange = (bandKey: string) => {
    setSelectedBand(bandKey);
    if (bandKey !== 'Custom') {
      const newFrequency = LTE_BANDS[bandKey as keyof typeof LTE_BANDS];
      handleInputChange('frequency', newFrequency);
    }
  };

  const calculatedResults = useMemo(() => {
    const {
        cellRadius, frequency, linkDirection, bandwidth,
        eNodeBNoiseFigure, eNodeBTxPower, targetSINR, eNodeBCableLoss, eNodeBAntennaGain, eNodeBAntennaHeight,
        ueTxPower, ueCableLoss, ueAntennaGain, ueRxAntennaGain, ueAntennaHeight,
        propagationModel,
        bodyLoss, slowFadingMargin, foliageLoss, rainIceMargin, interferenceMargin,
        coverageType, buildingPenetrationLoss
    } = inputs;

    const numRB = LTE_BANDWIDTH_CONFIG[bandwidth].numRB;
    const bandwidthHz = numRB * 12 * 15000;
    const thermalNoise = -174 + 10 * Math.log10(bandwidthHz);

    const calculatePathLoss = (distanceM: number) => {
        const d_km = distanceM / 1000;
        if (d_km <= 0) return 0;
        const fc = frequency, h_te = eNodeBAntennaHeight, h_re = ueAntennaHeight;
        const a_hre = (1.1 * Math.log10(fc) - 0.7) * h_re - (1.56 * Math.log10(fc) - 0.8);
        let loss = 0;
        switch(propagationModel) {
            case LtePropagationModel.OkumuraHataUrban:
                loss = 69.55 + 26.16 * Math.log10(fc) - 13.82 * Math.log10(h_te) - a_hre + (44.9 - 6.55 * Math.log10(h_te)) * Math.log10(d_km);
                break;
            case LtePropagationModel.OkumuraHataSuburban:
                const urbanLoss = 69.55 + 26.16 * Math.log10(fc) - 13.82 * Math.log10(h_te) - a_hre + (44.9 - 6.55 * Math.log10(h_te)) * Math.log10(d_km);
                loss = urbanLoss - 2 * (Math.log10(fc / 28))**2 - 5.4;
                break;
            case LtePropagationModel.COST231HataUrban:
                loss = 46.3 + 33.9 * Math.log10(fc) - 13.82 * Math.log10(h_te) - a_hre + (44.9 - 6.55 * Math.log10(h_te)) * Math.log10(d_km) + 3;
                break;
            case LtePropagationModel.COST231HataSuburban:
                loss = 46.3 + 33.9 * Math.log10(fc) - 13.82 * Math.log10(h_te) - a_hre + (44.9 - 6.55 * Math.log10(h_te)) * Math.log10(d_km);
                break;
        }
        return Math.max(0, loss);
    }

    const propagationLoss = calculatePathLoss(cellRadius);
    const buildingLoss = coverageType === CoverageType.Indoor ? buildingPenetrationLoss : 0;
    const fullPathLoss = propagationLoss + bodyLoss + slowFadingMargin + foliageLoss + rainIceMargin + interferenceMargin + buildingLoss;
    
    let linkBudget, rxSensitivity;
    if (linkDirection === LinkDirection.UL) {
        rxSensitivity = eNodeBNoiseFigure + thermalNoise + targetSINR;
        linkBudget = ueTxPower - ueCableLoss + ueAntennaGain - fullPathLoss + eNodeBAntennaGain - eNodeBCableLoss;
    } else { // DL
        rxSensitivity = eNodeBNoiseFigure + thermalNoise + targetSINR;
        linkBudget = eNodeBTxPower - eNodeBCableLoss + eNodeBAntennaGain - fullPathLoss + ueRxAntennaGain - ueCableLoss;
    }

    const radioChannelStatus: 'Pass' | 'Fail' = linkBudget >= rxSensitivity ? 'Pass' : 'Fail';

    return { thermalNoise, rxSensitivity, propagationLoss, fullPathLoss, linkBudget, radioChannelStatus };
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
                options={['Custom', 'Ericsson', 'Huawei', 'Nokia'].map(v => ({ value: v, label: v }))}
                tooltip="Select a vendor to apply typical eNodeB configurations. Modifying a preset value will switch back to 'Custom'."
            />
        </AccordionSection>
        <AccordionSection title="Core Parameters" defaultOpen={true}>
            <div>
                  <InputSlider 
                    label="Cell Radius" 
                    unit={distanceUnit} 
                    value={distanceUnit === 'm' ? inputs.cellRadius : parseFloat((inputs.cellRadius / 1000).toFixed(2))} 
                    onChange={v => handleInputChange('cellRadius', distanceUnit === 'm' ? v : v * 1000)} 
                    min={distanceUnit === 'm' ? 100 : 0.1} 
                    max={distanceUnit === 'm' ? 20000 : 20} 
                    step={distanceUnit === 'm' ? 50 : 0.05} 
                />
                  <div className="text-right -mt-2">
                    <button onClick={() => setDistanceUnit('m')} className={`px-2 py-0.5 text-xs rounded-l-md transition-colors ${distanceUnit === 'm' ? 'bg-cyan-600 text-white font-semibold' : 'bg-slate-700 hover:bg-slate-600'}`}>m</button>
                    <button onClick={() => setDistanceUnit('km')} className={`px-2 py-0.5 text-xs rounded-r-md transition-colors ${distanceUnit === 'km' ? 'bg-cyan-600 text-white font-semibold' : 'bg-slate-700 hover:bg-slate-600'}`}>km</button>
                </div>
            </div>
            <Select 
                label="LTE Frequency Band"
                value={selectedBand}
                onChange={handleBandChange}
                options={['Custom', ...Object.keys(LTE_BANDS)].map(k => ({ value: k, label: k }))}
                tooltip="Select a standard LTE band to auto-fill the frequency."
            />
            <InputSlider label="Centre Frequency" unit="MHz" value={inputs.frequency} onChange={v => handleInputChange('frequency', v)} min={400} max={2600} step={10} tooltip="Typical LTE bands (e.g., 700, 800, 1800, 2100, 2600 MHz)" />
            <Select label="Direction of Link" value={inputs.linkDirection} onChange={v => handleInputChange('linkDirection', v)} options={Object.values(LinkDirection).map(d => ({ value: d, label: d }))} />
            <Select label="Channel Bandwidth" value={inputs.bandwidth} onChange={v => handleInputChange('bandwidth', parseFloat(v))} options={Object.values(LteBandwidth).filter(v => typeof v === 'number').map(bw => ({ value: bw, label: LTE_BANDWIDTH_CONFIG[bw as LteBandwidth].label }))} />
        </AccordionSection>
        <AccordionSection title="eNodeB Configuration">
            {inputs.linkDirection === LinkDirection.DL && <InputSlider label="Transmit Power" unit="dBm" value={inputs.eNodeBTxPower} onChange={v => handleInputChange('eNodeBTxPower', v)} min={20} max={50} step={0.5} />}
            <InputSlider label="Noise Figure" unit="dB" value={inputs.eNodeBNoiseFigure} onChange={v => handleInputChange('eNodeBNoiseFigure', v)} min={0} max={15} step={0.1} />
            <InputSlider label="Target SINR" unit="dB" value={inputs.targetSINR} onChange={v => handleInputChange('targetSINR', v)} min={-20} max={30} step={0.5} />
            <InputSlider label="Cable Loss" unit="dB" value={inputs.eNodeBCableLoss} onChange={v => handleInputChange('eNodeBCableLoss', v)} min={0} max={10} step={0.1} />
            <InputSlider label="eNodeB Antenna Gain" unit="dBi" value={inputs.eNodeBAntennaGain} onChange={v => handleInputChange('eNodeBAntennaGain', v)} min={0} max={30} step={0.5} />
            <InputSlider label="eNodeB Antenna Height" unit="m" value={inputs.eNodeBAntennaHeight} onChange={v => handleInputChange('eNodeBAntennaHeight', v)} min={10} max={150} step={1} />
        </AccordionSection>
        <AccordionSection title="UE Configuration">
            {inputs.linkDirection === LinkDirection.UL && <InputSlider label="Transmit Power" unit="dBm" value={inputs.ueTxPower} onChange={v => handleInputChange('ueTxPower', v)} min={0} max={24} step={0.5} />}
            <InputSlider label="Cable Loss" unit="dB" value={inputs.ueCableLoss} onChange={v => handleInputChange('ueCableLoss', v)} min={0} max={5} step={0.1} />
            {inputs.linkDirection === LinkDirection.UL && 
                <InputSlider label="UE Antenna Gain" unit="dBi" value={inputs.ueAntennaGain} onChange={v => handleInputChange('ueAntennaGain', v)} min={-5} max={5} step={0.5} tooltip="UE's transmit antenna gain, for Uplink." />
            }
            {inputs.linkDirection === LinkDirection.DL &&
                <InputSlider label="UE Rx Antenna Gain" unit="dBi" value={inputs.ueRxAntennaGain} onChange={v => handleInputChange('ueRxAntennaGain', v)} min={-5} max={5} step={0.5} tooltip="UE's receiver antenna gain, for Downlink." />
            }
            <InputSlider label="UE Antenna Height" unit="m" value={inputs.ueAntennaHeight} onChange={v => handleInputChange('ueAntennaHeight', v)} min={0.5} max={10} step={0.1} />
        </AccordionSection>
        <AccordionSection title="Path Loss & Propagation">
            <Select label="Propagation Model" value={inputs.propagationModel} onChange={v => handleInputChange('propagationModel', v)} options={Object.values(LtePropagationModel).map(p => ({ value: p, label: p }))} tooltip="Classic empirical models for macro-cell path loss. The model will auto-adjust based on the selected frequency."/>
            <div className="p-3 bg-slate-900/70 rounded-lg border border-slate-700">
                <h4 className="text-sm font-semibold text-cyan-400 mb-2">{LTE_PROPAGATION_MODEL_DESCRIPTIONS[inputs.propagationModel as keyof typeof LTE_PROPAGATION_MODEL_DESCRIPTIONS].title}</h4>
                <p className="text-xs text-slate-400">{LTE_PROPAGATION_MODEL_DESCRIPTIONS[inputs.propagationModel as keyof typeof LTE_PROPAGATION_MODEL_DESCRIPTIONS].description}</p>
            </div>
        </AccordionSection>
        <AccordionSection title="Additional Losses">
            <InputSlider label="Body Loss" unit="dB" value={inputs.bodyLoss} onChange={v => handleInputChange('bodyLoss', v)} min={0} max={10} step={0.5} tooltip="Signal loss from obstruction by the user's body." />
            <InputSlider label="Slow Fading Margin" unit="dB" value={inputs.slowFadingMargin} onChange={v => handleInputChange('slowFadingMargin', v)} min={0} max={15} step={0.5} tooltip="Compensates for large-scale signal fluctuations due to shadowing."/>
            <InputSlider label="Foliage Loss" unit="dB" value={inputs.foliageLoss} onChange={v => handleInputChange('foliageLoss', v)} min={0} max={20} step={0.5} tooltip="Signal attenuation from trees and vegetation."/>
            <InputSlider label="Rain/Ice Margin" unit="dB" value={inputs.rainIceMargin} onChange={v => handleInputChange('rainIceMargin', v)} min={0} max={5} step={0.1} tooltip="Additional margin for precipitation, more relevant at higher frequencies."/>
            <InputSlider label="Interference Margin" unit="dB" value={inputs.interferenceMargin} onChange={v => handleInputChange('interferenceMargin', v)} min={0} max={10} step={0.1} tooltip="Accounts for interference from other cells and sources."/>
            <Select label="Coverage Type" value={inputs.coverageType} onChange={v => handleInputChange('coverageType', v)} options={Object.values(CoverageType).map(c => ({ value: c, label: c }))} />
            {inputs.coverageType === CoverageType.Indoor && (
                <InputSlider label="Building Penetration Loss" unit="dB" value={inputs.buildingPenetrationLoss} onChange={v => handleInputChange('buildingPenetrationLoss', v)} min={0} max={50} step={1} tooltip="Loss from signal passing through exterior walls. Varies by material."/>
            )}
        </AccordionSection>
    </div>
  );
};

export default LteCalculator;
