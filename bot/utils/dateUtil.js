class DateUtil{

  /**
   * @method parseDate
   * @description Parse dateString to Date object with correct UTC
   * @param {String} dateString yyyymmdd format string (e.g. 20241213)
   * @returns {Date} Date object
   */
  static parseDate(dateString){
    const year = parseInt(dateString.substring(0, 4), 10);
    const month = parseInt(dateString.substring(4, 6), 10) - 1; // Month is 0-based
    const day = parseInt(dateString.substring(6, 8), 10);

    const parsedDate = new Date(Date.UTC(year, month, day));

    return parsedDate;
  }
  
  /**
   * @method formatDate
   * @description Format Date object to well-formated dateSting
   * @param {Date} dateObj
   * @returns {String} Date in String (2024-07-19)
   */
  static formatDate(dateObj){
    const formattedDate =
    dateObj.getFullYear() +
    "-" +
    String(dateObj.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(dateObj.getDate()).padStart(2, "0");

    return formattedDate;
  }

  static getRetrieveResultMessage(availableTimes){
    let output = "";
    const memo = new Set();

    availableTimes.map((slot) => {
      const formatedDate = this.formatDate(new Date(slot.date));
      if (!memo.has(formatedDate)){
        memo.add(formatedDate);
        output += `\n ${formatedDate}: \n`;
      }
      output += ` - ${slot.start_time} - ${slot.end_time} \n`;
    });

    output.trim();
    return output;
  }
}

export default DateUtil;