export const appConfig = {
  name: "StudentHub",
  launchCity: "Indore",
  apiUrl: import.meta.env.VITE_API_URL ?? "/api",
} as const;
