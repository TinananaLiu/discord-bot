class DateUtil{

  /**
   * Parse a 'HH:mm' string (e.g. 21:00) to a Date object.
   * @param {String} time 
   * @returns {Date}
   */
  static parseTime(time) {
    const [hour, minute] = time.split(":").map(Number);
    const now = new Date();
    now.setHours(hour, minute, 0, 0);
    return now;
  }

  /**
   * Parse a 'yyyyMMdd' string (e.g. 21:00) to a Date object.
   * @param {String} dateString 
   * @returns 
   */
  static parseDate(dateString) {
    const year = parseInt(dateString.substring(0, 4), 10);
    const month = parseInt(dateString.substring(4, 6), 10) - 1; // Month is 0-based
    const day = parseInt(dateString.substring(6, 8), 10);
  
    const parsedDate = new Date(Date.UTC(year, month, day));
  
    return parsedDate;
  }

  /**
   * // Format a Date object back to 'HH:mm'
   * @param {Date} date 
   * @returns {String}
   */
  static formatTime(date) {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  } 
}

export default DateUtil;