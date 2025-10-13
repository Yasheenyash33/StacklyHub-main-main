// Utility functions for timezone conversions

/**
 * Convert UTC datetime to IST (Indian Standard Time)
 * @param {string|Date} utcDate - UTC datetime string or Date object
 * @returns {Date} - Date object in IST
 */
export function utcToIST(utcDate) {
  const date = new Date(utcDate);
  // IST is UTC+5:30
  const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
  return new Date(date.getTime() + istOffset);
}

/**
 * Format date to readable IST string
 * @param {string|Date} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'time')
 * @returns {string} - Formatted date string
 */
export function formatIST(date, format = 'short') {
  const istDate = utcToIST(date);

  switch (format) {
    case 'short':
      return istDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    case 'long':
      return istDate.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    case 'time':
      return istDate.toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    case 'datetime':
      return istDate.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    default:
      return istDate.toLocaleDateString('en-IN');
  }
}
