import httpRequest from "@/utils/httpRequest";

// Get all users
export const getUsers = async () => {
    const response = await httpRequest.get("/users");
    return response;
};

// Get user by ID
export const getUserById = async (id) => {
    const response = await httpRequest.get(`/users/${id}`);
    return response;
}

// Create user
export const createUser = async (userData) => {
    const response = await httpRequest.post("/users", userData);
    return response;
};

// Update existing user
export const updateUser = async (id, userData) => {
    const response = await httpRequest.put(`/users/${id}`, userData);
    return response;
};

// Delete user
export const deleteUser = async (id) => {
    const response = await httpRequest.del(`/users/${id}`);
    return response;
};

// Update user avatar
export const updateAvatar = async (formData) => {
    // Giả định rằng httpRequest có thể xử lý FormData và header multipart/form-data
    const response = await httpRequest.patch(`/users/me/avatar`, formData);
    return response;
};
