import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { toast } from "react-toastify";
import API from "../services/api";
import "../components/styles/login.css";

function Register() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  // ===============================
  // Email Registration
  // ===============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (user.password !== user.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      setLoading(true);

      await API.post("/auth/register", {
        name: user.name,
        email: user.email,
        password: user.password,
      });

      toast.success("Registration Successful!");

      setTimeout(() => {
        navigate("/");
      }, 1000);

    } catch (err) {

      toast.error(
        err.response?.data?.message ||
        "Registration Failed"
      );

    } finally {

      setLoading(false);

    }
  };

  // ===============================
  // Google Registration
  // ===============================
  const handleGoogleRegister = async () => {
    try {

      setGoogleLoading(true);

      const result = await signInWithPopup(
        auth,
        googleProvider
      );

      const googleUser = result.user;

      const idToken = await googleUser.getIdToken();

      const res = await API.post("/auth/google", {
        idToken,
      });

      localStorage.setItem(
        "token",
        res.data.token
      );

      toast.success(
        "Google Registration Successful!"
      );

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);

    } catch (err) {

      console.error(err);

      if (
        err.code !==
        "auth/popup-closed-by-user"
      ) {
        toast.error(
          "Google Registration Failed"
        );
      }

    } finally {

      setGoogleLoading(false);

    }
  };

  return (
    <div className="login-page">

      <div className="bg-circle circle1"></div>
      <div className="bg-circle circle2"></div>
      <div className="bg-circle circle3"></div>

      <div className="login-card">

        <div className="login-header">

          <h1>SmaXTify</h1>

          <p>
            Create your account and start
            managing your income and expenses
            today.
          </p>

        </div>

        <form onSubmit={handleSubmit}>

          <div className="input-group">

            <FaUser className="input-icon" />

            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={user.name}
              onChange={handleChange}
              required
            />

          </div>

          <div className="input-group">

            <FaEnvelope className="input-icon" />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={user.email}
              onChange={handleChange}
              required
            />

          </div>

          <div className="input-group">

            <FaLock className="input-icon" />

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              name="password"
              placeholder="Password"
              value={user.password}
              onChange={handleChange}
              required
            />

            <button
              type="button"
              className="eye-btn"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
            >
              {showPassword
                ? <FaEyeSlash />
                : <FaEye />}
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
              name="confirmPassword"
              placeholder="Confirm Password"
              value={user.confirmPassword}
              onChange={handleChange}
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
              {showConfirmPassword
                ? <FaEyeSlash />
                : <FaEye />}
            </button>

          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              margin: "18px 0",
            }}
          >
            <hr style={{ flex: 1 }} />
            <span
              style={{
                margin: "0 12px",
                color: "#fff",
              }}
            >
              OR
            </span>
            <hr style={{ flex: 1 }} />
          </div>

          <button
            type="button"
            className="google-btn"
            onClick={handleGoogleRegister}
            disabled={googleLoading}
          >
            <FcGoogle />

            <span>
              {googleLoading
                ? "Signing up..."
                : "Continue with Google"}
            </span>

          </button>

          <p className="register-text">

            Already have an account?{" "}

            <Link to="/">
              Login
            </Link>

          </p>

        </form>

      </div>

    </div>
  );
}

export default Register;