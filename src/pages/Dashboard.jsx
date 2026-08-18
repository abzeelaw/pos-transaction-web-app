import { useEffect, useMemo, useState } from "react";
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
  FiRefreshCw,
  FiDollarSign,
  FiSmartphone,
  FiSend,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Dashboard = () => {
  const { user, logout } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      setLoading(true);

      const response = await api.get("/transactions");

      setTransactions(
        response.data.transactions || []
      );
    } catch (error) {
      console.error(
        "Failed to fetch transactions:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // ==========================================
  // DATE HELPERS
  // ==========================================

  const isToday = (date) => {
    const transactionDate = new Date(date);
    const today = new Date();

    return (
      transactionDate.getDate() === today.getDate() &&
      transactionDate.getMonth() === today.getMonth() &&
      transactionDate.getFullYear() === today.getFullYear()
    );
  };

  // ==========================================
  // ANALYTICS
  // ==========================================

  const analytics = useMemo(() => {
    const todayTransactions =
      transactions.filter((transaction) =>
        isToday(transaction.createdAt)
      );

    const todaysSales =
      todayTransactions.reduce(
        (total, transaction) =>
          total +
          Number(transaction.totalAmount || 0),
        0
      );

    const totalRevenue =
      transactions.reduce(
        (total, transaction) =>
          total +
          Number(transaction.totalAmount || 0),
        0
      );

    const cashSales =
      transactions
        .filter(
          (transaction) =>
            transaction.paymentMethod === "cash"
        )
        .reduce(
          (total, transaction) =>
            total +
            Number(transaction.totalAmount || 0),
          0
        );

    const transferSales =
      transactions
        .filter(
          (transaction) =>
            transaction.paymentMethod === "transfer"
        )
        .reduce(
          (total, transaction) =>
            total +
            Number(transaction.totalAmount || 0),
          0
        );

    const posSales =
      transactions
        .filter(
          (transaction) =>
            transaction.paymentMethod === "pos"
        )
        .reduce(
          (total, transaction) =>
            total +
            Number(transaction.totalAmount || 0),
          0
        );

    return {
      todayTransactions,
      todaysSales,
      totalRevenue,
      cashSales,
      transferSales,
      posSales,
    };
  }, [transactions]);

  // ==========================================
  // RECENT TRANSACTIONS
  // ==========================================

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      )
      .slice(0, 5);
  }, [transactions]);

  // ==========================================
  // FORMATTERS
  // ==========================================

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-NG",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ==========================================
  // PAYMENT LABEL
  // ==========================================

  const getPaymentLabel = (method) => {
    if (method === "cash") return "Cash";
    if (method === "transfer") return "Transfer";
    if (method === "pos") return "POS";

    return method;
  };

  return (
    <div className="dashboard-layout">

      {/* ======================================
          SIDEBAR
      ====================================== */}

      <aside className="sidebar">

        <div className="sidebar-brand">

          <div className="brand-mark">
            P
          </div>

          <span>
            POS Tracker
          </span>

        </div>

        <nav className="sidebar-nav">

          <Link
            to="/dashboard"
            className="nav-item active"
          >
            <FiHome />
            <span>
              Dashboard
            </span>
          </Link>

          <Link
            to="/transactions"
            className="nav-item"
          >
            <FiShoppingBag />
            <span>
              Transactions
            </span>
          </Link>

        </nav>

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


      {/* ======================================
          MAIN CONTENT
      ====================================== */}

      <main className="dashboard-main">

        {/* HEADER */}

        <header className="dashboard-header">

          <div>

            <p className="header-greeting">
              Welcome back
            </p>

            <h1>
              {user?.name || "POS Agent"}
            </h1>

          </div>

          <div className="header-actions">

            <button
              type="button"
              className="refresh-button"
              onClick={fetchTransactions}
              disabled={loading}
            >
              <FiRefreshCw
                className={
                  loading ? "spin" : ""
                }
              />

              Refresh
            </button>

            <Link
              to="/transactions"
              className="primary-button"
            >
              <FiPlus />
              New Transaction
            </Link>

          </div>

        </header>


        {/* ======================================
            MAIN STATISTICS
        ====================================== */}

        <section className="stats-grid">

          <div className="stat-card">

            <div className="stat-icon">
              <FiTrendingUp />
            </div>

            <div>

              <p>
                Today's Sales
              </p>

              <h2>
                {loading
                  ? "..."
                  : formatCurrency(
                      analytics.todaysSales
                    )}
              </h2>

              <span className="stat-description">
                {analytics.todayTransactions.length}{" "}
                transactions today
              </span>

            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              <FiActivity />
            </div>

            <div>

              <p>
                Transactions
              </p>

              <h2>
                {loading
                  ? "..."
                  : transactions.length}
              </h2>

              <span className="stat-description">
                Total recorded sales
              </span>

            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              <FiCreditCard />
            </div>

            <div>

              <p>
                Total Revenue
              </p>

              <h2>
                {loading
                  ? "..."
                  : formatCurrency(
                      analytics.totalRevenue
                    )}
              </h2>

              <span className="stat-description">
                All recorded transactions
              </span>

            </div>

          </div>

        </section>


        {/* ======================================
            PAYMENT BREAKDOWN
        ====================================== */}

        <section className="dashboard-section">

          <div className="section-heading">

            <div>

              <h2>
                Payment Breakdown
              </h2>

              <p>
                Revenue by payment method
              </p>

            </div>

          </div>


          <div className="payment-stats">

            <div className="payment-stat-card">

              <div className="payment-stat-icon">
                <FiDollarSign />
              </div>

              <div>

                <span>
                  Cash
                </span>

                <strong>
                  {loading
                    ? "..."
                    : formatCurrency(
                        analytics.cashSales
                      )}
                </strong>

              </div>

            </div>


            <div className="payment-stat-card">

              <div className="payment-stat-icon">
                <FiSend />
              </div>

              <div>

                <span>
                  Transfer
                </span>

                <strong>
                  {loading
                    ? "..."
                    : formatCurrency(
                        analytics.transferSales
                      )}
                </strong>

              </div>

            </div>


            <div className="payment-stat-card">

              <div className="payment-stat-icon">
                <FiSmartphone />
              </div>

              <div>

                <span>
                  POS
                </span>

                <strong>
                  {loading
                    ? "..."
                    : formatCurrency(
                        analytics.posSales
                      )}
                </strong>

              </div>

            </div>

          </div>

        </section>


        {/* ======================================
            RECENT TRANSACTIONS
        ====================================== */}

        <section className="dashboard-section">

          <div className="section-heading">

            <div>

              <h2>
                Recent Transactions
              </h2>

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
              <p>
                Loading transactions...
              </p>
            </div>

          ) : recentTransactions.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                <FiShoppingBag />
              </div>

              <h3>
                No transactions yet
              </h3>

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
                    <th>
                      Product
                    </th>

                    <th>
                      Quantity
                    </th>

                    <th>
                      Amount
                    </th>

                    <th>
                      Payment
                    </th>

                    <th>
                      Date
                    </th>
                  </tr>

                </thead>


                <tbody>

                  {recentTransactions.map(
                    (transaction) => (

                      <tr
                        key={
                          transaction._id
                        }
                      >

                        <td>
                          <strong>
                            {
                              transaction.productName
                            }
                          </strong>
                        </td>

                        <td>
                          {
                            transaction.quantity
                          }
                        </td>

                        <td>
                          {formatCurrency(
                            transaction.totalAmount
                          )}
                        </td>

                        <td>

                          <span
                            className={`payment-badge ${transaction.paymentMethod}`}
                          >
                            {getPaymentLabel(
                              transaction.paymentMethod
                            )}
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