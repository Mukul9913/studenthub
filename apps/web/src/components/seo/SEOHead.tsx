import { useEffect } from "react";

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  jsonLd?: Record<string, unknown>;
}

export function SEOHead({
  title = "StudentHub | Find Best PGs, Hostels & Libraries in Indore",
  description = "Indore's #1 Marketplace for Students & Professionals. Discover verified PGs, Hostels, Flats, and 24x7 AC Libraries near Holkar College, Vijay Nagar, and Bhawarkua.",
  image = "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80",
  url = typeof window !== "undefined" ? window.location.href : "https://studenthub.in",
  type = "website",
  jsonLd,
}: SEOHeadProps) {
  useEffect(() => {
    // 1. Dynamic Title
    document.title = title.includes("StudentHub") ? title : `${title} | StudentHub`;

    // 2. Helper to set or update meta tag
    const setMeta = (nameAttr: string, value: string, content: string) => {
      let element = document.querySelector(`meta[${nameAttr}="${value}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(nameAttr, value);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    setMeta("name", "description", description);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:image", image);
    setMeta("property", "og:url", url);
    setMeta("property", "og:type", type);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", image);

    // 3. Inject Structured Data JSON-LD
    let scriptTag = document.getElementById("studenthub-jsonld") as HTMLScriptElement;
    if (jsonLd) {
      if (!scriptTag) {
        scriptTag = document.createElement("script");
        scriptTag.id = "studenthub-jsonld";
        scriptTag.type = "application/ld+json";
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(jsonLd);
    } else if (scriptTag) {
      scriptTag.remove();
    }
  }, [title, description, image, url, type, jsonLd]);

  return null;
}
