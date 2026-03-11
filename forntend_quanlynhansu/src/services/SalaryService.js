import BaseApi from "./BaseApi";

const API_URL = "/salary";

const getMyHistory = (userId) => {
    return BaseApi.get(`${API_URL}/history?userId=${userId}`);
};

// Admin tính lương
const calculate = (userId, month, year) => {
    return BaseApi.post(`${API_URL}/calculate?userId=${userId}&month=${month}&year=${year}`);
};

export default { getMyHistory, calculate };