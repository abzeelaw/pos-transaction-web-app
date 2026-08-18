import { useEffect, useMemo, useState } from "react";
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
  FiShoppingBag,
} from "react-icons/fi";
import api from "../services/api";
import TransactionModel from "../components/TransactionModel";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState(null);

  // ===============================
  // FETCH TRANSACTIONS
  // ===============================

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

  // ===============================
  // FILTER TRANSACTIONS
  // ===============================

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const productName =
        transaction.productName || "";

      const matchesSearch = productName
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesPayment =
        paymentFilter === "all" ||
        transaction.paymentMethod === paymentFilter;

      return matchesSearch && matchesPayment;
    });
  }, [
    transactions,
    search,
    paymentFilter,
  ]);

  // ===============================
  // FORMATTING
  // ===============================

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

  // ===============================
  // CREATE
  // ===============================

  const handleCreate = () => {
    setEditingTransaction(null);
    setShowModal(true);
  };

  // ===============================
  // EDIT
  // ===============================

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowModal(true);
  };

  // ===============================
  // DELETE
  // ===============================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/transactions/${id}`);

      await fetchTransactions();
    } catch (error) {
      console.error(
        "Failed to delete transaction:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Unable to delete transaction."
      );
    }
  };

  // ===============================
  // MODAL
  // ===============================

  const handleModalClose = () => {
    setShowModal(false);
    setEditingTransaction(null);
  };

  const handleTransactionSaved = async () => {
    handleModalClose();
    await fetchTransactions();
  };

  // ===============================
  // RENDER
  // ===============================

  return (
    <div className="transactions-page">

      {/* PAGE HEADER */}

      <div className="transactions-header">

        <div>
          <p className="page-eyebrow">
            Sales Management
          </p>

          <h1>Transactions</h1>

          <p className="page-description">
            Record and manage your POS transactions.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={handleCreate}
        >
          <FiPlus />
          New Transaction
        </button>

      </div>


      {/* FILTERS */}

      <div className="transaction-filters">

        <div className="search-box">

          <FiSearch />

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

        </div>


        <select
          value={paymentFilter}
          onChange={(event) =>
            setPaymentFilter(event.target.value)
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


        <button
          type="button"
          className="refresh-button"
          onClick={fetchTransactions}
          disabled={loading}
        >
          <FiRefreshCw
            className={loading ? "spin" : ""}
          />

          Refresh
        </button>

      </div>


      {/* TRANSACTION TABLE */}

      <div className="transactions-card">

        {loading ? (

          <div className="transactions-empty">

            <p>
              Loading transactions...
            </p>

          </div>

        ) : filteredTransactions.length === 0 ? (

          <div className="transactions-empty">

            <div className="empty-icon">
              <FiShoppingBag />
            </div>

            <h3>
              No transactions found
            </h3>

            <p>
              {search || paymentFilter !== "all"
                ? "Try changing your search or filters."
                : "Start recording your first sale."}
            </p>

            {!search &&
              paymentFilter === "all" && (
                <button
                  type="button"
                  className="primary-button"
                  onClick={handleCreate}
                >
                  <FiPlus />
                  Record Sale
                </button>
              )}

          </div>

        ) : (

          <div className="table-wrapper">

            <table className="transaction-table">

              <thead>

                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {filteredTransactions.map(
                  (transaction) => (

                    <tr
                      key={transaction._id}
                    >

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
                          transaction.unitPrice
                        )}
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
                          className={`payment-badge ${transaction.paymentMethod}`}
                        >
                          {transaction.paymentMethod}
                        </span>
                      </td>

                      <td>
                        {formatDate(
                          transaction.createdAt
                        )}
                      </td>

                      <td>

                        <div className="table-actions">

                          <button
                            type="button"
                            className="icon-button edit"
                            onClick={() =>
                              handleEdit(
                                transaction
                              )
                            }
                            title="Edit transaction"
                          >
                            <FiEdit2 />
                          </button>

                          <button
                            type="button"
                            className="icon-button delete"
                            onClick={() =>
                              handleDelete(
                                transaction._id
                              )
                            }
                            title="Delete transaction"
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

      </div>


      {/* CREATE / EDIT MODAL */}

      {showModal && (
        <TransactionModel
          transaction={editingTransaction}
          onClose={handleModalClose}
          onSaved={handleTransactionSaved}
        />
      )}

    </div>
  );
};

export default Transactions;