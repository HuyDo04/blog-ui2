import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as postService from "@/services/post.service";

export const addPost = createAsyncThunk("posts/addPost", async (postData) => {
    const formData = new FormData();
    for (const key in postData) {
        if (key === "media") {
            postData.media.forEach(file => formData.append("media", file));
        } else if (key === "tags") {
            postData.tags.forEach(tagId => formData.append("tags[]", tagId));
        } else {
            formData.append(key, postData[key]);
        }
    }
    const res = await postService.createPost(formData);
    return res.data;
});


export const fetchPosts = createAsyncThunk("posts/fetchPosts", async () => {
    const res = await postService.getPosts();
    return res.data;
});

export const fetchPostBySlug = createAsyncThunk("posts/fetchPostBySlug", async (slug) => {
    const res = await postService.getPostBySlug(slug);
    return res.data;
});


export const editPost = createAsyncThunk("posts/editPost", async ({ id, postData }) => {
    const res = await postService.updatePost(id, postData);
    return res.data;
});

export const removePost = createAsyncThunk("posts/removePost", async (id) => {
    await postService.deletePost(id);
    return id;
});

const postSlice = createSlice({
    name: "posts",
    initialState: {
        list: [],
        currentPost: null,
        loading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPosts.pending, (state) => { state.loading = true; })
            .addCase(fetchPosts.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(fetchPosts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(fetchPostBySlug.fulfilled, (state, action) => {
                state.currentPost = action.payload;
            })
            .addCase(addPost.fulfilled, (state, action) => {
                state.list.push(action.payload);
            })
            .addCase(editPost.fulfilled, (state, action) => {
                const index = state.list.findIndex(p => p.id === action.payload.id);
                if (index !== -1) state.list[index] = action.payload;
            })
            .addCase(removePost.fulfilled, (state, action) => {
                state.list = state.list.filter(p => p.id !== action.payload);
            });
    }
});

export default postSlice.reducer;
