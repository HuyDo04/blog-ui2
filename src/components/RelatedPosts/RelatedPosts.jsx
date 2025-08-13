import PropTypes from 'prop-types';
import PostCard from '../PostCard/PostCard';
import EmptyState from '../EmptyState/EmptyState';
import styles from './RelatedPosts.module.scss';

const RelatedPosts = ({
  posts = [],
  loading = false,
  maxPosts = 3,
  className,
  ...props
}) => {
  const displayPosts = posts.slice(0, maxPosts);

  if (loading) {
    return (
      <section className={`${styles.relatedPosts} ${className || ''}`} {...props}>
        <h2 className={styles.title}>Related Posts</h2>
        <div className={styles.grid}>
          {Array.from({ length: maxPosts }, (_, index) => (
            <PostCard key={index} loading />
          ))}
        </div>
      </section>
    );
  }

  if (displayPosts.length === 0) {
    return (
      <section className={`${styles.relatedPosts} ${className || ''}`} {...props}>
        <h2 className={styles.title}>Related Posts</h2>
        <EmptyState
          icon="📰"
          title="No related posts"
          description="Check back later for more content on this topic."
        />
      </section>
    );
  }

  return (
    <section className={`${styles.relatedPosts} ${className || ''}`} {...props}>
      <h2 className={styles.title}>Related Posts</h2>
      <div className={styles.grid}>
        {displayPosts.map((post) => (
          <PostCard
            key={post.id}
            {...post}
            topic={typeof post.topic === "object" ? post.topic?.name : post.topic}
            compact
          />
        ))}
      </div>
    </section>
  );
};

RelatedPosts.propTypes = {
  posts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      title: PropTypes.string,
      excerpt: PropTypes.string,
      featuredImage: PropTypes.string,
      author: PropTypes.shape({
        username: PropTypes.string,
        avatar: PropTypes.string,
      }),
      publishedAt: PropTypes.string,
      readTime: PropTypes.number,
      topic: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
          name: PropTypes.string,
          slug: PropTypes.string,
          icon: PropTypes.string
        })
      ]),
    })
  ),
  loading: PropTypes.bool,
  maxPosts: PropTypes.number,
  className: PropTypes.string,
};

export default RelatedPosts;
