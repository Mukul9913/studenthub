import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";

import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";

export function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <SiteLayout>
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4 py-12">
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 mb-4 text-destructive">
          <ShieldAlert className="h-12 w-12" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-destructive">
          403 Access Denied
        </span>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Forbidden Area
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          You are authenticated, but your account role does not have the required permissions to
          access this page or resource.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Go Back
          </Button>
          <Button asChild size="sm" className="gap-1.5">
            <Link to="/">
              <Home className="h-4 w-4" /> Return to Home
            </Link>
          </Button>
        </div>
      </div>
    </SiteLayout>
  );
}
