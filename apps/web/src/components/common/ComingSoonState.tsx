import { Construction } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/layout/SiteLayout";

type ComingSoonStateProps = {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
};

export function ComingSoonState({
  title,
  description = "This section is under construction and will be available soon.",
  backHref = "/",
  backLabel = "Back to home",
}: ComingSoonStateProps) {
  return (
    <SiteLayout>
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center md:px-6">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Construction className="h-7 w-7" aria-hidden />
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <Button asChild className="mt-6" variant="outline">
          <Link to={backHref}>{backLabel}</Link>
        </Button>
      </div>
    </SiteLayout>
  );
}
