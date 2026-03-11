import api from "./BaseApi"; 

const AuthService = {
    login: async (account, password) => {
        try {
            const response = await api.post("/auth/login", { 
                account,
                password
            });
            if (response.data.token) {
                localStorage.setItem("user", JSON.stringify(response.data));
            }
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem("user");
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem("user");
        if (userStr) return JSON.parse(userStr);
        return null;
    },
    resetPassword: async (username, email, newPassword) => {
        try {
            const response = await api.post("/auth/reset-password", {
                username,
                email,
                newPassword
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};
export default AuthService;