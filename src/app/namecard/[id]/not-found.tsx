import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 flex items-center justify-center py-12 px-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">404</h1>
        <h2 className="text-2xl font-semibold">Name Card Not Found</h2>
        <p className="text-muted-foreground max-w-sm mx-auto">
          The name card you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Button asChild className="mt-8">
          <Link href="/">
            Return Home
          </Link>
        </Button>
      </div>
    </main>
  );
}
