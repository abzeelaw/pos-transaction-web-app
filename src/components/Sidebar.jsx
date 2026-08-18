import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiShoppingBag,
  FiLogOut,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { logout } = useAuth();

  return (
    <aside className="sidebar">

      {/* Brand */}

      <div className="sidebar-brand">

        <div className="brand-mark">
          P
        </div>

        <span>
          POS Tracker
        </span>

      </div>


      {/* Navigation */}

      <nav className="sidebar-nav">

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `nav-item ${
              isActive ? "active" : ""
            }`
          }
        >
          <FiHome />

          <span>
            Dashboard
          </span>
        </NavLink>


        <NavLink
          to="/transactions"
          className={({ isActive }) =>
            `nav-item ${
              isActive ? "active" : ""
            }`
          }
        >
          <FiShoppingBag />

          <span>
            Transactions
          </span>
        </NavLink>

      </nav>


      {/* Logout */}

      <button
        className="logout-button"
        onClick={logout}
      >
        <FiLogOut />

        <span>
          Logout
        </span>
      </button>

    </aside>
  );
};

export default Sidebar;