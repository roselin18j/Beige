
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useFormik } from "formik";
import * as Yup from "yup";
import { LoginUser } from "../redux/slices/authSlices";
import AuthLayout from "../components/auth/AuthLayout";

const loginValidationSchema = Yup.object({
  email: Yup.string()
    .trim()
    .lowercase()
    .email("Please enter a valid email address")
    .matches(
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/,
      "Please enter a valid email address"
    )
    .max(254, "Email must not exceed 254 characters")
    .required("Email address is required"),

  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must contain at least 8 characters")
    .max(64, "Password must not exceed 64 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(
      /[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]~`;' ]/,
      "Password must contain at least one special character"
    )
    .matches(/^\S*$/, "Password must not contain spaces"),
});

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },

    validationSchema: loginValidationSchema,

    onSubmit: async (values) => {
      if (loading) return;

      setLoading(true);

      try {
        const res = await dispatch(
          LoginUser({
            email: values.email.trim().toLowerCase(),
            password: values.password,
          })
        ).unwrap();


 
        toast.success(
          res?.message || "Registration successful! Please sign in."
        );


        navigate("/verify-otp", {
          state: {
            name:"",
            email: values.email.trim().toLowerCase(),
            password: values.password,
            type: "login"
          },
          replace: true,
        });



      } catch (error) {
        toast.error(error?.message || "Login failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue your everyday ritual."
    >
      <form onSubmit={formik.handleSubmit} noValidate className="space-y-5">
        <div>
          <label className="mb-2 block text-sm text-ink">
            Email address
          </label>

          <input
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
          <label className="mb-2 block text-sm text-ink">
            Password
          </label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
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

          {formik.touched.password && formik.errors.password && (
            <p className="mt-1 text-sm text-red-500">
              {formik.errors.password}
            </p>
          )}
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
