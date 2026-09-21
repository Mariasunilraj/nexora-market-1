import React from 'react';

interface StockLogoProps {
  symbol: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StockLogo: React.FC<StockLogoProps> = ({ symbol, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
  }[size];

  // Specific logo brand icons and styling with sharp geometric borders
  switch (symbol.toUpperCase()) {
    case 'AAPL':
      return (
        <div className={`${sizeClasses} bg-zinc-900 text-white dark:bg-zinc-800 flex items-center justify-center font-bold border border-zinc-700`}>
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 170 170">
            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.6-7.79-11.74-14.25-5.99-9.35-10.7-19.92-14.12-31.72-3.43-11.8-5.14-23.01-5.14-33.63 0-14.45 3.65-26.65 10.95-36.6 7.3-9.95 16.5-15.02 27.6-15.21 4.8 0 10.18 1.25 16.14 3.75 5.96 2.5 9.77 3.75 11.43 3.75 1.45 0 5.41-1.31 11.88-3.93 6.47-2.62 12.08-3.7 16.83-3.26 12.5.76 22.42 5.34 29.76 13.73-10.9 6.64-16.23 15.7-16 27.18.23 9.04 3.69 16.63 10.38 22.77 6.69 6.14 14.64 9.69 23.85 10.65-2.02 6.2-4.49 12.56-7.41 19.08zM119.22 31.84c0-7.39 2.65-14.28 7.95-20.67 5.3-6.39 11.85-10.45 19.65-12.17.65 2.18.98 4.35.98 6.53 0 7.39-2.73 14.38-8.19 20.97-5.46 6.59-12.04 10.45-19.74 11.58-.22-2.07-.65-4.15-.65-6.24z"/>
          </svg>
        </div>
      );
    case 'MSFT':
      return (
        <div className={`${sizeClasses} bg-zinc-100 dark:bg-zinc-800 p-1 flex items-center justify-center border border-zinc-300 dark:border-zinc-700`}>
          <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5">
            <div className="bg-[#F25022]"></div>
            <div className="bg-[#7FBA00]"></div>
            <div className="bg-[#00A4EF]"></div>
            <div className="bg-[#FFB900]"></div>
          </div>
        </div>
      );
    case 'GOOGL':
      return (
        <div className={`${sizeClasses} bg-white dark:bg-zinc-800 text-zinc-800 dark:text-white flex items-center justify-center font-black border border-zinc-300 dark:border-zinc-700`}>
          <span className="text-red-500 font-black">G</span>
        </div>
      );
    case 'AMZN':
      return (
        <div className={`${sizeClasses} bg-[#131921] text-amber-400 flex items-center justify-center font-bold border border-zinc-700`}>
          <span className="font-extrabold font-mono">a</span>
        </div>
      );
    case 'TSLA':
      return (
        <div className={`${sizeClasses} bg-[#E82127] text-white flex items-center justify-center font-black border border-red-700`}>
          <span className="font-mono font-bold tracking-tighter">T</span>
        </div>
      );
    case 'NVDA':
      return (
        <div className={`${sizeClasses} bg-[#76B900] text-black flex items-center justify-center font-black border border-emerald-600`}>
          <span className="font-mono font-bold text-white">NV</span>
        </div>
      );
    case 'META':
      return (
        <div className={`${sizeClasses} bg-blue-600 text-white flex items-center justify-center font-black border border-blue-700`}>
          <span className="font-mono font-bold">M</span>
        </div>
      );
    default:
      return (
        <div className={`${sizeClasses} bg-blue-600 text-white flex items-center justify-center font-mono font-bold border border-blue-700 uppercase tracking-tight`}>
          {symbol.slice(0, 2)}
        </div>
      );
  }
};
