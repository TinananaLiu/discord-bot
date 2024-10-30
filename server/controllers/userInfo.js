import { insertStudentInfo } from "../models/userinfoModel.js";

export const createUserInfo = async (req, res) => {
  const studentId = req.params.userId;
  const { studentName, age, interests } = req.body;

  try {
    const userInfoId = await insertStudentInfo(
      studentId,
      studentName,
      parseInt(age),
      interests
    );
    return res.status(201).json({ userInfoId });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
