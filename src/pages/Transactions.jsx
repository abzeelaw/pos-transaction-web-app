import { useEffect, useState } from "react";
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import api from "../services/api";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState(null);

  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    productName: "",
    quantity: "",
    unitPrice: "",
    paymentMethod: "cash",
  });

  // -----------------------------
  // FETCH TRANSACTIONS
  // -----------------------------

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/transactions");

      setTransactions(response.data.transactions || []);
    } catch (error) {
      console.error(
        "Failed to fetch transactions:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load transactions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // -----------------------------
  // FORM
  // -----------------------------

  const handleChange = (e) => {
    setFormData((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setFormData({
      productName: "",
      quantity: "",
      unitPrice: "",
      paymentMethod: "cash",
    });

    setEditingTransaction(null);
    setError("");
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (transaction) => {
    setEditingTransaction(transaction);

    setFormData({
      productName: transaction.productName,
      quantity: transaction.quantity,
      unitPrice: transaction.unitPrice,
      paymentMethod: transaction.paymentMethod,
    });

    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    resetForm();
  };

  // -----------------------------
  // CREATE / UPDATE
  // -----------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        productName: formData.productName.trim(),
        quantity: Number(formData.quantity),
        unitPrice: Number(formData.unitPrice),
        paymentMethod: formData.paymentMethod,
      };

      if (
        !payload.productName ||
        payload.quantity < 1 ||
        payload.unitPrice < 0
      ) {
        setError("Please enter valid transaction details.");
        return;
      }

      if (editingTransaction) {
        await api.put(
          `/transactions/${editingTransaction._id}`,
          payload
        );
      } else {
        await api.post("/transactions", payload);
      }

      await fetchTransactions();

      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error(
        "Failed to save transaction:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to save transaction."
      );
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------
  // DELETE
  // -----------------------------

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await api.delete(`/transactions/${id}`);

      await fetchTransactions();
    } catch (error) {
      console.error(
        "Failed to delete transaction:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to delete transaction."
      );
    }
  };

  // -----------------------------
  // SEARCH
  // -----------------------------

  const filteredTransactions = transactions.filter(
    (transaction) => {
      const product =
        transaction.productName?.toLowerCase() || "";

      const payment =
        transaction.paymentMethod?.toLowerCase() || "";

      const searchTerm = search.toLowerCase();

      return (
        product.includes(searchTerm) ||
        payment.includes(searchTerm)
      );
    }
  );

  // -----------------------------
  // HELPERS
  // -----------------------------

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

  const calculatedTotal =
    Number(formData.quantity || 0) *
    Number(formData.unitPrice || 0);

  // -----------------------------
  // UI
  // -----------------------------

  return (
    <div className="transactions-page">

      {/* HEADER */}

      <div className="transactions-header">

        <div>
          <h1>Transactions</h1>

          <p>
            Record and manage your POS sales.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openCreateModal}
        >
          <FiPlus />
          New Sale
        </button>

      </div>


      {/* TOOLBAR */}

      <div className="transaction-toolbar">

        <div className="search-box">

          <FiSearch />

          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        <span className="transaction-count">
          {filteredTransactions.length} transaction
          {filteredTransactions.length !== 1
            ? "s"
            : ""}
        </span>

      </div>


      {/* ERROR */}

      {error && !showModal && (
        <div className="page-error">
          {error}
        </div>
      )}


      {/* CONTENT */}

      <div className="transactions-card">

        {loading ? (

          <div className="transactions-empty">
            <p>Loading transactions...</p>
          </div>

        ) : filteredTransactions.length === 0 ? (

          <div className="transactions-empty">

            <h3>
              {search
                ? "No matching transactions"
                : "No transactions yet"}
            </h3>

            <p>
              {search
                ? "Try a different search term."
                : "Record your first sale to get started."}
            </p>

            {!search && (
              <button
                className="primary-button"
                onClick={openCreateModal}
              >
                <FiPlus />
                Record Sale
              </button>
            )}

          </div>

        ) : (

          <div className="transactions-table-wrapper">

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
                        <span className="payment-badge">
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
                            className="icon-button edit"
                            onClick={() =>
                              openEditModal(transaction)
                            }
                            title="Edit"
                          >
                            <FiEdit2 />
                          </button>

                          <button
                            className="icon-button delete"
                            onClick={() =>
                              handleDelete(
                                transaction._id
                              )
                            }
                            title="Delete"
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


      {/* MODAL */}

      {showModal && (

        <div className="modal-overlay">

          <div className="transaction-modal">

            <div className="modal-header">

              <div>

                <h2>
                  {editingTransaction
                    ? "Edit Transaction"
                    : "Record New Sale"}
                </h2>

                <p>
                  Enter the details of the transaction.
                </p>

              </div>

              <button
                className="modal-close"
                onClick={closeModal}
              >
                <FiX />
              </button>

            </div>


            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}


            <form
              className="transaction-form"
              onSubmit={handleSubmit}
            >

              <div className="form-group">

                <label>
                  Product name
                </label>

                <input
                  className="standard-input"
                  type="text"
                  name="productName"
                  placeholder="e.g. Maltina"
                  value={formData.productName}
                  onChange={handleChange}
                  required
                />

              </div>


              <div className="form-row">

                <div className="form-group">

                  <label>
                    Quantity
                  </label>

                  <input
                    className="standard-input"
                    type="number"
                    name="quantity"
                    min="1"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                  />

                </div>


                <div className="form-group">

                  <label>
                    Unit price
                  </label>

                  <input
                    className="standard-input"
                    type="number"
                    name="unitPrice"
                    min="0"
                    value={formData.unitPrice}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>


              <div className="form-group">

                <label>
                  Payment method
                </label>

                <select
                  className="standard-input"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                >
                  <option value="cash">
                    Cash
                  </option>

                  <option value="transfer">
                    Bank Transfer
                  </option>

                  <option value="pos">
                    POS
                  </option>

                </select>

              </div>


              <div className="total-preview">

                <span>
                  Total sale
                </span>

                <strong>
                  {formatCurrency(calculatedTotal)}
                </strong>

              </div>


              <div className="modal-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingTransaction
                    ? "Update Sale"
                    : "Record Sale"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default Transactions;