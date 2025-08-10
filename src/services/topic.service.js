import httpRequest from "@/utils/httpRequest";

export const getTopics = async () => {
    const response = await httpRequest.get("/topics");
    return response;
};

export const getTopicById = async (id) => {
    const response = await httpRequest.get(`/topics/${id}`);
    return response;
};

export const getTopicBySlug = async (slug) => {
    const response = await httpRequest.get(`/topics/by-slug/${slug}`);
    return response;
};

export const createTopic = async (topicData) => {
    const response = await httpRequest.post("/topics", topicData);
    return response;
};

export const updateTopic = async (id, topicData) => {
    const response = await httpRequest.put(`/topics/${id}`, topicData);
    return response;
};

export const deleteTopic = async (id) => {
    const response = await httpRequest.delete(`/topics/${id}`);
    return response;
};