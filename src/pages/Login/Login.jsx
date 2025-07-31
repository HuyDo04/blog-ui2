import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Button } from "../../components";
import { login, resendVerification } from "@/services/auth.service";
import styles from "./Login.module.scss";
import { setToken } from "@/utils/httpRequest";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu tối thiểu 6 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});
    setResendMessage("");
    setShowResend(false);

    try {
      const result = await login(formData);
      console.log("Login success:", result);
      setToken(result.access_token)
      localStorage.setItem("refresh_token", result.refresh_token); 
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Login failed:", error);

      if (
        error.response &&
        error.response.status === 401 &&
        error.response.data === "Vui lòng xác thục email"
      ) {
        setErrors({
          submit: "Tài khoản chưa được xác thực. Vui lòng kiểm tra email.",
        });
        setShowResend(true);
      } else {
        setErrors({
          submit:
            error.response?.data?.message ||
            "Đăng nhập thất bại. Vui lòng thử lại.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setIsSubmitting(true);
      setResendMessage("");
        
      const res = await resendVerification(formData.email);
      
      setResendMessage(
        res.message || "Đã gửi lại email xác thực. Vui lòng kiểm tra hộp thư."
      );
    } catch (error) {
      console.error("Resend verification failed:", error);
      setResendMessage(
        error.response?.data?.message ||
          "Không thể gửi lại email xác thực. Vui lòng thử lại sau."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <h1 className={styles.title}>Đăng nhập</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          error={errors.email}
          placeholder="Nhập email"
          required
        />

        <Input
          label="Mật khẩu"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          error={errors.password}
          placeholder="Nhập mật khẩu"
          required
        />

        <div className={styles.formOptions}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleInputChange}
              className={styles.checkbox}
            />
            <span>Ghi nhớ đăng nhập</span>
          </label>
        </div>

        {errors.submit && (
          <div className={styles.submitError}>{errors.submit}</div>
        )}

        {showResend && (
          <div className={styles.resendSection}>
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={isSubmitting}
              className={styles.resendButton}
            >
              {isSubmitting ? "Đang gửi..." : "Gửi lại email xác thực"}
            </button>
            {resendMessage && (
              <p className={styles.resendMessage}>{resendMessage}</p>
            )}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>
      </form>

      <p className={styles.registerPrompt}>
        Chưa có tài khoản? <a href="/register">Đăng ký</a>
      </p>
      <p className={styles.registerPrompt}>
        <a href="/forgot-password">Quên mật khẩu</a>
      </p>
    </div>
  );
};

export default Login;
