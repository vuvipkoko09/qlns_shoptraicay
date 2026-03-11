import api from "./BaseApi";

const WorkReportService = {
    getAll: () => api.get("/work-reports"),
    getById: (id) => api.get(`/work-reports/${id}`),
    create: (data) => api.post("/work-reports", data),
    update: (id, data) => api.put(`/work-reports/${id}`, data),
    delete: (id) => api.delete(`/work-reports/${id}`),
    getByUserId: (userId)=>api.get(`/work-reports/user/${userId}`),
};

export default WorkReportService;
