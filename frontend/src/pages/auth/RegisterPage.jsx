import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, UserPlus, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "@/context/AuthContext";
import { AuthSplitPanel } from "@/components/layout/AuthSplitPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function validate(values) {
  const errors = {};

  if (!values.name.trim()) {
    errors.name = "নাম আবশ্যক";
  } else if (values.name.trim().length < 2) {
    errors.name = "নাম কমপক্ষে ২ অক্ষরের হতে হবে";
  }

  if (!values.email.trim()) {
    errors.email = "ইমেইল আবশ্যক";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "একটি সঠিক ইমেইল ঠিকানা দিন";
  }

  if (values.phone && !/^\+?[0-9]{10,15}$/.test(values.phone)) {
    errors.phone = "একটি সঠিক ফোন নম্বর দিন";
  }

  if (!values.password) {
    errors.password = "পাসওয়ার্ড আবশ্যক";
  } else if (values.password.length < 8) {
    errors.password = "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে";
  } else if (!/\d/.test(values.password) || !/[A-Za-z]/.test(values.password)) {
    errors.password = "পাসওয়ার্ডে অক্ষর ও সংখ্যা উভয়ই থাকতে হবে";
  }

  if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "পাসওয়ার্ড দুটি মিলছে না";
  }

  return errors;
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setValues((prev) => ({ ...prev, referralCode: ref.toUpperCase() }));
    }
  }, [searchParams]);

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
      const { confirmPassword, ...payload } = values;
      if (!payload.referralCode) delete payload.referralCode;
      if (!payload.phone) delete payload.phone;

      const user = await register(payload);
      toast.success(`আর্নলেজারে স্বাগতম, ${user.name.split(" ")[0]}!`);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message || "নিবন্ধন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <AuthSplitPanel />

      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-7">
            <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
              তোমার অ্যাকাউন্ট তৈরি করো
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              মিনিটের মধ্যেই টাস্ক সম্পন্ন করা ও আয় করা শুরু করো।
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">পুরো নাম</Label>
              <Input
                id="name"
                name="name"
                placeholder="জুনায়েদ ইসলাম"
                value={values.name}
                onChange={handleChange}
                aria-invalid={!!errors.name}
              />
              {errors.name && <p className="text-xs text-rust">{errors.name}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">ইমেইল ঠিকানা</Label>
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
              <Label htmlFor="phone">
                ফোন নম্বর <span className="text-muted-foreground">(ঐচ্ছিক)</span>
              </Label>
              <Input
                id="phone"
                name="phone"
                placeholder="+8801XXXXXXXXX"
                value={values.phone}
                onChange={handleChange}
                aria-invalid={!!errors.phone}
              />
              {errors.phone && <p className="text-xs text-rust">{errors.phone}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">পাসওয়ার্ড</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="কমপক্ষে ৮ অক্ষর"
                  value={values.password}
                  onChange={handleChange}
                  aria-invalid={!!errors.password}
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
              {errors.password && <p className="text-xs text-rust">{errors.password}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmPassword">পাসওয়ার্ড নিশ্চিত করুন</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="পাসওয়ার্ড আবার লিখুন"
                value={values.confirmPassword}
                onChange={handleChange}
                aria-invalid={!!errors.confirmPassword}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-rust">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="referralCode">
                রেফারেল কোড <span className="text-muted-foreground">(ঐচ্ছিক)</span>
              </Label>
              <Input
                id="referralCode"
                name="referralCode"
                placeholder="e.g. AB12CD34"
                value={values.referralCode}
                onChange={handleChange}
                className="uppercase"
              />
            </div>

            <Button type="submit" variant="brass" size="lg" disabled={isSubmitting} className="mt-2">
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              {isSubmitting ? "অ্যাকাউন্ট তৈরি হচ্ছে…" : "অ্যাকাউন্ট তৈরি করুন"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              লগ ইন করুন
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
