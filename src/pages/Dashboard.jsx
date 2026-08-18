import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiActivity,
  FiArrowUpRight,
  FiCreditCard,
  FiLogOut,
  FiPlus,
  FiShoppingBag,
  FiTrendingUp,
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

    fetchTransactions();
  }, []);

  const today = new Date();

  const todaysTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const transactionDate = new Date(
        transaction.createdAt
      );

      return (
        transactionDate.getDate() === today.getDate() &&
        transactionDate.getMonth() ===
          today.getMonth() &&
        transactionDate.getFullYear() ===
          today.getFullYear()
      );
    });
  }, [transactions]);

  const todaysSales = useMemo(() => {
    return todaysTransactions.reduce(
      (total, transaction) =>
        total +
        Number(transaction.totalAmount || 0),
      0
    );
  }, [todaysTransactions]);

  const totalRevenue = useMemo(() => {
    return transactions.reduce(
      (total, transaction) =>
        total +
        Number(transaction.totalAmount || 0),
      0
    );
  }, [transactions]);

  const averageSale = useMemo(() => {
    if (!transactions.length) return 0;

    return totalRevenue / transactions.length;
  }, [transactions, totalRevenue]);

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      )
      .slice(0, 5);
  }, [transactions]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(
      "en-NG",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString(
      "en-NG",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  return (
    <div className="dashboard-layout">

      {/* SIDEBAR */}

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
            <FiActivity />
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


      {/* MAIN */}

      <main className="dashboard-main">

        <header className="dashboard-header">

          <div>
            <p className="header-greeting">
              Dashboard
            </p>

            <h1>
              Welcome back,{" "}
              {user?.name || "POS Agent"}
            </h1>

            <p className="header-description">
              Here's an overview of your
              transaction activity.
            </p>
          </div>

          <Link
            to="/transactions"
            className="primary-button"
          >
            <FiPlus />
            New Transaction
          </Link>

        </header>


        {/* STATS */}

        <section className="stats-grid">

          <div className="stat-card">

            <div className="stat-icon">
              <FiTrendingUp />
            </div>

            <div className="stat-content">
              <p>
                Today's Sales
              </p>

              <h2>
                {loading
                  ? "..."
                  : formatCurrency(
                      todaysSales
                    )}
              </h2>

              <span className="stat-helper">
                {todaysTransactions.length}{" "}
                transaction
                {todaysTransactions.length !==
                1
                  ? "s"
                  : ""}{" "}
                today
              </span>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              <FiActivity />
            </div>

            <div className="stat-content">

              <p>
                Transactions
              </p>

              <h2>
                {loading
                  ? "..."
                  : transactions.length}
              </h2>

              <span className="stat-helper">
                Total recorded sales
              </span>

            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              <FiCreditCard />
            </div>

            <div className="stat-content">

              <p>
                Total Revenue
              </p>

              <h2>
                {loading
                  ? "..."
                  : formatCurrency(
                      totalRevenue
                    )}
              </h2>

              <span className="stat-helper">
                Across all transactions
              </span>

            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              <FiShoppingBag />
            </div>

            <div className="stat-content">

              <p>
                Average Sale
              </p>

              <h2>
                {loading
                  ? "..."
                  : formatCurrency(
                      averageSale
                    )}
              </h2>

              <span className="stat-helper">
                Per transaction
              </span>

            </div>

          </div>

        </section>


        {/* RECENT TRANSACTIONS */}

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

          ) : recentTransactions.length ===
            0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                <FiShoppingBag />
              </div>

              <h3>
                No transactions yet
              </h3>

              <p>
                Start recording your first
                sale to see it here.
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
                          <div className="product-cell">
                            <div className="product-avatar">
                              {transaction.productName
                                ?.charAt(
                                  0
                                )
                                ?.toUpperCase()}
                            </div>

                            <strong>
                              {
                                transaction.productName
                              }
                            </strong>
                          </div>
                        </td>

                        <td>
                          {
                            transaction.quantity
                          }
                        </td>

                        <td>
                          <strong>
                            {formatCurrency(
                              transaction.totalAmount
                            )}
                          </strong>
                        </td>

                        <td>
                          <span className="payment-badge">
                            {
                              transaction.paymentMethod
                            }
                          </span>
                        </td>

                        <td>
                          <div className="date-cell">
                            <span>
                              {formatDate(
                                transaction.createdAt
                              )}
                            </span>

                            <small>
                              {formatTime(
                                transaction.createdAt
                              )}
                            </small>
                          </div>
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