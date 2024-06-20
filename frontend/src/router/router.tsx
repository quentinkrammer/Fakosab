import { createBrowserRouter } from "react-router-dom";
import { PAGES } from "../constants";
import { ExportPage } from "./ExportPage";
import { HistoryPage } from "./HistoryPage";
import { HomePage } from "./HomePage";
import { UsersPage } from "./UsersPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    children: [
      { path: PAGES.history, element: <HistoryPage /> },
      { path: PAGES.users, element: <UsersPage /> },
      { path: PAGES.export, element: <ExportPage /> },
    ],
  },
]);
