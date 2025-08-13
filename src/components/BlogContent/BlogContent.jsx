import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import Badge from "../Badge/Badge";
import FallbackImage from "../FallbackImage/FallbackImage";
import styles from "./BlogContent.module.scss";

// Nhận trực tiếp các props riêng lẻ, bao gồm cả topicId
const BlogContent = ({
    title,
    content,
    author,
    publishedAt,
    updatedAt,
    readTime,
    topic,
    topicId,
    authorId,
    createdAt, // <--- ĐÃ THÊM: Tách topicId ra khỏi props
    featuredImage,
    loading = false,
    className,
    published,
    ...props // props bây giờ sẽ không chứa topicId nữa
}) => {
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };
 

    const getImageUrl = (path) => {
        if (!path) return "";
    
        // Nếu đã là URL tuyệt đối thì trả về luôn
        if (/^https?:\/\//i.test(path)) {
            return path;
        }
    
        const API_URL = new URL(
            import.meta.env.VITE_BASE_URL || "http://localhost:3000"
        );
        const ASSET_BASE_URL = `${API_URL.protocol}//${API_URL.host}`;
    
        // Chuyển \ thành / và bỏ public/ ở đầu
        const imagePath = path
            .replace(/\\/g, "/")         // fix path Windows
            .replace(/^public\//, "");   // bỏ "public/" ở đầu nếu có
    
        return `${ASSET_BASE_URL}/${imagePath}`;
    };
    
    
    if (loading || !title) {
        return (
            // Thẻ article sẽ không còn nhận được prop topicId không hợp lệ
            <article className={`${styles.blogContent} ${className || ""}`} {...props}>
                <div className={styles.skeleton}>
                    <div className={styles.skeletonImage} />
                    <div className={styles.skeletonHeader}>
                        <div className={styles.skeletonTitle} />
                        <div className={styles.skeletonMeta} />
                    </div>
                    <div className={styles.skeletonContent}>
                        {Array.from({ length: 8 }, (_, i) => (
                            <div key={i} className={styles.skeletonParagraph} />
                        ))}
                    </div>
                </div>
            </article>
        );
    }

    return (
        // Thẻ article sẽ không còn nhận được prop topicId không hợp lệ
        <article className={`${styles.blogContent} ${className || ""}`} {...props}>
            {featuredImage && (
                <div className={styles.imageContainer}>
                    <FallbackImage
                        src={getImageUrl(featuredImage)}
                        alt={title}
                        className={styles.featuredImage}
                    />
                </div>
            )}

            <header className={styles.header}>
                {topic?.name && (
                    <div className={styles.topicBadge}>
                        <Badge variant="primary" size="md">
                            {topic.name}
                        </Badge>
                    </div>
                )}

                <h1 className={styles.title}>{title}</h1>

                <div className={styles.meta}>
                    <div className={styles.author}>
                        {author?.avatar && (
                            <FallbackImage
                                src={getImageUrl(author.avatar)}
                                alt={author.name || author.username}
                                className={styles.authorAvatar}
                            />
                        )}
                        <div className={styles.authorInfo}>
                            <Link
                                to={`/p/${author?.username}`}
                                className={styles.authorName}
                            >
                                {author?.name || author?.username}
                            </Link>
                            <div className={styles.dateInfo}>
                                <time dateTime={publishedAt} className={styles.publishDate}>
                                    {formatDate(publishedAt)}
                                </time>
                                {updatedAt && updatedAt !== publishedAt && (
                                    <span className={styles.updateInfo}>
                                        • Cập nhật {formatDate(updatedAt)}
                                    </span>
                                )}
                                {readTime > 0 && (
                                    <span className={styles.readTime}>
                                        • {readTime} phút đọc
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className={styles.content}>
                {typeof content === "string" ? (
                    <div
                        className={styles.htmlContent}
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                ) : (
                    content
                )}
            </div>
        </article>
    );
};

// Cập nhật PropTypes để khớp với các props riêng lẻ
BlogContent.propTypes = {
    title: PropTypes.string,
    content: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    author: PropTypes.shape({
        name: PropTypes.string,
        username: PropTypes.string,
        avatar: PropTypes.string,
    }),
    publishedAt: PropTypes.string,
    updatedAt: PropTypes.string,
    readTime: PropTypes.number,
    topic: PropTypes.shape({
        name: PropTypes.string,
    }),
    topicId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // <--- ĐÃ THÊM
    featuredImage: PropTypes.string,
    loading: PropTypes.bool,
    className: PropTypes.string,
    published: PropTypes.bool,
};

export default BlogContent;
