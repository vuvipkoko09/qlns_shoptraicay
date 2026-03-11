import api from "./BaseApi";

const WorkScheduleService = {
    getAll: () => api.get("/schedules"),
    getById: (id) => api.get(`/schedules/${id}`),
    create: (data) => api.post("/schedules", data),
    update: (id, data) => api.put(`/schedules/${id}`, data),
    delete: (id) => api.delete(`/schedules/${id}`),
    getByUserId: (userId) => api.get(`/schedules/user/${userId}`),
    createGroup: (data) => api.post("/schedules/group", data)
};

export default WorkScheduleService;
