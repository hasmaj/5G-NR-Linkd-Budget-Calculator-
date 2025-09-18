import React from 'react';

interface ResultCardProps {
  title: string;
  value: string;
  unit: string;
  description: string;
  icon: React.ReactNode;
  colorClass: string;
}

const ResultCard: React.FC<ResultCardProps> = ({ title, value, unit, description, icon, colorClass }) => {
  return (
    <div className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700/80 p-4 rounded-xl shadow-lg flex items-center space-x-4`}>
      <div className={`p-3 rounded-full bg-slate-900/50 border border-slate-700`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-400">{title}</p>
        <p className={`text-2xl font-bold ${colorClass}`}>
          {value} <span className="text-lg font-medium text-slate-400">{unit}</span>
        </p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
    </div>
  );
};

export default ResultCard;