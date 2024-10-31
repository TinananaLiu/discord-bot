import db from "../services/db_connection.js";

export const upsertStudentInfo = async (
  studentId,
  studentName,
  age,
  interests
) => {
  const result = await db.any(
    `
    INSERT INTO "dc-bot".user_account (student_id, student_name, age, interests)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (student_id) 
    DO UPDATE SET 
      student_name = EXCLUDED.student_name,
      age = EXCLUDED.age,
      interests = EXCLUDED.interests
    RETURNING *;
    `,
    [studentId, studentName, age, interests]
  );
  return result;
};