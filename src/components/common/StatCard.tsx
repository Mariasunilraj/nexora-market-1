import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  subValueType?: 'positive' | 'negative' | 'neutral';
  prefix?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subValue,
  subValueType = 'positive',
  prefix
}) => {
  const subColorClasses = {
    positive: 'text-emerald-600 dark:text-emerald-400 font-medium',
    negative: 'text-rose-600 dark:text-rose-400 font-medium',
    neutral: 'text-slate-500 dark:text-slate-400',
  }[subValueType];

  return (
    <div className="bg-white dark:bg-[#0E172E] border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide">
        {title}
      </p>
      
      <div className="mt-3">
        <h3 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {prefix}{value}
        </h3>
        
        {subValue && (
          <p className={`text-xs mt-1.5 flex items-center gap-1 ${subColorClasses}`}>
            {subValue}
          </p>
        )}
      </div>
    </div>
  );
};
