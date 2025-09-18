
import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-slate-800/50 rounded-lg shadow-lg p-6 border border-slate-700 ${className}`}>
      <h2 className="text-xl font-bold mb-4 text-cyan-400 border-b border-slate-700 pb-2">{title}</h2>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export default Card;
