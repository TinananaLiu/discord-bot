import { insertTimeSlot, getTimeSlot } from "../models/availableTimeModel.js";

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
