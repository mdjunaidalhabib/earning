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
    errors.newPassword = "নতুন পাসওয়ার্ড আবশ্যক";
  } else if (values.newPassword.length < 8) {
    errors.newPassword = "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে";
  } else if (!/\d/.test(values.newPassword) || !/[A-Za-z]/.test(values.newPassword)) {
    errors.newPassword = "পাসওয়ার্ডে অক্ষর ও সংখ্যা উভয়ই থাকতে হবে";
  }
  if (values.newPassword !== values.confirmPassword) {
    errors.confirmPassword = "পাসওয়ার্ড দুটি মিলছে না";
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
      toast.success("পাসওয়ার্ড সফলভাবে রিসেট হয়েছে। এখন লগ ইন করুন।");
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "এই রিসেট লিংকটি অবৈধ বা মেয়াদোত্তীর্ণ। নতুন একটি অনুরোধ করুন।"
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
              নতুন পাসওয়ার্ড সেট করুন
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              এমন একটি শক্তিশালী পাসওয়ার্ড বেছে নাও যা আগে ব্যবহার করোনি।
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="newPassword">নতুন পাসওয়ার্ড</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="কমপক্ষে ৮ অক্ষর"
                  value={values.newPassword}
                  onChange={handleChange}
                  aria-invalid={!!errors.newPassword}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                  aria-label={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখান"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.newPassword && <p className="text-xs text-rust">{errors.newPassword}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmPassword">নতুন পাসওয়ার্ড নিশ্চিত করুন</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="নতুন পাসওয়ার্ড আবার লিখুন"
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
              {isSubmitting ? "রিসেট হচ্ছে…" : "পাসওয়ার্ড রিসেট করুন"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            পাসওয়ার্ড মনে পড়ে গেছে?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              লগ ইন করুন
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
