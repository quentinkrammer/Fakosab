export const PAGES = {
  home: "home",
  history: "history",
  users: "users",
  export: "export",
  projects: "projects",
} as const;
export type Pages = (typeof PAGES)[keyof typeof PAGES];

export const STRING_NOT_FOUND = "NOT_FOUND";
