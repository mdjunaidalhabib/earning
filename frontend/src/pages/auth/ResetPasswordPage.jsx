import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import axiosInstance from "@/api/axiosInstance";
import { AuthSplitPanel } from "@/components/layout/AuthSplitPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function validate(values) {
  const errors = {};
  if (!values.newPassword) {
    errors.newPassword = "New password is required";
  } else if (values.newPassword.length < 8) {
    errors.newPassword = "Password must be at least 8 characters";
  } else if (!/\d/.test(values.newPassword) || !/[A-Za-z]/.test(values.newPassword)) {
    errors.newPassword = "Password must contain both letters and numbers";
  }
  if (values.newPassword !== values.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }
  return errors;
}

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [values, setValues] = useState({ newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await axiosInstance.post(`/auth/reset-password/${token}`, {
        newPassword: values.newPassword,
      });
      toast.success("Password reset successfully. Please log in now.");
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "This reset link is invalid or expired. Please request a new one."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <AuthSplitPanel />

      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
              Set a New Password
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              এমন একটি Strong Password বেছে নাও যা আগে ব্যবহার করোনি।
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={values.newPassword}
                  onChange={handleChange}
                  aria-invalid={!!errors.newPassword}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.newPassword && <p className="text-xs text-rust">{errors.newPassword}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter new password"
                value={values.confirmPassword}
                onChange={handleChange}
                aria-invalid={!!errors.confirmPassword}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-rust">{errors.confirmPassword}</p>
              )}
            </div>

            <Button type="submit" variant="brass" size="lg" disabled={isSubmitting} className="mt-2">
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <KeyRound className="h-4 w-4" />
              )}
              {isSubmitting ? "Resetting…" : "Reset Password"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Remembered your Password?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
