/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { CheckCircle, Loader2, RotateCcw } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;

const VerifyOTP = () => {
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const { email } = useParams();
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const inputRefs = useRef([]);

  // Timer for resend button
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Auto-submit when all digits are entered
  useEffect(() => {
    if (otp.every((digit) => digit !== "") && !isLoading && !isVerified) {
      handleVerify();
    }
  }, [otp, isLoading, isVerified]);

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Handle paste
    if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then((text) => {
        const digits = text.replace(/\D/g, "").slice(0, 6).split("");
        const newOtp = [...otp];
        digits.forEach((digit, i) => {
          if (i < 6) newOtp[i] = digit;
        });
        setOtp(newOtp);

        // Focus the next empty input or the last one
        const nextEmptyIndex = newOtp.findIndex((digit) => digit === "");
        const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
        inputRefs.current[focusIndex]?.focus();
      });
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setError("");
    setSuccessMessage("");

    try {
      if (!email) {
        setError(
          "Email is missing — please provide your email to resend the code."
        );
        setIsResending(false);
        return;
      }

      // 🔁 Call backend to resend OTP
      const response = await axios.post(
        `${API_URL}/api/v1/user/forgot-password`,
        { email }
      );

      // Reset timer & inputs
      setResendTimer(60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();

      // Show success message
      setSuccessMessage(
        response.data.message || "A new OTP has been sent to your email."
      );
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Failed to resend OTP. Please try again."
      );
    } finally {
      setIsResending(false);
    }
  };

  const clearOTP = () => {
    setOtp(["", "", "", "", "", ""]);
    setError("");
    inputRefs.current[0]?.focus();
  };

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const finalOtp = otp.join("");
    if (finalOtp.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const response = await axios.post(
        `${API_URL}/api/v1/user/verify-otp/${email}`,
        {
          otp: finalOtp,
        }
      );

      setSuccessMessage(response.data.message);
      setIsVerified(true);
      setTimeout(() => {
        navigate(`/change-password/${email}`);
      }, 1000);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex flex-col bg-lightGray">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-primaryBlue">
              Verify Your Email
            </h1>
            <p className="text-muted-foreground">
              We’ve sent a 6-digit verification code to{" "}
              <span className="font-medium text-foreground ">
                {email || "your email"}
              </span>
            </p>
          </div>

          <Card className="shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center text-primaryBlue">
                Enter Verification Code
              </CardTitle>
              <CardDescription className="text-center">
                {isVerified
                  ? "Code verified successfully! Redirecting..."
                  : "Enter the 6-digit code sent to your email"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {successMessage && (
                <p className="text-primaryBlue text-sm mb-3 text-center">
                  {successMessage}
                </p>
              )}

              {isVerified ? (
                <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="bg-primary/10 rounded-full p-3">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium text-lg">
                      Verification successful
                    </h3>
                    <p className="text-muted-foreground">
                      Your email has been verified. You'll be redirected to
                      reset your password.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      Redirecting...
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  {/* OTP Input */}
                  <div className="flex justify-between mb-6">
                    {otp.map((digit, index) => (
                      <Input
                        key={index}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        ref={(el) => (inputRefs.current[index] = el)}
                        className="w-12 h-12 text-center text-xl font-bold"
                      />
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button
                      onClick={handleVerify}
                      className="w-full bg-primaryBlue hover: primaryBlue text-white"
                      disabled={isLoading || otp.some((digit) => digit === "")}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify Code"
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={clearOTP}
                      className="w-full bg-transparent"
                      disabled={isLoading || isVerified}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Clear
                    </Button>
                  </div>

                  {/* Resend Section */}
                  <div className="text-center space-y-2 mt-4">
                    <p className="text-sm text-muted-foreground">
                      Didn't receive the code?
                    </p>
                    {resendTimer > 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Resend code in {resendTimer} seconds
                      </p>
                    ) : (
                      <Button
                        variant="link"
                        onClick={handleResendOTP}
                        disabled={isResending || isLoading}
                        className="p-0 h-auto font-medium text-primaryBlue hover:text-primaryBlue/80 transition-all duration-200"
                      >
                        {isResending ? (
                          <>
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          "Resend code"
                        )}
                      </Button>
                    )}
                    
                    {successMessage && (
                      <p className="text-sm text-primaryBlue font-medium mt-2">
                        {successMessage}
                      </p>
                    )}
                    {error && (
                      <p className="text-sm text-red-600 font-medium mt-2">
                        {error}
                      </p>
                    )}{" "}
                    
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-muted-foreground">
                Wrong email?{" "}
                <Link
                  to="/forgot-password"
                  className="text-primaryBlue hover:underline font-medium"
                >
                  Go back
                </Link>
              </p>
            </CardFooter>
          </Card>

          <div className="text-center text-xs text-muted-foreground">
            <p>
              For testing purposes, use code:{" "}
              <span className="font-mono font-medium">123456</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
