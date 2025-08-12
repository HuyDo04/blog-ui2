import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";
import Card from "../../components/Card/Card";
import FallbackImage from "../../components/FallbackImage/FallbackImage";
import { updateAvatar } from "../../services/user.service";
import styles from "./EditProfile.module.scss";
import { selectCurrentUser, setUser } from "@/features/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";

const EditProfile = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const user = useSelector(selectCurrentUser);

    const handleAvatarChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            setErrors({ avatar: "Vui lòng chọn tệp ảnh hợp lệ" });
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setErrors({ avatar: "Kích thước ảnh phải nhỏ hơn 5MB" });
            return;
        }

        setErrors({});
        setAvatarFile(file);

        // Preview ảnh
        const reader = new FileReader();
        reader.onload = (e) => {
            setAvatarPreview(e.target.result);
        };
        reader.readAsDataURL(file);
    };


const handleSubmit = async (e) => {
    e.preventDefault();
    if (!avatarFile) {
        setErrors({ avatar: "Vui lòng chọn ảnh để upload" });
        return;
    }

    setLoading(true);
    try {
        const formData = new FormData();
        formData.append("avatar", avatarFile);
        const response = await updateAvatar(formData);
        
        // Cập nhật avatar vào Redux ngay lập tức
        dispatch(setUser({
            ...user, // dữ liệu user hiện tại từ Redux
            avatar: response.avatar
        }))
        
        // Navigate về trang trước
        navigate(`/profile/${user.username}`);
    } catch (error) {
        console.error("Lỗi upload avatar:", error);
        setErrors({ submit: "Không thể upload ảnh. Vui lòng thử lại." });
    } finally {
        setLoading(false);
    }
};


    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <div className={styles.editProfilePage}>
            <div className="container">
                <div className={styles.pageHeader}>
                    <Button
                        variant="ghost"
                        onClick={handleCancel}
                        className={styles.backButton}
                    >
                        ← Quay lại
                    </Button>
                    <h1>Đổi Avatar</h1>
                    <p>Chọn ảnh mới và xem trước trước khi lưu</p>
                </div>

                <Card className={styles.formCard}>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.section}>
                            <h3>Avatar</h3>
                            <div className={styles.avatarPreview}>
                            
                <FallbackImage
                    src={
                        avatarPreview // Nếu đã chọn ảnh mới → hiển thị preview
                            ? avatarPreview
                            : user?.avatar // Nếu chưa chọn ảnh → hiển thị avatar hiện tại
                                ? user.avatar
                                : "http://localhost:3000/uploads/posts/avatar-default.jpg"
                    }
                    alt="Avatar preview"
                    className={styles.avatarImg}
                />

                                <div className={styles.imageUpload}>
                                    <input
                                        type="file"
                                        id="avatar"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className={styles.fileInput}
                                    />
                                    <label
                                        htmlFor="avatar"
                                        className={styles.uploadButton}
                                    >
                                        📷 Chọn ảnh
                                    </label>
                                </div>
                                {errors.avatar && (
                                    <div className={styles.imageError}>
                                        {errors.avatar}
                                    </div>
                                )}
                            </div>
                            <p>
                                <strong>Gợi ý:</strong> Ảnh vuông 400x400px, nhỏ
                                hơn 5MB
                            </p>
                        </div>

                        {errors.submit && (
                            <div className={styles.submitError}>
                                {errors.submit}
                            </div>
                        )}

                        <div className={styles.actions}>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleCancel}
                                disabled={loading}
                                size="lg"
                            >
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                loading={loading}
                                size="lg"
                            >
                                Lưu ảnh
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default EditProfile;
