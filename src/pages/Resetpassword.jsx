import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

import AuthLayout from "../components/auth/AuthLayout";
import { resetPassword, selectAuthLoading } from "../redux/slices/authSlices";

const SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>]/;

export default function ResetPassword() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(selectAuthLoading);
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    const formData = new FormData(e.currentTarget);

    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (!password) {
      toast.error("Please enter your new password");
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
      const res = await dispatch(resetPassword({ token, password })).unwrap();

      toast.success(res?.message || "Password updated. Please sign in.");

      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(error?.message || "Could not reset the password. Please try again.");
    }
  };

  if (!token) {
    return (
      <AuthLayout
        title="Link not valid"
        subtitle="This password reset link is missing or has expired."
      >
        <Link
          to="/forgot-password"
          className="block w-full bg-mocha py-4 text-center text-white transition hover:bg-ink"
        >
          Request a new link
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Choose a strong password you haven't used before."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label htmlFor="password" className="mb-2 block text-sm text-ink">
            New password
          </label>

          <input
            id="password"
            type="password"
            name="password"
            placeholder="Create a new password"
            autoComplete="new-password"
            className="w-full border border-line bg-white px-4 py-3.5 outline-none transition focus:border-mocha"
          />

          <p className="mt-2 text-xs text-muted">
            8+ characters, uppercase, lowercase, number & special character
          </p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-2 block text-sm text-ink">
            Confirm new password
          </label>

          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            placeholder="Confirm your new password"
            autoComplete="new-password"
            className="w-full border border-line bg-white px-4 py-3.5 outline-none transition focus:border-mocha"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-mocha py-4 text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Updating..." : "Update password"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        Back to{" "}
        <Link to="/login" className="font-medium text-mocha underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}