import { Link } from "react-router-dom";
import { MapPin, Instagram, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-elevated">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
                <MapPin className="h-5 w-5" />
              </span>
              <span className="text-lg font-bold">
                Student<span className="text-primary">Hub</span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Helping students and professionals find their place in Indore — trusted accommodation
              and essential services in one place.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Discover</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/accommodations" className="hover:text-foreground">
                  Accommodations
                </Link>
              </li>
              <li>
                <Link to="/libraries" className="hover:text-foreground">
                  Libraries
                </Link>
              </li>
              <li>
                <Link to="/mess" className="hover:text-foreground">
                  Mess
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-foreground">
                  Services
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-foreground">
                  About
                </Link>
              </li>
              <li>
                <Link to="/owner" className="hover:text-foreground">
                  List your property
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-foreground">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-foreground">
                  Careers
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Legal</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-foreground">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-foreground">
                  Terms
                </Link>
              </li>
            </ul>
            <div className="mt-4 flex items-center gap-3 text-muted-foreground">
              <a href="#" className="hover:text-foreground" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-foreground" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-foreground" aria-label="LinkedIn">
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
