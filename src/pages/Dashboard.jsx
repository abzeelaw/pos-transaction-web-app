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
  TODAY
  ========================================
  */

  const today = new Date();

  const todaysTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      if (!transaction.createdAt) {
        return false;
      }

      const date =
        new Date(transaction.createdAt);

      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() ===
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
  PAYMENT BREAKDOWN
  ========================================
  */

  const paymentBreakdown = useMemo(() => {
    const breakdown = {
      cash: {
        count: 0,
        amount: 0,
      },

      transfer: {
        count: 0,
        amount: 0,
      },

      pos: {
        count: 0,
        amount: 0,
      },
    };

    transactions.forEach((transaction) => {
      const method =
        transaction.paymentMethod;

      if (breakdown[method]) {
        breakdown[method].count += 1;

        breakdown[method].amount +=
          Number(
            transaction.totalAmount || 0
          );
      }
    });

    return breakdown;
  }, [transactions]);

  /*
  ========================================
  MAX PAYMENT AMOUNT
  ========================================
  */

  const maxPaymentAmount = useMemo(() => {
    return Math.max(
      paymentBreakdown.cash.amount,
      paymentBreakdown.transfer.amount,
      paymentBreakdown.pos.amount,
      1
    );
  }, [paymentBreakdown]);

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
  CURRENCY
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
  DATE
  ========================================
  */

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

  /*
  ========================================
  PAYMENT LABEL
  ========================================
  */

  const formatPaymentMethod = (method) => {
    if (!method) return "-";

    return (
      method.charAt(0).toUpperCase() +
      method.slice(1)
    );
  };

  return (
    <div className="dashboard-layout">

      <Sidebar />

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
              Here's what's happening with
              your sales today.
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
            ANALYTICS
        ================================= */}

        <section className="analytics-grid">

          {/* SALES OVERVIEW */}

          <div className="analytics-card">

            <div className="analytics-card-header">

              <div>
                <h2>
                  Sales Overview
                </h2>

                <p>
                  Revenue generated by
                  payment method
                </p>
              </div>

              <div className="analytics-header-icon">
                <FiTrendingUp />
              </div>

            </div>


            <div className="payment-bars">

              {/* CASH */}

              <div className="payment-bar-item">

                <div className="payment-bar-label">

                  <span>
                    Cash
                  </span>

                  <strong>
                    {formatCurrency(
                      paymentBreakdown
                        .cash.amount
                    )}
                  </strong>

                </div>

                <div className="payment-bar-track">

                  <div
                    className="payment-bar-fill cash"
                    style={{
                      width: `${
                        (paymentBreakdown.cash
                          .amount /
                          maxPaymentAmount) *
                        100
                      }%`,
                    }}
                  />

                </div>

                <small>
                  {paymentBreakdown.cash.count}{" "}
                  transaction
                  {paymentBreakdown.cash.count !==
                  1
                    ? "s"
                    : ""}
                </small>

              </div>


              {/* TRANSFER */}

              <div className="payment-bar-item">

                <div className="payment-bar-label">

                  <span>
                    Bank Transfer
                  </span>

                  <strong>
                    {formatCurrency(
                      paymentBreakdown
                        .transfer.amount
                    )}
                  </strong>

                </div>

                <div className="payment-bar-track">

                  <div
                    className="payment-bar-fill transfer"
                    style={{
                      width: `${
                        (paymentBreakdown
                          .transfer.amount /
                          maxPaymentAmount) *
                        100
                      }%`,
                    }}
                  />

                </div>

                <small>
                  {
                    paymentBreakdown.transfer
                      .count
                  }{" "}
                  transaction
                  {paymentBreakdown.transfer
                    .count !== 1
                    ? "s"
                    : ""}
                </small>

              </div>


              {/* POS */}

              <div className="payment-bar-item">

                <div className="payment-bar-label">

                  <span>
                    POS
                  </span>

                  <strong>
                    {formatCurrency(
                      paymentBreakdown.pos
                        .amount
                    )}
                  </strong>

                </div>

                <div className="payment-bar-track">

                  <div
                    className="payment-bar-fill pos"
                    style={{
                      width: `${
                        (paymentBreakdown.pos
                          .amount /
                          maxPaymentAmount) *
                        100
                      }%`,
                    }}
                  />

                </div>

                <small>
                  {paymentBreakdown.pos.count}{" "}
                  transaction
                  {paymentBreakdown.pos.count !==
                  1
                    ? "s"
                    : ""}
                </small>

              </div>

            </div>

          </div>


          {/* PAYMENT SUMMARY */}

          <div className="analytics-card">

            <div className="analytics-card-header">

              <div>
                <h2>
                  Payment Summary
                </h2>

                <p>
                  Sales by payment type
                </p>
              </div>

              <div className="analytics-header-icon">
                <FiCreditCard />
              </div>

            </div>


            <div className="payment-summary">

              <div className="payment-summary-item">

                <div className="payment-summary-left">

                  <span className="summary-dot cash-dot" />

                  <div>
                    <strong>
                      Cash
                    </strong>

                    <small>
                      {
                        paymentBreakdown
                          .cash.count
                      }{" "}
                      transactions
                    </small>
                  </div>

                </div>

                <strong>
                  {formatCurrency(
                    paymentBreakdown
                      .cash.amount
                  )}
                </strong>

              </div>


              <div className="payment-summary-item">

                <div className="payment-summary-left">

                  <span className="summary-dot transfer-dot" />

                  <div>
                    <strong>
                      Transfer
                    </strong>

                    <small>
                      {
                        paymentBreakdown
                          .transfer.count
                      }{" "}
                      transactions
                    </small>
                  </div>

                </div>

                <strong>
                  {formatCurrency(
                    paymentBreakdown
                      .transfer.amount
                  )}
                </strong>

              </div>


              <div className="payment-summary-item">

                <div className="payment-summary-left">

                  <span className="summary-dot pos-dot" />

                  <div>
                    <strong>
                      POS
                    </strong>

                    <small>
                      {
                        paymentBreakdown
                          .pos.count
                      }{" "}
                      transactions
                    </small>
                  </div>

                </div>

                <strong>
                  {formatCurrency(
                    paymentBreakdown.pos
                      .amount
                  )}
                </strong>

              </div>

            </div>

          </div>

        </section>


        {/* =================================
            RECENT TRANSACTIONS
        ================================= */}

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

            <Link
              to="/transactions"
              className="view-all-link"
            >
              View all
              <FiArrowUpRight />
            </Link>

          </div>


          {loading ? (

            <div className="loading-container">

              <div className="loading-spinner" />

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
                sale to see your
                transactions here.
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
                                ?.toUpperCase() ||
                                "P"}
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

                          <span
                            className={`payment-badge payment-${transaction.paymentMethod}`}
                          >
                            {formatPaymentMethod(
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
                Add Sale
              </Link>

            </section>

          )}

      </main>

    </div>
  );
};

export default Dashboard;