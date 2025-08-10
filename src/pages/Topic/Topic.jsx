import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import TopicHeader from "../../components/TopicHeader/TopicHeader";
import PostList from "../../components/PostList/PostList";
import EmptyState from "../../components/EmptyState/EmptyState";
import Loading from "../../components/Loading/Loading";
import { getTopicBySlug } from "@/services/topic.service";
import { getUserById } from "@/services/user.service"; // Import the user service
import styles from "./Topic.module.scss";

const Topic = () => {
    const { slug } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();

    const [topic, setTopic] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pagination
    const currentPage = parseInt(searchParams.get("page")) || 1;
    const postsPerPage = 10;
    const [totalPages, setTotalPages] = useState(1);
    
    useEffect(() => {
        const fetchTopicAndPosts = async () => {
            setLoading(true);
            setError(null);

            try {
                const topicData = await getTopicBySlug(slug, {
                    page: currentPage,
                    pageSize: postsPerPage,
                });

                if (!topicData) {
                    setError("Topic not found");
                    return;
                }

                setTopic(topicData);
                
                // If there are posts, fetch their authors
                if (topicData.posts && topicData.posts.length > 0) {
                    const postsWithAuthors = await Promise.all(
                      topicData.posts.map(async (post) => {
                        
                        try {
                          if (!post.authorId) throw new Error("Missing authorId");
                  
                          const authorData = await getUserById(post.authorId);
                          console.log(`Author fetched for post ${post.id}:`, authorData);
                          
                          return {
                            ...post,
                            author: authorData, // chứa full name, avatar, username, ...
                          };
                        } catch (error) {
                          console.error(`Author fetch failed for post ${post.id}:`, error);
                          return {
                            ...post,
                            author: {
                              username: "unknown",
                              avatar: "",
                              firstName: "",
                              lastName: "",
                            },
                          };
                        }
                      })
                    );
                    setPosts(postsWithAuthors);
                  } else {
                    setPosts([]);
                  }
                  

                // Pagination
                if (topicData.postCount) {
                    setTotalPages(Math.ceil(topicData.postCount / postsPerPage));
                } else {
                    setTotalPages(1);
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load topic");
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchTopicAndPosts();
        }
    }, [slug, currentPage]);

    const handlePageChange = (page) => {
        setSearchParams({ page: page.toString() });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (loading) {
        return (
            <div className={styles.topicPage}>
                <div className="container">
                    <Loading size="md" text="Đang tải chủ đề..." />
                </div>
            </div>
        );
    }

    if (error || !topic) {
        return (
            <div className={styles.topicPage}>
                <div className="container">
                    <EmptyState
                        icon="📚"
                        title="Không tìm thấy chủ đề"
                        description="Chủ đề bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."
                    />
                </div>
            </div>
        );
    }

    return (
        <div className={styles.topicPage}>
            <div className="container">
                {/* Topic Header */}
                <TopicHeader topic={topic} />

                {/* Post List */}
                <PostList
                   posts={posts.map(post => ({
                    ...post,
                    author: {
                      name: post.author?.username || "Unknown",
                      avatar: post.author?.avatar || "",
                      username: post.author?.username
                    }
                  }))}
                    loading={false}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    showPagination={true}
                    className={styles.postsList}
                />
            </div>
        </div>
    );
};

export default Topic;