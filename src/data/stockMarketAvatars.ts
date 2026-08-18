export interface StockMarketAvatar {
  id: string;
  name: string;
  gender: 'male' | 'female';
  role: string;
  badge: string;
  description: string;
  themeColor: string;
  avatarSvg: string;
}

export const STOCK_MARKET_AVATARS: StockMarketAvatar[] = [
  // 1. Male: Wall Street Bull Titan
  {
    id: 'avatar-male-bull',
    name: 'Wall Street Bull Titan',
    gender: 'male',
    role: 'Bullish Momentum Lead',
    badge: '🐂 Bull Titan',
    description: 'Specializes in aggressive breakout plays, long equity surges, and golden cross rallies.',
    themeColor: 'from-emerald-500 to-teal-700',
    avatarSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <linearGradient id="bg-bull" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="%2310B981"/>
          <stop offset="100%" stop-color="%23064E3B"/>
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(%23bg-bull)" stroke="%2334D399" stroke-width="2"/>
      <!-- Suit & Tie -->
      <path d="M25 96 C25 72 38 68 50 68 C62 68 75 72 75 96 Z" fill="%230F172A"/>
      <polygon points="50,70 42,96 58,96" fill="%23FFFFFF"/>
      <polygon points="50,74 46,96 54,96" fill="%2310B981"/>
      <!-- Head & Skin -->
      <circle cx="50" cy="42" r="18" fill="%23FBBF24"/>
      <!-- Hair -->
      <path d="M34 38 C34 26 44 22 56 22 C64 22 67 27 67 36 C62 34 52 32 42 34 Z" fill="%23334155"/>
      <!-- Eyes & Smile -->
      <circle cx="44" cy="42" r="2.2" fill="%230F172A"/>
      <circle cx="56" cy="42" r="2.2" fill="%230F172A"/>
      <path d="M46 50 Q50 54 54 50" stroke="%230F172A" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- Bull Horns Crown -->
      <path d="M30 25 Q36 12 44 20 Q38 28 32 28 Z" fill="%23F59E0B"/>
      <path d="M70 25 Q64 12 56 20 Q62 28 68 28 Z" fill="%23F59E0B"/>
      <!-- Candlestick Badge -->
      <circle cx="78" cy="78" r="12" fill="%23065F46" stroke="%2334D399" stroke-width="1.5"/>
      <text x="78" y="83" font-size="12" text-anchor="middle" fill="%23FFFFFF">🐂</text>
    </svg>`,
  },

  // 2. Female: Momentum Growth Strategist
  {
    id: 'avatar-female-growth',
    name: 'Growth Equities Director',
    gender: 'female',
    role: 'Macro Growth Strategist',
    badge: '📈 Growth Lead',
    description: 'Expert in high-growth tech portfolios, exponential valuation modeling, and breakout trends.',
    themeColor: 'from-emerald-400 to-cyan-600',
    avatarSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <linearGradient id="bg-growth" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="%23059669"/>
          <stop offset="100%" stop-color="%230E7490"/>
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(%23bg-growth)" stroke="%236EE7B7" stroke-width="2"/>
      <!-- Blazer -->
      <path d="M24 96 C24 72 38 68 50 68 C62 68 76 72 76 96 Z" fill="%23047857"/>
      <polygon points="50,72 44,96 56,96" fill="%23FFFFFF"/>
      <!-- Head & Skin -->
      <circle cx="50" cy="42" r="17" fill="%23FED7AA"/>
      <!-- Hair Bob -->
      <path d="M31 46 C31 24 40 18 50 18 C60 18 69 24 69 46 C69 56 64 58 64 48 C64 34 60 26 50 26 C40 26 36 34 36 48 C36 58 31 56 31 46 Z" fill="%237C2D12"/>
      <!-- Eyes & Smile -->
      <circle cx="44" cy="42" r="2.2" fill="%230F172A"/>
      <circle cx="56" cy="42" r="2.2" fill="%230F172A"/>
      <path d="M46 51 Q50 55 54 51" stroke="%23B91C1C" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- Trading Headset -->
      <path d="M32 38 C32 26 40 22 50 22 C60 22 68 26 68 38" stroke="%2338BDF8" stroke-width="2.5" fill="none"/>
      <circle cx="32" cy="40" r="4" fill="%230284C7"/>
      <path d="M32 40 Q40 50 46 48" stroke="%230284C7" stroke-width="1.5" fill="none"/>
      <!-- Chart Badge -->
      <circle cx="78" cy="78" r="12" fill="%23064E3B" stroke="%236EE7B7" stroke-width="1.5"/>
      <text x="78" y="83" font-size="12" text-anchor="middle" fill="%23FFFFFF">📈</text>
    </svg>`,
  },

  // 3. Male: Bear Market Short Specialist
  {
    id: 'avatar-male-bear',
    name: 'Tactical Short Specialist',
    gender: 'male',
    role: 'Hedge & Risk Manager',
    badge: '🐻 Risk Master',
    description: 'Master of downside hedging, volatility trading, inverse ETF allocations, and capital preservation.',
    themeColor: 'from-rose-600 to-slate-900',
    avatarSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <linearGradient id="bg-bear" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="%23E11D48"/>
          <stop offset="100%" stop-color="%231E1B4B"/>
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(%23bg-bear)" stroke="%23FB7185" stroke-width="2"/>
      <!-- Tactical Hoodie -->
      <path d="M22 96 C22 70 36 65 50 65 C64 65 78 70 78 96 Z" fill="%230F172A"/>
      <polygon points="50,68 44,96 56,96" fill="%23BE123C"/>
      <!-- Head & Skin -->
      <circle cx="50" cy="42" r="17" fill="%23FDE68A"/>
      <!-- Beard & Hair -->
      <path d="M33 36 C33 22 43 18 53 18 C63 18 67 24 67 36 C60 33 50 31 40 33 Z" fill="%231E293B"/>
      <path d="M38 46 C38 58 44 60 50 60 C56 60 62 58 62 46 Z" fill="%231E293B"/>
      <!-- Smart Glasses -->
      <rect x="38" y="38" width="10" height="7" rx="2" fill="%230F172A" stroke="%23FB7185" stroke-width="1.5"/>
      <rect x="52" y="38" width="10" height="7" rx="2" fill="%230F172A" stroke="%23FB7185" stroke-width="1.5"/>
      <line x1="48" y1="41" x2="52" y2="41" stroke="%23FB7185" stroke-width="1.5"/>
      <!-- Bear Badge -->
      <circle cx="78" cy="78" r="12" fill="%234C0519" stroke="%23FB7185" stroke-width="1.5"/>
      <text x="78" y="83" font-size="12" text-anchor="middle" fill="%23FFFFFF">🐻</text>
    </svg>`,
  },

  // 4. Female: High-Frequency Quant Lead
  {
    id: 'avatar-female-quant',
    name: 'Algorithmic Quant Lead',
    gender: 'female',
    role: 'HFT & Machine Learning Alpha',
    badge: '⚡ Quant Alpha',
    description: 'Deploys algorithmic statistical arbitrage, neural pricing models, and low-latency order routing.',
    themeColor: 'from-violet-600 to-indigo-900',
    avatarSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <linearGradient id="bg-quant" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="%237C3AED"/>
          <stop offset="100%" stop-color="%231E1B4B"/>
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(%23bg-quant)" stroke="%23C084FC" stroke-width="2"/>
      <!-- High Tech Blazer -->
      <path d="M24 96 C24 72 38 68 50 68 C62 68 76 72 76 96 Z" fill="%231E1B4B"/>
      <polygon points="50,70 44,96 56,96" fill="%23A855F7"/>
      <!-- Head & Skin -->
      <circle cx="50" cy="42" r="17" fill="%23FBCFE8"/>
      <!-- Modern Ponytail Hair -->
      <path d="M32 44 C32 22 42 16 52 16 C64 16 68 24 68 44 C68 46 64 36 50 36 C36 36 32 46 32 44 Z" fill="%230F172A"/>
      <circle cx="70" cy="28" r="6" fill="%230F172A"/>
      <!-- Cyber HUD Visor Glasses -->
      <rect x="36" y="38" width="28" height="8" rx="3" fill="%23818CF8" fill-opacity="0.7" stroke="%23C084FC" stroke-width="1.5"/>
      <line x1="39" y1="42" x2="61" y2="42" stroke="%23FFFFFF" stroke-width="1"/>
      <!-- Smile -->
      <path d="M46 52 Q50 55 54 52" stroke="%239333EA" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- Quant Lightning Badge -->
      <circle cx="78" cy="78" r="12" fill="%233B0764" stroke="%23C084FC" stroke-width="1.5"/>
      <text x="78" y="83" font-size="12" text-anchor="middle" fill="%23FFFFFF">⚡</text>
    </svg>`,
  },

  // 5. Male: Diamond Hands Value Investor
  {
    id: 'avatar-male-diamond',
    name: 'Diamond Hands Investor',
    gender: 'male',
    role: 'Compound Value Strategist',
    badge: '💎 Diamond',
    description: 'Disciplined compounding titan who ignores market noise and holds high-conviction monopolies forever.',
    themeColor: 'from-blue-600 to-indigo-900',
    avatarSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <linearGradient id="bg-diamond" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="%232563EB"/>
          <stop offset="100%" stop-color="%231E3A8A"/>
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(%23bg-diamond)" stroke="%2360A5FA" stroke-width="2"/>
      <!-- Pinstripe Suit -->
      <path d="M24 96 C24 72 38 68 50 68 C62 68 76 72 76 96 Z" fill="%230F172A"/>
      <polygon points="50,70 42,96 58,96" fill="%23FFFFFF"/>
      <polygon points="50,74 46,96 54,96" fill="%233B82F6"/>
      <!-- Head & Skin -->
      <circle cx="50" cy="42" r="18" fill="%23FED7AA"/>
      <!-- Slick Hair -->
      <path d="M32 36 C32 20 44 18 56 18 C64 18 68 24 68 34 C60 30 48 30 38 34 Z" fill="%23475569"/>
      <!-- Confident Eyes & Smile -->
      <circle cx="44" cy="42" r="2.2" fill="%230F172A"/>
      <circle cx="56" cy="42" r="2.2" fill="%230F172A"/>
      <path d="M46 51 Q50 55 54 51" stroke="%230F172A" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- Diamond Badge -->
      <circle cx="78" cy="78" r="12" fill="%231E3A8A" stroke="%2360A5FA" stroke-width="1.5"/>
      <text x="78" y="83" font-size="12" text-anchor="middle" fill="%23FFFFFF">💎</text>
    </svg>`,
  },

  // 6. Female: Institutional Fund Executive
  {
    id: 'avatar-female-institutional',
    name: 'Institutional Fund Director',
    gender: 'female',
    role: 'Global Asset Allocation',
    badge: '🏛️ Fund Exec',
    description: 'Manages multi-billion dollar simulated portfolios, sovereign mandates, and sector rotations.',
    themeColor: 'from-amber-600 to-amber-950',
    avatarSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <linearGradient id="bg-fund" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="%23D97706"/>
          <stop offset="100%" stop-color="%23451A03"/>
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(%23bg-fund)" stroke="%23FCD34D" stroke-width="2"/>
      <!-- Gold Rim Executive Suit -->
      <path d="M24 96 C24 72 38 68 50 68 C62 68 76 72 76 96 Z" fill="%2318181B"/>
      <polygon points="50,70 43,96 57,96" fill="%23FBBF24"/>
      <!-- Head & Skin -->
      <circle cx="50" cy="42" r="17" fill="%23FDE68A"/>
      <!-- Elegant Styled Hair -->
      <path d="M30 46 C30 20 40 16 52 16 C64 16 70 20 70 46 C66 40 58 32 48 32 C38 32 32 40 30 46 Z" fill="%2327272A"/>
      <!-- Pearls / Collar -->
      <circle cx="50" cy="65" r="3" fill="%23FDE68A"/>
      <!-- Eyes & Smile -->
      <circle cx="44" cy="42" r="2.2" fill="%230F172A"/>
      <circle cx="56" cy="42" r="2.2" fill="%230F172A"/>
      <path d="M46 51 Q50 55 54 51" stroke="%23991B1B" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- Institutional Pillar Badge -->
      <circle cx="78" cy="78" r="12" fill="%23451A03" stroke="%23FCD34D" stroke-width="1.5"/>
      <text x="78" y="83" font-size="12" text-anchor="middle" fill="%23FFFFFF">🏛️</text>
    </svg>`,
  },

  // 7. Male: Technical Chart Master
  {
    id: 'avatar-male-chartist',
    name: 'Technical Chartist Pro',
    gender: 'male',
    role: 'Fibonacci & Price Action Master',
    badge: '📊 Chartist',
    description: 'Precision entry technician utilizing order flow footprints, VWAP bands, and Elliott wave cycles.',
    themeColor: 'from-cyan-600 to-slate-900',
    avatarSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <linearGradient id="bg-chart" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="%230891B2"/>
          <stop offset="100%" stop-color="%230F172A"/>
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(%23bg-chart)" stroke="%2367E8F9" stroke-width="2"/>
      <!-- Modern Vest & Shirt -->
      <path d="M24 96 C24 72 38 68 50 68 C62 68 76 72 76 96 Z" fill="%231E293B"/>
      <polygon points="50,70 44,96 56,96" fill="%2306B6D4"/>
      <!-- Head & Skin -->
      <circle cx="50" cy="42" r="17" fill="%23FBBF24"/>
      <!-- Haircut -->
      <path d="M33 34 C33 20 45 18 55 18 C65 18 67 24 67 34 C60 30 50 28 40 30 Z" fill="%230F172A"/>
      <!-- Chart Glasses -->
      <rect x="38" y="38" width="10" height="7" rx="2" fill="%230891B2" fill-opacity="0.4" stroke="%2322D3EE" stroke-width="1.5"/>
      <rect x="52" y="38" width="10" height="7" rx="2" fill="%230891B2" fill-opacity="0.4" stroke="%2322D3EE" stroke-width="1.5"/>
      <line x1="48" y1="41" x2="52" y2="41" stroke="%2322D3EE" stroke-width="1.5"/>
      <!-- Smile -->
      <path d="M46 51 Q50 55 54 51" stroke="%230F172A" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- Chart Icon Badge -->
      <circle cx="78" cy="78" r="12" fill="%23164E63" stroke="%2367E8F9" stroke-width="1.5"/>
      <text x="78" y="83" font-size="12" text-anchor="middle" fill="%23FFFFFF">📊</text>
    </svg>`,
  },

  // 8. Female: Derivatives & Macro Specialist
  {
    id: 'avatar-female-macro',
    name: 'Macro Options Specialist',
    gender: 'female',
    role: 'Volatility & Hedging Trader',
    badge: '🌐 Macro Lead',
    description: 'Expert in global macro liquidity, option greeks (Delta/Gamma/Theta), and Fed rate expectations.',
    themeColor: 'from-pink-600 to-purple-950',
    avatarSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <linearGradient id="bg-macro" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="%23DB2777"/>
          <stop offset="100%" stop-color="%23581C87"/>
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(%23bg-macro)" stroke="%23F472B6" stroke-width="2"/>
      <!-- Plum Executive Blazer -->
      <path d="M24 96 C24 72 38 68 50 68 C62 68 76 72 76 96 Z" fill="%23831843"/>
      <polygon points="50,70 44,96 56,96" fill="%23FDF2F8"/>
      <!-- Head & Skin -->
      <circle cx="50" cy="42" r="17" fill="%23FDE68A"/>
      <!-- Wavy Hair -->
      <path d="M30 46 C30 22 40 16 50 16 C62 16 70 22 70 46 C66 54 62 44 50 36 C38 44 34 54 30 46 Z" fill="%233B0764"/>
      <!-- Eyes & Smile -->
      <circle cx="44" cy="42" r="2.2" fill="%230F172A"/>
      <circle cx="56" cy="42" r="2.2" fill="%230F172A"/>
      <path d="M46 51 Q50 55 54 51" stroke="%239D174D" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- Macro Globe Badge -->
      <circle cx="78" cy="78" r="12" fill="%23500724" stroke="%23F472B6" stroke-width="1.5"/>
      <text x="78" y="83" font-size="12" text-anchor="middle" fill="%23FFFFFF">🌐</text>
    </svg>`,
  },
];
