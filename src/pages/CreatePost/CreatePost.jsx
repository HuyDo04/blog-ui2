import { useState } from "react";
import { createPost } from "@/services/post.service";

export default function CreatePost() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [images, setImages] = useState([]); // preview ảnh
    const [videos, setVideos] = useState([]); // preview video

    // Chọn ảnh
    const handleSelectImages = (e) => {
        const files = Array.from(e.target.files);
        // URL: trỏ đến bộ nhớ của máy tính
        const newImages = files.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));
        setImages(prev => [...prev, ...newImages]);
    };

    // Chọn video
    const handleSelectVideos = (e) => {
        const files = Array.from(e.target.files);
        const newVideos = files.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));
        setVideos(prev => [...prev, ...newVideos]);
    };

    // Submit bài viết
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("content", content);

            // Upload ảnh
            images.forEach(img => {
                formData.append("images", img.file);
            });

            // Upload video
            videos.forEach(vid => {
                formData.append("videos", vid.file);
            });

            await createPost(formData);

            alert("Đăng bài thành công!");
            setTitle("");
            setContent("");
            setImages([]);
            setVideos([]);
        } catch (error) {
            console.error("Lỗi đăng bài:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Tiêu đề"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
                placeholder="Nội dung"
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />

            <h4>Chọn ảnh</h4>
            <input type="file" accept="image/*" multiple onChange={handleSelectImages} />
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {images.map((img, idx) => (
                    <img key={idx} src={img.preview} alt="" width={120} />
                ))}
            </div>

            <h4>Chọn video</h4>
            <input type="file" accept="video/*" multiple onChange={handleSelectVideos} />
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {videos.map((vid, idx) => (
                    <video key={idx} src={vid.preview} controls width={200} />
                ))}
            </div>

            <button type="submit">Đăng bài</button>
        </form>
    );
}
