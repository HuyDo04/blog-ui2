import httpRequest from "@/utils/httpRequest"

// Register
export const register = async (data) => {
    const response = await httpRequest.post("/register", data)
    return response
}

// Verify Email
export const verifyEmail = async (token) => {
    const response = await httpRequest.get(`/verify-email?token=${token}`)
    console.log("Reponse:", response);
    return response
}

// Login
export const login = async (data) => {
    try {
      const response = await httpRequest.post("/login", data, { withCredentials: true });
      // localStorage.setItem("token", response.access_token);   
      return response;
    } catch (error) {
      console.error("Login API error:", error);
      throw error; 
    }
  };

  // Resend Email
export const resendVerification = async (email) => {
  const response = await httpRequest.post("/resend-verification", { email }, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  console.log("Resend verification response:", response);
  return response;
};

// Forgot Password
export const forgotPassword = async (email) => {
  const response = await httpRequest.post("/forgot-password", {email})  
  return response
}

export const verifyOtp = async (email, otp) => {
  const response = await httpRequest.post("/forgot-password/verify-otp", {email, otp})
  return response
}

export const resetPassword = async (data) => {
  const response = await httpRequest.put("/forgot-password/reset-password", data)
  
  return response
}

export const resendOtp = async (email) => {
  const response = await httpRequest.post("/forgot-password/resend-otp", {email})
  return response
}

export const changePassword = async (data) => {
  const response = await httpRequest.post("/change-password", data);
  console.log("Response ChangePassword:", response);
  
  return response
}

export const getCurrentUser = async () => {
  const response = await httpRequest.get("/me");
  return response
}

export const logout = async (refreshToken) => {
  const response = await httpRequest.post("/logout", { refresh_token: refreshToken });
  console.log("Logout Response:", response);
  
  return response
}