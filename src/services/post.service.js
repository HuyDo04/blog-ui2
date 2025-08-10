import httpRequest from "@/utils/httpRequest";

const buildFormData = (postData) => {
    const formData = new FormData();
    for (const key in postData) {
        if (key === 'featuredImage' && postData.featuredImage) {
            formData.append('featuredImage', postData.featuredImage);
        } else if (key === 'media' && postData.media) {
            for (let i = 0; i < postData.media.length; i++) {
                formData.append('media', postData.media[i]);
            }
        } else if (postData[key] !== null && postData[key] !== undefined) {
            formData.append(key, postData[key]);
        }
    }
    return formData;
};

// Get all posts
export const getPosts = async () => {
    return await httpRequest.get("/posts");
};

// Create post
export const createPost = async (postData) => {
    const formData = buildFormData(postData);
    return await httpRequest.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
};

// Update existing post
export const updatePost = async (id, postData) => {
    const formData = buildFormData(postData);
    return await httpRequest.put(`/posts/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
};

// Delete post
export const deletePost = async (id) => {
    return await httpRequest.del(`/posts/${id}`);
};

export const getPostById = async (id) => {
    return await httpRequest.get(`/posts/${id}`);
};

export const getPostBySlug = async (slug) => {
    return await httpRequest.get(`/posts/by-slug/${slug}`);
};
