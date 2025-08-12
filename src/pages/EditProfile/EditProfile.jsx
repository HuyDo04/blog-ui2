import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";
import Card from "../../components/Card/Card";
import FallbackImage from "../../components/FallbackImage/FallbackImage";
import Input from "../../components/Input/Input"; // Assuming an Input component exists
import { updateAvatar, updateUser, checkUsernameExists } from "../../services/user.service";
import styles from "./EditProfile.module.scss";
import { selectCurrentUser, setUser } from "@/features/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";

const EditProfile = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector(selectCurrentUser);

    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState("");
    const [username, setUsername] = useState(user?.username || "");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setUsername(user.username || "");
        }
    }, [user]);

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

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
        setErrors((prev) => ({ ...prev, username: undefined }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        let hasError = false;
        const newErrors = {};

        // Validate username
        if (!username.trim()) {
            newErrors.username = "Tên người dùng không được để trống";
            hasError = true;
        }

        if (hasError) {
            setErrors(newErrors);
            setLoading(false);
            return;
        }

        try {
            let updatedUser = { ...user };
            let avatarUpdated = false;
            let profileUpdated = false;

            // Handle avatar update
            if (avatarFile) {
                try {
                    const formData = new FormData();
                    formData.append("avatar", avatarFile);
                    const response = await updateAvatar(formData);
                    updatedUser = { ...updatedUser, avatar: response.avatar };
                    avatarUpdated = true;
                } catch (error) {
                    console.error("Lỗi upload avatar:", error);
                    newErrors.submit = "Không thể upload ảnh đại diện.";
                    hasError = true;
                }
            }

            // Handle username update
            if (username !== user?.username) {
                try {
                    const usernameTaken = await checkUsernameExists(username);
                    if (usernameTaken) {
                        newErrors.username = "Tên người dùng đã tồn tại";
                        hasError = true;
                    } else {
                        const response = await updateUser(user._id, { username });
                        updatedUser = { ...updatedUser, username: response.username };
                        profileUpdated = true;
                    }
                } catch (error) {
                    console.error("Lỗi cập nhật tên người dùng:", error);
                    newErrors.submit = newErrors.submit ? newErrors.submit + " " + "Không thể cập nhật tên người dùng." : "Không thể cập nhật tên người dùng. Tên người dùng đã tồn tại.";
                    hasError = true;
                }
            }

            if (hasError) {
                setErrors(newErrors);
            } else if (avatarUpdated || profileUpdated) {
                dispatch(setUser(updatedUser));
                navigate(`/profile/${updatedUser.username}`);
            } else {
                // No changes made, just navigate back
                navigate(`/profile/${user.username}`);
            }
        } catch (error) {
            console.error("Lỗi chung khi cập nhật hồ sơ:", error);
            setErrors({ submit: "Đã xảy ra lỗi khi cập nhật hồ sơ." });
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
                    <h1>Chỉnh sửa hồ sơ</h1>
                    <p>Cập nhật thông tin cá nhân của bạn</p>
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

                        <div className={styles.section}>
                            <h3>Thông tin cơ bản</h3>
                            <Input
                                label="Tên người dùng"
                                id="username"
                                name="username"
                                value={username}
                                onChange={handleUsernameChange}
                                error={errors.username}
                                placeholder="Nhập tên người dùng của bạn"
                            />
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
                                Lưu thay đổi
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default EditProfile;
