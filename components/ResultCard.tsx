
import React from 'react';

interface ResultCardProps {
  title: string;
  value: string | number;
  unit?: string;
  status?: 'Pass' | 'Fail' | 'Neutral';
  description: string;
}

const ResultCard: React.FC<ResultCardProps> = ({ title, value, unit, status = 'Neutral', description }) => {
  const statusColors = {
    Pass: 'text-green-400 border-green-500/50',
    Fail: 'text-red-400 border-red-500/50',
    Neutral: 'text-cyan-400 border-cyan-500/50',
  };

  return (
    <div className={`bg-slate-800/60 rounded-lg p-4 shadow-lg border-t-4 ${statusColors[status]}`}>
      <div className="text-sm text-slate-400">{title}</div>
      <div className={`text-3xl font-bold my-1 ${statusColors[status]}`}>
        {value} <span className="text-lg">{unit}</span>
      </div>
      <div className="text-xs text-slate-500">{description}</div>
    </div>
  );
};

export default ResultCard;
