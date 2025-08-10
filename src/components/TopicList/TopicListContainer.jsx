import { useEffect, useState } from "react";
import TopicList from "./TopicList";
import topicService from "@/services/topic.service";

// eslint-disable-next-line react/prop-types
const TopicListContainer = ({ className, ...props }) => {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        topicService
            .getTopics()
            .then((data) => setTopics(data))
            .catch(() => setTopics([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <TopicList topics={topics} loading={loading} className={className} {...props} />
    );
};

export default TopicListContainer;