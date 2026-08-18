import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiEdit2,
  FiPlus,
  FiSearch,
  FiShoppingBag,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import { Link } from "react-router-dom";

import toast from "react-hot-toast";

import api from "../services/api";
import TransactionModal from "../components/TransactionModel";
import Sidebar from "../components/Sidebar";

const Transactions = () => {

  const [transactions, setTransactions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [paymentFilter, setPaymentFilter] =
    useState("all");

  const [showModal, setShowModal] =
    useState(false);

  const [editingTransaction, setEditingTransaction] =
    useState(null);

  const [deletingTransaction, setDeletingTransaction] =
    useState(null);

  const [deleteLoading, setDeleteLoading] =
    useState(false);


  /*
   * Fetch transactions
   */
  const fetchTransactions = async () => {
    try {

      setLoading(true);

      const response =
        await api.get("/transactions");

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
        "Unable to load transactions."
      );

    } finally {

      setLoading(false);

    }
  };


  /*
   * Initial load
   */
  useEffect(() => {
    fetchTransactions();
  }, []);


  /*
   * Search + filter
   */
  const filteredTransactions = useMemo(() => {

    return transactions.filter(
      (transaction) => {

        const matchesSearch =
          transaction.productName
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            );

        const matchesPayment =
          paymentFilter === "all" ||
          transaction.paymentMethod ===
            paymentFilter;

        return (
          matchesSearch &&
          matchesPayment
        );
      }
    );

  }, [
    transactions,
    search,
    paymentFilter,
  ]);


  /*
   * Filtered revenue
   */
  const totalFilteredRevenue =
    filteredTransactions.reduce(
      (total, transaction) =>
        total +
        Number(
          transaction.totalAmount || 0
        ),
      0
    );


  /*
   * Currency
   */
  const formatCurrency = (amount) => {

    return new Intl.NumberFormat(
      "en-NG",
      {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
      }
    ).format(amount);

  };


  /*
   * Date
   */
  const formatDate = (date) => {

    return new Date(date)
      .toLocaleDateString(
        "en-NG",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      );

  };


  /*
   * Time
   */
  const formatTime = (date) => {

    return new Date(date)
      .toLocaleTimeString(
        "en-NG",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );

  };


  /*
   * Create
   */
  const handleCreate = () => {

    setEditingTransaction(null);
    setShowModal(true);

  };


  /*
   * Edit
   */
  const handleEdit = (transaction) => {

    setEditingTransaction(
      transaction
    );

    setShowModal(true);

  };


  /*
   * Modal success
   */
  const handleModalSuccess = () => {

    setShowModal(false);

    setEditingTransaction(null);

    fetchTransactions();

  };


  /*
   * Delete
   */
  const handleDelete = async () => {

    if (!deletingTransaction) {
      return;
    }

    try {

      setDeleteLoading(true);

      await api.delete(
        `/transactions/${deletingTransaction._id}`
      );


      setTransactions((current) =>
        current.filter(
          (transaction) =>
            transaction._id !==
            deletingTransaction._id
        )
      );


      toast.success(
        "Transaction deleted successfully"
      );


      setDeletingTransaction(null);

    } catch (error) {

      console.error(
        "Failed to delete transaction:",
        error
      );

      toast.error(
        error.response?.data?.message ||
        "Unable to delete transaction."
      );

    } finally {

      setDeleteLoading(false);

    }
  };


  /*
   * Clear filters
   */
  const clearFilters = () => {

    setSearch("");

    setPaymentFilter("all");

  };


  return (
    <div className="dashboard-layout">

      {/* SIDEBAR */}

      <Sidebar />


      {/* MAIN */}

      <main className="transactions-content">

        {/* HEADER */}

        <header className="transactions-header">

          <div>

            <p className="header-greeting">
              Sales Management
            </p>

            <h1>
              Transactions
            </h1>

            <p>
              Record and manage your POS sales.
            </p>

          </div>


          <button
            className="primary-button"
            onClick={handleCreate}
          >

            <FiPlus />

            New Transaction

          </button>

        </header>


        {/* SUMMARY */}

        <section className="stats-grid">

          {/* TRANSACTIONS */}

          <div className="stat-card">

            <div className="stat-icon">
              <FiShoppingBag />
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

            </div>

          </div>


          {/* REVENUE */}

          <div className="stat-card">

            <div className="stat-icon">
              ₦
            </div>

            <div className="stat-content">

              <p>
                Filtered Revenue
              </p>

              <h2>
                {loading
                  ? "..."
                  : formatCurrency(
                      totalFilteredRevenue
                    )}
              </h2>

            </div>

          </div>

        </section>


        {/* TABLE */}

        <section className="dashboard-section">

          {/* TOOLBAR */}

          <div className="transactions-toolbar">

            <div className="search-box">

              <FiSearch />

              <input
                type="text"
                placeholder="Search product..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
              />

            </div>


            <select
              className="filter-select"
              value={paymentFilter}
              onChange={(event) =>
                setPaymentFilter(
                  event.target.value
                )
              }
            >

              <option value="all">
                All payment methods
              </option>

              <option value="cash">
                Cash
              </option>

              <option value="transfer">
                Transfer
              </option>

              <option value="pos">
                POS
              </option>

            </select>

          </div>


          {/* CLEAR FILTERS */}

          {(search ||
            paymentFilter !== "all") && (

            <div className="clear-filter-container">

              <button
                className="secondary-button"
                onClick={clearFilters}
              >

                <FiX />

                Clear filters

              </button>

            </div>

          )}


          {/* LOADING */}

          {loading ? (

            <div className="loading-container">

              <div className="loading-spinner" />

              <p>
                Loading transactions...
              </p>

            </div>

          )


          /* EMPTY */

          : filteredTransactions.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                <FiShoppingBag />
              </div>

              <h3>
                No transactions found
              </h3>

              <p>

                {transactions.length === 0

                  ? "Record your first sale to get started."

                  : "Try changing your search or filter."}

              </p>


              {transactions.length === 0 && (

                <button
                  className="primary-button"
                  onClick={handleCreate}
                >

                  <FiPlus />

                  Record Sale

                </button>

              )}

            </div>

          )


          /* TABLE */

          : (

            <div className="transaction-table-wrapper">

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
                      Unit Price
                    </th>

                    <th>
                      Total
                    </th>

                    <th>
                      Payment
                    </th>

                    <th>
                      Date
                    </th>

                    <th>
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredTransactions.map(
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


                        {/* QUANTITY */}

                        <td>
                          {
                            transaction.quantity
                          }
                        </td>


                        {/* UNIT PRICE */}

                        <td>

                          {formatCurrency(
                            transaction.unitPrice
                          )}

                        </td>


                        {/* TOTAL */}

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

                            {
                              transaction.paymentMethod
                            }

                          </span>

                        </td>


                        {/* DATE */}

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


                        {/* ACTIONS */}

                        <td>

                          <div className="transaction-actions">

                            <button
                              className="edit-button"
                              title="Edit transaction"
                              onClick={() =>
                                handleEdit(
                                  transaction
                                )
                              }
                            >

                              <FiEdit2 />

                            </button>


                            <button
                              className="delete-button"
                              title="Delete transaction"
                              onClick={() =>
                                setDeletingTransaction(
                                  transaction
                                )
                              }
                            >

                              <FiTrash2 />

                            </button>

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


      {/* CREATE / EDIT MODAL */}

      {showModal && (

        <TransactionModal

          transaction={
            editingTransaction
          }

          onClose={() => {

            setShowModal(false);

            setEditingTransaction(null);

          }}

          onSuccess={
            handleModalSuccess
          }

        />

      )}


      {/* DELETE CONFIRMATION */}

      {deletingTransaction && (

        <div
          className="modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {

              if (!deleteLoading) {
                setDeletingTransaction(
                  null
                );
              }

            }

          }}
        >

          <div className="confirm-modal">

            <div className="confirm-icon">

              <FiTrash2 />

            </div>


            <h2>
              Delete transaction?
            </h2>


            <p>

              This will permanently delete
              the transaction for{" "}

              <strong>
                {
                  deletingTransaction.productName
                }
              </strong>
              .

            </p>


            <div className="confirm-actions">

              <button
                className="secondary-button"
                onClick={() =>
                  setDeletingTransaction(
                    null
                  )
                }
                disabled={deleteLoading}
              >

                Cancel

              </button>


              <button
                className="danger-button"
                onClick={handleDelete}
                disabled={deleteLoading}
              >

                {deleteLoading
                  ? "Deleting..."
                  : "Delete"}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default Transactions;