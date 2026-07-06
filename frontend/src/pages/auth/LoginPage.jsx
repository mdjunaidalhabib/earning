import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "@/context/AuthContext";
import { AuthSplitPanel } from "@/components/layout/AuthSplitPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function validate(values) {
  const errors = {};
  if (!values.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Please enter a valid email address";
  }
  if (!values.password) {
    errors.password = "Password is required";
  }
  return errors;
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [values, setValues] = useState({ email: "", password: "" });
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
      const user = await login({ ...values, portal: "user" });
      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
      const redirectTo = location.state?.from?.pathname;
      navigate(redirectTo || "/dashboard", { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message || "Invalid email or password. Please try again.";
      toast.error(message);
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
              Welcome Back
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              তোমার ব্যালেন্স আর আজকের কাজগুলো দেখতে লগ ইন করো।
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={values.email}
                onChange={handleChange}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="text-xs text-rust">{errors.email}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                  Password ভুলে গেছেন?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={values.password}
                  onChange={handleChange}
                  aria-invalid={!!errors.password}
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
              {errors.password && <p className="text-xs text-rust">{errors.password}</p>}
            </div>

            <Button type="submit" variant="brass" size="lg" disabled={isSubmitting} className="mt-2">
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              {isSubmitting ? "Logging in…" : "Log In"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            অ্যাকাউন্ট নেই?{" "}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Sign Up for Free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
