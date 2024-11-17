import userInfoModel from "../models/userInfoModel.js";

export const createUserInfo = async (req, res) => {
  const studentId = req.params.userId;
  const { studentName, age, interests } = req.body;

  try {
    const userInfoId = await userInfoModel.upsert(
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
