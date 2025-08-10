// src/features/comments/commentHelpers.js

export const addReplyToComments = (comments, parentId, reply) => {
    return comments.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), reply],
        };
      }
      if (comment.replies?.length) {
        return {
          ...comment,
          replies: addReplyToComments(comment.replies, parentId, reply),
        };
      }
      return comment;
    });
  };
  
  export const updateCommentContent = (comments, id, content) => {
    return comments.map(c => {
      if (c.id === id) return { ...c, content };
      if (c.replies?.length) {
        return { ...c, replies: updateCommentContent(c.replies, id, content) };
      }
      return c;
    });
  };
  
  export const deleteCommentById = (comments, id) => {
    return comments
      .filter(c => c.id !== id)
      .map(c => ({
        ...c,
        replies: deleteCommentById(c.replies || [], id),
      }));
  };
  
  export const toggleLike = (comments, id) => {
    return comments.map(c => {
      if (c.id === id) {
        const isLiked = !c.isLiked;
        const likes = isLiked ? c.likes + 1 : c.likes - 1;
        return { ...c, isLiked, likes };
      }
      if (c.replies?.length) {
        return { ...c, replies: toggleLike(c.replies, id) };
      }
      return c;
    });
  };
  
  export const replaceCommentById = (comments, updated) => {
    return comments.map(c => {
      if (c.id === updated.id) return updated;
      if (c.replies?.length) {
        return { ...c, replies: replaceCommentById(c.replies, updated) };
      }
      return c;
    });
  };
  
  export const appendRepliesToComment = (comments, id, replies) => {
    return comments.map(c => {
      if (c.id === id) {
        return {
          ...c,
          replies: [...(c.replies || []), ...replies],
        };
      }
      if (c.replies?.length) {
        return { ...c, replies: appendRepliesToComment(c.replies, id, replies) };
      }
      return c;
    });
  };
  