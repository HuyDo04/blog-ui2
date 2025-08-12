import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../features/auth/authSlice";
import AuthorInfo from "../../components/AuthorInfo/AuthorInfo";
import PostList from "../../components/PostList/PostList";
import Button from "../../components/Button/Button";
import Badge from "../../components/Badge/Badge";
import EmptyState from "../../components/EmptyState/EmptyState";
import Loading from "../../components/Loading/Loading";
import FallbackImage from "../../components/FallbackImage/FallbackImage";
import ChatWindow from "../../components/ChatWindow/ChatWindow";

import styles from "./Profile.module.scss";
import { getPostsByUserId } from "@/services/post.service";

const Profile = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const currentUser = useSelector(selectCurrentUser);
    

    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [postsLoading, setPostsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("posts");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isChatMinimized, setIsChatMinimized] = useState(false);
    const isOwnProfile = currentUser && currentUser.username === username;

    useEffect(() => {
        const loadProfile = async () => {
            setLoading(true);
            if (isOwnProfile) {
                setProfile(currentUser);
            } else {
                // In a real app, you would fetch the profile of the user specified by `username`
                console.log(`Fetching profile for ${username}...`);
                // For now, we'll simulate a not found state for other users.
                setProfile(null);
            }
            setLoading(false);
        };

        loadProfile();
    }, [username, currentUser, isOwnProfile]);

    useEffect(() => {
        const loadPosts = async () => {
            if (profile) {
                setPostsLoading(true);
                try {
                    const response = await getPostsByUserId(currentUser.id);
                    
                    setPosts(response);
                    
                    // Assuming the API returns pagination info
                    setTotalPages(response.totalPages || 1);
                    setCurrentPage(response.currentPage || 1);
                } catch (error) {
                    console.error("Failed to fetch posts:", error);
                    // Handle error state if needed
                } finally {
                    setPostsLoading(false);
                }
            }
        };

        if (activeTab === "posts") {
            loadPosts();
        }
    }, [profile, activeTab, currentPage, currentUser.id]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
        });
    };

    const handleMessageClick = () => {
        setIsChatOpen(true);
        setIsChatMinimized(false);
    };

    const handleChatClose = () => {
        setIsChatOpen(false);
        setIsChatMinimized(false);
    };

    const handleChatMinimize = (minimize) => {
        setIsChatMinimized(minimize);
    };

    if (loading) {
        return (
            <div className={styles.profile}>
                <div className="container">
                    <Loading size="md" text="Loading profile..." />
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className={styles.profile}>
                <div className="container">
                    <EmptyState
                        title="Profile not found"
                        description="The user profile you're looking for doesn't exist or has been removed."
                        icon="👤"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className={styles.profile}>
            {/* Cover Section */}
            <div className={styles.coverSection}>
                <div className={styles.coverImage}>
                    {/* Use a placeholder or leave empty if not available */}
                    <FallbackImage src={currentUser.avatar || ''} alt="Cover" />
                    <div className={styles.coverOverlay}></div>
                </div>

                <div className={styles.profileHeader}>
                    <div className="container">
                        <div className={styles.headerContent}>
                            <div className={styles.avatarSection}>
                                <FallbackImage
                                    src={profile.avatar}
                                    alt={profile.name}
                                    className={styles.avatar}
                                    fallbackSrc="http://localhost:3000/uploads/posts/avatar-default.jpg"
                                />
                                <div className={styles.basicInfo}>
                                    <h1 className={styles.name}>
                                        {profile.username || "User Name"}
                                    </h1>
                                    <p className={styles.username}>
                                        @{profile.username || "username"}
                                    </p>
                                    {profile.title && (
                                        <p className={styles.title}>
                                            {profile.title}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className={styles.actions}>
                                {isOwnProfile ? (
                                    <Button
                                        variant="secondary"
                                        size="md"
                                        onClick={() =>
                                            navigate(
                                                `/profile/${username}/edit`
                                            )
                                        }
                                    >
                                        Edit Profile
                                    </Button>
                                ) : (
                                    <>
                                        <Button variant="primary" size="md">
                                            Follow
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="md"
                                            onClick={handleMessageClick}
                                        >
                                            Message
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="container">
                <div className={styles.content}>
                    {/* Sidebar */}
                    <aside className={styles.sidebar}>
                        {/* Bio */}
                        {profile.bio && (
                            <div className={styles.bioCard}>
                                <h3>About</h3>
                                <p>{profile.bio}</p>
                            </div>
                        )}

                        {/* Stats */}
                        <div className={styles.statsCard}>
                            <h3>Stats</h3>
                            <div className={styles.stats}>
                                <div className={styles.stat}>
                                    <strong>{posts.length || 0}</strong>
                                    <span>Posts</span>
                                </div>
                                <div className={styles.stat}>
                                    <strong>
                                        {profile.stats?.followers?.toLocaleString() || 0}
                                    </strong>
                                    <span>Followers</span>
                                </div>
                                <div className={styles.stat}>
                                    <strong>{profile.stats?.following || 0}</strong>
                                    <span>Following</span>
                                </div>
                                <div className={styles.stat}>
                                    <strong>
                                        {profile.stats?.likes?.toLocaleString() || 0}
                                    </strong>
                                    <span>Likes</span>
                                </div>
                            </div>
                        </div>

                        {/* Skills */}
                        {profile.skills && profile.skills.length > 0 && (
                            <div className={styles.skillsCard}>
                                <h3>Skills</h3>
                                <div className={styles.skills}>
                                    {profile.skills.map((skill) => (
                                        <Badge
                                            key={skill}
                                            variant="secondary"
                                            size="sm"
                                        >
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Badges */}
                        {profile.badges && profile.badges.length > 0 && (
                            <div className={styles.badgesCard}>
                                <h3>Achievements</h3>
                                <div className={styles.badges}>
                                    {profile.badges.map((badge) => (
                                        <div
                                            key={badge.name}
                                            className={styles.badge}
                                        >
                                            <span className={styles.badgeIcon}>
                                                {badge.icon}
                                            </span>
                                            <span className={styles.badgeName}>
                                                {badge.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Additional Info */}
                        <div className={styles.infoCard}>
                            <h3>Info</h3>
                            <div className={styles.infoItems}>
                                {profile.location && (
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoIcon}>
                                            📍
                                        </span>
                                        <span>{profile.location}</span>
                                    </div>
                                )}
                                {profile.website && (
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoIcon}>
                                            🌐
                                        </span>
                                        <a
                                            href={profile.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {profile.website.replace(
                                                /^https?:\/\//,
                                                ""
                                            )}
                                        </a>
                                    </div>
                                )}
                                <div className={styles.infoItem}>
                                    <span className={styles.infoIcon}>📅</span>
                                    <span>
                                        Joined {formatDate(profile.createdAt || profile.joinedDate)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        {profile.social &&
                            Object.keys(profile.social).length > 0 && (
                                <div className={styles.socialCard}>
                                    <h3>Connect</h3>
                                    <div className={styles.socialLinks}>
                                        {profile.social.twitter && (
                                            <a
                                                href={profile.social.twitter}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <span>🐦</span> Twitter
                                            </a>
                                        )}
                                        {profile.social.github && (
                                            <a
                                                href={profile.social.github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <span>🐙</span> GitHub
                                            </a>
                                        )}
                                        {profile.social.linkedin && (
                                            <a
                                                href={profile.social.linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <span>💼</span> LinkedIn
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                    </aside>

                    {/* Main Content */}
                    <main className={styles.main}>
                        {/* Tabs */}
                        <div className={styles.tabs}>
                            <button
                                className={`${styles.tab} ${
                                    activeTab === "posts" ? styles.active : ""
                                }`}
                                onClick={() => setActiveTab("posts")}
                            >
                                Posts ({posts.length || 0})
                            </button>
                            <button
                                className={`${styles.tab} ${
                                    activeTab === "about" ? styles.active : ""
                                }`}
                                onClick={() => setActiveTab("about")}
                            >
                                About
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className={styles.tabContent}>
                            {activeTab === "posts" && (
                                <div className={styles.postsTab}>
                                    <PostList
                                        posts={posts}
                                        loading={postsLoading}
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                        layout="grid"
                                    />
                                </div>
                            )}

                            {activeTab === "about" && (
                                <div className={styles.aboutTab}>
                                    <AuthorInfo
                                        author={{
                                            name: currentUser.username,
                                            email: currentUser.email,
                                            title: currentUser.title,
                                            bio: currentUser.bio,
                                            avatar: currentUser.avatar,
                                            social: currentUser.social,
                                            postsCount:
                                                posts.length || 0,
                                            followers: currentUser.stats?.followers,
                                            following: currentUser.stats?.following,
                                        }}
                                        showFollowButton={false}
                                    />
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>

            {/* Chat Window */}
            {!isOwnProfile && (
                <ChatWindow
                    user={{
                        name: profile.name,
                        avatar: profile.avatar,
                        username: profile.username,
                    }}
                    isOpen={isChatOpen}
                    isMinimized={isChatMinimized}
                    onClose={handleChatClose}
                    onMinimize={handleChatMinimize}
                />
            )}
        </div>
    );
};

export default Profile;
