import BaseApi from "./BaseApi";

const API_URL = "/leave";

const create = (userId, data) => {
    return BaseApi.post(`${API_URL}/create?userId=${userId}`, data);
};

const getMyHistory = (userId) => {
    return BaseApi.get(`${API_URL}/my-history?userId=${userId}`);
};

// Admin
const getAll = () => {
    return BaseApi.get(`${API_URL}/all`);
};

const approve = (id, status, comment) => {
    return BaseApi.put(`${API_URL}/approve/${id}?status=${status}&comment=${comment}`);
};

export default { create, getMyHistory, getAll, approve };