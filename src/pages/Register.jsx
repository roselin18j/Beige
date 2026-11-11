import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import AuthLayout from "../components/auth/AuthLayout";
import { registerUser, selectAuthLoading } from "../redux/slices/authSlices";

const NAME_REGEX = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>]/;

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(selectAuthLoading);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    const formData = new FormData(e.currentTarget);

    const name = formData.get("name")?.trim();
    const email = formData.get("email")?.trim().toLowerCase();
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (!name) {
      toast.error("Please enter your full name");
      return;
    }

    if (!NAME_REGEX.test(name)) {
      toast.error("Name must contain letters and spaces only");
      return;
    }

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!password) {
      toast.error("Please enter your password");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must contain at least 8 characters");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      toast.error("Password must contain at least one uppercase letter");
      return;
    }

    if (!/[a-z]/.test(password)) {
      toast.error("Password must contain at least one lowercase letter");
      return;
    }

    if (!/[0-9]/.test(password)) {
      toast.error("Password must contain at least one number");
      return;
    }

    if (!SPECIAL_CHAR_REGEX.test(password)) {
      toast.error("Password must contain a special character");
      return;
    }

    if (!confirmPassword) {
      toast.error("Please confirm your password");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const res = await dispatch(
        registerUser({ name, email, password })
      ).unwrap();

      toast.success(res?.message || "Registration successful! Please sign in.");

      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(error?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start your everyday beauty ritual with Beige."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm text-ink">
            Full name
          </label>

          <input
            id="name"
            type="text"
            name="name"
            placeholder="Your name"
            autoComplete="name"
            className="w-full border border-line bg-white px-4 py-3.5 max-md:py-2.5 outline-none transition focus:border-mocha"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block text-sm text-ink">
            Email address
          </label>

          <input
            id="email"
            type="email"
            name="email"
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full border border-line bg-white px-4 py-3.5 max-md:py-2.5 outline-none transition focus:border-mocha"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm text-ink">
            Password
          </label>

          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Create a password"
              autoComplete="new-password"
              className="w-full border border-line bg-white px-4 py-3.5 max-md:py-2.5 pr-12 outline-none transition focus:border-mocha"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <p className="mt-2 text-xs text-muted">
            8+ characters, uppercase, lowercase, number & special character
          </p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-2 block text-sm text-ink">
            Confirm password
          </label>

          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm your password"
              autoComplete="new-password"
              className="w-full border border-line bg-white px-4 py-3.5 max-md:py-2.5 pr-12 outline-none transition focus:border-mocha"
            />

            <button
              type="button"
              onClick={() => setShowConfirm((prev) => !prev)}
              aria-label={showConfirm ? "Hide password" : "Show password"}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-mocha py-4 text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-mocha underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}