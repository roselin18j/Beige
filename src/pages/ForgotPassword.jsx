import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

import AuthLayout from "../components/auth/AuthLayout";
import { forgotPassword, selectAuthLoading } from "../redux/slices/authSlices";

export default function ForgotPassword() {
  const dispatch = useDispatch();
  const loading = useSelector(selectAuthLoading);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = formData.get("email").trim();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      const res = await dispatch(
        forgotPassword({ email: email.toLowerCase() })
      ).unwrap();

      toast.success(
        res?.message ||
          "If an account exists for this email, a reset link has been sent."
      );

      form.reset();
    } catch (error) {
      toast.error(error?.message || "Could not send the reset link. Please try again.");
    }
  };

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="Enter your email and we'll help you get back in."
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
            required
            className="w-full border border-line bg-white px-4 py-3.5 max-md:py-2.5 outline-none transition focus:border-mocha"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-mocha py-4 max-md:py-2.5 text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Sending..." : "Reset password"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        Remember your password?{" "}
        <Link to="/login" className="font-medium text-mocha underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}