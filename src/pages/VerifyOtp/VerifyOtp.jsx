import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Input, Button } from "../../components";
import styles from "./VerifyOtp.module.scss";
import { resendOtp, verifyOtp } from "@/services/auth.service";

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState("");

  const validateForm = () => {
    const newErrors = {};
    
    if (!otp) {
      newErrors.otp = "Vui lòng nhập OTP.";
    } else if (otp.length !== 6) {
      newErrors.otp = "OTP phải gồm 6 chữ số.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});
    setMessage("");

    try {
      await verifyOtp(email, otp);

      setMessage("Xác minh OTP thành công.");
      // Navigate sang Reset Password page
      navigate("/reset-password", { state: { email } });
    } catch (error) {
      console.error("Verify OTP error:", error);
      setErrors({
        submit:
          error.response.message || "OTP không hợp lệ hoặc đã hết hạn.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async (e) => {
    e.preventDefault();

    if (!email) {
      setErrors({ email: "Không có email để gửi lại OTP." });
      return;
    }

    setIsResending(true);
    setErrors({});
    setMessage("");

    try {
      const res = await resendOtp(email);
      setMessage(res.message || "Đã gửi lại OTP. Vui lòng kiểm tra email.");
    } catch (error) {
      console.error("Resend OTP error:", error);
      setErrors({
        submit:
          error.response?.data?.message || "Không thể gửi lại OTP. Vui lòng thử lại.",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>Xác minh OTP</h1>
        <p className={styles.subtitle}>
          Nhập mã OTP đã gửi đến email: <strong>{email}</strong>
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <Input
          label="OTP"
          type="text"
          name="otp"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          error={errors.otp}
          placeholder="Nhập OTP"
          required
        />

        {errors.submit && (
          <div className={styles.submitError}>{errors.submit}</div>
        )}

        {message && (
          <div className={styles.successMessage}>{message}</div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Đang xác minh..." : "Xác minh"}
        </Button>
      </form>

      <div className={styles.resendContainer}>
        <p>Bạn không nhận được OTP?</p>
        <a
          href="#"
          onClick={handleResendOtp}
          className={styles.resendLink}
        >
          {isResending ? "Đang gửi lại..." : "Gửi lại OTP"}
        </a>
      </div>

      <div className={styles.footer}>
        <Link to="/forgot-password" className={styles.backLink}>
          ← Quay lại quên mật khẩu
        </Link>
      </div>
    </>
  );
};

export default VerifyOtp;
