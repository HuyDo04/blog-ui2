import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopicList from "../../components/TopicList/TopicList";
import Loading from "../../components/Loading/Loading";
import {getTopics} from "@/services/topic.service";
import styles from "./TopicsListing.module.scss";
const TopicsListing = () => {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchTopics = async () => {
            setLoading(true);
            try {
                const data = await getTopics();
                setTopics(data || []);
            } catch (error) {
                setTopics([]);
                console.error("Failed to fetch topics:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTopics();
    }, []);
    const handleTopicClick = (slug) => {
        navigate(`/topics/by-slug/${slug}`);
    };
    if (loading) {
        return (
            <div className={styles.topicsListing}>
                <div className="container">
                    <Loading size="md" text="Loading topics..." />
                </div>
            </div>
        );
    }
    return (
        <div className={styles.topicsListing}>
            <div className="container">
                {/* Header */}
                <header className={styles.header}>
                    <h1 className={styles.title}>All Topics</h1>
                    <p className={styles.description}>
                        Explore all available topics and find content that
                        interests you.
                    </p>
                </header>
                {/* Topics Grid */}
                <section className={styles.content}>
                    <TopicList 
                        topics={topics} 
                        loading={loading}
                        onTopicClick={handleTopicClick}
                    />
                </section>
            </div>
        </div>
    );
};
export default TopicsListing;