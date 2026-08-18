import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { toast } from "react-toastify";
import API from "../services/api";
import "../components/styles/login.css";

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const { email, otp } = location.state || {};

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  if (!email || !otp) {
    navigate("/forgot-password");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/reset-password", {
        email,
        otp,
        password,
      });

      toast.success(res.data.message);

      setTimeout(() => {
        navigate("/");
      }, 1200);

    } catch (err) {

      toast.error(
        err.response?.data?.message ||
          "Password Reset Failed"
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

          <h1>Reset Password</h1>

          <p>
            Create a strong password for your Smart ET
            account.
          </p>

        </div>

        <form onSubmit={handleSubmit}>

          <div className="input-group">

            <FaLock className="input-icon" />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="button"
              className="eye-btn"
              onClick={() =>
                setShowPassword(!showPassword)
              }
            >
              {showPassword ? (
                <FaEyeSlash />
              ) : (
                <FaEye />
              )}
            </button>

          </div>

          <div className="input-group">

            <FaLock className="input-icon" />

            <input
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              required
            />

            <button
              type="button"
              className="eye-btn"
              onClick={() =>
                setShowConfirmPassword(
                  !showConfirmPassword
                )
              }
            >
              {showConfirmPassword ? (
                <FaEyeSlash />
              ) : (
                <FaEye />
              )}
            </button>

          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading
              ? "Updating..."
              : "Reset Password"}
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

export default ResetPassword;