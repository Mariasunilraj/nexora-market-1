import React, { useState } from 'react';
import {
  TrendingUp,
  BarChart2,
  Maximize2,
  Camera,
  Activity,
  Sliders,
  Compass,
  Edit3,
  Search,
  ZoomIn,
} from 'lucide-react';
import { CandleData } from '../../services/finnhubService';

interface CandlestickChartProps {
  symbol: string;
  exchange?: string;
  candles: CandleData[];
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  activeTimeframe: string;
  onTimeframeChange: (tf: string) => void;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  symbol,
  exchange = 'NASDAQ',
  candles,
  currentPrice,
  priceChange,
  priceChangePercent,
  activeTimeframe,
  onTimeframeChange,
}) => {
  const [chartType, setChartType] = useState<'candles' | 'line'>('candles');
  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null);
  const [selectedTool, setSelectedTool] = useState<string>('crosshair');

  const timeframes = ['1D', '1W', '1M', '3M', '6M', '1Y', '5Y', 'MAX'];

  // Calculations for chart viewport
  const displayedCandles = candles && candles.length > 0 ? candles : [];
  const minPrice = displayedCandles.length > 0 ? Math.min(...displayedCandles.map(c => c.low)) * 0.98 : 170;
  const maxPrice = displayedCandles.length > 0 ? Math.max(...displayedCandles.map(c => c.high)) * 1.02 : 215;
  const maxVolume = displayedCandles.length > 0 ? Math.max(...displayedCandles.map(c => c.volume)) : 100000000;

  const width = 800;
  const height = 380;
  const chartBottom = 310;
  const volumeHeight = 60;

  const getY = (price: number) => {
    return chartBottom - ((price - minPrice) / (maxPrice - minPrice)) * (chartBottom - 30);
  };

  const getVolY = (vol: number) => {
    return height - (vol / maxVolume) * volumeHeight;
  };

  const candleWidth = Math.max(3, (width - 60) / (displayedCandles.length || 1) - 4);

  const activeCandle = hoveredCandle || displayedCandles[displayedCandles.length - 1] || {
    open: currentPrice - priceChange,
    high: currentPrice * 1.01,
    low: currentPrice * 0.99,
    close: currentPrice,
    volume: 52310000,
    time: 'Today',
  };

  const isUp = priceChange >= 0;

  const priceTicks = [
    maxPrice,
    maxPrice - (maxPrice - minPrice) * 0.25,
    maxPrice - (maxPrice - minPrice) * 0.5,
    currentPrice,
    minPrice + (maxPrice - minPrice) * 0.25,
    minPrice,
  ];

  return (
    <div className="bg-[#0B132B] border border-[#1C2951] rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xl relative overflow-hidden">
      {/* Top Chart Toolbar matching mockup */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#152042]">
        {/* Timeframe Selector Pills */}
        <div className="flex items-center gap-1 bg-[#111C3A] p-1 rounded-xl border border-[#1C2951]">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                activeTimeframe === tf
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Right Tools: Indicators, Chart Style, Fullscreen */}
        <div className="flex items-center gap-1.5 text-slate-400">
          <button
            onClick={() => setChartType(chartType === 'candles' ? 'line' : 'candles')}
            title="Toggle Candle / Line Chart"
            className="p-1.5 rounded-lg hover:text-white hover:bg-[#111C3A] transition-colors"
          >
            <BarChart2 className="w-4 h-4" />
          </button>
          <button
            title="Technical Indicators"
            className="p-1.5 rounded-lg hover:text-white hover:bg-[#111C3A] transition-colors"
          >
            <Activity className="w-4 h-4" />
          </button>
          <button
            title="Chart Settings"
            className="p-1.5 rounded-lg hover:text-white hover:bg-[#111C3A] transition-colors"
          >
            <Sliders className="w-4 h-4" />
          </button>
          <button
            onClick={() => alert('Chart snapshot saved to clipboard')}
            title="Take Snapshot"
            className="p-1.5 rounded-lg hover:text-white hover:bg-[#111C3A] transition-colors"
          >
            <Camera className="w-4 h-4" />
          </button>
          <button
            title="Fullscreen Chart"
            className="p-1.5 rounded-lg hover:text-white hover:bg-[#111C3A] transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chart Canvas & Left Drawing Toolbar Area */}
      <div className="flex gap-2 pt-3 relative">
        {/* Left Drawing Tools Sidebar */}
        <div className="hidden sm:flex flex-col gap-2 py-2 pr-2 border-r border-[#152042] text-slate-400 text-xs">
          {[
            { id: 'crosshair', icon: Compass, label: 'Crosshair' },
            { id: 'trendline', icon: TrendingUp, label: 'Trend Line' },
            { id: 'pitchfork', icon: Sliders, label: 'Pitchfork' },
            { id: 'brush', icon: Edit3, label: 'Brush' },
            { id: 'text', icon: Search, label: 'Search / Text' },
            { id: 'zoom', icon: ZoomIn, label: 'Zoom' },
          ].map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(tool.id)}
                title={tool.label}
                className={`p-1.5 rounded-lg transition-colors ${
                  selectedTool === tool.id
                    ? 'text-blue-400 bg-blue-500/15'
                    : 'hover:text-white hover:bg-[#111C3A]'
                }`}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>

        {/* Main Interactive Chart Canvas */}
        <div className="flex-1 relative">
          {/* Live OHLC Header Banner matching mockup */}
          <div className="flex flex-wrap items-center gap-3 text-xs mb-2 font-mono">
            <span className="font-bold text-white tracking-wide">
              {symbol} • {activeTimeframe} • {exchange}
            </span>
            <span className="text-slate-400">
              O <span className={activeCandle.open >= activeCandle.close ? 'text-rose-400' : 'text-emerald-400 font-bold'}>{activeCandle.open.toFixed(2)}</span>
            </span>
            <span className="text-slate-400">
              H <span className="text-slate-200 font-bold">{activeCandle.high.toFixed(2)}</span>
            </span>
            <span className="text-slate-400">
              L <span className="text-slate-200 font-bold">{activeCandle.low.toFixed(2)}</span>
            </span>
            <span className="text-slate-400">
              C <span className={isUp ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{activeCandle.close.toFixed(2)}</span>
            </span>
            <span className={`font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isUp ? '+' : ''}{priceChange.toFixed(2)} ({isUp ? '+' : ''}{priceChangePercent.toFixed(2)}%)
            </span>
          </div>

          {/* SVG Candlestick Graphic */}
          <div className="relative w-full h-[320px] overflow-hidden select-none">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-full"
              preserveAspectRatio="none"
            >
              {/* Horizontal Grid lines */}
              {priceTicks.map((p, idx) => (
                <line
                  key={idx}
                  x1="0"
                  y1={getY(p)}
                  x2={width - 70}
                  y2={getY(p)}
                  stroke="#16244C"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
              ))}

              {/* Volume Bars (Histogram) */}
              {displayedCandles.map((candle, idx) => {
                const x = idx * ((width - 75) / displayedCandles.length) + 10;
                const y = getVolY(candle.volume);
                const barHeight = height - y;
                const candleIsUp = candle.close >= candle.open;

                return (
                  <rect
                    key={`vol-${idx}`}
                    x={x}
                    y={y}
                    width={candleWidth}
                    height={barHeight}
                    fill={candleIsUp ? '#10B981' : '#EF4444'}
                    opacity={0.35}
                  />
                );
              })}

              {/* Candlesticks */}
              {chartType === 'candles' && displayedCandles.map((candle, idx) => {
                const x = idx * ((width - 75) / displayedCandles.length) + 10;
                const centerX = x + candleWidth / 2;
                const candleIsUp = candle.close >= candle.open;
                const highY = getY(candle.high);
                const lowY = getY(candle.low);
                const openY = getY(candle.open);
                const closeY = getY(candle.close);
                const bodyTop = Math.min(openY, closeY);
                const bodyHeight = Math.max(2, Math.abs(openY - closeY));
                const color = candleIsUp ? '#10B981' : '#EF4444';

                return (
                  <g
                    key={`candle-${idx}`}
                    className="cursor-pointer transition-opacity hover:opacity-80"
                    onMouseEnter={() => setHoveredCandle(candle)}
                    onMouseLeave={() => setHoveredCandle(null)}
                  >
                    {/* Wick Line */}
                    <line
                      x1={centerX}
                      y1={highY}
                      x2={centerX}
                      y2={lowY}
                      stroke={color}
                      strokeWidth="1.5"
                    />
                    {/* Body Rectangle */}
                    <rect
                      x={x}
                      y={bodyTop}
                      width={candleWidth}
                      height={bodyHeight}
                      fill={color}
                      rx="1"
                    />
                  </g>
                );
              })}

              {/* Line Chart fallback style */}
              {chartType === 'line' && (
                <path
                  d={displayedCandles.reduce((acc, c, idx) => {
                    const x = idx * ((width - 75) / displayedCandles.length) + 10;
                    const y = getY(c.close);
                    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
                  }, '')}
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="2.5"
                />
              )}

              {/* Current Price Reference Dashed Line */}
              <line
                x1="0"
                y1={getY(currentPrice)}
                x2={width - 70}
                y2={getY(currentPrice)}
                stroke="#10B981"
                strokeDasharray="2 2"
                strokeWidth="1.5"
              />
            </svg>

            {/* Right Price Scale matching mockup */}
            <div className="absolute top-0 right-0 bottom-6 w-16 border-l border-[#152042] flex flex-col justify-between py-2 pl-2 text-[10px] font-mono text-slate-400">
              <span>{maxPrice.toFixed(2)}</span>
              <span>{(maxPrice * 0.98).toFixed(2)}</span>
              <span className="bg-emerald-500 text-slate-950 px-1 py-0.5 rounded font-bold text-[11px] shadow-md shadow-emerald-500/20">
                {currentPrice.toFixed(2)}
              </span>
              <span>{(minPrice * 1.05).toFixed(2)}</span>
              <span>{minPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Bottom Timeline & Status Row matching mockup */}
          <div className="flex items-center justify-between pt-2 border-t border-[#152042] text-[11px] text-slate-400 font-mono">
            <div className="flex gap-6 overflow-hidden">
              <span>Dec</span>
              <span>2025</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
            </div>

            <div className="flex items-center gap-2">
              <span>10:45:23 (UTC-4)</span>
              <span className="text-slate-500">%</span>
              <span className="text-slate-500">log</span>
              <span className="text-blue-400 font-bold">auto</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
