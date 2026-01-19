import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md border-slate-200 shadow-xl">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 text-destructive">
            <AlertCircle className="h-8 w-8" />
            <h1 className="text-2xl font-bold font-display text-slate-900">404 Page Not Found</h1>
          </div>
          <p className="mt-4 text-sm text-slate-600 leading-relaxed">
            The page you are looking for does not exist. It might have been moved or deleted.
          </p>
          <div className="mt-8">
            <Link href="/" className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white transition-colors bg-primary rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              Return Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
