import type { MessWeekDay } from "@studenthub/types";

export const PROVIDER_TYPE_LABELS: Record<string, string> = {
  mess: "Mess",
  tiffin: "Tiffin Service",
  home_kitchen: "Home Kitchen",
  cloud_kitchen: "Cloud Kitchen",
  catering: "Catering",
};

export const FOOD_PREFERENCE_LABELS: Record<string, string> = {
  vegetarian: "Pure Veg",
  non_vegetarian: "Non-Veg",
  jain: "Jain",
  eggetarian: "Eggetarian",
};

export const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
};

export const MEAL_PLAN_DURATION_LABELS: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  "15_day": "15 Days",
  monthly: "Monthly",
  custom: "Custom",
};

export const WEEK_DAYS: MessWeekDay[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Maps `Date.getDay()` (Sun = 0) onto the short weekday keys used by the menu. */
export function getTodayWeekDay(): MessWeekDay {
  const jsDayToWeekDay: MessWeekDay[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return jsDayToWeekDay[new Date().getDay()] ?? "Mon";
}
