import type { MessMenuItem } from "@studenthub/types";

/** Splits a comma/newline separated image URL field into a clean list of https links. */
export function parseImageUrls(raw: string): string[] {
  return raw
    .split(/[\n,]/)
    .map((url) => url.trim())
    .filter((url) => /^https?:\/\//i.test(url));
}

/** Renders menu items as the comma separated text used by the Phase 1 menu editor. */
export function menuItemsToText(items?: MessMenuItem[]): string {
  return (items || []).map((item) => item.name).join(", ");
}

/** Parses comma separated dish names back into menu items. */
export function textToMenuItems(raw: string): MessMenuItem[] {
  return raw
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name) => ({ name }));
}
