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
      const response = await httpRequest.post("/login", data);
      console.log("Login API response:", response);
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
  console.log("service:", response);
  
  return response
}

export const resendOtp = async (email) => {
  const response = await httpRequest.post("/forgot-password/resend-otp", {email})
  return response
}