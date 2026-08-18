import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiShield,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!formData.password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      await login(
        formData.email.trim(),
        formData.password
      );

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error("Login error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to sign in. Please check your details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* LEFT SIDE */}

      <div className="auth-brand-panel">

        <div className="auth-brand">

          <div className="brand-mark">
            P
          </div>

          <span>
            POS Tracker
          </span>

        </div>

        <div className="auth-brand-content">

          <div className="auth-icon">
            <FiShield />
          </div>

          <p className="auth-eyebrow">
            SIMPLE • SECURE • SMART
          </p>

          <h1>
            Keep your POS
            <span>
              transactions organized.
            </span>
          </h1>

          <p>
            Record sales, track revenue and
            understand your business from
            one simple dashboard.
          </p>

        </div>

        <div className="auth-footer-text">
          © 2026 POS Tracker
        </div>

      </div>


      {/* RIGHT SIDE */}

      <div className="auth-form-panel">

        <div className="auth-form-container">

          <div className="mobile-auth-brand">

            <div className="brand-mark">
              P
            </div>

            <span>
              POS Tracker
            </span>

          </div>

          <div className="auth-form-header">

            <h2>
              Welcome back
            </h2>

            <p>
              Sign in to manage your transactions.
            </p>

          </div>


          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}


          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >

            {/* EMAIL */}

            <div className="form-group">

              <label htmlFor="email">
                Email address
              </label>

              <div className="input-wrapper">

                <FiMail />

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="email"
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div className="form-group">

              <div className="form-label-row">

                <label htmlFor="password">
                  Password
                </label>

              </div>

              <div className="input-wrapper">

                <FiLock />

                <input
                  id="password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (previous) =>
                        !previous
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <FiEyeOff />
                  ) : (
                    <FiEye />
                  )}
                </button>

              </div>

            </div>


            {/* SUBMIT */}

            <button
              type="submit"
              className="auth-submit-button"
              disabled={loading}
            >

              {loading
                ? "Signing in..."
                : "Sign in"}

              {!loading && (
                <FiArrowRight />
              )}

            </button>

          </form>


          <div className="auth-switch">

            <span>
              Don't have an account?
            </span>

            <Link to="/register">
              Create one
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Login;