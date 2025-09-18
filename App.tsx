import React, { useState } from 'react';
import NrCalculator from './components/NrCalculator';
import LteCalculator from './components/LteCalculator';
import Infographic from './components/Infographic';
import ResultCard from './components/ResultCard';
import { SignalIcon, WifiIcon, CheckCircleIcon, XCircleIcon } from './components/icons';

type Tab = 'nr' | 'lte';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('lte');
  const [results, setResults] = useState<any>(null);
  const [inputs, setInputs] = useState<any>(null);


  const renderTabContent = () => {
    switch (activeTab) {
      case 'nr':
        return <NrCalculator onCalculate={(data, inputs) => {
          setResults(data);
          setInputs(inputs);
        }} />;
      case 'lte':
        return <LteCalculator onCalculate={(data, inputs) => {
          setResults(data);
          setInputs(inputs);
        }} />;
      default:
        return null;
    }
  };
  
  const getTabClass = (tab: Tab) => {
    return activeTab === tab
      ? 'bg-cyan-600 text-white shadow-md'
      : 'bg-slate-800 text-slate-300 hover:bg-slate-700/80';
  };

  const handleTabChange = (tab: Tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      setResults(null);
      setInputs(null);
    }
  };

  const formatValue = (val: number | undefined) => val != null ? val.toFixed(2) : '--';
  const status = results?.radioChannelStatus;

  return (
    <div className="min-h-screen font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-screen-2xl mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">5G NR & LTE Link Budget Calculator</h1>
          <p className="mt-2 text-lg text-slate-400">An intelligent tool for network planning and optimization.</p>
        </header>

        {/* Results Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <ResultCard 
                title="Link Budget"
                value={formatValue(results?.linkBudget)}
                unit="dBm"
                description="Final Received Signal Strength"
                icon={<SignalIcon className="w-6 h-6 text-cyan-400" />}
                colorClass="text-cyan-400"
            />
            <ResultCard 
                title="Reception Sensitivity"
                value={formatValue(results?.rxSensitivity)}
                unit="dBm"
                description="Required Minimum Signal"
                icon={<WifiIcon className="w-6 h-6 text-amber-400" />}
                colorClass="text-amber-400"
            />
            <ResultCard 
                title="Radio Channel Status"
                value={status || 'N/A'}
                unit=""
                description={status ? `Margin: ${formatValue(results.linkBudget - results.rxSensitivity)} dB` : "Calculate to see status"}
                icon={status === 'Pass' ? <CheckCircleIcon className="w-6 h-6 text-green-400" /> : <XCircleIcon className="w-6 h-6 text-red-400" />}
                colorClass={status === 'Pass' ? 'text-green-400' : 'text-red-400'}
            />
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column: Controls */}
          <div className="lg:col-span-2">
             <div className="bg-slate-800/30 backdrop-blur-md rounded-xl shadow-lg border border-slate-700 p-2 sm:p-4">
                <div className="flex justify-center mb-4">
                  <div className="flex space-x-2 bg-slate-900/80 p-1 rounded-lg border border-slate-600">
                    <button
                      onClick={() => handleTabChange('nr')}
                      className={`px-6 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${getTabClass('nr')}`}
                    >
                      5G NR
                    </button>
                    <button
                      onClick={() => handleTabChange('lte')}
                      className={`px-6 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${getTabClass('lte')}`}
                    >
                      LTE
                    </button>
                  </div>
                </div>
                <div className="max-h-[calc(100vh-380px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                  {renderTabContent()}
                </div>
            </div>
          </div>

          {/* Right Column: Visualization */}
          <div className="lg:col-span-3 bg-slate-800/30 backdrop-blur-md rounded-xl shadow-lg border border-slate-700 p-4 sm:p-6 min-h-[500px]">
             {results && inputs ? (
                <Infographic 
                    results={results} 
                    inputs={inputs}
                    tech={activeTab.toUpperCase() as 'NR' | 'LTE'}
                />
             ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className='text-lg'>Awaiting Calculation</p>
                    <p>Enter parameters and calculate to see the visualization.</p>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
