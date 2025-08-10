import { createAsyncThunk } from "@reduxjs/toolkit";
import httpRequest from "@/utils/httpRequest";
import {
  addComment,
  deleteComment,
  replaceComment,
  setComments,
  setLoading,
  toggleLikeComment,
} from "./commentSlice";

// Lấy tất cả bình luận của một bài viết
export const fetchComments = createAsyncThunk(
  "comments/fetchComments",
  async (postId, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const res = await httpRequest.get(`/comments?postId=${postId}`);
      dispatch(setComments(res.data));
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Tạo một bình luận gốc
export const createComment = createAsyncThunk(
  "comments/createComment",
  async ({ postId, content }, { dispatch, rejectWithValue }) => {
    try {
      const res = await httpRequest.post("/comments", {
        postId,
        content,
      });
      dispatch(addComment(res.data));
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Trả lời một bình luận khác
export const replyToComment = createAsyncThunk(
  "comments/replyToComment",
  async ({ postId, parentId, content }, { dispatch, rejectWithValue }) => {
    try {
      const res = await httpRequest.post("/comments", {
        postId,
        parentId,
        content,
      });
      dispatch(addComment(res.data));
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Cập nhật nội dung bình luận
export const updateCommentAsync = createAsyncThunk(
  "comments/updateComment",
  async ({ id, content }, { dispatch, rejectWithValue }) => {
    try {
      const res = await httpRequest.put(`/comments/${id}`, {
        content,
      });
      dispatch(replaceComment(res.data)); // replace toàn bộ bình luận bằng bản mới từ server
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Xoá bình luận
export const deleteCommentAsync = createAsyncThunk(
  "comments/deleteComment",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await httpRequest.delete(`/comments/${id}`);
      dispatch(deleteComment(id));
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Toggle like / unlike bình luận
export const toggleLikeCommentAsync = createAsyncThunk(
  "comments/toggleLike",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await httpRequest.post(`/comments/${id}/like-toggle`);
      dispatch(toggleLikeComment(id));
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
