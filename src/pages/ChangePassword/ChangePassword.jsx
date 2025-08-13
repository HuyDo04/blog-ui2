import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Button } from "../../components";
import styles from "./ChangePassword.module.scss";
import { changePassword } from "@/services/auth.service";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/features/auth/authSlice";

const ChangePassword = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const user = useSelector(selectCurrentUser);
  console.log(user);
  


  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const validateForm = () => {
    const newErrors = {};

    if (!formData.oldPassword) {
      newErrors.oldPassword = "Vui lòng nhập mật khẩu cũ.";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới.";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu mới.";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu mới không khớp.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});
    setMessage("");

    try {
      const res = await changePassword(formData);
      console.log("Res:", res);
      setMessage(res.message || "Đổi mật khẩu thành công.");

      // Redirect sau 2s
      setTimeout(() => navigate(`/profile/${user.username}`), 2000);
    } catch (error) {
      console.error("Change password error:", error);
      setErrors({
        submit:
          error.response?.data?.message ||
          "Không thể đổi mật khẩu. Vui lòng thử lại.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.changePasswordPage}>
      <h1 className={styles.title}>Đổi mật khẩu</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <Input
          label="Mật khẩu cũ"
          type="password"
          name="oldPassword"
          value={formData.oldPassword}
          onChange={handleInput}
          error={errors.oldPassword}
          placeholder="Nhập mật khẩu cũ"
          required
        />

        <Input
          label="Mật khẩu mới"
          type="password"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleInput}
          error={errors.newPassword}
          placeholder="Nhập mật khẩu mới"
          required
        />

        <Input
          label="Xác nhận mật khẩu mới"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInput}
          error={errors.confirmPassword}
          placeholder="Nhập lại mật khẩu mới"
          required
        />

        {errors.submit && (
          <div className={styles.submitError}>{errors.submit}</div>
        )}

        {message && <div className={styles.successMessage}>{message}</div>}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Đang đổi..." : "Đổi mật khẩu"}
        </Button>
      </form>
    </div>
  );
};

export default ChangePassword;
