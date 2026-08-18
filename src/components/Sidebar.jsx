import {
  FiBarChart2,
  FiGrid,
  FiLogOut,
  FiMenu,
  FiShoppingBag,
  FiX,
} from "react-icons/fi";
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const closeMobileSidebar = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}

      <button
        className="mobile-menu-button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <FiMenu />
      </button>

      {/* Mobile overlay */}

      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeMobileSidebar}
        />
      )}

      <aside
        className={`sidebar ${
          mobileOpen ? "sidebar-mobile-open" : ""
        }`}
      >

        {/* BRAND */}

        <div className="sidebar-brand">

          <div className="brand-mark">
            <FiShoppingBag />
          </div>

          <div className="brand-text">
            <strong>
              POS Tracker
            </strong>

            <span>
              Sales Management
            </span>
          </div>

          <button
            className="mobile-close-sidebar"
            onClick={closeMobileSidebar}
            aria-label="Close navigation"
          >
            <FiX />
          </button>

        </div>


        {/* NAVIGATION */}

        <nav className="sidebar-nav">

          <p className="sidebar-label">
            MAIN MENU
          </p>

          <NavLink
            to="/dashboard"
            onClick={closeMobileSidebar}
            className={({ isActive }) =>
              `sidebar-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <FiGrid />

            <span>
              Dashboard
            </span>
          </NavLink>


          <NavLink
            to="/transactions"
            onClick={closeMobileSidebar}
            className={({ isActive }) =>
              `sidebar-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <FiBarChart2 />

            <span>
              Transactions
            </span>
          </NavLink>

        </nav>


        {/* USER */}

        <div className="sidebar-bottom">

          <div className="sidebar-user">

            <div className="user-avatar">
              {user?.name
                ?.charAt(0)
                ?.toUpperCase() || "U"}
            </div>

            <div className="user-info">

              <strong>
                {user?.name || "User"}
              </strong>

              <span>
                {user?.email || ""}
              </span>

            </div>

          </div>


          <button
            className="logout-button"
            onClick={handleLogout}
          >
            <FiLogOut />

            <span>
              Sign out
            </span>
          </button>

        </div>

      </aside>
    </>
  );
};

export default Sidebar;