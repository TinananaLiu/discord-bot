import db from "../config/db.js"
import BaseModel from "./baseModel.js";
import { ConflictError, DatabaseError } from "../utils/errorClass.js";
import DateUtil from "../utils/dateUtil.js";

class AvailableTimeModel extends BaseModel{
  constructor(){
    super();
  }

  /**
   * Inserts time slots into the for a specific teacher.
   * @param {String} teacherId Teacher's discord id
   * @param {String} date 'yyyy-MM-dd' format string
   * @param {*} startTime 'hh:mm:ss' format string
   * @param {*} endTime 'hh:mm:ss' format string
   * @returns {Array} A uuid array of new data.
   */
  async insert(teacherId, date, startTime, endTime){
    try {
      const timeSlotIds = [];
      await db.tx(async (t) => {
        await this.setSchema(t);
  
        let currentHour = DateUtil.parseTime(startTime);
        let finalHour = DateUtil.parseTime(endTime);
  
        while (currentHour < finalHour) {
          const nextHour = new Date(currentHour);
          nextHour.setHours(currentHour.getHours() + 1);
  
          const timeSlotId = await t.oneOrNone(
            `INSERT INTO available_time (teacher_id, date, start_time, end_time, status)
              VALUES ($1, $2, $3, $4, $5)
              ON CONFLICT (teacher_id, date, start_time, end_time) DO NOTHING
              RETURNING id 
            `,
            [
              teacherId,
              date,
              DateUtil.formatTime(currentHour),
              DateUtil.formatTime(nextHour),
              false
            ]
          );
  
          if (!timeSlotId){
            throw new ConflictError(`Conflict: Time slot already exists for ${date} at ${formatTime(currentHour)}`)
          }
            
          timeSlotIds.push(timeSlotId.id);
          currentHour = nextHour;
        }
      });
      return timeSlotIds;
    } catch (error) {
      if (error instanceof ConflictError){
        throw error;
      }
      console.error('Error during "AvailableTimeModel.insertTimeSlot()":', error);
      throw new DatabaseError(`Failed to execute SQL transaction, ${error}`);
    }
  }

  /**
   * Retrieves all available time slots for a teacher
   * @param {String} teacherId Teacher's discord id
   * @return {Array} Retrieved data
   */
  async getById(teacherId){
    try {
      const availableTimeSlots = await db.any(
        `
        SELECT date, start_time, end_time 
        FROM "${this.schemaName}".available_time 
        WHERE teacher_id = $1
        ORDER BY date, start_time ASC
        `,
        [teacherId]
      );
      return availableTimeSlots;
    } catch (error) {
      console.error('Error during "AvailableTimeModel.getById()":', error);
      throw new DatabaseError(`Failed to execute SQL transaction, ${error}`);
    }
  }

  /**
   * Retrieves available time slots for a specific date.
   * @param {Date} parsedDate Date object for query
   * @returns {Array} Retrieved data
   */
  async getByDate(parsedDate){
    try {
      const formattedDate = parsedDate.toISOString().split("T")[0];
      const availableTimeSlots = await db.any(
        `
        SELECT id, start_time, end_time 
        FROM "${this.schemaName}".available_time 
        WHERE date = $1::date AND status = false
        ORDER BY start_time ASC
        `,
        [formattedDate]
      );
      return availableTimeSlots.length > 0 ? availableTimeSlots : [];
    } catch (error) {
      console.error('Error during "AvailableTimeModel.getByDate()":', error);
      throw new DatabaseError(`Failed to execute SQL transaction, ${error}`);
    }
  }
}

export default new AvailableTimeModel();
