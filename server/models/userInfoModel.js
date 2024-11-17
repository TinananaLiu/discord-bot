import db from "../config/db.js";
import BaseModel from "./baseModel.js";
import {DatabaseError} from "../utils/errorClass.js";

class UserInfoModel extends BaseModel{
  constructor(){
    super();
  }

  async upsert(studentId, studentName, age, interests){
    try{
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
    }
    catch (error){
      console.error('Error during "UserInfoModel.upsert()":', error);
      throw new DatabaseError(`Failed to execute SQL transaction, ${error}`);
    }
  }
}

export default new UserInfoModel();