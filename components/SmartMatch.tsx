import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'framer-motion';

interface SmartMatchProps {
    inputs: any;
    results: any;
    tech: 'NR' | 'LTE';
}

const SmartMatch: React.FC<SmartMatchProps> = ({ inputs, results, tech }) => {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getSuggestions = async () => {
        setIsLoading(true);
        setError(null);
        setSuggestions([]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

            const prompt = `
                Act as a senior radio network optimization expert for ${tech} technology.
                Analyze the following link budget calculation and provide three concise, actionable suggestions to improve the link budget, especially if the status is "Fail".
                For each suggestion, briefly explain why it helps. Format the output as a numbered list.

                Current Configuration:
                - Link Direction: ${inputs.linkDirection}
                - Cell Radius: ${inputs.cellRadius} m
                - Frequency: ${inputs.frequency} MHz
                - Propagation Model: ${inputs.propagationModel}
                - Transmitter Power: ${inputs.linkDirection === 'UL' ? (tech === 'NR' ? inputs.utTxPower : inputs.ueTxPower) : (tech === 'NR' ? inputs.gNodeBTxPower : inputs.eNodeBTxPower)} dBm
                - Transmitter Antenna Gain: ${inputs.linkDirection === 'UL' ? (tech === 'NR' ? inputs.utAntennaGain : inputs.ueAntennaGain) : (tech === 'NR' ? inputs.gNodeBAntennaGain : inputs.eNodeBAntennaGain)} dBi
                - Receiver Antenna Gain: ${inputs.linkDirection === 'UL' ? (tech === 'NR' ? inputs.gNodeBAntennaGain : inputs.eNodeBAntennaGain) : (tech === 'NR' ? inputs.utAntennaGain : inputs.ueRxAntennaGain)} dBi
                - Target SINR: ${inputs.targetSINR} dB
                - Other losses (Body, Fading, Foliage, etc.): ${(results.fullPathLoss - results.propagationLoss).toFixed(2)} dB

                Calculation Results:
                - Path Loss: ${results.propagationLoss.toFixed(2)} dB
                - Full Path Loss: ${results.fullPathLoss.toFixed(2)} dB
                - Reception Sensitivity: ${results.rxSensitivity.toFixed(2)} dBm
                - Final Link Budget: ${results.linkBudget.toFixed(2)} dBm
                - Radio Channel Status: ${results.radioChannelStatus}

                Provide exactly three numbered suggestions. Each suggestion must start with a bolded title using markdown, like "**Suggestion Title:**".
            `;

            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
            });

            const text = response.text;
            const parsedSuggestions = text.split('\n').filter(line => line.match(/^\d+\.\s/)).map(line => line.trim().replace(/^\d+\.\s*/, ''));
            setSuggestions(parsedSuggestions);

        } catch (err) {
            console.error("Error fetching suggestions:", err);
            setError("Failed to get suggestions. Please check the API configuration.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-900/50 backdrop-blur-sm p-4 rounded-xl mt-4 border border-cyan-500/30">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className='flex items-center gap-3'>
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <div>
                        <h3 className="text-lg font-bold text-cyan-400">AI-Powered Optimization</h3>
                        <p className="text-xs text-slate-400 -mt-1">Let Gemini analyze your setup and suggest improvements.</p>
                    </div>
                </div>
                <button
                    onClick={getSuggestions}
                    disabled={isLoading}
                    className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 px-6 rounded-lg text-sm transition-all duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-cyan-500/30"
                >
                     {isLoading ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Analyzing...
                        </>
                     ) : "Generate Suggestions"}
                </button>
            </div>
            
            <div className="mt-4">
                <AnimatePresence>
                    {isLoading && (
                         <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex justify-center items-center h-24"
                          >
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                        </motion.div>
                    )}
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    {suggestions.length > 0 && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-4"
                        >
                            {suggestions.map((suggestion, index) => {
                                const parts = suggestion.split('**');
                                const title = parts.length > 1 ? parts[1] : `Suggestion ${index + 1}`;
                                const description = (parts.length > 2 ? parts[2] : suggestion).replace(/^:\s*/, '');
                                
                                return (
                                <motion.div 
                                    key={index} 
                                    className="bg-slate-800/50 p-4 rounded-lg text-sm border border-slate-700"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0, transition: { delay: index * 0.1 } }}
                                >
                                    <h4 className="font-bold text-cyan-400 mb-2">{title}</h4>
                                    <p className="text-slate-300 text-xs">{description}</p>
                                </motion.div>
                            )})}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SmartMatch;
