const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
};

const TIME_FORMAT: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
};

export function formatDate(isoString: string, locale = 'en-GB'): string {
  return new Intl.DateTimeFormat(locale, DATE_FORMAT).format(new Date(isoString));
}

export function formatTime(isoString: string, locale = 'en-GB'): string {
  return new Intl.DateTimeFormat(locale, TIME_FORMAT).format(new Date(isoString));
}

export function formatDateShort(isoString: string, locale = 'en-GB'): string {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(isoString));
}
