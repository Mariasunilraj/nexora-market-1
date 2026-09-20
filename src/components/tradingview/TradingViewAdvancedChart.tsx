import React, { useEffect, useRef, memo, useState } from 'react';

interface TradingViewAdvancedChartProps {
  symbol?: string;
  theme?: 'dark' | 'light';
  width?: string | number;
  height?: number;
  mobileHeight?: number;
}

export const TradingViewAdvancedChart: React.FC<TradingViewAdvancedChartProps> = memo(({
  symbol = 'NASDAQ:AAPL',
  theme = 'dark',
  height = 700,
  mobileHeight = 454,
}) => {
  const container = useRef<HTMLDivElement>(null);

  // Compute responsive height based on screen size (compact 454px on mobile, 700px on desktop)
  const [effectiveHeight, setEffectiveHeight] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 ? mobileHeight : height;
    }
    return height;
  });

  useEffect(() => {
    const updateSize = () => {
      const isMobile = window.innerWidth < 768;
      const targetH = isMobile ? mobileHeight : height;
      setEffectiveHeight(prev => (prev !== targetH ? targetH : prev));
    };

    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [height, mobileHeight]);

  // Normalize symbol for TradingView format (e.g. 'AAPL' -> 'NASDAQ:AAPL')
  const formattedSymbol = symbol.includes(':') ? symbol : `NASDAQ:${symbol.toUpperCase()}`;

  useEffect(() => {
    const currentContainer = container.current;
    if (!currentContainer) return;

    // Clear previous widget
    currentContainer.innerHTML = '';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.height = `${effectiveHeight - 32}px`;
    widgetDiv.style.width = '100%';
    currentContainer.appendChild(widgetDiv);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      width: '100%',
      height: effectiveHeight,
      symbol: formattedSymbol,
      interval: 'D',
      timezone: 'America/New_York',
      theme: theme,
      style: '1',
      locale: 'en',
      enable_publishing: false,
      allow_symbol_change: true,
      save_image: true,
      calendar: false,
      hide_side_toolbar: false, // Always preserve drawing tools on mobile and desktop
      hide_top_toolbar: false,
      hide_legend: false,
      hide_volume: false,
      backgroundColor: theme === 'dark' ? '#0B132B' : '#FFFFFF',
      gridColor: theme === 'dark' ? 'rgba(28, 41, 81, 0.4)' : 'rgba(226, 232, 240, 0.8)',
      watchlist: ['NASDAQ:AAPL', 'NASDAQ:MSFT', 'NASDAQ:TSLA', 'NASDAQ:NVDA', 'NASDAQ:GOOGL', 'NASDAQ:AMZN'],
      withdateranges: true,
      compareSymbols: [],
      support_host: 'https://www.tradingview.com',
      studies: [],
    });

    currentContainer.appendChild(script);

    return () => {
      if (currentContainer) {
        currentContainer.innerHTML = '';
      }
    };
  }, [formattedSymbol, theme, effectiveHeight]);

  return (
    <div
      className="tradingview-widget-container rounded-2xl overflow-hidden border border-slate-200/80 dark:border-[#1C2951] bg-white dark:bg-[#0B132B] w-full transition-colors"
      ref={container}
      style={{
        height: `${effectiveHeight}px`,
        minHeight: `${effectiveHeight}px`,
        width: '100%',
      }}
    >
      <div
        className="tradingview-widget-container__widget"
        style={{ height: `${effectiveHeight - 32}px`, minHeight: `${effectiveHeight - 32}px`, width: '100%' }}
      />
    </div>
  );
});

TradingViewAdvancedChart.displayName = 'TradingViewAdvancedChart';
