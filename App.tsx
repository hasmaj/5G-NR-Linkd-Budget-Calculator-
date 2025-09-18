
import React, { useState, useMemo } from 'react';
import { CalculatorInputs, LinkDirection, Numerology, PropagationModel, CoverageType } from './types';
import Card from './components/Card';
import InputSlider from './components/InputSlider';
import Select from './components/Select';
import ResultCard from './components/ResultCard';

const NUMEROLOGY_CONFIG = {
  [Numerology.N0]: { label: '0: µ:15kHz', scs: 15000 },
  [Numerology.N1]: { label: '1: µ:30kHz', scs: 30000 },
  [Numerology.N2]: { label: '2: µ:60kHz', scs: 60000 },
  [Numerology.N3]: { label: '3: µ:120kHz', scs: 120000 },
  [Numerology.N4]: { label: '4: µ:240kHz', scs: 240000 },
};

const App: React.FC = () => {
  const [inputs, setInputs] = useState<CalculatorInputs>({
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

  const handleInputChange = <K extends keyof CalculatorInputs>(field: K, value: CalculatorInputs[K]) => {
    // Coerce to number if the original type was number
    const originalValue = inputs[field];
    const finalValue = typeof originalValue === 'number' ? Number(value) : value;
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

    // Intermediate Calculations
    const subcarrierQuantity = numRB * 12;
    const subcarrierSpacingHz = NUMEROLOGY_CONFIG[numerology].scs;
    const bandwidthHz = subcarrierQuantity * subcarrierSpacingHz;
    const thermalNoise = -174 + 10 * Math.log10(bandwidthHz);
    
    // Path Loss Calculation (3GPP 38.901 Models)
    const fc_GHz = frequency / 1000;
    const d_2D = cellRadius;
    const d_3D = Math.sqrt(d_2D**2 + (gNodeBAntennaHeight - utAntennaHeight)**2);
    
    let propagationLoss = 0;
    switch(propagationModel) {
        case PropagationModel.UMa_NLOS: {
            const d_BP = 4 * (gNodeBAntennaHeight - 1) * (utAntennaHeight - 1) * (fc_GHz * 1e9) / (3e8);
            const PL1 = 28.0 + 22 * Math.log10(d_3D) + 20 * Math.log10(fc_GHz);
            const PL2 = 28.0 + 40 * Math.log10(d_3D) + 20 * Math.log10(fc_GHz) - 9 * Math.log10((d_BP**2) + (gNodeBAntennaHeight - utAntennaHeight)**2);
            propagationLoss = Math.max(PL1, PL2);
            break;
        }
        case PropagationModel.UMi_NLOS:
            propagationLoss = 36.7 * Math.log10(d_3D) + 22.7 + 26 * Math.log10(fc_GHz);
            break;
        case PropagationModel.RMa_NLOS: {
            const d_BP = 2 * Math.PI * gNodeBAntennaHeight * utAntennaHeight * (fc_GHz * 1e9) / (3e8);
             if (d_2D <= d_BP) {
                propagationLoss = 20 * Math.log10(40 * Math.PI * d_3D * fc_GHz / 3) + 10.5 - 0.2 * (utAntennaHeight-1.5) - 0.2*(gNodeBAntennaHeight - 35);
             } else {
                propagationLoss = 40 * Math.log10(d_3D) - 20*Math.log10(d_BP) + 20*Math.log10(40*Math.PI*d_BP*fc_GHz/3) + 10.5 - 0.2 * (utAntennaHeight-1.5) - 0.2*(gNodeBAntennaHeight - 35);
             }
            break;
        }
    }
    
    const buildingLoss = coverageType === CoverageType.Indoor ? buildingPenetrationLoss : 0;
    const fullPathLoss = propagationLoss + bodyLoss + slowFadingMargin + foliageLoss + rainIceMargin + interferenceMargin + buildingLoss;
    
    let linkBudget, rxSensitivity;

    if (linkDirection === LinkDirection.UL) {
        // UT is Tx, gNodeB is Rx
        rxSensitivity = gNodeBNoiseFigure + thermalNoise + targetSINR;
        linkBudget = utTxPower - utCableLoss + utAntennaGain - fullPathLoss + gNodeBAntennaGain - gNodeBCableLoss;
    } else { // DL
        // gNodeB is Tx, UT is Rx
        // Assuming UT has same noise figure and SINR requirement for simplicity as it's not specified
        rxSensitivity = gNodeBNoiseFigure + thermalNoise + targetSINR; 
        linkBudget = gNodeBTxPower - gNodeBCableLoss + gNodeBAntennaGain - fullPathLoss + utAntennaGain - utCableLoss;
    }

    const radioChannelStatus: 'Pass' | 'Fail' = linkBudget >= rxSensitivity ? 'Pass' : 'Fail';

    return {
        subcarrierQuantity,
        thermalNoise,
        rxSensitivity,
        propagationLoss,
        fullPathLoss,
        linkBudget,
        radioChannelStatus
    };
  }, [inputs]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">5G NR Link Budget Calculator</h1>
          <p className="mt-2 text-lg text-slate-400">Calculate 5G NR link budget based on 3GPP 38.901 standard.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <ResultCard 
                title="Link Budget" 
                value={calculatedResults.linkBudget.toFixed(2)} 
                unit="dBm" 
                status={calculatedResults.radioChannelStatus}
                description="Signal level at the receiver."
            />
            <ResultCard 
                title="Radio Channel Status" 
                value={calculatedResults.radioChannelStatus} 
                status={calculatedResults.radioChannelStatus}
                description="Indicates if the link is viable."
            />
            <ResultCard 
                title="Reception Sensitivity" 
                value={calculatedResults.rxSensitivity.toFixed(2)} 
                unit="dBm"
                description="Minimum signal strength for successful reception."
            />
        </div>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Input Data">
                    <InputSlider label="Cell Radius" unit="m" value={inputs.cellRadius} onChange={v => handleInputChange('cellRadius', v)} min={10} max={5000} step={10} />
                    <InputSlider label="Centre Frequency" unit="MHz" value={inputs.frequency} onChange={v => handleInputChange('frequency', v)} min={500} max={100000} step={10} tooltip="Supports 0.5–100 GHz"/>
                    <Select label="Direction of Link" value={inputs.linkDirection} onChange={v => handleInputChange('linkDirection', v)} options={Object.values(LinkDirection).map(d => ({ value: d, label: d }))} />
                    <InputSlider label="Number of RB" unit="" value={inputs.numRB} onChange={v => handleInputChange('numRB', v)} min={1} max={273} step={1} />
                    <Select label="Numerology (SCS)" value={inputs.numerology} onChange={v => handleInputChange('numerology', v)} options={Object.values(Numerology).filter(v => typeof v === 'number').map(n => ({ value: n, label: NUMEROLOGY_CONFIG[n as Numerology].label }))} />
                    <div>
                        <label className="text-sm font-medium">Subcarrier Quantity</label>
                        <p className="text-lg font-mono p-2 bg-slate-900 rounded-md mt-1">{calculatedResults.subcarrierQuantity}</p>
                        <p className="text-xs text-slate-500 mt-1">= Number of used RB * 12</p>
                    </div>
                </Card>

                <Card title="gNodeB Configuration">
                     {inputs.linkDirection === 'DL' && <InputSlider label="Transmit Power" unit="dBm" value={inputs.gNodeBTxPower} onChange={v => handleInputChange('gNodeBTxPower', v)} min={0} max={60} step={1} />}
                    <InputSlider label="Noise Figure" unit="dB" value={inputs.gNodeBNoiseFigure} onChange={v => handleInputChange('gNodeBNoiseFigure', v)} min={0} max={15} step={0.1} />
                    <InputSlider label="Target SINR" unit="dB" value={inputs.targetSINR} onChange={v => handleInputChange('targetSINR', v)} min={-20} max={30} step={0.5} />
                    <InputSlider label="Cable Loss" unit="dB" value={inputs.gNodeBCableLoss} onChange={v => handleInputChange('gNodeBCableLoss', v)} min={0} max={10} step={0.1} />
                    <InputSlider label="Antenna Gain" unit="dBi" value={inputs.gNodeBAntennaGain} onChange={v => handleInputChange('gNodeBAntennaGain', v)} min={0} max={30} step={0.5} />
                    <InputSlider label="Antenna Height" unit="m" value={inputs.gNodeBAntennaHeight} onChange={v => handleInputChange('gNodeBAntennaHeight', v)} min={5} max={150} step={1} />
                </Card>
                
                <Card title="UT Configuration">
                    {inputs.linkDirection === 'UL' && <InputSlider label="Transmit Power" unit="dBm" value={inputs.utTxPower} onChange={v => handleInputChange('utTxPower', v)} min={0} max={30} step={1} />}
                    <InputSlider label="Cable Loss" unit="dB" value={inputs.utCableLoss} onChange={v => handleInputChange('utCableLoss', v)} min={0} max={5} step={0.1} />
                    <InputSlider label="Antenna Gain" unit="dBi" value={inputs.utAntennaGain} onChange={v => handleInputChange('utAntennaGain', v)} min={-5} max={10} step={0.5} />
                    <InputSlider label="Antenna Height" unit="m" value={inputs.utAntennaHeight} onChange={v => handleInputChange('utAntennaHeight', v)} min={0.5} max={10} step={0.1} />
                </Card>

                 <Card title="Path Loss Calculation">
                    <Select label="Propagation Model" value={inputs.propagationModel} onChange={v => handleInputChange('propagationModel', v)} options={Object.values(PropagationModel).map(p => ({ value: p, label: p }))} tooltip="5G NR uses 3D propagation models defined in 3GPP 38.901 (0.5–100 GHz)."/>
                    <div>
                        <label className="text-sm font-medium">Propagation Model Path Loss</label>
                        <p className="text-lg font-mono p-2 bg-slate-900 rounded-md mt-1">{calculatedResults.propagationLoss.toFixed(2)} dB</p>
                    </div>
                 </Card>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
                <Card title="Additional Losses">
                    <InputSlider label="Body Loss" unit="dB" value={inputs.bodyLoss} onChange={v => handleInputChange('bodyLoss', v)} min={0} max={40} step={0.5} tooltip="Typical Body Loss @3.5GHz: 3-5dB, @28GHz: 8-40dB" />
                    <InputSlider label="Slow Fading Margin" unit="dB" value={inputs.slowFadingMargin} onChange={v => handleInputChange('slowFadingMargin', v)} min={0} max={15} step={0.5} tooltip="Source: 3GPP 38.901. O2O Urban: 7dB, O2I Urban: 8dB"/>
                    <InputSlider label="Foliage Loss" unit="dB" value={inputs.foliageLoss} onChange={v => handleInputChange('foliageLoss', v)} min={0} max={30} step={0.5} tooltip="Typical Foliage Loss (Dense Tree) @3.5GHz: 8.5dB, @28GHz: 15dB"/>
                    <InputSlider label="Rain/Ice Margin" unit="dB" value={inputs.rainIceMargin} onChange={v => handleInputChange('rainIceMargin', v)} min={0} max={10} step={0.1} tooltip="Typical Rain/Ice Margin @3.5GHz: 0dB, @28GHz: 3dB"/>
                    <InputSlider label="Interference Margin" unit="dB" value={inputs.interferenceMargin} onChange={v => handleInputChange('interferenceMargin', v)} min={0} max={10} step={0.1} tooltip="Typical Interference Margin DL @3.5GHz: 6dB, UL @3.5GHz: 2dB"/>
                    <Select label="Coverage Type" value={inputs.coverageType} onChange={v => handleInputChange('coverageType', v)} options={Object.values(CoverageType).map(c => ({ value: c, label: c }))} />
                    {inputs.coverageType === CoverageType.Indoor && (
                        <InputSlider label="Building Penetration" unit="dB" value={inputs.buildingPenetrationLoss} onChange={v => handleInputChange('buildingPenetrationLoss', v)} min={0} max={50} step={1} tooltip="Loss from signal passing through exterior walls. Varies by material."/>
                    )}
                </Card>
                 <Card title="Calculation Summary">
                    <div className="flex justify-between items-center text-sm">
                        <span>Full Path Loss:</span>
                        <span className="font-bold text-lg text-amber-400">{calculatedResults.fullPathLoss.toFixed(2)} dB</span>
                    </div>
                     <div className="flex justify-between items-center text-sm">
                        <span>Reception Sensitivity:</span>
                        <span className="font-bold text-lg text-cyan-400">{calculatedResults.rxSensitivity.toFixed(2)} dBm</span>
                    </div>
                     <div className="flex justify-between items-center text-sm">
                        <span>Link Budget (Rx Signal):</span>
                        <span className="font-bold text-lg text-green-400">{calculatedResults.linkBudget.toFixed(2)} dBm</span>
                    </div>
                 </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
