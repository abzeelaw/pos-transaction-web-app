import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiShoppingBag,
  FiLogOut,
  FiX,
  FiMenu,
} from "react-icons/fi";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);

  const closeSidebar = () => {
    setOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="mobile-menu-button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
      >
        <FiMenu />
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`sidebar ${
          open ? "sidebar-open" : ""
        }`}
      >
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="brand-mark">
            P
          </div>

          <div className="brand-text">
            <strong>POS Tracker</strong>
            <span>Sales Management</span>
          </div>

          {/* Mobile close */}
          <button
            className="sidebar-close-button"
            onClick={closeSidebar}
            aria-label="Close navigation"
          >
            <FiX />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <p className="sidebar-section-title">
            MENU
          </p>

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `nav-item ${
                isActive ? "active" : ""
              }`
            }
            onClick={closeSidebar}
          >
            <FiHome />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/transactions"
            className={({ isActive }) =>
              `nav-item ${
                isActive ? "active" : ""
              }`
            }
            onClick={closeSidebar}
          >
            <FiShoppingBag />
            <span>Transactions</span>
          </NavLink>
        </nav>

        {/* Bottom */}
        <div className="sidebar-bottom">
          <button
            className="logout-button"
            onClick={logout}
          >
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;