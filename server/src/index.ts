import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { runMonteCarloBacktest } from './services/backtestEngine.js';
import { processLimitOrders } from './services/orderWorker.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: '*', // Allow requests from Vercel frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
app.use(express.json());

// 1. Health Check Endpoint (For Render Uptime & Keep-Alive)
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    service: 'NEXORA High-Process Trading Backend',
    environment: process.env.NODE_ENV || 'production',
  });
});

// 2. High-Process Algorithmic Backtest & Monte Carlo Simulation Endpoint
app.post('/api/backtest', (req: Request, res: Response) => {
  try {
    const { symbol = 'AAPL', initialCapital = 50000, strategy = 'EMA_CROSSOVER', periodDays = 90 } = req.body;
    const result = runMonteCarloBacktest({
      symbol,
      initialCapital: Number(initialCapital),
      strategy,
      periodDays: Number(periodDays),
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Real-Time Market Status & Schedule Endpoint
app.get('/api/market/status', (_req: Request, res: Response) => {
  const now = new Date();
  const nyDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const istDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));

  const day = nyDate.getDay();
  const hours = nyDate.getHours();
  const minutes = nyDate.getMinutes();
  const currentMinutes = hours * 60 + minutes;

  const isOpen = (day >= 1 && day <= 5) && (currentMinutes >= 570 && currentMinutes < 960); // 9:30 AM - 4:00 PM ET

  res.json({
    isOpen,
    session: isOpen ? 'Regular' : (day === 0 || day === 6 ? 'Closed (Weekend)' : 'Closed (Off-Hours)'),
    currentTimeNY: nyDate.toLocaleTimeString('en-US'),
    currentTimeIST: istDate.toLocaleTimeString('en-US'),
    scheduleIST: '7:00 PM – 1:30 AM IST (DST) / 8:00 PM – 2:30 AM IST (Standard)',
  });
});

// 4. Manual / Webhook Trigger for Background Order Processing
app.post('/api/orders/process', async (req: Request, res: Response) => {
  const { prices = {} } = req.body;
  const result = await processLimitOrders(prices);
  res.json({ success: true, ...result });
});

// Background Worker: Run limit order matching every 60 seconds
cron.schedule('* * * * *', async () => {
  // Simulates market price pulse for active order matching
  const mockPrices = {
    AAPL: 228.45,
    NVDA: 128.50,
    MSFT: 448.20,
    TSLA: 218.80,
    AMZN: 186.40,
  };
  await processLimitOrders(mockPrices);
});

app.listen(PORT, () => {
  console.log(`⚡ NEXORA High-Process Trading Server running on port ${PORT}`);
});
