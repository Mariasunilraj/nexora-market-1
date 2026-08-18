export interface MarketStatusInfo {
  isOpen: boolean;
  session: 'Regular' | 'Pre-Market' | 'After-Hours' | 'Closed';
  statusText: 'Open' | 'Closed' | 'Pre-Market' | 'After-Hours';
  formattedScheduleIST: string;
  isDST: boolean;
  nextEventText: string;
  currentTimeNY: string;
  currentTimeIST: string;
}

export function getMarketStatus(date: Date = new Date()): MarketStatusInfo {
  // Get time in America/New_York (automatically handles Daylight Saving Time EDT vs EST)
  const nyDateString = date.toLocaleString('en-US', { timeZone: 'America/New_York' });
  const nyDate = new Date(nyDateString);

  // Get time in Asia/Kolkata (IST)
  const istDateString = date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  const istDate = new Date(istDateString);

  const dayOfWeek = nyDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const hours = nyDate.getHours();
  const minutes = nyDate.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  // Check if US is currently in Daylight Saving Time (EDT vs EST)
  // Standard UTC offset for NY is -5 (EST), in DST it is -4 (EDT)
  const janDate = new Date(date.getFullYear(), 0, 1);
  const julDate = new Date(date.getFullYear(), 6, 1);
  const janOffset = new Date(janDate.toLocaleString('en-US', { timeZone: 'America/New_York' })).getTimezoneOffset();
  const julOffset = new Date(julDate.toLocaleString('en-US', { timeZone: 'America/New_York' })).getTimezoneOffset();
  const currentNYOffset = nyDate.getTimezoneOffset();
  const isDST = currentNYOffset === Math.min(janOffset, julOffset);

  // US Regular Trading Hours: 9:30 AM to 4:00 PM (16:00) Eastern Time
  const regularOpenMinutes = 9 * 60 + 30;  // 9:30 AM ET (7:00 PM IST in DST / 8:00 PM IST in standard)
  const regularCloseMinutes = 16 * 60;     // 4:00 PM ET (1:30 AM IST in DST / 2:30 AM IST in standard)
  const preMarketOpenMinutes = 4 * 60;     // 4:00 AM ET
  const afterHoursCloseMinutes = 20 * 60;  // 8:00 PM ET

  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  let isOpen = false;
  let session: 'Regular' | 'Pre-Market' | 'After-Hours' | 'Closed' = 'Closed';
  let statusText: 'Open' | 'Closed' | 'Pre-Market' | 'After-Hours' = 'Closed';
  let nextEventText = '';

  const scheduleIST = isDST
    ? '7:00 PM – 1:30 AM IST (Daylight Saving Time)'
    : '8:00 PM – 2:30 AM IST (Standard Time)';

  if (!isWeekend) {
    if (timeInMinutes >= regularOpenMinutes && timeInMinutes < regularCloseMinutes) {
      isOpen = true;
      session = 'Regular';
      statusText = 'Open';
      const remainingMinutes = regularCloseMinutes - timeInMinutes;
      const remH = Math.floor(remainingMinutes / 60);
      const remM = remainingMinutes % 60;
      nextEventText = `Closes in ${remH > 0 ? `${remH}h ` : ''}${remM}m`;
    } else if (timeInMinutes >= preMarketOpenMinutes && timeInMinutes < regularOpenMinutes) {
      isOpen = false;
      session = 'Pre-Market';
      statusText = 'Pre-Market';
      const toOpenMinutes = regularOpenMinutes - timeInMinutes;
      const remH = Math.floor(toOpenMinutes / 60);
      const remM = toOpenMinutes % 60;
      nextEventText = `Regular opens in ${remH > 0 ? `${remH}h ` : ''}${remM}m`;
    } else if (timeInMinutes >= regularCloseMinutes && timeInMinutes < afterHoursCloseMinutes) {
      isOpen = false;
      session = 'After-Hours';
      statusText = 'After-Hours';
      nextEventText = isDST ? 'Opens tomorrow 7:00 PM IST' : 'Opens tomorrow 8:00 PM IST';
    } else {
      isOpen = false;
      session = 'Closed';
      statusText = 'Closed';
      nextEventText = isDST ? 'Opens at 7:00 PM IST' : 'Opens at 8:00 PM IST';
    }
  } else {
    isOpen = false;
    session = 'Closed';
    statusText = 'Closed';
    nextEventText = isDST ? 'Opens Monday 7:00 PM IST' : 'Opens Monday 8:00 PM IST';
  }

  const formatTime = (d: Date) => {
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  return {
    isOpen,
    session,
    statusText,
    formattedScheduleIST: scheduleIST,
    isDST,
    nextEventText,
    currentTimeNY: formatTime(nyDate),
    currentTimeIST: formatTime(istDate),
  };
}
