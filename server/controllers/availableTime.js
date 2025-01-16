import reservationModel from "../models/reservationModel.js";
import availableTimeModel from "../models/availableTimeModel.js";
import DateUtil from "../utils/dateUtil.js";

export const createAvailableTime = async (req, res) => {
  const teacherId = req.params.userId;
  const { date, startTime, endTime } = req.body;
  try {
    const timeSlotIds = await availableTimeModel.insert(
      teacherId,
      date,
      startTime,
      endTime
    );
    return res.status(201).json({ timeSlotIds });
  } catch (error) {
    if (error.name === "ConflictError") {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};

export const getAvailableTime = async (req, res) => {
  const teacherId = req.params.userId;
  try {
    const availableTimeSlots = await availableTimeModel.getById(teacherId);
    return res.status(200).json({ availableTimeSlots });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAvailableTimeByDate = async (req, res) => {
  const date = req.params.date;
  const parsedDate = DateUtil.parseDate(date.toString());
  try {
    const availableTimeSlots = await availableTimeModel.getByDate(parsedDate);
    return res.status(200).json({ availableTimeSlots });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createReserveTime = async (req, res) => {
  const studentId = req.params.userId;
  const { timeSlotId } = req.body;
  try {
    const reserveTimeId = await reservationModel.insert(timeSlotId, studentId);
    return res.status(201).json({ reserveTimeId });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getTimeSchedule = async (req, res) => {
  const userId = req.params.userId;
  try {
    const timeSchedule = await reservationModel.getById(userId);
    return res.status(200).json({ timeSchedule });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
