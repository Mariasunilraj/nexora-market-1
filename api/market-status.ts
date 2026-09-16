import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  const now = new Date();
  const nyDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const istDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));

  const day = nyDate.getDay();
  const hours = nyDate.getHours();
  const minutes = nyDate.getMinutes();
  const currentMinutes = hours * 60 + minutes;

  // Regular Trading Hours: 9:30 AM to 4:00 PM ET
  const isOpen = (day >= 1 && day <= 5) && (currentMinutes >= 570 && currentMinutes < 960);

  res.status(200).json({
    isOpen,
    session: isOpen ? 'Regular' : (day === 0 || day === 6 ? 'Closed (Weekend)' : 'Closed (Off-Hours)'),
    currentTimeNY: nyDate.toLocaleTimeString('en-US'),
    currentTimeIST: istDate.toLocaleTimeString('en-US'),
    scheduleIST: '7:00 PM – 1:30 AM IST (Daylight Saving Time) / 8:00 PM – 2:30 AM IST (Standard)',
  });
}
