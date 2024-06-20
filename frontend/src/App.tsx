import { Outlet } from "react-router-dom";

function App() {
  return (
    <div>
      <div>Top</div>
      <div>
        <Outlet />
      </div>
      <div>Bot</div>
    </div>
  );
}

export default App;
