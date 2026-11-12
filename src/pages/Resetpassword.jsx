import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { useFormik } from "formik";
import * as Yup from "yup";

import AuthLayout from "../components/auth/AuthLayout";
import { resetPassword } from "../redux/slices/authSlices";

const SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>]/;

export default function ResetPassword() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },

    validationSchema: Yup.object({
      password: Yup.string()
        .required("Please enter your new password")
        .min(8, "Password must contain at least 8 characters")
        .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
        .matches(/[a-z]/, "Password must contain at least one lowercase letter")
        .matches(/[0-9]/, "Password must contain at least one number")
        .matches(SPECIAL_CHAR_REGEX, "Password must contain a special character"),

      confirmPassword: Yup.string()
        .required("Please confirm your password")
        .oneOf([Yup.ref("password")], "Passwords do not match"),
    }),

    onSubmit: async (values) => {
      if (loading) return;

      setLoading(true);

      try {
        const res = await dispatch(
          resetPassword({ token, password: values.password })
        ).unwrap();

        toast.success(res?.message || "Password updated. Please sign in.");

        navigate("/login", { replace: true });
      } catch (error) {
        toast.error(
          error?.message || "Could not reset the password. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
  });

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
      <form onSubmit={formik.handleSubmit} noValidate className="space-y-5">
        <div>
          <label htmlFor="password" className="mb-2 block text-sm text-ink">
            New password
          </label>

          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Create a new password"
              autoComplete="new-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border border-line bg-white px-4 py-3.5 pr-12 outline-none transition focus:border-mocha"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
            </button>
          </div>

          {formik.touched.password && formik.errors.password && (
            <p className="mt-1 text-sm text-red-500">
              {formik.errors.password}
            </p>
          )}

          <p className="mt-2 text-xs text-muted">
            8+ characters, uppercase, lowercase, number & special character
          </p>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm text-ink"
          >
            Confirm new password
          </label>

          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm your new password"
              autoComplete="new-password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border border-line bg-white px-4 py-3.5 pr-12 outline-none transition focus:border-mocha"
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
              aria-label={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
            >
              <i
                className={`bi ${
                  showConfirmPassword ? "bi-eye-slash" : "bi-eye"
                }`}
              ></i>
            </button>
          </div>

          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">
              {formik.errors.confirmPassword}
            </p>
          )}
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