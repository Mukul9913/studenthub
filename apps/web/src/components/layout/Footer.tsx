import { Link } from "react-router-dom";
import { Instagram, Twitter, Linkedin } from "lucide-react";

import { BrandLogo } from "@/components/brand/BrandLogo";
import { PUBLIC_NAV } from "@/config/navigation";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-elevated">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <BrandLogo />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Helping students and professionals find their place in Indore — trusted accommodation
              and essential services in one place.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Discover</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {PUBLIC_NAV.map((item) => (
                <li key={item.href}>
                  <Link to={item.href} className="hover:text-foreground">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/register?role=owner" className="hover:text-foreground">
                  List your property
                </Link>
              </li>
              <li>
                <a href="mailto:hello@studenthub.in" className="hover:text-foreground">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Legal</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <span className="cursor-default text-muted-foreground/70" title="Coming soon">
                  Privacy (soon)
                </span>
              </li>
              <li>
                <span className="cursor-default text-muted-foreground/70" title="Coming soon">
                  Terms (soon)
                </span>
              </li>
            </ul>
            <div className="mt-4 flex items-center gap-3 text-muted-foreground">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} StudentHub. Made for Indore.</p>
          <p>Verified listings · Transparent info · Local expertise</p>
        </div>
      </div>
    </footer>
  );
}
