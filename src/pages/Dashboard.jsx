import { useEffect, useMemo, useState } from "react";
import {
  FiActivity,
  FiArrowDownRight,
  FiArrowUpRight,
  FiCreditCard,
  FiDollarSign,
  FiPlus,
  FiShoppingBag,
  FiTrendingUp,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

const Dashboard = () => {
  const { user } = useAuth();

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

      toast.error(
        error.response?.data?.message ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  /* =========================================
     DATE HELPERS
  ========================================= */

  const today = new Date();

  const isToday = (date) => {
    const transactionDate = new Date(date);

    return (
      transactionDate.getDate() === today.getDate() &&
      transactionDate.getMonth() === today.getMonth() &&
      transactionDate.getFullYear() ===
        today.getFullYear()
    );
  };

  const isThisWeek = (date) => {
    const transactionDate = new Date(date);

    const current = new Date();

    const day = current.getDay();

    const difference =
      day === 0 ? 6 : day - 1;

    const startOfWeek = new Date(current);

    startOfWeek.setDate(
      current.getDate() - difference
    );

    startOfWeek.setHours(0, 0, 0, 0);

    return transactionDate >= startOfWeek;
  };

  const isThisMonth = (date) => {
    const transactionDate = new Date(date);

    return (
      transactionDate.getMonth() ===
        today.getMonth() &&
      transactionDate.getFullYear() ===
        today.getFullYear()
    );
  };

  /* =========================================
     ANALYTICS
  ========================================= */

  const analytics = useMemo(() => {
    const todaysTransactions =
      transactions.filter((transaction) =>
        isToday(transaction.createdAt)
      );

    const weeklyTransactions =
      transactions.filter((transaction) =>
        isThisWeek(transaction.createdAt)
      );

    const monthlyTransactions =
      transactions.filter((transaction) =>
        isThisMonth(transaction.createdAt)
      );

    const totalRevenue = transactions.reduce(
      (total, transaction) =>
        total +
        Number(transaction.totalAmount || 0),
      0
    );

    const todaysSales =
      todaysTransactions.reduce(
        (total, transaction) =>
          total +
          Number(transaction.totalAmount || 0),
        0
      );

    const weeklySales =
      weeklyTransactions.reduce(
        (total, transaction) =>
          total +
          Number(transaction.totalAmount || 0),
        0
      );

    const monthlySales =
      monthlyTransactions.reduce(
        (total, transaction) =>
          total +
          Number(transaction.totalAmount || 0),
        0
      );

    const averageSale =
      transactions.length > 0
        ? totalRevenue / transactions.length
        : 0;

    const paymentMethods = {
      cash: 0,
      transfer: 0,
      pos: 0,
    };

    transactions.forEach((transaction) => {
      const method =
        transaction.paymentMethod;

      if (
        Object.prototype.hasOwnProperty.call(
          paymentMethods,
          method
        )
      ) {
        paymentMethods[method] += Number(
          transaction.totalAmount || 0
        );
      }
    });

    const totalPaymentRevenue =
      Object.values(paymentMethods).reduce(
        (total, value) => total + value,
        0
      );

    const paymentPercentages = {
      cash:
        totalPaymentRevenue > 0
          ? Math.round(
              (paymentMethods.cash /
                totalPaymentRevenue) *
                100
            )
          : 0,

      transfer:
        totalPaymentRevenue > 0
          ? Math.round(
              (paymentMethods.transfer /
                totalPaymentRevenue) *
                100
            )
          : 0,

      pos:
        totalPaymentRevenue > 0
          ? Math.round(
              (paymentMethods.pos /
                totalPaymentRevenue) *
                100
            )
          : 0,
    };

    return {
      todaysTransactions,
      weeklyTransactions,
      monthlyTransactions,
      totalRevenue,
      todaysSales,
      weeklySales,
      monthlySales,
      averageSale,
      paymentMethods,
      paymentPercentages,
    };
  }, [transactions]);

  /* =========================================
     RECENT TRANSACTIONS
  ========================================= */

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      )
      .slice(0, 5);
  }, [transactions]);

  /* =========================================
     FORMATTERS
  ========================================= */

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

      {/* =====================================
          SIDEBAR
      ===================================== */}

      <Sidebar />

      {/* =====================================
          MAIN CONTENT
      ===================================== */}

      <main className="dashboard-main">

        {/* HEADER */}

        <header className="dashboard-header">

          <div>
            <p className="header-greeting">
              Overview
            </p>

            <h1>
              Welcome back,{" "}
              {user?.name || "POS Agent"}
            </h1>

            <p className="dashboard-subtitle">
              Here's what's happening with
              your sales today.
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


        {/* =====================================
            MAIN STATISTICS
        ===================================== */}

        <section className="stats-grid">

          {/* TODAY */}

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
                      analytics.todaysSales
                    )}
              </h2>

              <span className="stat-meta positive">
                <FiArrowUpRight />
                {analytics.todaysTransactions
                  .length}{" "}
                transactions today
              </span>

            </div>

          </div>


          {/* TRANSACTIONS */}

          <div className="stat-card">

            <div className="stat-icon">
              <FiActivity />
            </div>

            <div className="stat-content">

              <p>
                Total Transactions
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


          {/* REVENUE */}

          <div className="stat-card">

            <div className="stat-icon">
              <FiDollarSign />
            </div>

            <div className="stat-content">

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

              <span className="stat-meta">
                Lifetime revenue
              </span>

            </div>

          </div>


          {/* AVERAGE */}

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
                      analytics.averageSale
                    )}
              </h2>

              <span className="stat-meta">
                Average transaction value
              </span>

            </div>

          </div>

        </section>


        {/* =====================================
            SALES OVERVIEW
        ===================================== */}

        <section className="analytics-grid">

          <div className="dashboard-card sales-overview">

            <div className="card-header">

              <div>
                <h2>
                  Sales Overview
                </h2>

                <p>
                  Your sales performance
                  across different periods.
                </p>
              </div>

              <div className="card-header-icon">
                <FiTrendingUp />
              </div>

            </div>


            <div className="sales-period-grid">

              <div className="sales-period">

                <span>
                  Today
                </span>

                <strong>
                  {formatCurrency(
                    analytics.todaysSales
                  )}
                </strong>

                <small>
                  {
                    analytics.todaysTransactions
                      .length
                  }{" "}
                  sales
                </small>

              </div>


              <div className="sales-period">

                <span>
                  This Week
                </span>

                <strong>
                  {formatCurrency(
                    analytics.weeklySales
                  )}
                </strong>

                <small>
                  {
                    analytics.weeklyTransactions
                      .length
                  }{" "}
                  sales
                </small>

              </div>


              <div className="sales-period">

                <span>
                  This Month
                </span>

                <strong>
                  {formatCurrency(
                    analytics.monthlySales
                  )}
                </strong>

                <small>
                  {
                    analytics.monthlyTransactions
                      .length
                  }{" "}
                  sales
                </small>

              </div>

            </div>

          </div>


          {/* ===================================
              PAYMENT BREAKDOWN
          =================================== */}

          <div className="dashboard-card payment-overview">

            <div className="card-header">

              <div>
                <h2>
                  Payment Methods
                </h2>

                <p>
                  Revenue by payment method.
                </p>
              </div>

              <div className="card-header-icon">
                <FiCreditCard />
              </div>

            </div>


            <div className="payment-list">

              {/* CASH */}

              <div className="payment-row">

                <div className="payment-row-info">

                  <div className="payment-method-icon cash">
                    <FiDollarSign />
                  </div>

                  <div>
                    <strong>
                      Cash
                    </strong>

                    <span>
                      {
                        analytics
                          .paymentPercentages
                          .cash
                      }
                      %
                    </span>
                  </div>

                </div>

                <strong>
                  {formatCurrency(
                    analytics.paymentMethods
                      .cash
                  )}
                </strong>

              </div>


              <div className="payment-progress">
                <div
                  className="payment-progress-bar cash"
                  style={{
                    width: `${analytics.paymentPercentages.cash}%`,
                  }}
                />
              </div>


              {/* TRANSFER */}

              <div className="payment-row">

                <div className="payment-row-info">

                  <div className="payment-method-icon transfer">
                    <FiArrowUpRight />
                  </div>

                  <div>
                    <strong>
                      Transfer
                    </strong>

                    <span>
                      {
                        analytics
                          .paymentPercentages
                          .transfer
                      }
                      %
                    </span>
                  </div>

                </div>

                <strong>
                  {formatCurrency(
                    analytics.paymentMethods
                      .transfer
                  )}
                </strong>

              </div>


              <div className="payment-progress">
                <div
                  className="payment-progress-bar transfer"
                  style={{
                    width: `${analytics.paymentPercentages.transfer}%`,
                  }}
                />
              </div>


              {/* POS */}

              <div className="payment-row">

                <div className="payment-row-info">

                  <div className="payment-method-icon pos">
                    <FiCreditCard />
                  </div>

                  <div>
                    <strong>
                      POS
                    </strong>

                    <span>
                      {
                        analytics
                          .paymentPercentages
                          .pos
                      }
                      %
                    </span>
                  </div>

                </div>

                <strong>
                  {formatCurrency(
                    analytics.paymentMethods
                      .pos
                  )}
                </strong>

              </div>


              <div className="payment-progress">
                <div
                  className="payment-progress-bar pos"
                  style={{
                    width: `${analytics.paymentPercentages.pos}%`,
                  }}
                />
              </div>

            </div>

          </div>

        </section>


        {/* =====================================
            RECENT TRANSACTIONS
        ===================================== */}

        <section className="dashboard-card recent-transactions-card">

          <div className="card-header">

            <div>
              <h2>
                Recent Transactions
              </h2>

              <p>
                Your latest recorded sales.
              </p>
            </div>

            <Link
              to="/transactions"
              className="view-all-link"
            >
              View all
              <FiArrowUpRight />
            </Link>

          </div>


          {loading ? (

            <div className="dashboard-loading">
              <div className="loading-spinner" />
              <p>
                Loading transactions...
              </p>
            </div>

          ) : recentTransactions.length === 0 ? (

            <div className="empty-state dashboard-empty">

              <div className="empty-icon">
                <FiShoppingBag />
              </div>

              <h3>
                No transactions yet
              </h3>

              <p>
                Start recording your first
                sale to see your analytics.
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
                              {transaction
                                .productName
                                ?.charAt(0)
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