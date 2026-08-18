import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { FaShieldAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import API from "../services/api";
import OTPInput from "../components/OTPInput";
import "../components/styles/login.css";

function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(300);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const minutes = String(Math.floor(timer / 60)).padStart(2, "0");
  const seconds = String(timer % 60).padStart(2, "0");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      toast.error("Please enter the 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/verify-otp", {
        email,
        otp: otpCode,
      });

      toast.success(res.data.message);

      setTimeout(() => {
        navigate("/reset-password", {
          state: {
            email,
            otp: otpCode,
          },
        });
      }, 1000);

    } catch (err) {

      toast.error(
        err.response?.data?.message || "Invalid OTP"
      );

    } finally {

      setLoading(false);

    }
  };

  const resendOTP = async () => {
    try {

      await API.post("/auth/send-otp", { email });

      setTimer(300);

      toast.success("New OTP sent successfully!");

    } catch (err) {

      toast.error(
        err.response?.data?.message || "Failed to resend OTP"
      );

    }
  };

  return (
    <div className="login-page">

      <div className="bg-circle circle1"></div>
      <div className="bg-circle circle2"></div>
      <div className="bg-circle circle3"></div>

      <div className="login-card">

        <div className="login-header">

          <h1>Verify OTP</h1>

          <p>
            Enter the 6-digit verification code sent to
          </p>

          <h4
            style={{
              marginTop: "10px",
              color: "#fff",
              wordBreak: "break-word",
            }}
          >
            {email}
          </h4>

        </div>

        <form onSubmit={handleSubmit}>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "20px",
              color: "white",
              fontSize: "35px",
            }}
          >
            <FaShieldAlt />
          </div>

          <OTPInput
            otp={otp}
            setOtp={setOtp}
          />

          <p
            style={{
              textAlign: "center",
              marginTop: "20px",
              marginBottom: "20px",
              fontWeight: "600",
              color: "#fff",
              fontSize: "17px",
            }}
          >
            {minutes}:{seconds}
          </p>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <div
            style={{
              textAlign: "center",
              marginTop: "20px",
            }}
          >

            {timer > 0 ? (

              <p style={{ color: "#fff" }}>
                Resend OTP in{" "}
                <strong>
                  {minutes}:{seconds}
                </strong>
              </p>

            ) : (

              <button
                type="button"
                className="login-btn"
                onClick={resendOTP}
                style={{
                  marginTop: "0",
                }}
              >
                Resend OTP
              </button>

            )}

          </div>

          <p className="register-text">

            <Link to="/forgot-password">
              ← Back
            </Link>

          </p>

        </form>

      </div>

    </div>
  );
}

export default VerifyOTP;