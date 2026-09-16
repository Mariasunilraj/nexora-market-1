import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'NEXORA Serverless Backend on Vercel',
    database: 'Supabase PostgreSQL Cloud',
  });
}
