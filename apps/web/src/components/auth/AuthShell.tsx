import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden bg-primary text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary-foreground text-primary">
            <MapPin className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold">StudentHub</span>
        </Link>
        <div>
          <h2 className="text-3xl font-bold leading-tight">Your home base for life in Indore.</h2>
          <p className="mt-3 max-w-md text-primary-foreground/80">
            Save listings, message owners and manage your relocation — all in one place.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/70">
          © {new Date().getFullYear()} StudentHub
        </p>
      </div>
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <Link to="/" className="mb-8 flex items-center gap-2 lg:hidden">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
            <MapPin className="h-4 w-4" />
          </span>
          <span className="font-bold">StudentHub</span>
        </Link>
        <div className="mx-auto w-full max-w-sm">
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
