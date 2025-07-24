import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./VerifyEmail.module.scss";
import { verifyEmail, resendVerification } from "@/services/auth.service";

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); 
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const userEmail = params.get("email");
    setEmail(userEmail);

    if (!token) {
      setStatus("error");
      setMessage("Token không hợp lệ.");
      return;
    }

    const verify = async () => {
      try {
        const response = await verifyEmail(token);
        setStatus("success");
        setMessage(response.message);
      } catch (error) {
        console.error("Verify email failed:", error);
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "Xác thực thất bại. Token không hợp lệ hoặc đã hết hạn."
        );
      }
    };

    verify();
  }, [location.search]);

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  const handleResendVerification = async () => {
    try {
      const response = await resendVerification({ email });
      setMessage(response.message || "Email xác thực đã được gửi lại.");
    } catch (error) {
      console.error("Resend verification failed:", error);
      setMessage(
        error.response?.data?.message ||
          "Gửi lại email xác thực thất bại. Vui lòng thử lại."
      );
    }
  };

  return (
    <div className={styles.verifyEmail}>
      {status === "loading" && <p>Đang xác thực, vui lòng đợi...</p>}

      {status === "success" && (
        <div>
          <h2>{message}</h2>
          <button onClick={handleLoginRedirect}>Đăng nhập</button>
        </div>
      )}

      {status === "error" && (
        <div>
          <h2>{message}</h2>
          {email && (
            <button onClick={handleResendVerification}>
              Gửi lại email xác thực
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default VerifyEmail;
