import {
  insertTimeSlot
} from "../models/availableTimeModel.js";

export const createAvailableTime = async (req, res) => {
  const teacherId = req.params.userId;
  const {date, startTime, endTime} = req.body;
  try {
    const timeSlotIds = await insertTimeSlot(teacherId, date, startTime, endTime);
    return res.status(201).json({timeSlotIds});
  }
  catch (error){
    return res.status(500).json({message: error.message});
  }
}