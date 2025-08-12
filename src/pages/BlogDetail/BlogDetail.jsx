import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    BlogContent,
    AuthorInfo,
    RelatedPosts,
    CommentSection,
    Loading,
} from "../../components";
import styles from "./BlogDetail.module.scss";
import { getPostBySlug } from "@/services/post.service";
import { getUserById } from "@/services/user.service";

import {
    createComment as apiCreateComment,
    getCommentsByPost,
    updateComment as apiUpdateComment,
    deleteComment as apiDeleteComment,
} from "@/services/comment.service";

import { useDispatch, useSelector } from "react-redux";
import {
    setComments,
    addComment as addCommentAction,
    updateComment as updateCommentAction,
    deleteComment as deleteCommentAction,
    toggleLikeComment,
    replyToComment,
} from "@/features/comments/commentSlice";

const BlogDetail = () => {
    const { slug } = useParams();
    const dispatch = useDispatch();
    const comments = useSelector((state) => state.comments.items);

    const [loading, setLoading] = useState(true);
    const [post, setPost] = useState(null);
    const [likes, setLikes] = useState(0);
    const [views] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [likingInProgress, setLikingInProgress] = useState(false);
    const [bookmarkingInProgress, setBookmarkingInProgress] = useState(false);
    const [isAuthenticated] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const postRes = await getPostBySlug(slug);
                const authorRes = await getUserById(postRes.authorId);
                const fullPost = {
                    ...postRes,
                    author: {
                        name: authorRes.username,
                        avatar: authorRes.avatar || "http://localhost:3000/uploads/posts/avatar-default.jpg",
                        social: {},
                    },
                };
                setPost(fullPost);
                setLikes(postRes.likes || 0);

                const commentRes = await getCommentsByPost(postRes.id);
                dispatch(setComments(commentRes));
            } catch (err) {
                console.error("Lỗi tải bài viết:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug, dispatch]);

    // 🟢 Comment handlers
    const handleAddComment = async (content) => {
        if (!post?.id) return;
        try {
            const res = await apiCreateComment({ content, postId: post.id });
            dispatch(addCommentAction(res));
        } catch (err) {
            console.error("Lỗi thêm bình luận:", err);
        }
    };

    const handleReplyComment = async (parentId, content) => {
        try {
          const res = await apiCreateComment({ content, postId: post.id, parentId });
      
          // Đảm bảo giới hạn cấp độ khi dispatch
        //   dispatch(addCommentAction({
        //     ...res,
        //     depth: Math.min(level + 1, 3), // cấp tối đa là 3
        //   }));
        dispatch(replyToComment(res));
        } catch (err) {
          console.error("Lỗi phản hồi:", err);
        }
      };
      

    const handleEditComment = async (commentId, newContent) => {
        try {
            const updated = await apiUpdateComment(commentId, { content: newContent });
            dispatch(updateCommentAction({ id: commentId, content: updated.content }));
        } catch (err) {
            console.error("Lỗi sửa bình luận:", err);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await apiDeleteComment(commentId);
            dispatch(deleteCommentAction(commentId));
        } catch (err) {
            console.error("Lỗi xoá bình luận:", err);
        }
    };

    const handleLikeComment = (commentId) => {
        dispatch(toggleLikeComment(commentId));
    };

    const handleLikePost = async () => {
        if (likingInProgress) return;
        setLikingInProgress(true);
        setIsLiked((prev) => !prev);
        setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
        setLikingInProgress(false);
    };

    const handleBookmarkPost = async () => {
        if (bookmarkingInProgress) return;
        setBookmarkingInProgress(true);
        setIsBookmarked((prev) => !prev);
        setBookmarkingInProgress(false);
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Loading text="Đang tải bài viết..." />
            </div>
        );
    }

    if (!post) {
        return (
            <div className={styles.notFoundContainer}>
                <h1>Bài viết không tồn tại</h1>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.articleHeader}>
                <BlogContent {...post} />
                <div className={styles.interactions}>
                    <div className={styles.stats}>
                        <span>{views} lượt xem</span>
                        <span>{likes} lượt thích</span>
                    </div>
                    <div className={styles.actions}>
                        <button onClick={handleLikePost} disabled={likingInProgress}>
                            {isLiked ? "Đã thích" : "Thích"}
                        </button>
                        <button onClick={handleBookmarkPost} disabled={bookmarkingInProgress}>
                            {isBookmarked ? "Đã lưu" : "Lưu"}
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.authorSection}>
                <AuthorInfo author={post.author} />
                {console.log(post.author)};
                
            </div>

            <div className={styles.contentSection}>
                <RelatedPosts posts={[]} />
            </div>

            <div className={styles.contentSection}>
                <CommentSection
                    comments={comments}
                    onAddComment={handleAddComment}
                    onReplyComment={handleReplyComment}
                    onLikeComment={handleLikeComment}
                    onEditComment={handleEditComment}
                    onDeleteComment={handleDeleteComment}
                    isAuthenticated={isAuthenticated}
                />
            </div>
        </div>
    );
};

export default BlogDetail;
