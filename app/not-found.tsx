import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-sm font-medium text-accent">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Sorry, the page you are looking for does not exist.
      </p>
      <div className="mt-6">
        <Button asChild variant="accent">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
