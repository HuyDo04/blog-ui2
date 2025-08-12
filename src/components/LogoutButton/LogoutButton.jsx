import { useDispatch } from "react-redux";
import { logout } from "@/features/auth/authSlice"; // Nếu có action logout
import httpRequest from "@/utils/httpRequest";

// eslint-disable-next-line react/prop-types
const LogoutButton = ({ className = "", onLogout }) => {
    const dispatch = useDispatch();

    const handleLogout = async () => {
        try {
            // Gọi API logout nếu cần
            const refreshToken = localStorage.getItem("refresh_token");
            if (refreshToken) {
                await httpRequest.post("/logout", { refresh_token: refreshToken });
            }
            // Xoá token ở localStorage
            localStorage.removeItem("token");
            localStorage.removeItem("refresh_token");
            // Dispatch action logout nếu dùng redux
            dispatch(logout());
            // Chuyển hướng về trang đăng nhập
            window.location.href = "/";
            // Gọi callback nếu có
            if (onLogout) onLogout();
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <button className={className} onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                    d="M7 14H2C1.45 14 1 13.55 1 13V3C1 2.45 1.45 2 2 2H7V0H2C0.34 0 0 1.34 0 3V13C0 14.66 1.34 16 2 16H7V14ZM11.09 7L9.09 5C8.7 4.61 8.7 3.98 9.09 3.59C9.48 3.2 10.11 3.2 10.5 3.59L14.5 7.59C14.89 7.98 14.89 8.61 14.5 9L10.5 13C10.11 13.39 9.48 13.39 9.09 13C8.7 12.61 8.7 11.98 9.09 11.59L11.09 9.59H4V6.41H11.09V7Z"
                    fill="currentColor"
                />
            </svg>
            Logout
        </button>
    );
};

export default LogoutButton;