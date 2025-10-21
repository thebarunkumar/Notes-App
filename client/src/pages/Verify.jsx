import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

const Verify = () => {
    const { token } = useParams(); // token from URL
    const [status, setStatus] = useState("Verifying your email...");
    const navigate = useNavigate();

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                console.log("🔗 Token from URL:", token);
                const response = await axios.post(`${API_URL}/api/v1/user/verify-email`,{}, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    //  withCredentials: true
                });
                console.log(response)
                if (response.data.success) {
                    setStatus("✅ Your email has been verified successfully!");
                    setTimeout(() => {
                        navigate("/login");
                    }, 2000);
                } else {
                    setStatus("❌ Invalid or expired verification link.");
                }
            } catch (error) {
                console.log(error);               
                // console.error("Verification error:", error.response?.data || error.message);
                setStatus("❌ Verification failed. Please try again or resend the link.");
            }
        };

        verifyEmail();
    }, [token, navigate]);

  return (
    <div className="relative w-full min-h-screen bg-lightGray flex items-center justify-center px-4">
      {/* Card */}
      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl w-full max-w-md text-center hover:shadow-2xl transition-shadow duration-300">
        <h2 className="text-2xl sm:text-3xl font-bold text-primaryBlue mb-4">
          Email Verification
        </h2>
        <p className="text-gray-700 text-base">{status}</p>
      </div>
    </div>
  );
};

export default Verify;
