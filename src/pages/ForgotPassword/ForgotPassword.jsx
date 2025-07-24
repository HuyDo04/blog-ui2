import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input, Button } from "../../components";
import styles from "./ForgotPassword.module.scss";
import { forgotPassword } from "@/services/auth.service";


const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = "Vui lòng nhập email.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email không hợp lệ.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage("");

    try {
      const res = await forgotPassword(email);
      
      setSuccessMessage(res.message);

      // Navigate sang Verify OTP nếu OTP đã gửi hoặc còn hạn
      
        navigate("/forgot-password/verify-otp", { state: { email } });

    } catch (error) {
      console.error("Forgot password error:", error);
      setErrors({
        submit:
          error.response?.data?.message ||
          "Không thể gửi OTP. Vui lòng thử lại.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>Quên mật khẩu?</h1>
        <p className={styles.subtitle}>
          Nhập email của bạn và chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <Input
          label="Email"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          placeholder="Nhập email của bạn"
          required
        />

        {errors.submit && (
          <div className={styles.submitError}>{errors.submit}</div>
        )}

        {successMessage && (
          <div className={styles.successMessage}>{successMessage}</div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Đang gửi..." : "Gửi OTP"}
        </Button>
      </form>

      <div className={styles.footer}>
        <Link to="/login" className={styles.backLink}>
          ← Quay lại đăng nhập
        </Link>
      </div>
    </>
  );
};

export default ForgotPassword;

