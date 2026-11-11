import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import AuthLayout from "../components/auth/AuthLayout";
import { exchangeLogin, selectAuthLoading } from "../redux/slices/authSlices";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const loading = useSelector(selectAuthLoading);

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    const formData = new FormData(event.currentTarget);

    const email = formData.get("email")?.trim();
    const password = formData.get("password");

    if (!email) {
      toast.error("Please enter your email");
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

    try {
      await dispatch(
        exchangeLogin({ email: email.toLowerCase(), password })
      ).unwrap();

      toast.success("Welcome back to Beige");

      navigate(location.state?.from?.pathname ?? "/", { replace: true });
    } catch (error) {
      toast.error(error?.message || "Login failed. Please try again.");
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue your everyday ritual."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label className="mb-2 block text-sm text-ink">
            Email address
          </label>

          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full border border-line bg-white px-4 py-3.5 max-md:py-2.5 outline-none transition focus:border-mocha"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-ink">
            Password
          </label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              className="w-full border border-line bg-white px-4 py-3.5 max-md:py-2.5 pr-12 outline-none transition focus:border-mocha"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="text-right">
          <Link
            to="/forgot-password"
            className="text-sm text-mocha hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-mocha py-4 text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        New to Beige?{" "}
        <Link
          to="/register"
          className="font-medium text-mocha underline underline-offset-4"
        >
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}