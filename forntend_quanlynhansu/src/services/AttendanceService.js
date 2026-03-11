import BaseApi from "./BaseApi";

const API_URL = "/attendance";

const checkIn = (userId, data) => {
    return BaseApi.post(`${API_URL}/check-in?userId=${userId}`, data);
};

const checkOut = (userId) => {
    return BaseApi.post(`${API_URL}/check-out?userId=${userId}`);
};

const getToday = (userId) => {
    return BaseApi.get(`${API_URL}/today?userId=${userId}`);
};

const getHistory = (userId, month, year) => {
    return BaseApi.get(`${API_URL}/history?userId=${userId}&month=${month}&year=${year}`);
};

export default { checkIn, checkOut, getToday, getHistory };