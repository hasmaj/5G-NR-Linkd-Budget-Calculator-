
import React from 'react';

interface SelectProps {
  label: string;
  value: string | number;
  onChange: (value: any) => void;
  options: { value: string | number; label: string }[];
  tooltip?: string;
}

const Select: React.FC<SelectProps> = ({ label, value, onChange, options, tooltip }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">
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
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
