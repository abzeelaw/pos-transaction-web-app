import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiHome,
  FiShoppingBag,
  FiPlus,
  FiLogOut,
  FiTrendingUp,
  FiCreditCard,
  FiActivity,
  FiArrowUpRight,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Dashboard = () => {
  const { user, logout } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await api.get("/transactions");

        setTransactions(response.data.transactions || []);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const today = new Date();

  const todaysTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.createdAt);

    return (
      transactionDate.getDate() === today.getDate() &&
      transactionDate.getMonth() === today.getMonth() &&
      transactionDate.getFullYear() === today.getFullYear()
    );
  });

  const todaysSales = todaysTransactions.reduce(
    (total, transaction) =>
      total + Number(transaction.totalAmount || 0),
    0
  );

  const totalRevenue = transactions.reduce(
    (total, transaction) =>
      total + Number(transaction.totalAmount || 0),
    0
  );

  const recentTransactions = [...transactions]
    .sort(
      (a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    )
    .slice(0, 5);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="dashboard-layout">

      {/* Sidebar */}

      <aside className="sidebar">

        <div className="sidebar-brand">
          <div className="brand-mark">P</div>
          <span>POS Tracker</span>
        </div>

        <nav className="sidebar-nav">

          <Link
            to="/dashboard"
            className="nav-item active"
          >
            <FiHome />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/transactions"
            className="nav-item"
          >
            <FiShoppingBag />
            <span>Transactions</span>
          </Link>

        </nav>

        <button
          className="logout-button"
          onClick={logout}
        >
          <FiLogOut />
          <span>Logout</span>
        </button>

      </aside>


      {/* Main */}

      <main className="dashboard-main">

        <header className="dashboard-header">

          <div>
            <p className="header-greeting">
              Welcome back
            </p>

            <h1>
              {user?.name || "POS Agent"}
            </h1>
          </div>

          <Link
            to="/transactions"
            className="primary-button"
          >
            <FiPlus />
            New Transaction
          </Link>

        </header>


        {/* Statistics */}

        <section className="stats-grid">

          <div className="stat-card">

            <div className="stat-icon">
              <FiTrendingUp />
            </div>

            <div>
              <p>Today's Sales</p>

              <h2>
                {loading
                  ? "..."
                  : formatCurrency(todaysSales)}
              </h2>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              <FiActivity />
            </div>

            <div>
              <p>Transactions</p>

              <h2>
                {loading
                  ? "..."
                  : transactions.length}
              </h2>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              <FiCreditCard />
            </div>

            <div>
              <p>Total Revenue</p>

              <h2>
                {loading
                  ? "..."
                  : formatCurrency(totalRevenue)}
              </h2>
            </div>

          </div>

        </section>


        {/* Recent Transactions */}

        <section className="dashboard-section">

          <div className="section-heading">

            <div>
              <h2>Recent Transactions</h2>

              <p>
                Your latest recorded sales
              </p>
            </div>

            <Link to="/transactions">
              View all
              <FiArrowUpRight />
            </Link>

          </div>


          {loading ? (

            <div className="empty-state">
              <p>Loading transactions...</p>
            </div>

          ) : recentTransactions.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                <FiShoppingBag />
              </div>

              <h3>No transactions yet</h3>

              <p>
                Start recording your first sale.
              </p>

              <Link
                to="/transactions"
                className="primary-button"
              >
                <FiPlus />
                Record Sale
              </Link>

            </div>

          ) : (

            <div className="recent-table-wrapper">

              <table className="transaction-table">

                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>

                  {recentTransactions.map(
                    (transaction) => (

                      <tr key={transaction._id}>

                        <td>
                          <strong>
                            {transaction.productName}
                          </strong>
                        </td>

                        <td>
                          {transaction.quantity}
                        </td>

                        <td>
                          {formatCurrency(
                            transaction.totalAmount
                          )}
                        </td>

                        <td>
                          <span className="payment-badge">
                            {transaction.paymentMethod}
                          </span>
                        </td>

                        <td>
                          {formatDate(
                            transaction.createdAt
                          )}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

    </div>
  );
};

export default Dashboard;