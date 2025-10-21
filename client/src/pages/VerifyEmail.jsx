import React, { useState, useEffect } from "react";
import axios from "axios";
import { Loader2, CheckCircle2 } from "lucide-react";
const API_URL = import.meta.env.VITE_API_URL;

const ResendEmail = ({ email: propEmail }) => {
  const [email, setEmail] = useState(
    propEmail ||
      (typeof window !== "undefined" && window.history.state?.usr?.email) ||
      localStorage.getItem("pendingEmail") ||
      ""
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // Cooldown timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleResendLink = async () => {
    if (!email) {
      setError("Email not found. Please sign up again.");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await axios.post(
        `${API_URL}/api/v1/user/resend-verification`,
        { email },
        { headers: { "Content-Type": "application/json" } }
      );

      setMessage(response.data.message || "Verification link has been resent successfully!");
      setResendTimer(60);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to resend the verification link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl w-full max-w-md text-center border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="text-primaryBlue w-12 h-12" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-4">Verify Your Email</h2>
        {email ? (
          <p className="text-gray-700 text-base mb-6 leading-relaxed">
            A verification link has been sent to <span className="font-semibold text-gray-900">{email}</span>. <br />
            Please check your inbox and click the link to activate your account.
          </p>
        ) : (
          // When email is missing, show an input so user can enter it and resend
          <div className="mb-6">
            <p className="text-gray-700 text-base mb-3">Enter your email to resend verification:</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border rounded px-3 py-2"
            />
          </div>
        )}

        {error && <p className="text-red-600 text-sm font-medium mb-3">{error}</p>}
        {message && <p className="text-blue-700 text-sm font-medium mb-3">{message}</p>}

        <div className="mt-4">
          <p className="text-gray-600 text-sm mb-2">
            Didn't receive the verification link?{" "}</p>
          {resendTimer > 0 ? (
            <p className="text-gray-500 text-sm">Resend link in {resendTimer} seconds</p>
          ) : (
            <button
              onClick={handleResendLink}
              disabled={loading || !email}
              className={`font-medium ${
                loading ? "text-gray-400 cursor-not-allowed" : "text-primaryBlue hover:underline"
              } mt-3`}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin inline-block" />
                  Sending...
                </>
              ) : (
                "Resend Verification Link"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResendEmail;
