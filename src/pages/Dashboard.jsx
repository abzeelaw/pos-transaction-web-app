import { useEffect, useMemo, useState } from "react";
import {
  FiActivity,
  FiArrowUpRight,
  FiCreditCard,
  FiPlus,
  FiShoppingBag,
  FiTrendingUp,
} from "react-icons/fi";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

const Dashboard = () => {
  const { user } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  /*
  ========================================
  FETCH TRANSACTIONS
  ========================================
  */

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

  /*
  ========================================
  DATE
  ========================================
  */

  const today = new Date();

  /*
  ========================================
  TODAY'S TRANSACTIONS
  ========================================
  */

  const todaysTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      if (!transaction.createdAt) {
        return false;
      }

      const transactionDate =
        new Date(transaction.createdAt);

      return (
        transactionDate.getDate() ===
          today.getDate() &&
        transactionDate.getMonth() ===
          today.getMonth() &&
        transactionDate.getFullYear() ===
          today.getFullYear()
      );
    });
  }, [transactions]);

  /*
  ========================================
  TODAY'S SALES
  ========================================
  */

  const todaysSales = useMemo(() => {
    return todaysTransactions.reduce(
      (total, transaction) =>
        total +
        Number(transaction.totalAmount || 0),
      0
    );
  }, [todaysTransactions]);

  /*
  ========================================
  TOTAL REVENUE
  ========================================
  */

  const totalRevenue = useMemo(() => {
    return transactions.reduce(
      (total, transaction) =>
        total +
        Number(transaction.totalAmount || 0),
      0
    );
  }, [transactions]);

  /*
  ========================================
  RECENT TRANSACTIONS
  ========================================
  */

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      )
      .slice(0, 5);
  }, [transactions]);

  /*
  ========================================
  CURRENCY FORMAT
  ========================================
  */

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  /*
  ========================================
  DATE FORMAT
  ========================================
  */

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString(
      "en-NG",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  /*
  ========================================
  PAYMENT LABEL
  ========================================
  */

  const formatPaymentMethod = (method) => {
    if (!method) {
      return "-";
    }

    return (
      method.charAt(0).toUpperCase() +
      method.slice(1)
    );
  };

  /*
  ========================================
  UI
  ========================================
  */

  return (
    <div className="dashboard-layout">

      {/* =================================
          SIDEBAR
      ================================= */}

      <Sidebar />


      {/* =================================
          MAIN CONTENT
      ================================= */}

      <main className="dashboard-main">

        {/* =================================
            HEADER
        ================================= */}

        <header className="dashboard-header">

          <div className="dashboard-header-content">

            <p className="header-greeting">
              Welcome back
            </p>

            <h1>
              {user?.name || "POS Agent"}
            </h1>

            <p className="header-description">
              Here's what's happening with your
              sales today.
            </p>

          </div>


          <Link
            to="/transactions"
            className="primary-button"
          >
            <FiPlus />

            <span>
              New Transaction
            </span>
          </Link>

        </header>


        {/* =================================
            STATISTICS
        ================================= */}

        <section className="stats-grid">

          {/* TODAY'S SALES */}

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

              <span className="stat-meta">
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


          {/* TOTAL TRANSACTIONS */}

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

              <span className="stat-meta">
                All recorded sales
              </span>

            </div>

          </div>


          {/* TOTAL REVENUE */}

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

              <span className="stat-meta">
                All-time revenue
              </span>

            </div>

          </div>

        </section>


        {/* =================================
            RECENT TRANSACTIONS
        ================================= */}

        <section className="dashboard-section">

          {/* SECTION HEADER */}

          <div className="section-heading">

            <div>

              <h2>
                Recent Transactions
              </h2>

              <p>
                Your latest recorded sales
              </p>

            </div>


            <Link
              to="/transactions"
              className="view-all-link"
            >
              <span>
                View all
              </span>

              <FiArrowUpRight />

            </Link>

          </div>


          {/* =================================
              LOADING
          ================================= */}

          {loading ? (

            <div className="loading-container">

              <div className="loading-spinner" />

              <p>
                Loading transactions...
              </p>

            </div>


          ) : recentTransactions.length ===
            0 ? (

            /* =================================
               EMPTY STATE
            ================================= */

            <div className="empty-state">

              <div className="empty-icon">
                <FiShoppingBag />
              </div>

              <h3>
                No transactions yet
              </h3>

              <p>
                Start recording your first sale
                to see your transactions here.
              </p>

              <Link
                to="/transactions"
                className="primary-button"
              >
                <FiPlus />

                <span>
                  Record Sale
                </span>

              </Link>

            </div>


          ) : (

            /* =================================
               TRANSACTION TABLE
            ================================= */

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

                        {/* PRODUCT */}

                        <td>

                          <div className="product-cell">

                            <div className="product-avatar">
                              {transaction.productName
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                "P"}
                            </div>

                            <div>

                              <strong>
                                {
                                  transaction.productName
                                }
                              </strong>

                            </div>

                          </div>

                        </td>


                        {/* QUANTITY */}

                        <td>
                          {transaction.quantity}
                        </td>


                        {/* AMOUNT */}

                        <td>

                          <strong>
                            {formatCurrency(
                              transaction.totalAmount
                            )}
                          </strong>

                        </td>


                        {/* PAYMENT */}

                        <td>

                          <span
                            className={`payment-badge payment-${transaction.paymentMethod}`}
                          >
                            {formatPaymentMethod(
                              transaction.paymentMethod
                            )}
                          </span>

                        </td>


                        {/* DATE */}

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


        {/* =================================
            QUICK ACTION
        ================================= */}

        {!loading &&
          transactions.length > 0 && (
            <section className="dashboard-quick-action">

              <div className="quick-action-icon">
                <FiShoppingBag />
              </div>

              <div className="quick-action-content">

                <h3>
                  Ready to record another sale?
                </h3>

                <p>
                  Quickly add a new transaction
                  to your sales records.
                </p>

              </div>

              <Link
                to="/transactions"
                className="secondary-button"
              >
                <FiPlus />

                <span>
                  Add Sale
                </span>

              </Link>

            </section>
          )}

      </main>

    </div>
  );
};

export default Dashboard;