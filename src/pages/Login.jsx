import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      await login(
        formData.email,
        formData.password
      );

      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to login. Please check your details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-container">

        {/* Brand */}

        <div className="auth-brand">

          <div className="brand-mark">
            P
          </div>

          <span>
            POS Tracker
          </span>

        </div>


        {/* Card */}

        <div className="auth-card">

          {/* Header */}

          <div className="auth-header">

            <h1>
              Welcome back
            </h1>

            <p>
              Sign in to manage your POS transactions.
            </p>

          </div>


          {/* Error */}

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}


          {/* Form */}

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >

            {/* Email */}

            <div className="form-group">

              <label htmlFor="email">
                Email address
              </label>

              <div className="auth-input-wrapper">

                <FiMail />

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  disabled={loading}
                />

              </div>

            </div>


            {/* Password */}

            <div className="form-group">

              <label htmlFor="password">
                Password
              </label>

              <div className="auth-input-wrapper">

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
                  autoComplete="current-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (current) => !current
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  disabled={loading}
                >
                  {showPassword ? (
                    <FiEyeOff />
                  ) : (
                    <FiEye />
                  )}
                </button>

              </div>

            </div>


            {/* Submit */}

            <button
              type="submit"
              className="primary-button auth-submit"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="button-spinner" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <FiArrowRight />
                </>
              )}

            </button>

          </form>


          {/* Footer */}

          <div className="auth-footer">

            <span>
              Don't have an account?{" "}
            </span>

            <Link to="/register">
              Create an account
            </Link>

          </div>

        </div>


        {/* Bottom text */}

        <p className="auth-copyright">
          POS Tracker · Sales management made simple
        </p>

      </div>

    </div>
  );
};

export default Login;