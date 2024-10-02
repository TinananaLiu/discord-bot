import db from "../services/db_connection.js";

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

        const timeSlotId = await t.one(
          `INSERT INTO available_time (teacher_id, date, start_time, end_time, status)
           VALUES ($1, $2, $3, $4, $5)
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

        timeSlotIds.push(timeSlotId.id);
        currentHour = nextHour;
      }
    });
    return timeSlotIds;
  } catch (error) {
    console.error('Error during "insertTimeSlot()":', error);
  }
};

export const getTimeSlot = async (teacherId) => {
  const availableTimeSlots = await db.any(
    `
    SELECT start_time, end_time 
    FROM "dc-bot".available_time 
    WHERE teacher_id = $1
    ORDER BY start_time ASC
    `,
    [teacherId]
  );
  return availableTimeSlots;
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
