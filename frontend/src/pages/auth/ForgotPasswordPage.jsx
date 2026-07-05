import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

import axiosInstance from "@/api/axiosInstance";
import { AuthSplitPanel } from "@/components/layout/AuthSplitPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email.trim()) {
      setError("ইমেইল আবশ্যক");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("একটি সঠিক ইমেইল ঠিকানা দিন");
      return;
    }
    setError("");

    setIsSubmitting(true);
    try {
      const { data } = await axiosInstance.post("/auth/forgot-password", { email });
      setIsSubmitted(true);
      // In non-production, the backend also returns the reset link directly
      // so you can test the flow without a real email provider wired up yet.
      if (data?.data?.resetUrl) {
        setDevResetUrl(data.data.resetUrl);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <AuthSplitPanel />

      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <Link
            to="/login"
            className="mb-6 flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> লগ ইনে ফিরে যান
          </Link>

          {isSubmitted ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-moss/15">
                <CheckCircle2 className="h-7 w-7 text-moss" />
              </div>
              <h1 className="font-display text-xl font-semibold text-foreground">
                তোমার ইমেইল চেক করো
              </h1>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">{email}</span> এর জন্য যদি কোনো অ্যাকাউন্ট থেকে থাকে,
                তাহলে পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে।
              </p>

              {devResetUrl && (
                <div className="mt-4 w-full rounded-lg border border-brass/40 bg-brass/10 p-3.5 text-left">
                  <p className="eyebrow mb-1.5 text-brass-dark">
                    ডেভ মোড — এখনো কোনো ইমেইল প্রোভাইডার সেট করা হয়নি
                  </p>
                  <a
                    href={devResetUrl}
                    className="break-all text-xs font-medium text-primary hover:underline"
                  >
                    {devResetUrl}
                  </a>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
                  পাসওয়ার্ড ভুলে গেছেন?
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  তোমার ইমেইল দাও, আমরা রিসেট করার লিংক পাঠিয়ে দেব।
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email">ইমেইল ঠিকানা</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    aria-invalid={!!error}
                  />
                  {error && <p className="text-xs text-rust">{error}</p>}
                </div>

                <Button type="submit" variant="brass" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                  {isSubmitting ? "পাঠানো হচ্ছে…" : "রিসেট লিংক পাঠান"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
