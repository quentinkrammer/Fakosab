import { css } from "goober";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { Sidebar } from "primereact/sidebar";
import { classNames } from "primereact/utils";
import { memo, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { PAGES, Pages } from "../constants";
import { useActiveRoute } from "../hooks/useActiveRoute";
import { useQueryMyUserData } from "../hooks/useQueryMyUserData";

type LinkConfig = {
  route: Pages;
  label: string;
  icon: string;
};

const USER_LINKS: LinkConfig[] = [
  { label: "Home", icon: "pi pi-home", route: PAGES.home },
  { label: "History", icon: "pi pi-clock", route: PAGES.history },
];

const ADMIN_LINKS: LinkConfig[] = [
  {
    label: "Users",
    icon: "pi pi-users",
    route: PAGES.users,
  },
  {
    label: "Projects",
    icon: "pi pi-clipboard",
    route: PAGES.projects,
  },
  {
    label: "Excel Export",
    icon: "pi pi-file-excel",
    route: PAGES.export,
  },
];

export const NavBar = memo(function NavBar() {
  const [visible, setVisible] = useState(false);
  const activeRoute = useActiveRoute();
  const userData = useQueryMyUserData();
  const username = userData.data?.username;
  const isAdmin = userData.data?.isAdmin;

  const onLink = useCallback(() => setVisible(false), []);

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
        {USER_LINKS.map((props) => (
          <NavBarLink {...props} activeRoute={activeRoute} onClick={onLink} />
        ))}
        {isAdmin && (
          <>
            <Divider>{"Admin"}</Divider>
            {ADMIN_LINKS.map((props) => (
              <NavBarLink
                {...props}
                activeRoute={activeRoute}
                onClick={onLink}
              />
            ))}
          </>
        )}
      </Sidebar>
    </>
  );
});

type NavBarLinkProps = LinkConfig & {
  activeRoute: ReturnType<typeof useActiveRoute>;
  onClick?: () => void;
};
const NavBarLink = memo(function NavBarLink({
  icon,
  label,
  route,
  activeRoute,
  onClick,
}: NavBarLinkProps) {
  return (
    <Link
      to={PAGES[route]}
      style={{
        textDecoration: "none",
      }}
      key={route}
    >
      <span
        onClick={onClick}
        className={classNames(styles.link, {
          [styles.activeLink]: activeRoute === route,
        })}
      >
        <i className={icon} style={{ fontSize: "1.5rem" }}></i>
        <h4 style={{ padding: "0" }}>{label}</h4>
      </span>
    </Link>
  );
});

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
