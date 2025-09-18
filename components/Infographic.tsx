import React from 'react';
import { TowerIcon, UEIcon, PlusIcon, MinusIcon } from './icons';
import { motion, AnimatePresence } from 'framer-motion';
import SmartMatch from './SmartMatch';

interface InfographicProps {
    results: any;
    inputs: any;
    tech: 'NR' | 'LTE';
}

const formatValue = (val: number) => val.toFixed(2);

const MotionDiv = motion.div;

const Infographic: React.FC<InfographicProps> = ({ results, inputs, tech }) => {
    const isUplink = inputs.linkDirection === 'UL';
    const isNr = tech === 'NR';
    
    const txPower = isUplink ? (isNr ? inputs.utTxPower : inputs.ueTxPower) : (isNr ? inputs.gNodeBTxPower : inputs.eNodeBTxPower);
    const txAntennaGain = isUplink ? (isNr ? inputs.utAntennaGain : inputs.ueAntennaGain) : (isNr ? inputs.gNodeBAntennaGain : inputs.eNodeBAntennaGain);
    const rxAntennaGain = isUplink ? (isNr ? inputs.gNodeBAntennaGain : inputs.eNodeBAntennaGain) : (isNr ? inputs.utAntennaGain : inputs.ueRxAntennaGain);
    const pathLoss = results.propagationLoss;
    const otherLosses = results.fullPathLoss - pathLoss;

    const transmitter = isUplink ? { icon: <UEIcon className="w-12 h-12 text-cyan-400"/>, name: isNr ? 'UT' : 'UE' } : { icon: <TowerIcon className="w-12 h-12 text-cyan-400"/>, name: isNr ? 'gNodeB' : 'eNodeB' };
    const receiver = isUplink ? { icon: <TowerIcon className="w-12 h-12 text-cyan-400"/>, name: isNr ? 'gNodeB' : 'eNodeB' } : { icon: <UEIcon className="w-12 h-12 text-cyan-400"/>, name: isNr ? 'UT' : 'UE' };

    const calculateBarWidth = (currentPower: number, maxPower: number) => {
        const minPower = results.rxSensitivity - 20;
        const range = maxPower - minPower;
        const position = currentPower - minPower;
        return Math.max(0, Math.min(100, (position / range) * 100));
    };

    const maxSignal = txPower + txAntennaGain;
    const signalAfterPathLoss = txPower + txAntennaGain - pathLoss;
    const signalAfterOtherLosses = signalAfterPathLoss - otherLosses;
    const finalSignal = results.linkBudget;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
    };
    
    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 },
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            <h2 className="text-xl font-bold text-white tracking-tight text-center">
                Link Budget Analysis: <span className="text-cyan-400">{inputs.linkDirection}</span>
            </h2>

            <MotionDiv className="flex-grow" variants={containerVariants} initial="hidden" animate="visible">
                <div className="flex items-center w-full h-full">
                    {/* Transmitter */}
                    <MotionDiv variants={itemVariants} className="flex flex-col items-center space-y-2 w-24 text-center">
                        {transmitter.icon}
                        <span className="text-sm font-semibold">Transmitter</span>
                        <span className="text-xs text-slate-400">{transmitter.name}</span>
                    </MotionDiv>

                    {/* Signal Path */}
                    <div className="flex-1 px-4 space-y-2">
                        {/* Power Bar */}
                        <div className="relative h-10 bg-slate-900/50 rounded-lg overflow-hidden border border-slate-700">
                            <motion.div 
                                className="absolute h-full bg-gradient-to-r from-green-500 to-cyan-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${calculateBarWidth(txPower + txAntennaGain, maxSignal)}%` }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                            />
                            <motion.div 
                                className="absolute h-full bg-gradient-to-r from-amber-500 to-yellow-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${calculateBarWidth(signalAfterPathLoss, maxSignal)}%` }}
                                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
                            />
                            <motion.div 
                                className="absolute h-full bg-gradient-to-r from-red-600 to-orange-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${calculateBarWidth(signalAfterOtherLosses, maxSignal)}%` }}
                                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.4 }}
                            />
                            <motion.div 
                                className="absolute h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${calculateBarWidth(finalSignal, maxSignal)}%` }}
                                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.6 }}
                            />
                            <motion.div
                                className="absolute top-0 bottom-0 border-l-2 border-dashed border-red-400"
                                title={`Rx Sensitivity: ${formatValue(results.rxSensitivity)} dBm`}
                                initial={{ left: '100%' }}
                                animate={{ left: `${calculateBarWidth(results.rxSensitivity, maxSignal)}%` }}
                                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.8 }}
                             >
                                 <div className="absolute -top-2 -right-2 text-red-400 text-xs transform translate-x-1/2">
                                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/></svg>
                                 </div>
                             </motion.div>
                        </div>
                        {/* Legend */}
                         <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-2 text-xs">
                            <div className="flex items-center"><PlusIcon className="w-4 h-4 text-green-400 mr-1.5"/>Tx Power + Gain: <span className="font-mono ml-1 text-white">{formatValue(txPower + txAntennaGain)} dBm</span></div>
                            <div className="flex items-center"><MinusIcon className="w-4 h-4 text-amber-400 mr-1.5"/>Path Loss: <span className="font-mono ml-1 text-white">{formatValue(pathLoss)} dB</span></div>
                            <div className="flex items-center"><MinusIcon className="w-4 h-4 text-red-500 mr-1.5"/>Other Losses: <span className="font-mono ml-1 text-white">{formatValue(otherLosses)} dB</span></div>
                            <div className="flex items-center"><PlusIcon className="w-4 h-4 text-cyan-400 mr-1.5"/>Rx Gain: <span className="font-mono ml-1 text-white">{formatValue(rxAntennaGain)} dB</span></div>
                        </div>
                    </div>

                    {/* Receiver */}
                    <MotionDiv variants={itemVariants} className="flex flex-col items-center space-y-2 w-24 text-center">
                        {receiver.icon}
                        <span className="text-sm font-semibold">Receiver</span>
                        <span className="text-xs text-slate-400">{receiver.name}</span>
                    </MotionDiv>
                </div>
            </MotionDiv>
            
            <SmartMatch inputs={inputs} results={results} tech={tech} />
        </div>
    );
};

export default Infographic;
