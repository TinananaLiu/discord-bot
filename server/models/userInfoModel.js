import db from "../services/db_connection.js";

export const insertStudentInfo = async (
  studentId,
  studentName,
  age,
  interests
) => {
  const result = await db.any(
    `
        INSERT INTO "dc-bot".user_account (student_id, student_name, age, interests)
        VALUES($1, $2, $3, $4)
        RETURNING *;
        `,
    [studentId, studentName, age, interests]
  );
  return result;
};
