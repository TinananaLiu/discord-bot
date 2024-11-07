import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json"
  }
});

async function postAvailableTime(data, userId) {
  console.log(userId);
  const response = await apiClient.post(
    `/available_time/teacher/${userId}`,
    data
  );
  return response;
}

// async function getAvailableTime(teacherId) {
//   const response = await apiClient.get(`/available_time/teacher/${teacherId}`);
//   return response.data;
// }

async function getAvailableTime(teacherId) {
  const response = await apiClient.get(`/available_time/teacher/${teacherId}`);
  return response.data;
}

async function getAvailableTimeByDate(date) {
  const response = await apiClient.get(`/available_time/date/${date}`); //路徑不確定
  return response.data;
}

async function postReserveTime(data, userId) {
  const response = await apiClient.post(
    `/available_time/student/${userId}`,
    data
  );
  return response;
}

async function postUserInfo(data, userId) {
  const response = await apiClient.post(`/user_info/student/${userId}`, data);
  return response;
}

export {
  postAvailableTime,
  getAvailableTime,
  getAvailableTimeByDate,
  postReserveTime,
  postUserInfo
};
