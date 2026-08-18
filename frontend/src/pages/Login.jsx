import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-toastify";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import API from "../services/api";
import "../components/styles/login.css";

function Login() {
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  // Email Login
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await API.post("/auth/login", user);

      localStorage.setItem("token", res.data.token);

      toast.success("Login Successful!");

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Login Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // Google Login
  const handleGoogleLogin = async () => {
  try {
    setGoogleLoading(true);

    // Open Google Sign-In popup
    const result = await signInWithPopup(auth, googleProvider);

    // Get Firebase ID Token
    const idToken = await result.user.getIdToken();

    // Send ID Token to backend
    const res = await API.post("/auth/google", {
      idToken,
    });

    // Save JWT from your backend
    localStorage.setItem("token", res.data.token);

    toast.success("Google Login Successful!");

    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1000);

  } catch (err) {
    console.error(err);

    if (err.code !== "auth/popup-closed-by-user") {
      toast.error(
        err.response?.data?.message || "Google Login Failed"
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
            Manage your money smarter.
            <br />
            Track your income and expenses effortlessly.
          </p>

        </div>

        <form onSubmit={handleSubmit}>

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
              type={showPassword ? "text" : "password"}
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

          <div className="forgot-password">

            <Link to="/forgot-password">
              Forgot Password?
            </Link>

          </div>

          <button
            className="login-btn"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

          {/* OR Divider */}

          <div className="or-divider">
  <hr />
  <span>OR</span>
  <hr />
</div>

          {/* ONLY ONE GOOGLE BUTTON */}

          <button
            type="button"
            className="google-btn"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
          >
            <FcGoogle />

            <span>
              {googleLoading
                ? "Signing in with Google..."
                : "Continue with Google"}
            </span>

          </button>

          <p className="register-text">

            Don't have an account?{" "}

            <Link to="/register">
              Register
            </Link>

          </p>

        </form>

      </div>

    </div>
  );
}

export default Login;