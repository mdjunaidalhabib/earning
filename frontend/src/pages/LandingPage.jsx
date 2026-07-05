import { Link } from "react-router-dom";
import { ArrowRight, ListChecks, Users, Wallet, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: ListChecks,
    title: "সহজ টাস্ক সম্পন্ন করো",
    description: "সার্ভে, বিজ্ঞাপন দেখা, অ্যাপ ইনস্টল, এবং অফার — তোমার সময় অনুযায়ী টাস্ক থেকে আয় করো।",
  },
  {
    icon: Users,
    title: "রেফারেল থেকে আয় করো",
    description: "তোমার নিজস্ব লিংক দিয়ে বন্ধুদের আমন্ত্রণ জানাও এবং প্রতিটি সাইনআপে বোনাস পাও।",
  },
  {
    icon: Wallet,
    title: "যেকোনো সময় উত্তোলন করো",
    description: "সর্বনিম্ন পরিমাণে পৌঁছালে বিকাশ, নগদ, রকেট, অথবা ব্যাংক ট্রান্সফারের মাধ্যমে টাকা তুলে নাও।",
  },
  {
    icon: ShieldCheck,
    title: "স্বচ্ছ লেজার",
    description: "প্রতিটি এন্ট্রি — আয়, অপেক্ষমাণ, বা উত্তোলিত — লগ করা থাকে এবং সহজে ট্র্যাক করা যায়।",
  },
];

export default function LandingPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-ink text-paper">
        <div className="bg-ledger-dots bg-ledger-dots absolute inset-0 opacity-30" aria-hidden="true" />
        <div className="container relative z-10 flex flex-col items-center py-24 text-center sm:py-32">
          <span className="eyebrow mb-4 text-brass">টাস্ক-ভিত্তিক আয়ের প্ল্যাটফর্ম</span>
          <h1 className="font-display max-w-2xl text-4xl font-medium leading-tight sm:text-5xl">
            অর্জিত প্রতিটি টাকা,
            <br />
            পাসবইয়ের মতো হিসাব রাখা হয়।
          </h1>
          <p className="mt-5 max-w-lg text-paper/70">
            সহজ টাস্ক সম্পন্ন করো, বন্ধুদের আমন্ত্রণ জানাও, এবং তোমার আয়ের প্রতিটি এন্ট্রি একটি স্বচ্ছ
            লেজারে ট্র্যাক করো।
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="brass" size="lg">
              <Link to="/register">
                বিনামূল্যে শুরু করুন <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-paper/30 text-paper hover:bg-paper/10">
              <Link to="/how-it-works">কিভাবে কাজ করে</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container py-20">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-3xl font-semibold text-foreground">
            আসল, ট্র্যাক করার মতো আয়ের জন্য তৈরি
          </h2>
          <p className="mt-3 text-muted-foreground">
            কোনো ছলচাতুরি নেই — শুধু টাস্ক, রেফারেল, আর বিশ্বাসযোগ্য একটি লেজার।
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
            তোমার ফ্রি অ্যাকাউন্ট তৈরি করো এবং মিনিটেই প্রথম টাস্ক সম্পন্ন করো।
          </p>
          <Button asChild variant="brass" size="lg" className="mt-2">
            <Link to="/register">
              ফ্রি অ্যাকাউন্ট তৈরি করুন <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
