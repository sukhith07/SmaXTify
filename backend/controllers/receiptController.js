const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

const ReceiptScan = require("../models/ReceiptScan");
const Expense = require("../models/Expense");

const {
  updateTransaction,
  deleteTransaction,
} = require("../services/transactionService");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const parseAmount = (value, fallback = 0) => {
  if (value === undefined) return fallback;
  if (value === null || value === "") return null;

  const amount = Number(value);

  return Number.isFinite(amount) && amount >= 0 ? amount : null;
};

const parseDate = (value, fallback) => {
  if (value === undefined) return fallback;

  const parsedDate = new Date(value);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const parseItems = (items, fallback = []) => {
  if (items === undefined) return fallback;
  if (!Array.isArray(items)) return null;

  const parsedItems = [];

  for (const item of items) {
    if (!item || typeof item.name !== "string" || !item.name.trim()) {
      continue;
    }

    const quantity =
      item.quantity === undefined ? 1 : Number(item.quantity);

    const price = item.price === undefined ? 0 : Number(item.price);

    if (
      !Number.isFinite(quantity) ||
      quantity < 0 ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      return null;
    }

    const total =
      item.total === undefined
        ? quantity * price
        : Number(item.total);

    if (!Number.isFinite(total) || total < 0) {
      return null;
    }

    parsedItems.push({
      name: item.name.trim(),
      quantity,
      price,
      total,
    });
  }

  return parsedItems;
};

const getOwnedReceipt = async (receiptId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(receiptId)) {
    return null;
  }

  return ReceiptScan.findOne({
    _id: receiptId,
    user: userId,
  });
};

const getLinkedTransaction = async (receipt, userId) => {
  if (!receipt.transaction) return null;

  const transaction = await Expense.findOne({
    _id: receipt.transaction,
    user: userId,
  });

  if (!transaction) {
    throw new Error(
      "The transaction linked to this receipt was not found."
    );
  }

  return transaction;
};

const syncReceiptTotal = async (receipt, transaction) => {
  if (!receipt || !transaction) return;

  const transactionAmount = Number(transaction.amount);

  if (
    Number.isFinite(transactionAmount) &&
    transactionAmount >= 0 &&
    Number(receipt.total) !== transactionAmount
  ) {
    receipt.total = transactionAmount;
    await receipt.save();
  }
};

const validateCloudinaryImage = (
  imageUrl,
  imagePublicId,
  userId
) => {
  if (!imageUrl && !imagePublicId) {
    return {
      valid: true,
      imageUrl: "",
      imagePublicId: "",
    };
  }

  if (
    typeof imageUrl !== "string" ||
    typeof imagePublicId !== "string" ||
    !imageUrl.trim() ||
    !imagePublicId.trim()
  ) {
    return {
      valid: false,
    };
  }

  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME?.trim();

  if (!cloudName) {
    return {
      valid: false,
    };
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(imageUrl.trim());
  } catch {
    return {
      valid: false,
    };
  }

  const expectedPrefix = `smaxtify/receipts/${userId}/`;

  const expectedPathPrefix = `/${cloudName}/image/upload/`;

  if (
    parsedUrl.protocol !== "https:" ||
    parsedUrl.hostname !== "res.cloudinary.com" ||
    !parsedUrl.pathname.startsWith(expectedPathPrefix) ||
    !imagePublicId.trim().startsWith(expectedPrefix)
  ) {
    return {
      valid: false,
    };
  }

  return {
    valid: true,
    imageUrl: imageUrl.trim(),
    imagePublicId: imagePublicId.trim(),
  };
};

const deleteCloudinaryImage = async (
  imagePublicId,
  userId
) => {
  if (!imagePublicId) return;

  const expectedPrefix = `smaxtify/receipts/${userId}/`;

  if (!imagePublicId.startsWith(expectedPrefix)) {
    throw new Error("Invalid receipt image reference.");
  }

  const result = await cloudinary.uploader.destroy(
    imagePublicId,
    {
      resource_type: "image",
      invalidate: true,
    }
  );

  if (
    result.result !== "ok" &&
    result.result !== "not found"
  ) {
    throw new Error(
      "Unable to delete the receipt image from Cloudinary."
    );
  }
};

const saveReceiptScan = async (req, res) => {
  try {
    const {
      merchant,
      date,
      currency,
      subtotal,
      tax,
      total,
      items,
      transaction,
      imageUrl,
      imagePublicId,
    } = req.body;

    const parsedTotal = parseAmount(total);

    if (parsedTotal === null) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid receipt total.",
      });
    }

    const parsedDate = parseDate(date, new Date());

    if (!parsedDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid receipt date.",
      });
    }

    const parsedSubtotal = parseAmount(subtotal);
    const parsedTax = parseAmount(tax);

    if (
      parsedSubtotal === null ||
      parsedTax === null
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Subtotal and tax must be valid non-negative amounts.",
      });
    }

    const receiptItems = parseItems(items);

    if (!receiptItems) {
      return res.status(400).json({
        success: false,
        message:
          "Receipt items must contain valid quantities and prices.",
      });
    }

    const image = validateCloudinaryImage(
      imageUrl,
      imagePublicId,
      req.user.id
    );

    if (!image.valid) {
      return res.status(400).json({
        success: false,
        message: "Invalid receipt image details.",
      });
    }

    let linkedTransaction = null;

    if (transaction) {
      if (
        !mongoose.Types.ObjectId.isValid(transaction)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid transaction ID.",
        });
      }

      linkedTransaction = await Expense.findOne({
        _id: transaction,
        user: req.user.id,
      });

      if (!linkedTransaction) {
        return res.status(404).json({
          success: false,
          message: "Linked transaction not found.",
        });
      }

      if (linkedTransaction.type !== "Expense") {
        return res.status(400).json({
          success: false,
          message:
            "A receipt can only be linked to an expense transaction.",
        });
      }
    }

    const receipt = await ReceiptScan.create({
      user: req.user.id,

      transaction: linkedTransaction
        ? linkedTransaction._id
        : null,

      merchant:
        typeof merchant === "string"
          ? merchant.trim()
          : "",

      date: parsedDate,

      currency:
        typeof currency === "string" &&
        currency.trim()
          ? currency.trim().toUpperCase()
          : "INR",

      subtotal: parsedSubtotal,
      tax: parsedTax,
      total: parsedTotal,

      items: receiptItems,

      imageUrl: image.imageUrl,
      imagePublicId: image.imagePublicId,
    });

    return res.status(201).json({
      success: true,
      message: "Receipt saved successfully.",
      receipt,
    });
  } catch (error) {
    console.error("Save receipt error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save receipt.",
    });
  }
};

const getReceiptScans = async (req, res) => {
  try {
    const receipts = await ReceiptScan.find({
      user: req.user.id,
    })
      .sort({ createdAt: -1 })
      .limit(50);

    const transactionIds = receipts
      .filter((receipt) => receipt.transaction)
      .map((receipt) => receipt.transaction);

    const transactions = transactionIds.length
      ? await Expense.find({
          _id: {
            $in: transactionIds,
          },
          user: req.user.id,
          type: "Expense",
        }).select("_id amount")
      : [];

    const transactionMap = new Map(
      transactions.map((transaction) => [
        transaction._id.toString(),
        transaction,
      ])
    );

    const syncedReceipts = await Promise.all(
      receipts.map(async (receipt) => {
        if (receipt.transaction) {
          const linkedTransaction =
            transactionMap.get(
              receipt.transaction.toString()
            );

          if (linkedTransaction) {
            await syncReceiptTotal(
              receipt,
              linkedTransaction
            );
          }
        }

        return receipt.toObject();
      })
    );

    return res.status(200).json({
      success: true,
      receipts: syncedReceipts,
    });
  } catch (error) {
    console.error(
      "Get receipt history error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load receipt history.",
    });
  }
};

const updateReceiptScan = async (req, res) => {
  try {
    const receipt = await getOwnedReceipt(
      req.params.id,
      req.user.id
    );

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: "Receipt not found.",
      });
    }

    const {
      merchant,
      date,
      currency,
      subtotal,
      tax,
      total,
      items,
    } = req.body;

    const parsedTotal = parseAmount(
      total,
      receipt.total
    );

    const parsedSubtotal = parseAmount(
      subtotal,
      receipt.subtotal
    );

    const parsedTax = parseAmount(
      tax,
      receipt.tax
    );

    const parsedDate = parseDate(
      date,
      receipt.date
    );

    const parsedItems = parseItems(
      items,
      receipt.items
    );

    if (
      parsedTotal === null ||
      parsedSubtotal === null ||
      parsedTax === null ||
      !parsedDate ||
      !parsedItems
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide valid receipt details.",
      });
    }

    const linkedTransaction =
      await getLinkedTransaction(
        receipt,
        req.user.id
      );

    if (linkedTransaction) {
      await updateTransaction(
        linkedTransaction,
        {
          title:
            typeof merchant === "string" &&
            merchant.trim()
              ? merchant.trim()
              : linkedTransaction.title,

          amount: parsedTotal,
          date: parsedDate,
        },
        req.user.id
      );
    }

    receipt.merchant =
      merchant === undefined
        ? receipt.merchant
        : typeof merchant === "string"
        ? merchant.trim()
        : "";

    receipt.date = parsedDate;

    receipt.currency =
      typeof currency === "string" &&
      currency.trim()
        ? currency.trim().toUpperCase()
        : receipt.currency;

    receipt.subtotal = parsedSubtotal;
    receipt.tax = parsedTax;
    receipt.total = parsedTotal;
    receipt.items = parsedItems;

    await receipt.save();

    return res.status(200).json({
      success: true,
      message: "Receipt updated successfully.",
      receipt,
    });
  } catch (error) {
    console.error(
      "Update receipt error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Unable to update receipt.",
    });
  }
};

const deleteReceiptScan = async (req, res) => {
  try {
    const receipt = await getOwnedReceipt(
      req.params.id,
      req.user.id
    );

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: "Receipt not found.",
      });
    }

    const linkedTransaction =
      await getLinkedTransaction(
        receipt,
        req.user.id
      );

    if (linkedTransaction) {
      await deleteTransaction(
        linkedTransaction,
        req.user.id
      );
    }

    const imagePublicId =
      receipt.imagePublicId;

    await receipt.deleteOne();

    if (imagePublicId) {
      try {
        await deleteCloudinaryImage(
          imagePublicId,
          req.user.id
        );
      } catch (imageError) {
        console.error(
          "Cloudinary receipt image deletion error:",
          imageError
        );
      }
    }

    return res.status(200).json({
      success: true,
      message:
        "Receipt deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete receipt error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Unable to delete receipt.",
    });
  }
};

module.exports = {
  saveReceiptScan,
  getReceiptScans,
  updateReceiptScan,
  deleteReceiptScan,
};