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

  const [formData, setFormData] = useState({
    _id: null, // Add this for storing post ID
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    topicId: null,
    authorId: null,
    featuredImage: null,
  });

  const [featuredImageFile, setFeaturedImageFile] = useState(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState(null);
  const [existingFeaturedImageUrl, setExistingFeaturedImageUrl] = useState(null); // New state
  const [readTime, setReadTime] = useState(0);
  const [existingMedia, setExistingMedia] = useState([]);
  const [topics, setTopics] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(true);

  const headerRef = useRef(null);

  // Extract base URL without API prefix
  const backendBaseUrl = import.meta.env.VITE_BASE_URL.split('/api')[0];

  useEffect(() => {
    const fetchTopics = async () => {
      const topicsData = await getTopics();
      setTopics(topicsData);
    };
    fetchTopics();
  }, []);

  useEffect(() => {
    if (isEditing && slug) {
      const fetchPost = async () => {
        try {
          const post = await getPostBySlug(slug);
          if (post.authorId !== currentUser?.id) {
            setIsAuthorized(false);
            navigate("/404"); // Or a dedicated /unauthorized page
            return;
          }
          console.log("Fetched post for editing:", post.id); // Add this line
          console.log("post.featuredImage (raw):", post.featuredImage); // Debug log
          setFormData({
            _id: post.id, // Store the actual ID
            title: post.title || "",
            slug: post.slug || "",
            excerpt: post.excerpt || "",
            content: post.content || "",  
            topicId: post.topicId || null,
            authorId: post.authorId || null,
            featuredImage: post.featuredImage || null,
          });
          if (post.featuredImage) {
            // Construct absolute URL using the extracted backendBaseUrl
            const imageUrl = `${backendBaseUrl}/${post.featuredImage.replace(/\\/g, '/').replace('public/', '')}`;
            setExistingFeaturedImageUrl(imageUrl); // Set existing image URL
          }
          setReadTime(post.readTime || 0);
          console.log("Giá trị của post.media:", post.media); // Add this line
          setExistingMedia(post.media || []);
        } catch (err) {
          console.error("Error loading post:", err);
          navigate("/404");
        }
      };
      fetchPost();
    } else {
      if (currentUser?.id) {
        setFormData((prev) => ({ ...prev, authorId: currentUser.id }));
      }
    }
  }, [isEditing, slug, currentUser, navigate, backendBaseUrl]); // Add backendBaseUrl to dependencies

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

  const handleContentChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      content: value,
    }));
    if (errors.content) {
      setErrors((prev) => ({ ...prev, content: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFeaturedImageFile(file);
      setFeaturedImagePreview(URL.createObjectURL(file)); // Only set preview for new file
    } else {
      setFeaturedImageFile(null);
      setFeaturedImagePreview(null); // Clear preview if no file selected
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

    if (isEditing && !formData._id) {
      console.error("Error: Post ID is missing for update operation.");
      // Optionally, show a user-friendly message or disable the save button until data is loaded.
      return;
    }

    setSaving(true);

    const postFormData = new FormData();

    // Nối các trường dữ liệu vào FormData
    postFormData.append('title', formData.title);
    postFormData.append('slug', formData.slug);
    postFormData.append('excerpt', formData.excerpt);
    postFormData.append('content', formData.content);
    postFormData.append('topicId', formData.topicId);
    postFormData.append('authorId', formData.authorId);
    postFormData.append('published', isPublished);

    // Nối tệp ảnh nếu người dùng đã chọn ảnh mới
    if (featuredImageFile) {
      postFormData.append('featuredImage', featuredImageFile);
    } else if (formData.featuredImage) {
      // If no new file is selected but there was an existing image, append the existing image URL
      postFormData.append('featuredImage', formData.featuredImage);
    }

    try {
      let response;
      if (isEditing) {
        response = await updatePost(formData._id, postFormData); // Use _id here
      } else {
        response = await createPost(postFormData);
      }

      navigate(`/blog/${response.post.slug}`);
    } catch (error) {
      console.error("Error saving post:", error);
    } finally {
      setSaving(false);
    }
  };

  const displayImage = featuredImagePreview || (isEditing && existingFeaturedImageUrl && !featuredImageFile ? existingFeaturedImageUrl : null);

  if (!isAuthorized) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <h1>Unauthorized</h1>
          <p>You are not authorized to edit this post.</p>
        </div>
      </div>
    );
  }

  console.log("isEditing:", isEditing); // Debug log
  console.log("existingFeaturedImageUrl:", existingFeaturedImageUrl); // Debug log
  console.log("featuredImageFile:", featuredImageFile); // Debug log
  console.log("displayImage:", displayImage); // Debug log

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
                readOnly // Add this line
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
              <label
  htmlFor="featuredImage"
  style={{
    display: 'inline-block',
    padding: '8px 16px',
    border: '2px solid #007bff',
    borderRadius: '4px',
    backgroundColor: '#007bff',
    color: 'white',
    cursor: 'pointer',
    userSelect: 'none',
    fontWeight: '500',
    textAlign: 'center',
  }}
>
  Featured Image
</label>

                <input
                  id="featuredImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={styles.fileInput}
                />
                {displayImage && (
                  <div className={styles.imagePreview} style={{ marginTop: '1rem' }}>
                    <p>Preview:</p>
                    <img src={displayImage} alt="Featured Preview" style={{ maxWidth: '200px', height: 'auto', marginTop: '0.5rem', border: '1px solid #ddd', padding: '5px' }} />
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>Topic *</label>
                <select
                  className={styles.topicSelect}
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

              {Array.isArray(existingMedia) && existingMedia.length > 0 && (
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