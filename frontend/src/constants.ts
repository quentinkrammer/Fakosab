export const PAGES = {
  home: "home",
  history: "history",
  users: "users",
  export: "export",
} as const;
export type Pages = (typeof PAGES)[keyof typeof PAGES];
