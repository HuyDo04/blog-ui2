// src/features/comments/commentActions.js
export const replyToComment = (parentId, content, currentDepth) => async (dispatch) => {
    const replyDepth = Math.min(currentDepth + 1, 3); // không vượt quá 3
  
    const newReply = {
      id: Date.now(), // Tạo tạm id, nên thay bằng từ server nếu có
      content,
      parentId,
      depth: replyDepth,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: [],
      replies: [],
      author: {
        id: 1,
        fullName: "Người dùng demo",
        avatar: null,
      },
    };
  
    dispatch({
      type: 'comments/addReply',
      payload: newReply,
    });
  };
  