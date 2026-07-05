import { Link } from "react-router-dom";
import { ArrowRight, ListChecks, Users, Wallet, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: ListChecks,
    title: "Complete Simple Tasks",
    description: "Surveys, ad views, app installs, and offers — earn from tasks on your own schedule.",
  },
  {
    icon: Users,
    title: "Earn from Referrals",
    description: "Invite friends with your own link and earn a bonus on every sign-up.",
  },
  {
    icon: Wallet,
    title: "Withdraw Anytime",
    description: "Once you hit the minimum amount, withdraw via bKash, Nagad, Rocket, or bank transfer.",
  },
  {
    icon: ShieldCheck,
    title: "Transparent Ledger",
    description: "Every entry — earned, pending, or withdrawn — is logged and easy to track.",
  },
];

export default function LandingPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-ink text-paper">
        <div className="bg-ledger-dots bg-ledger-dots absolute inset-0 opacity-30" aria-hidden="true" />
        <div className="container relative z-10 flex flex-col items-center py-24 text-center sm:py-32">
          <span className="eyebrow mb-4 text-brass">Task-Based Earning Platform</span>
          <h1 className="font-display max-w-2xl text-4xl font-medium leading-tight sm:text-5xl">
            তোমার আয় করা প্রতিটি টাকা,
            <br />
            পাসবইয়ের মতোই হিসাব করে রাখা হয়।
          </h1>
          <p className="mt-5 max-w-lg text-paper/70">
            সহজ কাজ করো, বন্ধুদের আমন্ত্রণ জানাও, আর তোমার আয়ের প্রতিটি হিসাব রাখো একটি স্বচ্ছ লেজারে।
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="brass" size="lg">
              <Link to="/register">
                Free Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-paper/30 text-paper hover:bg-paper/10">
              <Link to="/how-it-works">How It Works</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container py-20">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-3xl font-semibold text-foreground">
            সত্যিকারের আয়, যার হিসাব তুমি নিজেই রাখতে পারবে
          </h2>
          <p className="mt-3 text-muted-foreground">
            কোনো লুকোচুরি নেই — শুধু কাজ, রেফারেল, আর একটি বিশ্বাসযোগ্য হিসাবের খাতা।
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="ledger-card p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brass/15">
                <f.icon className="h-5 w-5 text-brass-dark" strokeWidth={2} />
              </div>
              <h3 className="mt-4 font-display text-base font-semibold text-foreground">
                {f.title}
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container pb-24">
        <div className="ledger-card flex flex-col items-center gap-4 bg-ink p-10 text-center text-paper sm:p-14">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">
            আয় শুরু করতে প্রস্তুত?
          </h2>
          <p className="max-w-md text-paper/70">
            একদম ফ্রি অ্যাকাউন্ট খোলো, আর মিনিটের মধ্যেই শেষ করো তোমার প্রথম কাজ।
          </p>
          <Button asChild variant="brass" size="lg" className="mt-2">
            <Link to="/register">
              Create Free Account <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
