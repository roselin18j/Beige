
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import AuthLayout from "../components/auth/AuthLayout";
import { registerUser, sendLoginOtp, verifyLoginOtp } from "../redux/slices/authSlices";
import { useDispatch } from "react-redux";


export default function VerifyOTP() {


  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    name,
    email,
    password,
    type
  } = location.state || {};

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(30);

  const inputRefs = useRef([]);



  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();

    const pastedValue = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pastedValue) return;

    const updatedOtp = [...otp];

    pastedValue.split("").forEach((digit, index) => {
      updatedOtp[index] = digit;
    });

    setOtp(updatedOtp);

    const nextIndex = Math.min(pastedValue.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }

    setLoading(true);

    try {


      const payload = {
        name,
        email,
        password,
        type,
        otp: otpValue,

      }

      const response = await dispatch(verifyLoginOtp(payload)).unwrap();
      console.log('response', response)

      toast.success(response?.message || "OTP verified successfully");

      navigate("/")


      if (type === "register") {
        navigate("/");
      } else if (type === "login") {
        localStorage.setItem("token", response.token);
        console.log('restoken----------------------', response.token)
        navigate("/");
      }

    } catch (error) {
      toast.error(
        error?.message || "Invalid OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {

    console.log('enter handleResend page ')

    if (timer > 0 || resending) return;

    setResending(true);

    try {
      const response = await dispatch(sendLoginOtp({ email })).unwrap();
      console.log('response', response)
      setOtp(["", "", "", "", "", ""]);
      setTimer(30);
      inputRefs.current[0]?.focus();

      toast.success(response?.message || "OTP sent successfully");
    } catch (error) {
      toast.error(error?.message || "Unable to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="Enter the verification code sent to your email address."
    >
      <form onSubmit={handleVerify} className="space-y-6" noValidate>
        <div>
          <p className="text-sm text-muted text-center mb-2">
            We sent a 6-digit verification code to
          </p>

          <p className="text-sm font-medium text-ink text-center break-all">
            {email || "your registered email"}
          </p>
        </div>

        <div className="flex justify-center gap-2 sm:gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                inputRefs.current[index] = element;
              }}
              type="text"
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}

              className="w-11 h-12 sm:w-14 sm:h-14 border border-line bg-white text-center text-xl font-semibold text-ink outline-none transition focus:border-mocha"
              aria-label={`OTP digit ${index + 1}`}
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || otp.some((digit) => !digit)}
          className="w-full bg-mocha py-4 text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <div className="text-center">
          <p className="text-sm text-muted">
            Didn't receive the code?
          </p>

          <button
            type="button"
            onClick={handleResend}
            disabled={timer > 0 || resending}
            className="mt-2 text-sm font-medium text-mocha underline underline-offset-4 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {resending
              ? "Sending..."
              : timer > 0
                ? `Resend OTP in ${timer}s`
                : "Resend OTP"}
          </button>
        </div>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        <Link
          to="/register"
          className="inline-flex items-center gap-2 font-medium text-mocha underline underline-offset-4"
        >
          <ArrowLeft size={15} />
          Back to registration
        </Link>
      </p>
    </AuthLayout>
  );
}
