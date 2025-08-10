import httpRequest from "../utils/httpRequest";

// Upload a single file
export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    return await httpRequest.post("/upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};
