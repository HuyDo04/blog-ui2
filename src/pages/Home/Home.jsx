import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TopicList, FeaturedPosts, PostList, Button } from "../../components";
import styles from "./Home.module.scss";
import { getTopics } from "@/services/topic.service";
import { getPosts } from "@/services/post.service";

const Home = () => {
    const navigate = useNavigate();

    const [recentPosts, setRecentPosts] = useState([]);
    const [featuredPosts, setFeaturedPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [topics, setTopics] = useState([]);

    useEffect(() => {
        const fetchTopicsData = async () => {
            try {
                const data = await getTopics();
                setTopics(data);
            } catch (error) {
                setTopics([]);
            }
        };
        fetchTopicsData();
    }, []);

    useEffect(() => {
        const fetchPostsData = async () => {
            setLoading(true);
            try {
                const posts = await getPosts();
                setRecentPosts(posts.slice(0, 6));
                setFeaturedPosts(posts.slice(0, 3));
            } catch (error) {
                setRecentPosts([]);
                setFeaturedPosts([]);
            }
            setLoading(false);
        };
        fetchPostsData();
    }, []);
    
    const handleTopicClick = (slug) => {
        navigate(`/topics/by-slug/${slug}`);
    };

    // Map lại dữ liệu cho đúng prop types
    const mapPost = (post) => ({
        ...post,
        author: {
          name: post?.author?.username ?? "Unknown",
          avatar: post?.author?.avatar ?? "",
        },
        topic:
          typeof post.topic === "object" && post.topic !== null
            ? post.topic.name
            : post.topic || "",
      });
      
      const mappedFeaturedPosts = featuredPosts.map(mapPost);
      const mappedRecentPosts = recentPosts.map(mapPost);
      
    return (
        <div className={styles.home}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <div className="container">
                    <div className={styles.heroContent}>
                        <div className={styles.heroText}>
                            <h1 className={styles.heroTitle}>
                                Learn{" "}
                                <span className={styles.heroHighlight}>
                                    Modern Web Development
                                </span>{" "}
                                with Expert Insights
                            </h1>
                            <p className={styles.heroDescription}>
                                Discover cutting-edge tutorials, best practices,
                                and industry insights from experienced
                                developers. Stay ahead with the latest
                                technologies and frameworks.
                            </p>
                            <div className={styles.heroActions}>
                                <Button variant="primary" size="lg" asChild>
                                    <Link to="/topics">Explore Topics</Link>
                                </Button>
                                <Button
                                    component="a"
                                    variant="ghost"
                                    size="lg"
                                    href="#featured"
                                    className={styles.heroButton}
                                >
                                    Featured Posts
                                </Button>
                            </div>
                        </div>
                        <div className={styles.heroVisual}>
                            <div className={styles.heroCard}>
                                <div className={styles.heroCardHeader}>
                                    <div className={styles.heroCardDots}>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                                <div className={styles.heroCardContent}>
                                    <div className={styles.heroCode}>
                                        <div className={styles.codeLine}>
                                            <span className={styles.codeKeyword}>
                                                const
                                            </span>
                                            <span className={styles.codeVariable}>
                                                {" "}knowledge
                                            </span>
                                            <span className={styles.codeOperator}>
                                                {" "}={" "}
                                            </span>
                                            <span className={styles.codeString}>
                                                &apos;power&apos;
                                            </span>
                                        </div>
                                        <div className={styles.codeLine}>
                                            <span className={styles.codeKeyword}>
                                                function
                                            </span>
                                            <span className={styles.codeFunction}>
                                                {" "}learn
                                            </span>
                                            <span className={styles.codeBracket}>
                                                ()
                                            </span>
                                            <span className={styles.codeBracket}>
                                                {" "}{"{"}
                                            </span>
                                        </div>
                                        <div className={styles.codeLine}>
                                            <span className={styles.codeIndent}>
                                                {" "}
                                            </span>
                                            <span className={styles.codeKeyword}>
                                                return
                                            </span>
                                            <span className={styles.codeVariable}>
                                                {" "}success
                                            </span>
                                        </div>
                                        <div className={styles.codeLine}>
                                            <span className={styles.codeBracket}>
                                                {"}"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container">
                {/* Featured Posts */}
                <section id="featured" className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>
                            Featured Articles
                        </h2>
                        <p className={styles.sectionSubtitle}>
                            Hand-picked content from our expert contributors
                        </p>
                    </div>
                    <FeaturedPosts
                        posts={mappedFeaturedPosts}
                        maxPosts={3}
                        showTitle={false}
                    />
                </section>

                {/* Recent Posts */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Latest Posts</h2>
                        <p className={styles.sectionSubtitle}>
                            Fresh content updated regularly
                        </p>
                    </div>
                    <PostList
                        posts={mappedRecentPosts}
                        loading={loading}
                        showPagination={false}
                        layout="grid"
                        className={styles.recentPosts}
                    />
                    <div className={styles.sectionAction}>
                        <Button variant="secondary" size="lg" asChild>
                            <Link to="/topics">View All Posts</Link>
                        </Button>
                    </div>
                </section>

                {/* Trending Topics */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Trending Topics</h2>
                        <p className={styles.sectionSubtitle}>
                            Popular categories our readers love
                        </p>
                    </div>
                    <TopicList 
                        topics={topics} 
                        onTopicClick={handleTopicClick}
                    />
                    <div className={styles.sectionAction}>
                        <Button variant="secondary" asChild>
                            <Link to="/topics">Explore All Topics</Link>
                        </Button>
                    </div>
                </section>

                {/* Newsletter CTA */}
                <section className={styles.newsletter}>
                    <div className={styles.newsletterCard}>
                        <div className={styles.newsletterContent}>
                            <h3 className={styles.newsletterTitle}>
                                Stay Updated
                            </h3>
                            <p className={styles.newsletterDescription}>
                                Get the latest tutorials and insights delivered
                                to your inbox weekly. Join our community of
                                developers!
                            </p>
                            <div className={styles.newsletterActions}>
                                <Button variant="primary" size="lg">
                                    Subscribe Newsletter
                                </Button>
                            </div>
                        </div>
                        <div className={styles.newsletterVisual}>📧</div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Home;