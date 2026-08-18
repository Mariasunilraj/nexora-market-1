import React, { useEffect, useRef, memo } from 'react';

interface TradingViewTechnicalGaugeProps {
  symbol?: string;
  theme?: 'dark' | 'light';
}

export const TradingViewTechnicalGauge: React.FC<TradingViewTechnicalGaugeProps> = memo(({
  symbol = 'NASDAQ:AAPL',
  theme = 'dark',
}) => {
  const container = useRef<HTMLDivElement>(null);
  const formattedSymbol = symbol.includes(':') ? symbol : `NASDAQ:${symbol.toUpperCase()}`;

  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      interval: '1D',
      width: '100%',
      isTransparent: true,
      height: 400,
      symbol: formattedSymbol,
      showIntervalTabs: true,
      displayMode: 'single',
      locale: 'en',
      colorTheme: theme,
    });

    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [formattedSymbol, theme]);

  return (
    <div className="tradingview-widget-container w-full" ref={container}>
      <div className="tradingview-widget-container__widget" />
    </div>
  );
});

TradingViewTechnicalGauge.displayName = 'TradingViewTechnicalGauge';
