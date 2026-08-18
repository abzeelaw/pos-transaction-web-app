import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiShield,
  FiUser,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
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

    const name = formData.name.trim();
    const email = formData.email.trim();
    const password = formData.password;

    if (!name) {
      setError("Please enter your name.");
      return;
    }

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please create a password.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    try {
      setLoading(true);

      await register(
        name,
        email,
        password
      );

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to create your account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* LEFT */}

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
            BUILT FOR POS AGENTS
          </p>

          <h1>
            Move from paper
            <span>
              to digital records.
            </span>
          </h1>

          <p>
            Keep every sale organized,
            calculate your totals automatically
            and access your records whenever
            you need them.
          </p>

        </div>

        <div className="auth-footer-text">
          © 2026 POS Tracker
        </div>

      </div>


      {/* RIGHT */}

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
              Create your account
            </h2>

            <p>
              Start recording your POS
              transactions today.
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

            {/* NAME */}

            <div className="form-group">

              <label htmlFor="name">
                Full name
              </label>

              <div className="input-wrapper">

                <FiUser />

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="name"
                />

              </div>

            </div>


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

              <label htmlFor="password">
                Password
              </label>

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
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="new-password"
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
                ? "Creating account..."
                : "Create account"}

              {!loading && (
                <FiArrowRight />
              )}

            </button>

          </form>


          <div className="auth-switch">

            <span>
              Already have an account?
            </span>

            <Link to="/login">
              Sign in
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Register;