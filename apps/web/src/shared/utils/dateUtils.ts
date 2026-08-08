export function getBusinessDayStart(dateInput: Date | string | number = new Date(), timeZone: string = 'Asia/Kolkata'): Date {
  const date = new Date(dateInput);
  
  // 1. Get the local hour in the specified timezone
  const hourFormatter = new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', hourCycle: 'h23' });
  const localHourStr = hourFormatter.format(date);
  const localHour = parseInt(localHourStr, 10);
  
  // 2. Adjust date to get the correct business date (subtract 1 day if before 5 AM)
  let targetDate = date;
  if (localHour < 5) {
    targetDate = new Date(date.getTime() - 24 * 60 * 60 * 1000);
  }
  
  // 3. Format to YYYY-MM-DD in the target timezone
  const dateFormatter = new Intl.DateTimeFormat('sv-SE', { 
    timeZone, 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  });
  const localDateStr = dateFormatter.format(targetDate);
  
  // 4. Get the timezone offset string (e.g. GMT+5:30)
  const tzString = targetDate.toLocaleString('en-US', { timeZone, timeZoneName: 'shortOffset' });
  const match = tzString.match(/GMT([+-]\d{1,2}(?::\d{2})?)/);
  let offset = "+00:00";
  if (match) {
    let rawOffset = match[1]; // e.g. "+5:30" or "+05:30" or "-4"
    const isNegative = rawOffset.startsWith('-');
    const parts = rawOffset.substring(1).split(':');
    const h = parts[0].padStart(2, '0');
    const m = (parts[1] || '00').padStart(2, '0');
    offset = `${isNegative ? '-' : '+'}${h}:${m}`;
  } else if (tzString.includes('GMT')) {
    // If it literally says GMT, offset is 0
    offset = "+00:00";
  }
  
  // 5. Construct ISO string for 5:00 AM local time with the correct offset
  const isoString = `${localDateStr}T05:00:00${offset}`;
  
  return new Date(isoString);
}
