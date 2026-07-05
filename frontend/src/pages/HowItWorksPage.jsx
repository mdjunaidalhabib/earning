import { Link } from "react-router-dom";
import { UserPlus, ListChecks, ClipboardCheck, Wallet, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: UserPlus,
    title: "1. Create an Account",
    description:
      "Sign up in under a minute. Have a referral code? Add it during sign-up to link your account.",
  },
  {
    icon: ListChecks,
    title: "2. Complete Tasks",
    description:
      "Browse available surveys, ad views, app installs, and offers. Every task shows its reward amount upfront.",
  },
  {
    icon: ClipboardCheck,
    title: "3. Submit & Get Reviewed",
    description:
      "Submit proof of completion if required. Our team reviews the submission and adds the approved reward to your balance.",
  },
  {
    icon: Wallet,
    title: "4. Withdraw Your Earnings",
    description:
      "Once you reach the minimum withdrawable amount, request a payout via bKash, Nagad, Rocket, or bank transfer.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="container py-16 sm:py-24">
      <div className="mx-auto max-w-xl text-center">
        <span className="eyebrow text-primary">How It Works</span>
        <h1 className="font-display mt-3 text-3xl font-semibold text-foreground sm:text-4xl">
          আয় শুরু করার চারটি সহজ ধাপ
        </h1>
        <p className="mt-3 text-muted-foreground">
          EarnLedger সবকিছু Transparent রাখে — তুমি যে Task Complete করো তা থেকে শুরু করে তোমার Balance-এর
          Taka পর্যন্ত।
        </p>
      </div>

      <div className="mx-auto mt-14 flex max-w-2xl flex-col gap-6">
        {steps.map((step) => (
          <div key={step.title} className="ledger-card flex items-start gap-4 p-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brass/15">
              <step.icon className="h-5 w-5 text-brass-dark" strokeWidth={2} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-14 flex justify-center">
        <Button asChild variant="brass" size="lg">
          <Link to="/register">
            Free Get Started <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
