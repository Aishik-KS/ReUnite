import React, { useState } from "react";
import { useNavigate } from "react-router";
import { auth } from "../helpers/firebase";
import Background_Image from "../assets/AdminBackground-Image.png";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { toast } from "react-toastify";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import "./AdminLoginPage.css";

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleNormalSignIn = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Login successful! Redirecting...");
      navigate("/AdminDashboard");
    } catch (error) {
      handleLoginError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
      toast.success("Google login successful! Redirecting...");
    } catch (error) {
      handleLoginError(error, true);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginError = (error, isGoogle = false) => {
    console.error(`${isGoogle ? "Google" : ""} Login error:`, error);

    const errorMessages = {
      "auth/invalid-email": "Invalid email address format.",
      "auth/user-disabled": "This account has been disabled.",
      "auth/user-not-found": "No account found with this email.",
      "auth/wrong-password": "Incorrect password.",
      "auth/too-many-requests": "Too many attempts. Try again later.",
      "auth/account-exists-with-different-credential":
        "An account already exists with this email.",
    };

    toast.error(
      errorMessages[error.code] ||
        `${isGoogle ? "Google" : ""} login failed. Please try again.`
    );
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-visual">
          <img src={Background_Image} alt="" />
        </div>

        <div className="login-ui">
          <div className="login-header">
            <h1 className="login-title">Welcome,</h1>
            <h2 className="login-admin-title">Administrator Login</h2>
          </div>
          <p className="login-subtitle">
            Please enter your credentials to access the dashboard
          </p>

          <form className="login-form" onSubmit={handleNormalSignIn}>
            <div className="form-group">
              <label htmlFor="email" className="input-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="login-input"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="input-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="login-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className="login-options">
              <a href="#" className="forgot-password">
                Forgot password?
              </a>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? <span className="button-spinner"></span> : "Sign In"}
            </button>
          </form>

          <div className="login-divider">
            <span className="divider-text">or continue with</span>
          </div>

          <div className="social-login">
            <button
              type="button"
              className="social-button google"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <FcGoogle className="social-icon" size={22} />
              <span>Google</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
