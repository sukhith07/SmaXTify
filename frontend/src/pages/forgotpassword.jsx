import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope } from "react-icons/fa";
import { toast } from "react-toastify";
import API from "../services/api";
import "../components/styles/login.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await API.post("/auth/send-otp", {
        email,
      });

      toast.success(res.data.message);

      setTimeout(() => {
        navigate("/verify-otp", {
          state: { email },
        });
      }, 1000);

    } catch (err) {

      toast.error(
        err.response?.data?.message ||
          "Something went wrong"
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="login-page">

      <div className="bg-circle circle1"></div>
      <div className="bg-circle circle2"></div>
      <div className="bg-circle circle3"></div>

      <div className="login-card">

        <div className="login-header">

          <h1>Forgot Password</h1>

          <p>
            Enter your registered email address.
            We'll send you a verification OTP.
          </p>

        </div>

        <form onSubmit={handleSubmit}>

          <div className="input-group">

            <FaEnvelope className="input-icon" />

            <input
              type="email"
              placeholder="Registered Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>

          <p className="register-text">

            <Link to="/">
              ← Back to Login
            </Link>

          </p>

        </form>

      </div>

    </div>
  );
}

export default ForgotPassword;