import { useEffect, useState } from "react";
import {
  FiX,
  FiSave,
  FiPackage,
  FiHash,
  FiDollarSign,
  FiCreditCard,
} from "react-icons/fi";
import api from "../services/api";

const TransactionModel = ({
  transaction,
  onClose,
  onSaved,
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

  // ===============================
  // LOAD EDIT DATA
  // ===============================

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

  // ===============================
  // HANDLE INPUT
  // ===============================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  // ===============================
  // CALCULATE TOTAL
  // ===============================

  const totalAmount =
    Number(formData.quantity || 0) *
    Number(formData.unitPrice || 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
  };

  // ===============================
  // SUBMIT
  // ===============================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const productName =
      formData.productName.trim();

    const quantity = Number(
      formData.quantity
    );

    const unitPrice = Number(
      formData.unitPrice
    );

    // Validation

    if (!productName) {
      setError(
        "Please enter the product name."
      );
      return;
    }

    if (
      !Number.isFinite(quantity) ||
      quantity < 1
    ) {
      setError(
        "Quantity must be at least 1."
      );
      return;
    }

    if (
      !Number.isFinite(unitPrice) ||
      unitPrice < 0
    ) {
      setError(
        "Please enter a valid unit price."
      );
      return;
    }

    if (
      !["cash", "transfer", "pos"].includes(
        formData.paymentMethod
      )
    ) {
      setError(
        "Please select a valid payment method."
      );
      return;
    }

    try {
      setLoading(true);

      const payload = {
        productName,
        quantity,
        unitPrice,
        paymentMethod:
          formData.paymentMethod,
      };

      console.log(
        "Sending transaction:",
        payload
      );

      let response;

      // CREATE

      if (!isEditing) {
        response = await api.post(
          "/transactions",
          payload
        );
      }

      // UPDATE

      else {
        response = await api.put(
          `/transactions/${transaction._id}`,
          payload
        );
      }

      console.log(
        "Transaction response:",
        response.data
      );

      // Refresh parent list

      await onSaved();

    } catch (error) {
      console.error(
        "FULL TRANSACTION ERROR:",
        error
      );

      console.error(
        "ERROR RESPONSE:",
        error.response
      );

      console.error(
        "ERROR DATA:",
        error.response?.data
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to save transaction."
      );
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // RENDER
  // ===============================

  return (
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget
        ) {
          onClose();
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

        <div className="modal-header">

          <div>

            <p className="modal-eyebrow">
              {isEditing
                ? "Update Sale"
                : "New Sale"}
            </p>

            <h2 id="transaction-modal-title">
              {isEditing
                ? "Edit Transaction"
                : "Record Transaction"}
            </h2>

            <p>
              {isEditing
                ? "Update the details of this transaction."
                : "Enter the details of your POS sale."}
            </p>

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


        {/* ERROR */}

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}


        {/* FORM */}

        <form
          className="transaction-form"
          onSubmit={handleSubmit}
        >

          {/* PRODUCT */}

          <div className="form-group">

            <label htmlFor="productName">
              Product Name
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


          {/* QUANTITY + UNIT PRICE */}

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
                  placeholder="e.g. 5"
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

              <div className="input-wrapper">

                <FiDollarSign />

                <input
                  id="unitPrice"
                  name="unitPrice"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="e.g. 700"
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
                  Transfer
                </option>

                <option value="pos">
                  POS
                </option>

              </select>

            </div>

          </div>


          {/* TOTAL */}

          <div className="transaction-total">

            <div>

              <span>
                Total Amount
              </span>

              <small>
                Quantity × Unit Price
              </small>

            </div>

            <strong>
              {formatCurrency(
                totalAmount
              )}
            </strong>

          </div>


          {/* ACTIONS */}

          <div className="modal-actions">

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
              className="primary-button"
              disabled={loading}
            >

              <FiSave />

              {loading
                ? "Saving..."
                : isEditing
                ? "Update Transaction"
                : "Save Transaction"}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default TransactionModel;