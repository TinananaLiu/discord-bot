import db from "../config/db.js";
import BaseModel from "./baseModel.js";
import { DatabaseError, ConflictError } from "../utils/errorClass.js";

class ReservationModel extends BaseModel {
  constructor() {
    super();
  }

  /**
   *
   * @param {*} timeSlotId
   * @param {*} studentId
   */
  async insert(timeSlotId, studentId) {
    try {
      await db.tx(async (t) => {
        await this.setSchema(t);

        // Lock the reservation table to prevent concurrent writes
        await t.none(`LOCK TABLE reservation IN EXCLUSIVE MODE`);

        // Check if the time_slot_id already exists
        const existingReservation = await t.oneOrNone(
          `SELECT 1 FROM reservation WHERE time_slot_id = $1`,
          [timeSlotId]
        );

        if (existingReservation) {
          throw new ConflictError("The time_slot_id already exists");
        }

        const updatedSlot = await t.oneOrNone(
          `UPDATE available_time
           SET status = true
           WHERE id = $1
           RETURNING id`,
          [timeSlotId]
        );

        if (!updatedSlot) {
          throw new ConflictError(
            "The time slot is either unavailable or does not exist"
          );
        }

        const newReservation = await t.one(
          `INSERT INTO reservation (time_slot_id, student_id)
           VALUES ($1, $2)
           RETURNING id`,
          [timeSlotId, studentId]
        );

        // Insert the new reservation if the time_slot_id doesn't exist
        return newReservation.id;
      });
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      console.error('Error during "ReservationModel.insert()":', error);
      throw new DatabaseError(`Failed to execute SQL transaction, ${error}`);
    }
  }

  /**
   * Query all time schedule reserved by the user
   * @param {String} teacherId User's discord id
   * @return {Array} Queried data
   */
  async getById(userId) {
    try {
      const timeSchedule = await db.any(
        `
        SELECT 
          at.date,
          at.start_time,
          at.end_time
        FROM 
          "${this.schemaName}".reservation r
        INNER JOIN 
          "${this.schemaName}".available_time at
        ON 
          r.time_slot_id = at.id
        WHERE 
          r.student_id = $1
        ORDER BY 
          at.date ASC, at.start_time ASC;
        `,
        [userId]
      );
      return timeSchedule;
    } catch (error) {
      console.error('Error during "ReservationModel.getById()":', error);
      throw new DatabaseError(`Failed to execute SQL transaction, ${error}`);
    }
  }
}

export default new ReservationModel();
