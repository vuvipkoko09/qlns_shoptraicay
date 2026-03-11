import api from "./BaseApi";

const UserService = {
  getAll: () => api.get("/users"),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post("/users", data),
  update: (id, formData) =>
    api.put(`/users/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => api.delete(`/users/${id}`),
  uploadImage: (id, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(`/users/${id}/image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default UserService;
