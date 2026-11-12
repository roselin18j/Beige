
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useFormik } from "formik";
import * as Yup from "yup";

import AuthLayout from "../components/auth/AuthLayout";
import { registerUser } from "../redux/slices/authSlices";

const NAME_REGEX = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/;

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;

const SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]~`;' ]/;

const registerValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Please enter your full name")
    .matches(NAME_REGEX, "Name must contain letters and spaces only")
    .min(2, "Name must contain at least 2 characters")
    .max(50, "Name must not exceed 50 characters"),

  email: Yup.string()
    .trim()
    .lowercase()
    .required("Please enter your email address")
    .matches(EMAIL_REGEX, "Please enter a valid email address")
    .max(254, "Email must not exceed 254 characters"),

  password: Yup.string()
    .required("Please enter your password")
    .min(8, "Password must contain at least 8 characters")
    .max(64, "Password must not exceed 64 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(
      SPECIAL_CHAR_REGEX,
      "Password must contain at least one special character"
    )
    .matches(/^\S*$/, "Password must not contain spaces"),

  confirmPassword: Yup.string()
    .required("Please confirm your password")
    .oneOf([Yup.ref("password")], "Passwords do not match"),
});

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },

    validationSchema: registerValidationSchema,

    onSubmit: async (values) => {
      if (loading) return;

      setLoading(true);

      try {
        const res = await dispatch(
          registerUser({
            name: values.name.trim(),
            email: values.email.trim().toLowerCase(),
            password: values.password,
          })
        ).unwrap()



        toast.success(
          res?.message || "Registration successful! Please sign in."
        );


        navigate("/verify-otp", {
          state: {
            name: values.name.trim(),
            email: values.email.trim().toLowerCase(),
            password: values.password,
            type: "register"
          },
          replace: true,
        });



      } catch (error) {
        toast.error(
          error?.message || "Registration failed. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start your everyday beauty ritual with Beige."
    >
      <form onSubmit={formik.handleSubmit} noValidate className="space-y-5">
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
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full border border-line bg-white px-4 py-3.5 max-md:py-2.5 outline-none transition focus:border-mocha"
          />

          {formik.touched.name && formik.errors.name && (
            <p className="mt-1 text-sm text-red-500">
              {formik.errors.name}
            </p>
          )}
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
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full border border-line bg-white px-4 py-3.5 max-md:py-2.5 outline-none transition focus:border-mocha"
          />

          {formik.touched.email && formik.errors.email && (
            <p className="mt-1 text-sm text-red-500">
              {formik.errors.email}
            </p>
          )}
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
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
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

          {formik.touched.password && formik.errors.password && (
            <p className="mt-1 text-sm text-red-500">
              {formik.errors.password}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm text-ink"
          >
            Confirm password
          </label>

          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm your password"
              autoComplete="new-password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
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

          {formik.touched.confirmPassword &&
            formik.errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">
                {formik.errors.confirmPassword}
              </p>
            )}
        </div>

        <button
          type="submit"
          disabled={loading || formik.isSubmitting}
          className="w-full bg-mocha py-4 text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading || formik.isSubmitting
            ? "Creating account..."
            : "Create account"}
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
