import React, { useEffect, useRef, memo } from 'react';

interface TradingViewFinancialsWidgetProps {
  symbol?: string;
  theme?: 'dark' | 'light';
}

export const TradingViewFinancialsWidget: React.FC<TradingViewFinancialsWidgetProps> = memo(({
  symbol = 'NASDAQ:AAPL',
  theme = 'dark',
}) => {
  const container = useRef<HTMLDivElement>(null);
  const formattedSymbol = symbol.includes(':') ? symbol : `NASDAQ:${symbol.toUpperCase()}`;

  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-financials.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: formattedSymbol,
      colorTheme: theme,
      displayMode: 'regular',
      isTransparent: true,
      locale: 'en',
      width: '100%',
      height: 480,
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

TradingViewFinancialsWidget.displayName = 'TradingViewFinancialsWidget';
