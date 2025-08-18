import httpRequest from "@/utils/httpRequest";

let abortController = null;

export const createConversation = async (data) => {
  try {
    const response = await httpRequest.post("/conversations", data);
    return response.data;
  } catch (error) {
    console.error("Create conversation error:", error);
    throw error;
  }
};

export const sendMessage = async (conversationId, data) => {
  try {
    // Hủy request cũ nếu còn đang chạy
    if (abortController) {
      abortController.abort();
    }

    // Tạo controller mới cho request này
    abortController = new AbortController();

    const response = await httpRequest.post(
      `/conversations/${conversationId}/chat`,
      data,
      { signal: abortController.signal }
    );

    return response.data;
  } catch (error) {
    if (error.name === "CanceledError" || error.name === "AbortError") {
      console.warn("Send message request canceled");
      return null;
    }
    console.error("Send message error:", error);
    throw error;
  }
};

export const getMessages = async (conversationId) => {
  try {
    const response = await httpRequest.get(`/conversations/${conversationId}/messages`);
    return response.data;
  } catch (error) {
    console.error("Get messages error:", error);
    throw error;
  }
};

export const closeConversation = async (conversationId) => {
  try {
    const response = await httpRequest.patch(`/conversations/${conversationId}/close`);
    return response.data;
  } catch (error) {
    console.error("Close conversation error:", error);
    throw error;
  }
};

// Hàm để dừng request hiện tại
export const stopRequest = () => {
  if (abortController) {
    abortController.abort();
    abortController = null;
  }
};
