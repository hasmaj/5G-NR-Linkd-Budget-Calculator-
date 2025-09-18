import React from 'react';

interface InputSliderProps {
  label: string;
  unit: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  tooltip?: string;
}

const InputSlider: React.FC<InputSliderProps> = ({ label, unit, value, onChange, min, max, step, tooltip }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
  };

  return (
    <div>
      <label className="flex items-center justify-between text-sm font-medium text-slate-300">
        <span className="flex items-center">
            {label}
            {tooltip && (
                <div className="group relative flex items-center ml-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="absolute bottom-full mb-2 w-64 bg-slate-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 whitespace-pre-wrap shadow-lg">
                        {tooltip}
                    </div>
                </div>
            )}
        </span>
        <span className="px-2 py-1 text-xs rounded-md bg-slate-700 text-cyan-400">
          {value} {unit}
        </span>
      </label>
      <div className="flex items-center space-x-2 mt-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="w-24 bg-slate-900/50 border border-slate-700 rounded-md p-1 text-center focus:ring-cyan-500 focus:border-cyan-500"
        />
      </div>
    </div>
  );
};

export default InputSlider;