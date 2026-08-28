import type { ReactNode } from "react";

import { BrandLogo } from "@/components/brand/BrandLogo";

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
        <BrandLogo tone="inverse" />
        <div>
          <h2 className="font-display text-3xl font-bold leading-tight">
            Your home base for life in Indore.
          </h2>
          <p className="mt-3 max-w-md text-primary-foreground/80">
            Save listings, message owners and manage your relocation — all in one place.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/70">
          © {new Date().getFullYear()} StudentHub
        </p>
      </div>
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mb-8 lg:hidden">
          <BrandLogo size="sm" />
        </div>
        <div className="mx-auto w-full max-w-sm">
          <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
