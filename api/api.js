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
  try {
    const response = await apiClient.get(
      `/available_time/teacher/${teacherId}`
    );
    console.log(
      `Fetched available time: ${response.status} ${response.statusText}`
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      // 伺服器有回應，但狀態碼非 2xx
      console.error("Server responded with:", error.response.data);
    } else if (error.request) {
      // 請求已發出，但未收到回應
      console.error("No response received:", error.request);
    } else {
      // 發出請求前的錯誤
      console.error("Error setting up request:", error.message);
    }
    throw new Error("Failed to retrieve available time.");
  }
}

async function postUserInfo(data, userId) {
  const response = await apiClient.post(`/user_info/student/${userId}`, data);
  return response;
}

export { postAvailableTime, getAvailableTime, postUserInfo };
