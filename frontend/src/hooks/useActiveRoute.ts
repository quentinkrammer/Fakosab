import { useLocation } from "react-router-dom";
import { PAGES, Pages } from "../constants";
import { assertUnreachable } from "../utils/assertUnreachable";

export function useActiveRoute() {
  const { pathname } = useLocation();
  const domain = pathname.split("/")[1] as Pages | undefined;
  if (!domain) return;
  switch (domain) {
    case PAGES.home:
      return PAGES.home;
    case PAGES.history:
      return PAGES.history;
    case PAGES.users:
      return PAGES.users;
    case PAGES.export:
      return PAGES.export;
    case PAGES.projects:
      return PAGES.projects;
    default:
      assertUnreachable(domain);
  }
}
