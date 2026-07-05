import { Link } from "react-router-dom";
import { UserPlus, ListChecks, ClipboardCheck, Wallet, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: UserPlus,
    title: "১. অ্যাকাউন্ট তৈরি করো",
    description:
      "এক মিনিটের কম সময়ে সাইনআপ করো। রেফারেল কোড আছে? সাইনআপের সময় সেটি দিয়ে অ্যাকাউন্ট লিংক করো।",
  },
  {
    icon: ListChecks,
    title: "২. টাস্ক সম্পন্ন করো",
    description:
      "উপলব্ধ সার্ভে, বিজ্ঞাপন দেখা, অ্যাপ ইনস্টল, ও অফার দেখো। প্রতিটি টাস্কে আগে থেকেই পুরস্কারের পরিমাণ দেখানো থাকে।",
  },
  {
    icon: ClipboardCheck,
    title: "৩. সাবমিট করো ও পর্যালোচনা পাও",
    description:
      "প্রয়োজন হলে সম্পন্ন করার প্রমাণ জমা দাও। আমাদের টিম সাবমিশন পর্যালোচনা করে অনুমোদিত পুরস্কার তোমার ব্যালেন্সে যোগ করে দেয়।",
  },
  {
    icon: Wallet,
    title: "৪. তোমার আয় উত্তোলন করো",
    description:
      "সর্বনিম্ন উত্তোলনযোগ্য পরিমাণে পৌঁছালে বিকাশ, নগদ, রকেট, অথবা ব্যাংক ট্রান্সফারের মাধ্যমে টাকা তোলার জন্য অনুরোধ করো।",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="container py-16 sm:py-24">
      <div className="mx-auto max-w-xl text-center">
        <span className="eyebrow text-primary">কিভাবে কাজ করে</span>
        <h1 className="font-display mt-3 text-3xl font-semibold text-foreground sm:text-4xl">
          আয় শুরু করার চারটি সহজ ধাপ
        </h1>
        <p className="mt-3 text-muted-foreground">
          আর্নলেজার সবকিছু স্বচ্ছ রাখে — তুমি যে টাস্ক সম্পন্ন করো তা থেকে শুরু করে তোমার ব্যালেন্সের
          টাকা পর্যন্ত।
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
            বিনামূল্যে শুরু করুন <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
