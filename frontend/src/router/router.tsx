import { createBrowserRouter } from "react-router-dom";
import App from "../components/App";
import { PAGES } from "../constants";
import { ExportPage } from "./ExportPage";
import { HistoryPage } from "./HistoryPage";
import { HomePage } from "./HomePage";
import { ProjectsPage } from "./ProjectsPage";
import { UsersPage } from "./UsersPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: PAGES.home, element: <HomePage /> },
      { path: PAGES.history, element: <HistoryPage /> },
      { path: PAGES.users, element: <UsersPage /> },
      { path: PAGES.projects, element: <ProjectsPage /> },
      { path: PAGES.export, element: <ExportPage /> },
    ],
  },
]);
