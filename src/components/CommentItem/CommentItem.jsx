import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import Button from "../Button/Button";
import FallbackImage from "../FallbackImage/FallbackImage";
import styles from "./CommentItem.module.scss";

const CommentItem = ({
  comment,
  level = 0,
  maxLevel = 2,
  onReply,
  onLike,
  onEdit,
  onDelete,
  showActions = true,
  className,
  ...props
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showEditForm, setShowEditForm] = useState(false);
  const [editText, setEditText] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const dropdownRef = useRef(null);
  console.log("Comment:", comment)
  const {
    id,
    author,
    content,
    createdAt,
    likes = 0,
    isLiked = false,
    replies = [],
    isEdited = false,
  } = comment;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (replyText.trim() && onReply) {
      onReply(id, replyText.trim(), Math.min(level + 1, maxLevel));
      setReplyText("");
      setShowReplyForm(false);
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (editText.trim() && onEdit) {
      onEdit(id, editText.trim());
      setEditText("");
      setShowEditForm(false);
    }
  };

  const handleLike = () => onLike?.(id);
  const handleEdit = () => {
    setEditText(content);
    setShowEditForm(true);
    setShowDropdown(false);
  };
  const handleEditCancel = () => {
    setEditText("");
    setShowEditForm(false);
  };

  const handleDeleteConfirm = () => {
    onDelete?.(id);
    setShowDeleteConfirm(false);
    setShowDropdown(false);
  };
  console.log(author)
  return (
    <div
      className={`${styles.commentItem} ${className || ""}`}
      style={{ "--comment-indent": level > 0 ? `${level * 24}px` : "0" }}
      {...props}
    >
      <div className={styles.comment}>
        <div className={styles.avatar}>
          <FallbackImage src={author.avatar || "https://picsum.photos/200/300"} alt={author.name} />
        </div>

        <div className={styles.content}>
          <div className={styles.header}>
            <div className={styles.info}>
              <Link
                to={`/profile/${
                  author?.username ||
                  author?.name?.toLowerCase().replace(/\s+/g, "-")
                }`}
                className={styles.authorName}
              >
                {author.username}
              </Link>
              <time className={styles.date} dateTime={createdAt}>
                {formatDate(createdAt)}
              </time>
              {isEdited && <span className={styles.edited}>(edited)</span>}
            </div>

            {showActions && (onEdit || onDelete) && (
              <div className={styles.actionsDropdown} ref={dropdownRef}>
                <button
                  className={styles.moreButton}
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <circle cx="8" cy="3" r="1" />
                    <circle cx="8" cy="8" r="1" />
                    <circle cx="8" cy="13" r="1" />
                  </svg>
                </button>

                {showDropdown && (
                  <div className={styles.dropdown}>
                    {onEdit && (
                      <button
                        className={styles.dropdownItem}
                        onClick={handleEdit}
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        className={`${styles.dropdownItem} ${styles.deleteItem}`}
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={styles.text}>
            <p>{content}</p>
          </div>

          {showActions && (
            <div className={styles.actions}>
              <button
                className={`${styles.likeButton} ${isLiked ? styles.liked : ""}`}
                onClick={handleLike}
              >
                ❤️ {likes > 0 && <span>{likes}</span>}
              </button>

              {level <= maxLevel && (
                <button
                  className={styles.replyButton}
                  onClick={() => setShowReplyForm(!showReplyForm)}
                >
                  Reply
                </button>
              )}
            </div>
          )}

          {showReplyForm && (
            <form className={styles.replyForm} onSubmit={handleReplySubmit}>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                rows="3"
              />
              <div className={styles.replyActions}>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyText("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!replyText.trim()}
                >
                  Reply
                </Button>
              </div>
            </form>
          )}

          {showEditForm && (
            <form className={styles.editForm} onSubmit={handleEditSubmit}>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                placeholder="Edit your comment..."
                rows="3"
                autoFocus
              />
              <div className={styles.editActions}>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleEditCancel}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!editText.trim() || editText.trim() === content}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmModal}>
            <h3>Delete Comment</h3>
            <p>This action cannot be undone. Continue?</p>
            <div className={styles.confirmActions}>
              <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleDeleteConfirm}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {replies?.length > 0 && (
        <div className={styles.replies}>
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              level={Math.min(level + 1, maxLevel)} // luôn giữ level không vượt quá maxLevel
              maxLevel={maxLevel}
              onReply={onReply}
              onLike={onLike}
              onEdit={onEdit}
              onDelete={onDelete}
              showActions={showActions}
            />
          ))}
        </div>
      )}
    </div>
  );
};

CommentItem.propTypes = {
  comment: PropTypes.object.isRequired,
  level: PropTypes.number,
  maxLevel: PropTypes.number,
  onReply: PropTypes.func,
  onLike: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  showActions: PropTypes.bool,
  className: PropTypes.string,
};

export default CommentItem;
