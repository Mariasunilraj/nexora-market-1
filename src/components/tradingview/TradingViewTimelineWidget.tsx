import React, { useEffect, useRef, memo } from 'react';

interface TradingViewTimelineWidgetProps {
  symbol?: string;
  theme?: 'dark' | 'light';
}

export const TradingViewTimelineWidget: React.FC<TradingViewTimelineWidgetProps> = memo(({
  theme = 'dark',
}) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      displayMode: 'regular',
      feedMode: 'all_symbols',
      colorTheme: theme,
      isTransparent: true,
      locale: 'en',
      width: '100%',
      height: 380,
    });

    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [theme]);

  return (
    <div className="tradingview-widget-container w-full" ref={container}>
      <div className="tradingview-widget-container__widget" />
    </div>
  );
});

TradingViewTimelineWidget.displayName = 'TradingViewTimelineWidget';
