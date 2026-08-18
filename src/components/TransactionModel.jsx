import { useEffect, useState } from "react";
import {
  FiX,
  FiShoppingBag,
  FiCheck,
  FiCreditCard,
  FiHash,
  FiDollarSign,
  FiAlertCircle,
} from "react-icons/fi";
import api from "../services/api";

const TransactionModal = ({
  transaction,
  onClose,
  onSuccess,
}) => {
  const isEditing = Boolean(transaction);

  const [formData, setFormData] = useState({
    productName: "",
    quantity: "",
    unitPrice: "",
    paymentMethod: "cash",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (transaction) {
      setFormData({
        productName: transaction.productName || "",
        quantity: transaction.quantity ?? "",
        unitPrice: transaction.unitPrice ?? "",
        paymentMethod:
          transaction.paymentMethod || "cash",
      });
    } else {
      setFormData({
        productName: "",
        quantity: "",
        unitPrice: "",
        paymentMethod: "cash",
      });
    }
  }, [transaction]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const totalAmount =
    Number(formData.quantity || 0) *
    Number(formData.unitPrice || 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const productName = formData.productName.trim();
    const quantity = Number(formData.quantity);
    const unitPrice = Number(formData.unitPrice);

    if (!productName) {
      setError("Please enter the product name.");
      return;
    }

    if (!formData.quantity || quantity < 1) {
      setError("Quantity must be at least 1.");
      return;
    }

    if (
      formData.unitPrice === "" ||
      Number.isNaN(unitPrice) ||
      unitPrice < 0
    ) {
      setError("Please enter a valid unit price.");
      return;
    }

    if (!formData.paymentMethod) {
      setError("Please select a payment method.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        productName,
        quantity,
        unitPrice,
        paymentMethod: formData.paymentMethod,
      };

      if (isEditing) {
        await api.put(
          `/transactions/${transaction._id}`,
          payload
        );
      } else {
        await api.post(
          "/transactions",
          payload
        );
      }

      onSuccess();
    } catch (err) {
      console.error(
        "Transaction save error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to save transaction. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          if (!loading) {
            onClose();
          }
        }
      }}
    >
      <div
        className="transaction-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="transaction-modal-title"
      >

        {/* HEADER */}
        <div className="transaction-modal-header">

          <div className="modal-title-group">

            <div className="modal-icon">
              <FiShoppingBag />
            </div>

            <div>
              <span className="modal-eyebrow">
                SALES MANAGEMENT
              </span>

              <h2 id="transaction-modal-title">
                {isEditing
                  ? "Edit Transaction"
                  : "New Transaction"}
              </h2>

              <p>
                {isEditing
                  ? "Update the details of this sale."
                  : "Record a new POS sale."}
              </p>
            </div>

          </div>

          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close transaction modal"
          >
            <FiX />
          </button>

        </div>

        {/* FORM */}
        <form
          className="transaction-form"
          onSubmit={handleSubmit}
        >

          {/* ERROR */}
          {error && (
            <div className="form-error">
              <FiAlertCircle />
              <span>{error}</span>
            </div>
          )}

          {/* PRODUCT NAME */}
          <div className="form-group">

            <label htmlFor="productName">
              Product Name
            </label>

            <div className="input-with-icon">

              <FiShoppingBag />

              <input
                id="productName"
                name="productName"
                type="text"
                placeholder="e.g. Maltina"
                value={formData.productName}
                onChange={handleChange}
                disabled={loading}
                autoFocus
              />

            </div>

          </div>

          {/* QUANTITY + PRICE */}
          <div className="form-row">

            <div className="form-group">

              <label htmlFor="quantity">
                Quantity
              </label>

              <div className="input-with-icon">

                <FiHash />

                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={handleChange}
                  disabled={loading}
                />

              </div>

            </div>

            <div className="form-group">

              <label htmlFor="unitPrice">
                Unit Price
              </label>

              <div className="currency-input">

                <span className="currency-symbol">
                  ₦
                </span>

                <input
                  id="unitPrice"
                  name="unitPrice"
                  type="number"
                  min="0"
                  step="50"
                  placeholder="0"
                  value={formData.unitPrice}
                  onChange={handleChange}
                  disabled={loading}
                />

              </div>

            </div>

          </div>

          {/* PAYMENT METHOD */}
          <div className="form-group">

            <label htmlFor="paymentMethod">
              Payment Method
            </label>

            <div className="select-with-icon">

              <FiCreditCard />

              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                disabled={loading}
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

          </div>

          {/* TOTAL */}
          <div className="transaction-total">

            <div className="total-left">

              <div className="total-icon">
                <FiDollarSign />
              </div>

              <div>
                <span>
                  Total Amount
                </span>

                <small>
                  {formData.quantity || 0} ×{" "}
                  {formatCurrency(
                    Number(
                      formData.unitPrice || 0
                    )
                  )}
                </small>
              </div>

            </div>

            <strong>
              {formatCurrency(totalAmount)}
            </strong>

          </div>

          {/* ACTIONS */}
          <div className="modal-actions">

            <button
              type="button"
              className="secondary-button modal-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button modal-save"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="button-spinner" />
                  Saving...
                </>
              ) : (
                <>
                  <FiCheck />
                  {isEditing
                    ? "Update Transaction"
                    : "Save Transaction"}
                </>
              )}

            </button>

          </div>

        </form>
      </div>
    </div>
  );
};

export default TransactionModal;