import { useEffect, useState } from "react";
import {
  FiX,
  FiShoppingBag,
  FiCheck,
} from "react-icons/fi";
import toast from "react-hot-toast";
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

  /*
   * Populate form when editing
   */
  useEffect(() => {
    if (transaction) {
      setFormData({
        productName:
          transaction.productName || "",

        quantity:
          transaction.quantity ?? "",

        unitPrice:
          transaction.unitPrice ?? "",

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

    setError("");
  }, [transaction]);


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
   * Calculate total
   */
  const totalAmount =
    Number(formData.quantity || 0) *
    Number(formData.unitPrice || 0);


  /*
   * Format Nigerian currency
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount);
  };


  /*
   * Submit transaction
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    /*
     * Product validation
     */
    if (!formData.productName.trim()) {
      const message =
        "Please enter the product name.";

      setError(message);
      toast.error(message);

      return;
    }


    /*
     * Quantity validation
     */
    if (
      formData.quantity === "" ||
      Number(formData.quantity) < 1
    ) {
      const message =
        "Quantity must be at least 1.";

      setError(message);
      toast.error(message);

      return;
    }


    /*
     * Unit price validation
     */
    if (
      formData.unitPrice === "" ||
      Number(formData.unitPrice) < 0
    ) {
      const message =
        "Please enter a valid unit price.";

      setError(message);
      toast.error(message);

      return;
    }


    try {
      setLoading(true);

      const payload = {
        productName:
          formData.productName.trim(),

        quantity:
          Number(formData.quantity),

        unitPrice:
          Number(formData.unitPrice),

        paymentMethod:
          formData.paymentMethod,
      };


      /*
       * EDIT
       */
      if (isEditing) {
        await api.put(
          `/transactions/${transaction._id}`,
          payload
        );

        toast.success(
          "Transaction updated successfully"
        );
      }

      /*
       * CREATE
       */
      else {
        await api.post(
          "/transactions",
          payload
        );

        toast.success(
          "Transaction saved successfully"
        );
      }


      /*
       * Notify parent
       */
      onSuccess();

    } catch (err) {
      console.error(
        "Transaction save error:",
        err
      );

      const message =
        err.response?.data?.message ||
        "Unable to save transaction. Please try again.";

      setError(message);

      toast.error(message);

    } finally {
      setLoading(false);
    }
  };


  /*
   * Close modal with Escape key
   */
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [loading, onClose]);


  return (
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
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

        {/* =========================
            HEADER
        ========================== */}

        <div className="transaction-modal-header">

          <div className="modal-title-group">

            <div className="modal-icon">
              <FiShoppingBag />
            </div>

            <div>

              <h2 id="transaction-modal-title">
                {isEditing
                  ? "Edit Transaction"
                  : "New Transaction"}
              </h2>

              <p>
                {isEditing
                  ? "Update the transaction details below."
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


        {/* =========================
            FORM
        ========================== */}

        <form
          className="transaction-form"
          onSubmit={handleSubmit}
        >

          {/* ERROR */}

          {error && (
            <div
              className="form-error"
              role="alert"
            >
              {error}
            </div>
          )}


          {/* PRODUCT */}

          <div className="form-group">

            <label htmlFor="productName">
              Product Name
            </label>

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


          {/* QUANTITY + PRICE */}

          <div className="form-row">

            <div className="form-group">

              <label htmlFor="quantity">
                Quantity
              </label>

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


            <div className="form-group">

              <label htmlFor="unitPrice">
                Unit Price
              </label>

              <div className="currency-input">

                <span>₦</span>

                <input
                  id="unitPrice"
                  name="unitPrice"
                  type="number"
                  min="0"
                  step="1"
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


          {/* TOTAL */}

          <div className="transaction-total">

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