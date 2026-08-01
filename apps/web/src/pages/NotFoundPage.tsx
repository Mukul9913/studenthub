import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-3 text-muted-foreground">The page you requested does not exist.</p>
      <Link to="/" className="mt-6 text-sm font-medium underline underline-offset-4">
        Back to home
      </Link>
    </main>
  );
}
