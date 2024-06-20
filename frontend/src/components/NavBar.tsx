import { css } from "goober";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { Sidebar } from "primereact/sidebar";
import { classNames } from "primereact/utils";
import { useState } from "react";
import { Link } from "react-router-dom";
import { PAGES, Pages } from "../constants";
import { useActiveRoute } from "../hooks/useActiveRoute";
import { useQueryMyUserData } from "../hooks/useQueryMyUserData";

const LINK_CONFIG: Array<{ route: Pages; label: string; icon: string }> = [
  { label: "Home", icon: "pi pi-home", route: PAGES.home },
  { label: "History", icon: "pi pi-clock", route: PAGES.history },
  { label: "Users", icon: "pi pi-users", route: PAGES.users },
  { label: "Excel Export", icon: "pi pi-file-excel", route: PAGES.export },
];

export function NavBar() {
  const [visible, setVisible] = useState(false);
  const activeRoute = useActiveRoute();
  const username = useQueryMyUserData().data?.username;

  return (
    <>
      <div style={{ display: "flex" }}>
        <Button
          icon="pi pi-bars"
          onClick={() => setVisible(true)}
          aria-haspopup
          rounded
        />
        <Avatar
          label={username?.charAt(0)}
          size="large"
          shape="circle"
          style={{ marginLeft: "auto" }}
        />
      </div>

      <Sidebar
        visible={visible}
        onHide={() => setVisible(false)}
        showCloseIcon={false}
      >
        {LINK_CONFIG.map(({ icon, label, route }) => (
          <Link
            to={PAGES[route]}
            style={{
              textDecoration: "none",
            }}
          >
            <span
              onClick={() => setVisible(false)}
              className={classNames(styles.link, {
                [styles.activeLink]: activeRoute === route,
              })}
            >
              <i className={icon} style={{ fontSize: "1.5rem" }}></i>
              <h4 style={{ padding: "0" }}>{label}</h4>
            </span>
          </Link>
        ))}
      </Sidebar>
    </>
  );
}

const styles = {
  link: css({
    display: "flex",
    gap: "0.5rem",
    alignItems: "baseline",
    paddingLeft: "1rem",
    borderRadius: "6px",
    "&:hover": { background: "rgba(255, 255, 255, 0.05)" },
  }),
  activeLink: css({
    background: "rgba(255, 255, 255, 0.05)",
    "&&:hover": { background: "rgba(255, 255, 255, 0.1)" },
  }),
};
