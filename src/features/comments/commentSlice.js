import { createSlice } from "@reduxjs/toolkit";

const commentSlice = createSlice({
  name: "comments",
  initialState: {
    items: [],
    isLoading: false,
  },
  reducers: {
    setComments(state, action) {
      state.items = action.payload;
    },
    setLoading(state, action) {
      state.isLoading = action.payload;
    },
    addComment(state, action) {
      const newComment = action.payload;
      if (!newComment.parentId) {
        state.items.unshift({ ...newComment, replies: [] });
      } else {
        const insertReply = (comments) => {
          for (const c of comments) {
            if (c.id === newComment.parentId) {
              c.replies = [...(c.replies || []), newComment];
              return true;
            }
            if (c.replies && insertReply(c.replies)) return true;
          }
          return false;
        };
        insertReply(state.items);
      }
    },
    replyToComment(state, action) {
      const newReply = action.payload;
    
      const insertReply = (comments) => {
        for (const c of comments) {
          if (c.id === newReply.parentId) {
            // Luôn giới hạn lại depth tại đây nếu cần
            const parentDepth = c.depth || 1;
            newReply.depth = Math.min(parentDepth + 1, 3);
            newReply.replies = [];
    
            c.replies = [...(c.replies || []), newReply];
            return true;
          }
          if (c.replies && insertReply(c.replies)) return true;
        }
        return false;
      };
    
      insertReply(state.items);
    },
        
    updateComment(state, action) {
      const { id, content } = action.payload;
      const updateRecursively = (comments) => {
        return comments.map((c) => {
          if (c.id === id) return { ...c, content };
          if (c.replies?.length)
            return { ...c, replies: updateRecursively(c.replies) };
          return c;
        });
      };
      state.items = updateRecursively(state.items);
    },
    deleteComment(state, action) {
      const id = action.payload;
      const deleteRecursively = (comments) => {
        return comments
          .filter((c) => c.id !== id)
          .map((c) => ({
            ...c,
            replies: c.replies ? deleteRecursively(c.replies) : [],
          }));
      };
      state.items = deleteRecursively(state.items);
    },
    toggleLikeComment(state, action) {
      const id = action.payload;
      const toggleLike = (comments) => {
        return comments.map((c) => {
          if (c.id === id) {
            const isLiked = !c.isLiked;
            const likes = isLiked ? c.likes + 1 : c.likes - 1;
            return { ...c, isLiked, likes };
          }
          if (c.replies?.length)
            return { ...c, replies: toggleLike(c.replies) };
          return c;
        });
      };
      state.items = toggleLike(state.items);
    },
  },
});

export const {
  setComments,
  addComment,
  updateComment,
  deleteComment,
  toggleLikeComment,
  setLoading,
  replyToComment,
} = commentSlice.actions;

export default commentSlice.reducer;

// src/features/comments/commentSlice.js

// import { createSlice } from "@reduxjs/toolkit";
// import {
//   addReplyToComments,
//   updateCommentContent,
//   deleteCommentById,
//   toggleLike,
//   replaceCommentById,
//   appendRepliesToComment,
// } from "./commentHelpers";

// const commentSlice = createSlice({
//   name: "comments",
//   initialState: {
//     items: [],
//     isLoading: false,
//   },
//   reducers: {
//     setComments(state, action) {
//       state.items = action.payload;
//     },
//     setLoading(state, action) {
//       state.isLoading = action.payload;
//     },
//     clearComments(state) {
//       state.items = [];
//     },
//     addComment(state, action) {
//       const newComment = action.payload;
//       if (!newComment.parentId) {
//         state.items.unshift({ ...newComment, replies: [] });
//       } else {
//         state.items = addReplyToComments(state.items, newComment.parentId, newComment);
//       }
//     },
//     updateComment(state, action) {
//       const { id, content } = action.payload;
//       state.items = updateCommentContent(state.items, id, content);
//     },
//     deleteComment(state, action) {
//       const id = action.payload;
//       state.items = deleteCommentById(state.items, id);
//     },
//     toggleLikeComment(state, action) {
//       const id = action.payload;
//       state.items = toggleLike(state.items, id);
//     },
//     replaceComment(state, action) {
//       const updated = action.payload;
//       state.items = replaceCommentById(state.items, updated);
//     },
//     appendReplies(state, action) {
//       const { id, replies } = action.payload;
//       state.items = appendRepliesToComment(state.items, id, replies);
//     },
//   },
// });

// export const {
//   setComments,
//   setLoading,
//   clearComments,
//   addComment,
//   updateComment,
//   deleteComment,
//   toggleLikeComment,
//   replaceComment,
//   appendReplies,
// } = commentSlice.actions;

// export default commentSlice.reducer;
