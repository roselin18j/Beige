
import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { useFormik } from "formik";
import * as Yup from "yup";

import AuthLayout from "../components/auth/AuthLayout";
import { forgotPassword } from "../redux/slices/authSlices";

export default function ForgotPassword() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: "",
    },

    validationSchema: Yup.object({
      email: Yup.string()
        .transform((value) => value?.trim().toLowerCase())
        .required("Please enter your email address")
        .max(254, "Email address must not exceed 254 characters")
        .matches(
          /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/,
          "Please enter a valid email address"
        )
        .test(
          "domain-length",
          "Email domain is too long",
          (value) => {
            if (!value) return true;

            const domain = value.split("@")[1];

            return domain
              .split(".")
              .every((part) => part.length <= 63);
          }
        ),
    }),

    onSubmit: async (values, { resetForm }) => {
      if (loading) return;

      setLoading(true);

      try {
        const res = await dispatch(
          forgotPassword({
            email: values.email.trim().toLowerCase(),
          })
        ).unwrap();

        toast.success(
          res?.message ||
          "If an account exists for this email, a reset link has been sent."
        );

        resetForm();
      } catch (error) {
        toast.error(
          error?.message ||
          "Could not send the reset link. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="Enter your email and we'll help you get back in."
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
