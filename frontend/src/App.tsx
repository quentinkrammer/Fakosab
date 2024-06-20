import { useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { PAGES } from "./constants";

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(PAGES.home);
  }, [navigate]);

  return (
    <div>
      <div>
        <Link to={PAGES.users}>user link</Link>
      </div>
      <div>
        <Outlet />
      </div>
      <div>Bot</div>
    </div>
  );
}

export default App;
