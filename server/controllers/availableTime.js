import {
  insertTimeSlot,
  getTimeSlot,
  getTimeSlotByDate,
  insertReserveTime
} from "../models/availableTimeModel.js";

export const createAvailableTime = async (req, res) => {
  const teacherId = req.params.userId;
  const { date, startTime, endTime } = req.body;
  try {
    const timeSlotIds = await insertTimeSlot(
      teacherId,
      date,
      startTime,
      endTime
    );
    return res.status(201).json({ timeSlotIds });
  } catch (error) {
    if (error.name === "ConflictError"){
      return res.status(400).json({ message: error.message});
    }
    return res.status(500).json({ message: error.message });
  }
};

export const getAvailableTime = async (req, res) => {
  const teacherId = req.params.userId;
  try {
    const availableTimeSlots = await getTimeSlot(teacherId);
    return res.status(201).json({ availableTimeSlots });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAvailableTimeByDate = async (req, res) => {
  const date = req.params.date;
  const parsedDate = parseDate(date.toString());
  try {
    const availableTimeSlots = await getTimeSlotByDate(parsedDate);
    return res.status(201).json({ availableTimeSlots });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createReserveTime = async (req, res) => {
  const studentId = req.params.userId;
  const { timeSlotId } = req.body;
  try {
    const reserveTimeId = await insertReserveTime(timeSlotId, studentId);
    return res.status(201).json({ reserveTimeId });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Helper Functions
// -------------------------------------------------------------
function parseDate(dateString) {
  const year = parseInt(dateString.substring(0, 4), 10);
  const month = parseInt(dateString.substring(4, 6), 10) - 1; // Month is 0-based
  const day = parseInt(dateString.substring(6, 8), 10);

  const parsedDate = new Date(Date.UTC(year, month, day));

  return parsedDate;
}
