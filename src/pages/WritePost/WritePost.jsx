import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import FallbackImage from "../../components/FallbackImage/FallbackImage";
import RichTextEditor from "../../components/RichTextEditor/RichTextEditor";
import styles from "./WritePost.module.scss";
import { getTopics } from "@/services/topic.service";
import { createPost, updatePost, getPostBySlug } from "@/services/post.service";
import { selectCurrentUser } from "@/features/auth/authSlice";

// Giữ lại để tạo slug cho người dùng xem trước, backend sẽ là nguồn chính thức
const generateSlug = (str) => {
  return str
    .toLowerCase()
    .replace(/đ/g, "d") // Thêm dòng này để chuyển 'đ' thành 'd'
    .normalize("NFD") // Tách các ký tự có dấu thành ký tự gốc và dấu
    .replace(/[\u0300-\u036f]/g, "") // Xóa các dấu đã tách
    .replace(/[^a-z0-9\s-]/g, "") // Xóa các ký tự đặc biệt không mong muốn
    .trim() // Xóa khoảng trắng ở đầu và cuối
    .replace(/\s+/g, "-"); // Thay thế một hoặc nhiều khoảng trắng bằng dấu gạch ngang
};

const WritePost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(slug);

  const currentUser = useSelector(selectCurrentUser);
  console.log("currentUser", currentUser);

  //")
  // Đã loại bỏ readTime và publishedAt khỏi state ban đầu
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    topicId: null,
    authorId: null,
  });

  const [readTime, setReadTime] = useState(0); // State riêng cho readTime (chỉ để hiển thị)
  const [existingMedia, setExistingMedia] = useState([]);
  const [topics, setTopics] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);

  const headerRef = useRef(null);

  // Lấy danh sách topics
  useEffect(() => {
    const fetchTopics = async () => {
      const topicsData = await getTopics();
      setTopics(topicsData);
    };
    fetchTopics();
  }, []);

  // Lấy dữ liệu bài viết khi edit
  useEffect(() => {
    if (isEditing && slug) {
      const fetchPost = async () => {
        try {
          const post = await getPostBySlug(slug);
          setFormData({
            title: post.title || "",
            slug: post.slug || "",
            excerpt: post.excerpt || "",
            content: post.content || "",
            topicId: post.topicId || null,
            authorId: post.authorId || null,
            // published và publishedAt không cần thiết ở form data
          });
          setReadTime(post.readTime || 0); // Cập nhật readTime từ backend
          setExistingMedia(post.media || []);
        } catch (err) {
          console.error("Error loading post:", err);
          navigate("/404"); // Chuyển hướng nếu không tìm thấy bài viết
        }
      };
      fetchPost();
    } else {
      // Khi tạo mới, gán authorId từ user đăng nhập
      if (currentUser?.id) {
        setFormData((prev) => ({ ...prev, authorId: currentUser.id }));
      }
    }
  }, [isEditing, slug, currentUser, navigate]);

  // Xác định scroll header
  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const headerRect = headerRef.current.getBoundingClientRect();
        setIsHeaderScrolled(headerRect.top <= 0);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => {
      const newState = { ...prev, [field]: value };
      if (field === "title") {
        newState.slug = generateSlug(value);
      }
      return newState;
    });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Đã bỏ tính toán readTime ở đây
  const handleContentChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      content: value,
    }));
    if (errors.content) {
      setErrors((prev) => ({ ...prev, content: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.content.trim()) newErrors.content = "Content is required";
    if (!formData.topicId) newErrors.topicId = "Please select a topic";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (isPublished = false) => {
    if (!validateForm()) return;

    setSaving(true);
    
    // Dữ liệu gửi đi đã được đơn giản hóa
    const postData = {
      ...formData,
      published: isPublished,
    };

    try {
      let response;
      if (isEditing) {
        response = await updatePost(slug, postData);
      } else {
        response = await createPost(postData);
      }
      
      // Chuyển hướng đến trang bài viết đã tạo/cập nhật
      navigate(`/post/${response.post.slug}`); 
    } catch (error) {
      console.error("Error saving post:", error);
      // Có thể thêm thông báo lỗi cho người dùng ở đây
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {!previewMode ? (
          <div className={styles.editor}>
            <div className={styles.form}>
              <Input
                label="Title"
                placeholder="Enter your post title..."
                value={formData.title}
                onChange={handleInputChange("title")}
                error={errors.title}
                required
                fullWidth
                size="lg"
              />

              <Input
                label="Slug"
                placeholder="Post slug..."
                value={formData.slug}
                onChange={handleInputChange("slug")}
                error={errors.slug}
                required
                fullWidth
              />

              <Input
                label="Excerpt"
                placeholder="Write a brief description..."
                value={formData.excerpt}
                onChange={handleInputChange("excerpt")}
                error={errors.excerpt}
                fullWidth
              />

              <div className={styles.formGroup}>
                <label>Topic *</label>
                <select
                  value={formData.topicId || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      topicId: e.target.value ? parseInt(e.target.value, 10) : null,
                    }))
                  }
                >
                  <option value="">-- Select Topic --</option>
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                {errors.topicId && (
                  <p className={styles.error}>{errors.topicId}</p>
                )}
              </div>

              {existingMedia.length > 0 && (
                <div className={styles.previewContainer}>
                  {existingMedia.map((url, idx) => (
                    <div key={`existing-${idx}`} className={styles.previewItem}>
                      {url.match(/\.(mp4|webm)$/) ? (
                        <video src={url} controls />
                      ) : (
                        <FallbackImage src={url} alt={`media-${idx}`} />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.contentSection}>
                <label className={styles.label}>Content *</label>
                <RichTextEditor
                  value={formData.content}
                  onChange={handleContentChange}
                  placeholder="Start writing your post..."
                  error={errors.content}
                  className={styles.richTextEditor}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.preview}>
            <div className={styles.previewContent}>
              <h1 className={styles.previewTitle}>
                {formData.title || "Your Post Title"}
              </h1>
              <p className={styles.previewExcerpt}>
                {formData.excerpt || "Your post excerpt..."}
              </p>
              <div
                dangerouslySetInnerHTML={{
                  __html:
                    formData.content || "<p>Your post content...</p>",
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div
        ref={headerRef}
        className={`${styles.footer} ${isHeaderScrolled ? styles.scrolled : ""}`}
      >
        <div className={styles.footerContent}>
          <h1 className={styles.title}>
            {isEditing ? "Edit Post" : "Write New Post"}
          </h1>
          {readTime > 0 && (
            <div className={styles.stats}>
              <span>{readTime} min read</span>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <div className={styles.viewToggle}>
            <button
              className={`${styles.toggleButton} ${!previewMode ? styles.active : ""}`}
              onClick={() => setPreviewMode(false)}
            >
              Write
            </button>
            <button
              className={`${styles.toggleButton} ${previewMode ? styles.active : ""}`}
              onClick={() => setPreviewMode(true)}
            >
              Preview
            </button>
          </div>

          <div className={styles.saveActions}>
            <Button
              variant="secondary"
              onClick={() => handleSave(false)}
              loading={saving}
              disabled={saving}
            >
              Save Draft
            </Button>
            <Button
              variant="primary"
              onClick={() => handleSave(true)}
              loading={saving}
              disabled={saving}
            >
              {isEditing ? "Update" : "Publish"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WritePost;