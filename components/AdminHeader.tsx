"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type StaffRole = "owner" | "admin" | "editor";
type AdminTheme = "soft" | "dark";

type NavItem = {
  href: string;
  label: string;
  description: string;
  restricted?: boolean;
};

const navItems: NavItem[] = [
  {
    href: "/admin",
    label: "Dashboard",
    description: "Collection overview",
  },
  {
    href: "/admin/products",
    label: "Products",
    description: "Catalog & inventory",
  },
  {
    href: "/admin/categories",
    label: "Categories",
    description: "Store organization",
    restricted: true,
  },
  {
    href: "/admin/homepage",
    label: "Homepage",
    description: "Visual merchandising",
    restricted: true,
  },
];

function routeIsActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminHeader({
  role,
}: {
  role: StaffRole;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<AdminTheme>("soft");

  const visibleItems = navItems.filter(
    (item) => !item.restricted || role !== "editor",
  );

  useEffect(() => {
    const savedTheme =
      window.localStorage.getItem("rosy-admin-theme");

    const initialTheme: AdminTheme =
      savedTheme === "dark" ? "dark" : "soft";

    document.documentElement.dataset.adminTheme =
      initialTheme;

    const frame = window.requestAnimationFrame(() => {
      setTheme(initialTheme);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  function toggleTheme() {
    const nextTheme: AdminTheme =
      theme === "dark" ? "soft" : "dark";

    setTheme(nextTheme);

    document.documentElement.dataset.adminTheme =
      nextTheme;

    window.localStorage.setItem(
      "rosy-admin-theme",
      nextTheme,
    );
  }

  return (
    <>
      <aside
        className="admin-sidebar"
        aria-label="Admin navigation"
      >
        <div>
          <Link href="/admin" className="admin-brand">
            <span className="admin-brand-mark">ROSY</span>
            <span className="admin-brand-subtitle">
              Boutique Admin
            </span>
          </Link>

          <div className="admin-role-card">
            <span className="admin-role-dot" aria-hidden="true" />

            <div>
              <p className="admin-role-label">{role}</p>
              <p className="admin-role-copy">
                Workspace active
              </p>
            </div>
          </div>

          <nav className="admin-sidebar-nav">
            {visibleItems.map((item) => {
              const active = routeIsActive(
                pathname,
                item.href,
              );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`admin-nav-link ${
                    active ? "is-active" : ""
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <span
                    className="admin-nav-indicator"
                    aria-hidden="true"
                  />

                  <span>
                    <span className="admin-nav-title">
                      {item.label}
                    </span>

                    <span className="admin-nav-description">
                      {item.description}
                    </span>
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="admin-sidebar-footer">
          <button
            type="button"
            className="admin-theme-toggle"
            onClick={toggleTheme}
            aria-label={
              theme === "dark"
                ? "Switch to soft light mode"
                : "Switch to dark mode"
            }
          >
            <span
              className={`admin-theme-icon ${
                theme === "dark" ? "is-dark" : ""
              }`}
              aria-hidden="true"
            ><span className="admin-theme-icon-core" /></span>

            <span>
              <small>Appearance</small>
              <strong>
                {theme === "dark"
                  ? "Dark mode"
                  : "Soft light"}
              </strong>
            </span>
          </button>

          <Link href="/" className="admin-store-link">
            <span>View storefront</span>
            <span aria-hidden="true">Ã¢â€ â€”</span>
          </Link>
        </div>
      </aside>

      <header className="admin-mobile-header">
        <Link href="/admin" className="admin-mobile-brand">
          ROSY
        </Link>

        <div className="admin-mobile-header-actions">
          <button
            type="button"
            className="admin-mobile-theme-button"
            onClick={toggleTheme}
            aria-label={
              theme === "dark"
                ? "Switch to soft light mode"
                : "Switch to dark mode"
            }
          >
            <span
              className={`admin-theme-icon admin-theme-icon-mobile ${
                theme === "dark" ? "is-dark" : ""
              }`}
              aria-hidden="true"
            >
              <span className="admin-theme-icon-core" />
            </span>
          </button>

          <button
            type="button"
            className="admin-menu-button"
            onClick={() => setMenuOpen(true)}
            aria-expanded={menuOpen}
            aria-controls="admin-mobile-menu"
          >
            <span>Menu</span>

            <span
              className="admin-menu-lines"
              aria-hidden="true"
            >
              <span />
              <span />
            </span>
          </button>
        </div>
      </header>

      <button
        type="button"
        className={`admin-mobile-backdrop ${
          menuOpen ? "is-open" : ""
        }`}
        aria-label="Close admin menu"
        onClick={() => setMenuOpen(false)}
        tabIndex={menuOpen ? 0 : -1}
      />

      <div
        id="admin-mobile-menu"
        className={`admin-mobile-drawer ${
          menuOpen ? "is-open" : ""
        }`}
        aria-hidden={!menuOpen}
      >
        <div className="admin-mobile-drawer-head">
          <div>
            <p className="admin-eyebrow">
              Rosy Boutique
            </p>

            <p className="font-display text-3xl">
              Admin workspace
            </p>
          </div>

          <button
            type="button"
            className="admin-drawer-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            Ãƒâ€”
          </button>
        </div>

        <nav className="admin-mobile-nav">
          {visibleItems.map((item) => {
            const active = routeIsActive(
              pathname,
              item.href,
            );

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`admin-mobile-nav-link ${
                  active ? "is-active" : ""
                }`}
              >
                <span>{item.label}</span>
                <span aria-hidden="true">Ã¢â€ â€™</span>
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className="admin-mobile-theme-row"
          onClick={toggleTheme}
        >
          <span>Appearance</span>
          <strong>
            {theme === "dark"
              ? "Dark mode"
              : "Soft light"}
          </strong>
        </button>

        <div className="admin-mobile-drawer-footer">
          <p>{role} workspace</p>

          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
          >
            View storefront Ã¢â€ â€”
          </Link>
        </div>
      </div>
    </>
  );
}