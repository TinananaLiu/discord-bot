import db from "../services/db_connection.js";

class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = "ConflictError";
  }
}

export const insertTimeSlot = async (teacherId, date, startTime, endTime) => {
  try {
    const timeSlotIds = [];
    const schemaName = "dc-bot";
    await db.tx(async (t) => {
      await t.none(`SET search_path TO "${schemaName}"`);

      let currentHour = parseTime(startTime);
      let finalHour = parseTime(endTime);

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
            formatTime(currentHour),
            formatTime(nextHour),
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
    console.error('Error during "insertTimeSlot()":', error);
    throw new Error("Database error");
  }
};

export const getTimeSlot = async (teacherId) => {
  const availableTimeSlots = await db.any(
    `
    SELECT date, start_time, end_time 
    FROM "dc-bot".available_time 
    WHERE teacher_id = $1
    ORDER BY date, start_time ASC
    `,
    [teacherId]
  );
  return availableTimeSlots;
};

export const getTimeSlotByDate = async (parsedDate) => {
  const formattedDate = parsedDate.toISOString().split("T")[0];

  const availableTimeSlots = await db.any(
    `
    SELECT id, start_time, end_time 
    FROM "dc-bot".available_time 
    WHERE date = $1::date AND status = false
    ORDER BY start_time ASC
    `,
    [formattedDate]
  );
  return availableTimeSlots.length > 0 ? availableTimeSlots : [];
};

export const insertReserveTime = async (timeSlotId, studentId) => {
  try {
    const newReserveId = await db.tx(async (t) => {
      await t.none(`SET search_path TO "dc-bot"`);

      // Lock the reservation table to prevent concurrent writes
      await t.none(`LOCK TABLE reservation IN EXCLUSIVE MODE`);

      // Check if the time_slot_id already exists
      const existingReservation = await t.oneOrNone(
        `SELECT 1 FROM reservation WHERE time_slot_id = $1`,
        [timeSlotId]
      );

      if (existingReservation) {
        throw new Error('The time_slot_id already exists');
      }

      const updatedSlot = await t.oneOrNone(
        `UPDATE available_time
         SET status = true
         WHERE id = $1
         RETURNING id`,
        [timeSlotId]
      );

      if (!updatedSlot) {
        throw new Error('The time slot is either unavailable or does not exist');
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

    return newReserveId;
  } catch (error) {
    console.error('Error during "insertReserveTime":', error);
    throw error; // Ensure the error propagates to notify the caller
  }
};

// Helper function to parse time into a Date object
function parseTime(time) {
  const [hour, minute] = time.split(":").map(Number);
  const now = new Date();
  now.setHours(hour, minute, 0, 0);
  return now;
}

// Helper function to format a Date object back to 'HH:mm'
function formatTime(date) {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}
