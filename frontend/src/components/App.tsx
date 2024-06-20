import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { PAGES } from "../constants";
import { NavBar } from "./NavBar";

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(PAGES.home);
  }, [navigate]);

  return (
    <div
      style={{
        height: "100dvh",
        display: "grid",
        gridTemplateRows: "auto 1fr",
        gridAutoFlow: "row",
      }}
    >
      <div>
        <NavBar />
      </div>
      <div
        style={{
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          paddingTop: "1rem",
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}

export default App;
