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
    positive: 'text-emerald-600 dark:text-emerald-400 font-semibold',
    negative: 'text-rose-600 dark:text-rose-400 font-semibold',
    neutral: 'text-zinc-500 dark:text-zinc-400 font-medium',
  }[subValueType];

  return (
    <div className="bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-5 transition-all duration-150 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700">
      <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        {title}
      </p>
      
      <div className="mt-3">
        <h3 className="text-2xl lg:text-3xl font-mono font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {prefix}{value}
        </h3>
        
        {subValue && (
          <p className={`text-xs font-mono mt-1.5 flex items-center gap-1 ${subColorClasses}`}>
            {subValue}
          </p>
        )}
      </div>
    </div>
  );
};
