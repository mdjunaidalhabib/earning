import { Link } from "react-router-dom";
import { Wallet, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brass/15">
        <Wallet className="h-8 w-8 text-brass-dark" strokeWidth={1.75} />
      </div>
      <h1 className="font-display text-4xl font-semibold text-foreground">404</h1>
      <p className="max-w-xs text-sm text-muted-foreground">
        এই পেজটা খুঁজে পাওয়া যায়নি। চলো, তোমাকে আবার সঠিক জায়গায় ফিরিয়ে নিয়ে যাই।
      </p>
      <Button asChild variant="brass" className="mt-2">
        <Link to="/">
          <Home className="h-4 w-4" /> Back to Home
        </Link>
      </Button>
    </div>
  );
}
