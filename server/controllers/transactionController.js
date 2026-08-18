import Transaction from "../models/Transaction.js";

export const createTransaction = async (req, res) => {
  try {
    const {
      productName,
      quantity,
      unitPrice,
      paymentMethod,
    } = req.body;

    if (
      !productName ||
      quantity === undefined ||
      unitPrice === undefined ||
      !paymentMethod
    ) {
      return res.status(400).json({
        message: "All transaction fields are required",
      });
    }

    const totalAmount =
      Number(quantity) * Number(unitPrice);

    const transaction = await Transaction.create({
      user: req.user._id,
      productName,
      quantity,
      unitPrice,
      totalAmount,
      paymentMethod,
    });

    res.status(201).json({
      message: "Transaction created successfully",
      transaction,
    });
  } catch (error) {
    console.error("Create transaction error:", error);

    res.status(500).json({
      message: "Server error while creating transaction",
    });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.json({
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error("Get transactions error:", error);

    res.status(500).json({
      message: "Server error while fetching transactions",
    });
  }
};

export const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    res.json({
      transaction,
    });
  } catch (error) {
    console.error("Get transaction error:", error);

    res.status(500).json({
      message: "Server error while fetching transaction",
    });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const {
      productName,
      quantity,
      unitPrice,
      paymentMethod,
    } = req.body;

    const totalAmount =
      Number(quantity) * Number(unitPrice);

    const transaction = await Transaction.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      {
        productName,
        quantity,
        unitPrice,
        totalAmount,
        paymentMethod,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    res.json({
      message: "Transaction updated successfully",
      transaction,
    });
  } catch (error) {
    console.error("Update transaction error:", error);

    res.status(500).json({
      message: "Server error while updating transaction",
    });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    res.json({
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    console.error("Delete transaction error:", error);

    res.status(500).json({
      message: "Server error while deleting transaction",
    });
  }
};
