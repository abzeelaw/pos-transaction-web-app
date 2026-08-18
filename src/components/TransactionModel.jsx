import { useEffect, useMemo, useState } from "react";
import {
  FiDollarSign,
  FiHash,
  FiPackage,
  FiSave,
  FiX,
  FiCreditCard,
  FiAlertCircle,
} from "react-icons/fi";
import api from "../services/api";

const TransactionModal = ({
  transaction = null,
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

  /*
   * Populate form when editing
   */
  useEffect(() => {
    if (transaction) {
      setFormData({
        productName: transaction.productName || "",
        quantity: transaction.quantity ?? "",
        unitPrice: transaction.unitPrice ?? "",
        paymentMethod:
          transaction.paymentMethod || "cash",
      });
    }
  }, [transaction]);

  /*
   * Calculate total
   */
  const totalAmount = useMemo(() => {
    const quantity = Number(formData.quantity) || 0;
    const unitPrice = Number(formData.unitPrice) || 0;

    return quantity * unitPrice;
  }, [formData.quantity, formData.unitPrice]);

  /*
   * Currency formatter
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  /*
   * Handle input changes
   */
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

  /*
   * Submit
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const productName = formData.productName.trim();
    const quantity = Number(formData.quantity);
    const unitPrice = Number(formData.unitPrice);

    /*
     * Validation
     */
    if (!productName) {
      setError("Please enter a product name.");
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
    } catch (requestError) {
      console.error(
        "Transaction save error:",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          "Unable to save transaction. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Close when clicking overlay
   */
  const handleOverlayClick = (event) => {
    if (
      event.target === event.currentTarget &&
      !loading
    ) {
      onClose();
    }
  };

  return (
    <div
      className="modal-overlay"
      onMouseDown={handleOverlayClick}
    >
      <div
        className="transaction-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="transaction-modal-title"
      >
        {/* Header */}

        <div className="modal-header">

          <div className="modal-title-wrapper">

            <div className="modal-title-icon">
  <FiPackage />
</div>

            <div className="modal-header-content">

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
            className="modal-close"
            onClick={onClose}
            disabled={loading}
            aria-label="Close modal"
          >
            <FiX />
          </button>

        </div>


        {/* Form */}

        <form
          className="transaction-form"
          onSubmit={handleSubmit}
        >

          <div className="modal-body">

            {error && (
              <div className="form-error">
                <FiAlertCircle />

                <span>
                  {error}
                </span>
              </div>
            )}


            {/* Product */}

            <div className="form-group">

              <label htmlFor="productName">
                Product name
              </label>

              <div className="input-wrapper">

                <FiPackage />

                <input
                  id="productName"
                  name="productName"
                  type="text"
                  placeholder="e.g. Maltina"
                  value={formData.productName}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="off"
                />

              </div>

            </div>


            {/* Quantity + Price */}

            <div className="form-row">

              <div className="form-group">

                <label htmlFor="quantity">
                  Quantity
                </label>

                <div className="input-wrapper">

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
                  Unit price
                </label>

                <div className="input-wrapper">

                  <FiDollarSign />

                  <input
                    id="unitPrice"
                    name="unitPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={formData.unitPrice}
                    onChange={handleChange}
                    disabled={loading}
                  />

                </div>

              </div>

            </div>


            {/* Payment */}

            <div className="form-group">

              <label htmlFor="paymentMethod">
                Payment method
              </label>

              <div className="input-wrapper">

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


            {/* Total */}

            <div className="transaction-total">

              <div>
                <span>
                  Total amount
                </span>

                <small>
                  {formData.quantity || 0} ×{" "}
                  {formatCurrency(
                    Number(formData.unitPrice) || 0
                  )}
                </small>
              </div>

              <strong>
                {formatCurrency(totalAmount)}
              </strong>

            </div>

          </div>


          {/* Footer */}

          <div className="modal-footer">

            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button modal-submit"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="button-spinner" />
                  Saving...
                </>
              ) : (
                <>
                  <FiSave />
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