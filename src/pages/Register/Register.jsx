import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input, Button } from "../../components";
import { register } from "@/services/auth.service";
import styles from "./Register.module.scss";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",  
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = "Vui lòng nhập tên người dùng";
    } else if (formData.username.length < 3) {
      newErrors.username = "Tên người dùng phải có ít nhất 3 ký tự";
    }

    if (!formData.email) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (formData.password.length < 8) {
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng nhập lại mật khẩu";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const result = await register(formData);
      console.log("REsult:", result);
      

      setSuccessMessage(result.message);

      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: { message: "Đăng ký thành công, vui lòng xác thực email rồi đăng nhập." },
        });
      }, 2000);

    } catch (error) {
      console.error("Registration failed:", error);
      setErrors({
        submit: error.response?.data?.message || "Đăng ký thất bại, vui lòng thử lại",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Đăng ký tài khoản</h1>

      {successMessage && (
        <div className={styles.successMessage}>{successMessage}</div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>

        {/* ✅ Username input */}
        <Input
          label="Tên người dùng"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          error={errors.username}
          placeholder="Nhập tên người dùng"
        />

        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          error={errors.email}
          placeholder="Nhập email"
        />

        <Input
          label="Mật khẩu"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          error={errors.password}
          placeholder="Nhập mật khẩu"
        />

        <Input
          label="Nhập lại mật khẩu"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          error={errors.confirmPassword}
          placeholder="Nhập lại mật khẩu"
        />

        {errors.submit && (
          <div className={styles.submitError}>{errors.submit}</div>
        )}

        <Button type="submit" disabled={isSubmitting} loading={isSubmitting}>
          {isSubmitting ? "Đang đăng ký..." : "Đăng ký"}
        </Button>
      </form>

      <p>
        Đã có tài khoản?{" "}
        <Link to="/login" className={styles.loginLink}>
          Đăng nhập
        </Link>
      </p>
    </div>
  );
};

export default Register;
