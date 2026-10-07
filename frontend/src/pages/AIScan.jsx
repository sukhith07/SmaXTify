import { useEffect, useRef, useState } from "react";

import { toast } from "react-toastify";

import {
  FaReceipt,
  FaCloudUploadAlt,
  FaImage,
  FaTrash,
  FaSearch,
  FaHistory,
  FaStore,
  FaCalendarAlt,
  FaRupeeSign,
  FaFileInvoice,
  FaCamera,
  FaTimes,
  FaSyncAlt,
  FaCheckCircle,
  FaEdit,
  FaExclamationTriangle,
  FaSave,
} from "react-icons/fa";

import API from "../services/api";

import Navbar from "../components/layout/Navbar";

import Sidebar from "../components/layout/Sidebar";

import "../components/styles/aiScan.css";

const normalizeDate = (value) => {
  if (!value) return "";

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return "";

    return value.toISOString().slice(0, 10);
  }

  const dateString = String(value).trim();

  if (!dateString) return "";

  let year;
  let month;
  let day;
  let match;

  match = dateString.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);

  if (match) {
    day = Number(match[1]);
    month = Number(match[2]);
    year = Number(match[3]);
  } else {
    match = dateString.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);

    if (match) {
      year = Number(match[1]);
      month = Number(match[2]);
      day = Number(match[3]);
    } else {
      const parsed = new Date(dateString);

      if (Number.isNaN(parsed.getTime())) return "";

      return parsed.toISOString().slice(0, 10);
    }
  }

  const checkDate = new Date(Date.UTC(year, month - 1, day));

  if (
    checkDate.getUTCFullYear() !== year ||
    checkDate.getUTCMonth() !== month - 1 ||
    checkDate.getUTCDate() !== day
  ) {
    return "";
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`;
};

function AIScan() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);

  const [isScanning, setIsScanning] = useState(false);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  const [editingReceiptId, setEditingReceiptId] = useState("");
  const [deletingReceiptId, setDeletingReceiptId] = useState("");

  const [receipt, setReceipt] = useState(null);
  const [receiptHistory, setReceiptHistory] = useState([]);

  const [accounts, setAccounts] = useState([]);

  const [transactionType, setTransactionType] = useState("Expense");
  const [category, setCategory] = useState("");
  const [accountId, setAccountId] = useState("");

  const [transactionSaved, setTransactionSaved] = useState(false);
  const [savedTransactionId, setSavedTransactionId] = useState("");

  const [viewingReceiptImage, setViewingReceiptImage] = useState(null);

  const [editingReceipt, setEditingReceipt] = useState(null);

  const [editForm, setEditForm] = useState({
    merchant: "",
    date: "",
    total: "",
  });

  const [deleteReceipt, setDeleteReceipt] = useState(null);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedFile);

    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  useEffect(() => {
    let isActive = true;

    const loadData = async () => {
      try {
        const [accountResponse, receiptResponse] = await Promise.all([
          API.get("/accounts"),
          API.get("/ai/receipts"),
        ]);

        const accountList = Array.isArray(accountResponse.data)
          ? accountResponse.data
          : Array.isArray(accountResponse.data?.accounts)
          ? accountResponse.data.accounts
          : [];

        if (isActive) {
          setAccounts(accountList);
          setAccountId(accountList[0]?._id || accountList[0]?.id || "");
        }

        if (!receiptResponse.data?.success) {
          throw new Error(
            receiptResponse.data?.message ||
              "Unable to load receipt history."
          );
        }

        if (isActive) {
          setReceiptHistory(
            Array.isArray(receiptResponse.data.receipts)
              ? receiptResponse.data.receipts
              : []
          );
        }
      } catch (error) {
        if (isActive) {
          toast.error(
            error.response?.data?.message ||
              error.message ||
              "Unable to load receipt data."
          );
        }
      } finally {
        if (isActive) {
          setIsHistoryLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!isCameraOpen) return undefined;

    let isActive = true;
    let stream;

    const startCamera = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        toast.error(
          "Camera access is unavailable. Use HTTPS or localhost, or upload an image."
        );

        setIsCameraOpen(false);

        return;
      }

      setIsCameraLoading(true);

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: {
              ideal: "environment",
            },
          },
        });

        if (!isActive) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        cameraStreamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        if (isActive) {
          if (
            error.name === "NotAllowedError" ||
            error.name === "PermissionDeniedError"
          ) {
            toast.error("Please allow camera permission in your browser.");
          } else if (
            error.name === "NotFoundError" ||
            error.name === "DevicesNotFoundError"
          ) {
            toast.error("No camera was found on this device.");
          } else {
            toast.error("Unable to access the camera. Please try again.");
          }

          setIsCameraOpen(false);
        }
      } finally {
        if (isActive) {
          setIsCameraLoading(false);
        }
      }
    };

    startCamera();

    return () => {
      isActive = false;

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      if (cameraStreamRef.current === stream) {
        cameraStreamRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [isCameraOpen]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key !== "Escape") return;

      if (editingReceipt && !editingReceiptId) {
        setEditingReceipt(null);
      }

      if (deleteReceipt && !deletingReceiptId) {
        setDeleteReceipt(null);
      }

      if (viewingReceiptImage) {
        setViewingReceiptImage(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [
    editingReceipt,
    editingReceiptId,
    deleteReceipt,
    deletingReceiptId,
    viewingReceiptImage,
  ]);

  const resetScanForm = () => {
    setSelectedFile(null);
    setReceipt(null);
    setCategory("");
    setTransactionSaved(false);
    setSavedTransactionId("");
    setIsCategorizing(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a receipt image.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10 MB.");
      return;
    }

    setSelectedFile(file);
    setReceipt(null);
    setCategory("");
    setTransactionSaved(false);
    setSavedTransactionId("");
  };

  const handleFileChange = (event) => {
    handleFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    handleFile(event.dataTransfer.files?.[0]);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setReceipt(null);
    setCategory("");
    setTransactionSaved(false);
    setSavedTransactionId("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openFilePicker = () => fileInputRef.current?.click();

  const openCamera = () => setIsCameraOpen(true);

  const closeCamera = () => setIsCameraOpen(false);

  const capturePhoto = () => {
    const video = videoRef.current;

    if (!video || !video.videoWidth || !video.videoHeight) {
      toast.error("Camera is not ready. Please try again.");
      return;
    }

    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      toast.error("Unable to capture the photo.");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          toast.error("Unable to capture the photo.");
          return;
        }

        const photoFile = new File([blob], `receipt-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });

        handleFile(photoFile);
        setIsCameraOpen(false);
      },
      "image/jpeg",
      0.92
    );
  };

  const categorizeReceipt = async (receiptData, type = "Expense") => {
    const itemDetails = Array.isArray(receiptData.items)
      ? receiptData.items
          .map((item) => {
            const name = item.name || "";

            const quantity = item.quantity
              ? `quantity ${item.quantity}`
              : "";

            return [name, quantity].filter(Boolean).join(" ");
          })
          .filter(Boolean)
          .join(", ")
      : "";

    const title = [receiptData.merchant || "", itemDetails]
      .filter(Boolean)
      .join(" - ");

    if (!title.trim()) {
      throw new Error("No merchant or item details were detected.");
    }

    const response = await API.post("/ai/categorize", {
      title,
      type,
    });

    const detectedCategory =
      response.data?.category ||
      response.data?.result?.category ||
      response.data?.data?.category;

    if (
      typeof detectedCategory !== "string" ||
      !detectedCategory.trim()
    ) {
      throw new Error(
        response.data?.message || "AI could not determine the category."
      );
    }

    return detectedCategory.trim();
  };

  const handleScan = async () => {
    if (!selectedFile) {
      toast.error("Please select a receipt image first.");
      return;
    }

    if (isScanning) return;

    const formData = new FormData();

    formData.append("receipt", selectedFile);

    setIsScanning(true);
    setIsCategorizing(false);
    setReceipt(null);
    setCategory("");
    setTransactionSaved(false);
    setSavedTransactionId("");

    try {
      const response = await API.post("/ai/scan-receipt", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.data?.success || !response.data?.receipt) {
        throw new Error(
          response.data?.message || "Unable to scan receipt."
        );
      }

      const scannedReceipt = response.data.receipt;

      setReceipt(scannedReceipt);
      setIsCategorizing(true);

      try {
        const detectedCategory = await categorizeReceipt(
          scannedReceipt,
          transactionType
        );

        setCategory(detectedCategory);

        toast.success(
          `Receipt scanned. AI category: ${detectedCategory}`
        );
      } catch (categoryError) {
        setCategory("");

        toast.warning(
          categoryError.response?.data?.message ||
            "Receipt scanned, but AI could not determine the category. Please enter it manually."
        );
      } finally {
        setIsCategorizing(false);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to scan receipt. Please try again."
      );
    } finally {
      setIsScanning(false);
    }
  };

  const handleTransactionTypeChange = async (type) => {
    setTransactionType(type);

    if (!receipt || transactionSaved) return;

    setCategory("");
    setIsCategorizing(true);

    try {
      const detectedCategory = await categorizeReceipt(receipt, type);

      setCategory(detectedCategory);

      toast.success(`AI category updated: ${detectedCategory}`);
    } catch (error) {
      setCategory("");

      toast.warning(
        error.response?.data?.message ||
          "Unable to determine the category. Please enter it manually."
      );
    } finally {
      setIsCategorizing(false);
    }
  };

  const updateReceiptField = (field, value) => {
    setReceipt((current) =>
      current ? { ...current, [field]: value } : current
    );
  };

  const handleSaveReceipt = async () => {
    if (!receipt) {
      toast.error("Please scan a receipt before saving.");
      return;
    }

    const total = Number(receipt.total);

    if (
      receipt.total === null ||
      receipt.total === undefined ||
      receipt.total === "" ||
      !Number.isFinite(total) ||
      total <= 0
    ) {
      toast.error("Please enter a valid amount greater than zero.");
      return;
    }

    if (!accountId) {
      toast.error("Please select an account.");
      return;
    }

    if (!category.trim()) {
      toast.error("Please enter a transaction category.");
      return;
    }

    const normalizedDate =
      normalizeDate(receipt.date) ||
      new Date().toISOString().slice(0, 10);

    if (receipt.date && !normalizeDate(receipt.date)) {
      toast.error(
        "Invalid receipt date. Please enter the date as DD-MM-YYYY or YYYY-MM-DD."
      );
      return;
    }

    const receiptPayload = {
      merchant: receipt.merchant || "",
      date: normalizedDate,
      currency: receipt.currency || "INR",
      subtotal: receipt.subtotal ?? 0,
      tax: receipt.tax ?? 0,
      total,
      items: Array.isArray(receipt.items) ? receipt.items : [],
      imageUrl: receipt.imageUrl || "",
      imagePublicId: receipt.imagePublicId || "",
    };

    setIsSaving(true);

    try {
      let transactionId = savedTransactionId;

      if (!transactionSaved) {
        const transactionPayload = {
          title: receipt.merchant?.trim() || "Receipt Transaction",
          amount: total,
          category: category.trim(),
          type: transactionType,
          date: normalizedDate,
          notes: `Added from AI Receipt Scanner (${receipt.currency || "INR"})`,
          account: accountId,
        };

        const transactionResponse = await API.post(
          "/expenses",
          transactionPayload
        );

        if (
          !transactionResponse.data?.success ||
          !transactionResponse.data?.expense?._id
        ) {
          throw new Error(
            transactionResponse.data?.message ||
              "Unable to create the transaction."
          );
        }

        transactionId = transactionResponse.data.expense._id;

        setSavedTransactionId(transactionId);
        setTransactionSaved(true);
      }

      if (transactionType === "Expense" && transactionId) {
        receiptPayload.transaction = transactionId;
      }

      const receiptResponse = await API.post(
        "/ai/receipts",
        receiptPayload
      );

      if (
        !receiptResponse.data?.success ||
        !receiptResponse.data?.receipt
      ) {
        throw new Error(
          receiptResponse.data?.message ||
            "Unable to save receipt history."
        );
      }

      const savedReceipt = receiptResponse.data.receipt;

      setReceiptHistory((current) => [
        savedReceipt,
        ...current.filter((item) => item._id !== savedReceipt._id),
      ]);

      toast.success(
        transactionSaved
          ? "Receipt saved successfully."
          : "Transaction and receipt saved successfully."
      );

      resetScanForm();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to save receipt. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const openEditReceipt = (item) => {
    if (!item?._id || editingReceiptId || deletingReceiptId) return;

    setEditForm({
      merchant: item.merchant || "",
      date: item.date ? normalizeDate(item.date) : "",
      total:
        item.total === null || item.total === undefined
          ? ""
          : String(item.total),
    });

    setEditingReceipt(item);
  };

  const closeEditReceipt = () => {
    if (editingReceiptId) return;

    setEditingReceipt(null);

    setEditForm({
      merchant: "",
      date: "",
      total: "",
    });
  };

  const handleEditFormChange = (field, value) => {
    setEditForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleEditHistoryReceipt = async () => {
    if (!editingReceipt?._id || editingReceiptId) return;

    const merchant = editForm.merchant.trim();

    if (!merchant) {
      toast.error("Please enter a merchant name.");
      return;
    }

    const normalizedDate = normalizeDate(editForm.date);

    if (!normalizedDate) {
      toast.error(
        "Please enter a valid date as DD-MM-YYYY or YYYY-MM-DD."
      );
      return;
    }

    const total = Number(editForm.total);

    if (!Number.isFinite(total) || total <= 0) {
      toast.error("Please enter a valid amount greater than zero.");
      return;
    }

    const payload = {
      merchant,
      date: normalizedDate,
      total,
    };

    setEditingReceiptId(editingReceipt._id);

    try {
      const response = await API.put(
        `/ai/receipts/${editingReceipt._id}`,
        payload
      );

      if (!response.data?.success || !response.data?.receipt) {
        throw new Error(
          response.data?.message || "Unable to update receipt."
        );
      }

      const updatedReceipt = response.data.receipt;

      setReceiptHistory((current) =>
        current.map((receiptItem) =>
          receiptItem._id === editingReceipt._id
            ? updatedReceipt
            : receiptItem
        )
      );

      if (viewingReceiptImage?._id === editingReceipt._id) {
        setViewingReceiptImage(updatedReceipt);
      }

      setEditingReceipt(null);

      setEditForm({
        merchant: "",
        date: "",
        total: "",
      });

      toast.success("Receipt updated successfully.");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to update receipt."
      );
    } finally {
      setEditingReceiptId("");
    }
  };

  const openDeleteReceipt = (item) => {
    if (!item?._id || editingReceiptId || deletingReceiptId) return;

    setDeleteReceipt(item);
  };

  const closeDeleteReceipt = () => {
    if (deletingReceiptId) return;

    setDeleteReceipt(null);
  };

  const handleDeleteHistoryReceipt = async () => {
    if (!deleteReceipt?._id || deletingReceiptId) return;

    setDeletingReceiptId(deleteReceipt._id);

    try {
      const response = await API.delete(
        `/ai/receipts/${deleteReceipt._id}`
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Unable to delete receipt."
        );
      }

      setReceiptHistory((current) =>
        current.filter(
          (receiptItem) => receiptItem._id !== deleteReceipt._id
        )
      );

      if (viewingReceiptImage?._id === deleteReceipt._id) {
        setViewingReceiptImage(null);
      }

      setDeleteReceipt(null);

      toast.success("Receipt deleted successfully.");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to delete receipt."
      );
    } finally {
      setDeletingReceiptId("");
    }
  };

  const formatAmount = (amount) => {
    if (
      amount === null ||
      amount === undefined ||
      amount === ""
    ) {
      return "Not available";
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount)) return "Not available";

    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
    }).format(numericAmount);
  };

  const currencySymbol = (currency) => {
    if (!currency) return "₹";

    const normalized = currency.toUpperCase();

    if (["INR", "RS", "₹"].includes(normalized)) return "₹";

    if (["USD", "$"].includes(normalized)) return "$";

    if (["EUR", "€"].includes(normalized)) return "€";

    if (["GBP", "£"].includes(normalized)) return "£";

    return `${currency} `;
  };

  const formatHistoryDate = (date) => {
    if (!date) return "Date unavailable";

    const normalized = normalizeDate(date);

    if (!normalized) return String(date);

    const [year, month, day] = normalized.split("-").map(Number);

    return new Date(year, month - 1, day).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <div className="aiscan-page">
      <Sidebar />

      <div className="aiscan-content">
        <div className="aiscan-sticky-header">
          <Navbar />
        </div>

        <main className="aiscan-main">
          <section className="aiscan-page-header aiscan-animate">
            <div className="aiscan-page-header-icon">
              <FaReceipt />
            </div>

            <div className="aiscan-page-header-content">
              <h1>AI Receipt Scanner</h1>

              <p>
                Upload your receipt or take a photo to organize your
                transaction details.
              </p>
            </div>
          </section>

          <section className="aiscan-upload-section aiscan-animate aiscan-delay-1">
            <div className="aiscan-section-heading">
              <div>
                <h2>Upload Receipt</h2>

                <p>
                  Choose an image from your device or capture a
                  receipt using your camera.
                </p>
              </div>

              <div className="aiscan-heading-icon">
                <FaCloudUploadAlt />
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="aiscan-file-input"
              onChange={handleFileChange}
            />

            {!selectedFile ? (
              <div
                className={`aiscan-upload-area ${
                  isDragging ? "aiscan-upload-dragging" : ""
                }`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <div className="aiscan-upload-icon">
                  <FaCloudUploadAlt />
                </div>

                <h3>Choose how to add your receipt</h3>

                <p>
                  Upload an existing image or take a new photo
                </p>

                <div className="aiscan-upload-buttons">
                  <button
                    type="button"
                    className="aiscan-browse-btn"
                    onClick={openFilePicker}
                  >
                    <FaImage />
                    Upload Receipt
                  </button>

                  <button
                    type="button"
                    className="aiscan-browse-btn"
                    onClick={openCamera}
                  >
                    <FaCamera />
                    Take Photo
                  </button>
                </div>

                <span className="aiscan-upload-hint">
                  Supported image formats · Maximum size 10 MB
                </span>
              </div>
            ) : (
              <div className="aiscan-preview-card">
                <div className="aiscan-preview-header">
                  <div className="aiscan-file-info">
                    <div className="aiscan-file-icon">
                      <FaFileInvoice />
                    </div>

                    <div>
                      <h3>{selectedFile.name}</h3>

                      <p>
                        {(selectedFile.size / (1024 * 1024)).toFixed(
                          2
                        )}{" "}
                        MB
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="aiscan-remove-btn"
                    onClick={removeFile}
                    aria-label="Remove selected receipt"
                    title="Remove image"
                    disabled={isScanning || isSaving}
                  >
                    <FaTrash />
                  </button>
                </div>

                <div className="aiscan-image-preview">
                  <img
                    src={previewUrl}
                    alt="Selected receipt preview"
                  />
                </div>

                <div className="aiscan-preview-actions">
                  <button
                    type="button"
                    className="aiscan-change-btn"
                    onClick={openFilePicker}
                    disabled={isScanning || isSaving}
                  >
                    <FaImage />
                    Change Image
                  </button>

                  <button
                    type="button"
                    className="aiscan-change-btn"
                    onClick={openCamera}
                    disabled={isScanning || isSaving}
                  >
                    <FaCamera />
                    Take Photo
                  </button>

                  <button
                    type="button"
                    className="aiscan-scan-btn"
                    onClick={handleScan}
                    disabled={isScanning}
                    aria-busy={isScanning}
                  >
                    {isScanning ? (
                      <>
                        <FaSyncAlt className="aiscan-loading-icon" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <FaSearch />
                        AI Scan
                      </>
                    )}
                  </button>
                </div>

                {isScanning && (
                  <p className="aiscan-integration-note">
                    AI is analyzing your receipt. This may take a few
                    moments.
                  </p>
                )}
              </div>
            )}
          </section>

          <section className="aiscan-details-grid aiscan-animate aiscan-delay-2">
            <div className="aiscan-info-card">
              <div className="aiscan-info-card-icon">
                <FaStore />
              </div>

              <div>
                <span>Merchant</span>

                <strong>
                  {receipt?.merchant || "Waiting for scan"}
                </strong>
              </div>
            </div>

            <div className="aiscan-info-card">
              <div className="aiscan-info-card-icon">
                <FaCalendarAlt />
              </div>

              <div>
                <span>Receipt Date</span>

                <strong>
                  {receipt?.date || "Waiting for scan"}
                </strong>
              </div>
            </div>

            <div className="aiscan-info-card">
              <div className="aiscan-info-card-icon">
                <FaRupeeSign />
              </div>

              <div>
                <span>Total Amount</span>

                <strong>
                  {receipt?.total !== null &&
                  receipt?.total !== undefined
                    ? `${currencySymbol(
                        receipt.currency
                      )}${formatAmount(receipt.total)}`
                    : "Waiting for scan"}
                </strong>
              </div>
            </div>
          </section>

          {receipt && (
            <section className="aiscan-history-section aiscan-animate">
              <div className="aiscan-section-heading">
                <div>
                  <h2>Review Extracted Details</h2>

                  <p>
                    Check the information extracted by AI. You can
                    edit these details before saving.
                  </p>
                </div>

                <div className="aiscan-heading-icon">
                  <FaCheckCircle />
                </div>
              </div>

              <div className="aiscan-preview-card">
                <div className="aiscan-review-grid">
                  <label className="aiscan-review-field">
                    <span>Merchant</span>

                    <input
                      type="text"
                      value={receipt.merchant || ""}
                      onChange={(event) =>
                        updateReceiptField(
                          "merchant",
                          event.target.value
                        )
                      }
                      placeholder="Merchant name"
                      disabled={transactionSaved}
                    />
                  </label>

                  <label className="aiscan-review-field">
                    <span>Receipt Date</span>

                    <input
                      type="text"
                      value={receipt.date || ""}
                      onChange={(event) =>
                        updateReceiptField(
                          "date",
                          event.target.value
                        )
                      }
                      placeholder="DD-MM-YYYY or YYYY-MM-DD"
                    />
                  </label>

                  <label className="aiscan-review-field">
                    <span>Total Amount</span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={receipt.total ?? ""}
                      onChange={(event) =>
                        updateReceiptField(
                          "total",
                          event.target.value === ""
                            ? null
                            : Number(event.target.value)
                        )
                      }
                      placeholder="Total amount"
                      disabled={transactionSaved}
                    />
                  </label>

                  <label className="aiscan-review-field">
                    <span>Tax</span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={receipt.tax ?? ""}
                      onChange={(event) =>
                        updateReceiptField(
                          "tax",
                          event.target.value === ""
                            ? null
                            : Number(event.target.value)
                        )
                      }
                      placeholder="Tax amount"
                    />
                  </label>

                  <label className="aiscan-review-field">
                    <span>Subtotal</span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={receipt.subtotal ?? ""}
                      onChange={(event) =>
                        updateReceiptField(
                          "subtotal",
                          event.target.value === ""
                            ? null
                            : Number(event.target.value)
                        )
                      }
                      placeholder="Subtotal"
                    />
                  </label>

                  <label className="aiscan-review-field">
                    <span>Currency</span>

                    <input
                      type="text"
                      value={receipt.currency || ""}
                      onChange={(event) =>
                        updateReceiptField(
                          "currency",
                          event.target.value
                        )
                      }
                      placeholder="Currency"
                    />
                  </label>
                </div>

                <div className="aiscan-items-section">
                  <h3>Receipt Items</h3>

                  {receipt.items?.length ? (
                    <div className="aiscan-items-table-wrap">
                      <table className="aiscan-items-table">
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th>Quantity</th>
                            <th>Price</th>
                          </tr>
                        </thead>

                        <tbody>
                          {receipt.items.map((item, index) => (
                            <tr key={`${item.name}-${index}`}>
                              <td>
                                {item.name || "Unnamed item"}
                              </td>

                              <td>{item.quantity ?? "—"}</td>

                              <td>
                                {item.price === null ||
                                item.price === undefined
                                  ? "—"
                                  : `${currencySymbol(
                                      receipt.currency
                                    )}${formatAmount(item.price)}`}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p>No individual items were detected.</p>
                  )}
                </div>

                <div className="aiscan-transaction-options">
                  <h3>Save as Transaction</h3>

                  <div className="aiscan-review-grid">
                    <label className="aiscan-review-field">
                      <span>Transaction Type</span>

                      <select
                        value={transactionType}
                        onChange={(event) =>
                          handleTransactionTypeChange(
                            event.target.value
                          )
                        }
                        disabled={
                          transactionSaved || isCategorizing
                        }
                      >
                        <option value="Expense">
                          Expense
                        </option>

                        <option value="Income">
                          Income
                        </option>
                      </select>
                    </label>

                    <label className="aiscan-review-field">
                      <span>
                        Category
                        {isCategorizing
                          ? " — AI analyzing..."
                          : ""}
                      </span>

                      <input
                        type="text"
                        value={category}
                        onChange={(event) =>
                          setCategory(event.target.value)
                        }
                        placeholder={
                          isCategorizing
                            ? "AI is analyzing category..."
                            : "AI category will appear here"
                        }
                        disabled={
                          transactionSaved ||
                          isCategorizing
                        }
                      />
                    </label>

                    <label className="aiscan-review-field">
                      <span>Account</span>

                      <select
                        value={accountId}
                        onChange={(event) =>
                          setAccountId(event.target.value)
                        }
                        disabled={transactionSaved}
                      >
                        <option value="">
                          Select account
                        </option>

                        {accounts.map((account) => (
                          <option
                            key={account._id || account.id}
                            value={account._id || account.id}
                          >
                            {account.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>

                <div className="aiscan-save-actions">
                  <button
                    type="button"
                    className="aiscan-scan-btn"
                    onClick={handleSaveReceipt}
                    disabled={
                      isSaving ||
                      isScanning ||
                      isCategorizing ||
                      transactionSaved
                    }
                  >
                    {isSaving ? (
                      <>
                        <FaSyncAlt className="aiscan-loading-icon" />
                        Saving...
                      </>
                    ) : transactionSaved ? (
                      <>
                        <FaCheckCircle />
                        Transaction Saved
                      </>
                    ) : (
                      <>
                        <FaCheckCircle />
                        Save Transaction & Receipt
                      </>
                    )}
                  </button>
                </div>

                <p className="aiscan-integration-note">
                  Saving creates a transaction in your account and
                  adds the receipt to your scan history.
                </p>
              </div>
            </section>
          )}

          <section className="aiscan-history-section aiscan-animate aiscan-delay-3">
            <div className="aiscan-section-heading">
              <div>
                <h2>Scan History</h2>

                <p>
                  Your previously saved receipts appear here.
                </p>
              </div>

              <div className="aiscan-heading-icon">
                <FaHistory />
              </div>
            </div>

            {isHistoryLoading ? (
              <div className="aiscan-history-empty">
                <FaSyncAlt className="aiscan-loading-icon" />

                <h3>Loading Receipt History</h3>

                <p>
                  Please wait while your saved receipts are loaded.
                </p>
              </div>
            ) : receiptHistory.length === 0 ? (
              <div className="aiscan-history-empty">
                <div className="aiscan-history-empty-icon">
                  <FaReceipt />
                </div>

                <h3>No Scanned Receipts Yet</h3>

                <p>
                  Upload and save a receipt to see it displayed in
                  your history.
                </p>
              </div>
            ) : (
              <div className="aiscan-history-grid">
                {receiptHistory.map((item) => (
                  <article
                    key={item._id}
                    className="aiscan-preview-card aiscan-history-card"
                  >
                    <div className="aiscan-file-info">
                      <div className="aiscan-file-icon">
                        <FaReceipt />
                      </div>

                      <div className="aiscan-history-title">
                        <h3>
                          {item.merchant || "Unknown Merchant"}
                        </h3>

                        <p>
                          {formatHistoryDate(item.date)}
                        </p>
                      </div>
                    </div>

                    {item.imageUrl ? (
                      <button
                        type="button"
                        className="aiscan-history-image-button"
                        onClick={() =>
                          setViewingReceiptImage(item)
                        }
                        aria-label={`View receipt image for ${
                          item.merchant || "Unknown Merchant"
                        }`}
                        title="View receipt image"
                      >
                        <img
                          className="aiscan-history-image"
                          src={item.imageUrl}
                          alt={`${
                            item.merchant || "Receipt"
                          } receipt`}
                        />
                      </button>
                    ) : (
                      <div className="aiscan-history-image-empty">
                        <FaImage />

                        <span>
                          Receipt image is not available for this
                          saved scan.
                        </span>
                      </div>
                    )}

                    <div className="aiscan-history-amount">
                      <span>Total Amount</span>

                      <strong>
                        {currencySymbol(item.currency)}
                        {formatAmount(item.total)}
                      </strong>
                    </div>

                    {item.items?.length > 0 && (
                      <p className="aiscan-history-item-count">
                        {item.items.length}{" "}
                        {item.items.length === 1
                          ? "item"
                          : "items"}{" "}
                        detected
                      </p>
                    )}

                    <div className="aiscan-preview-actions">
                      {item.imageUrl && (
                        <button
                          type="button"
                          className="aiscan-change-btn"
                          onClick={() =>
                            setViewingReceiptImage(item)
                          }
                          disabled={
                            editingReceiptId === item._id ||
                            deletingReceiptId === item._id
                          }
                        >
                          <FaImage />
                          View Receipt
                        </button>
                      )}

                      <button
                        type="button"
                        className="aiscan-change-btn"
                        onClick={() => openEditReceipt(item)}
                        disabled={
                          editingReceiptId === item._id ||
                          deletingReceiptId === item._id
                        }
                      >
                        {editingReceiptId === item._id ? (
                          <>
                            <FaSyncAlt className="aiscan-loading-icon" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <FaEdit />
                            Edit
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        className="aiscan-remove-btn"
                        onClick={() => openDeleteReceipt(item)}
                        aria-label="Delete receipt"
                        title="Delete receipt"
                        disabled={
                          deletingReceiptId === item._id ||
                          editingReceiptId === item._id
                        }
                      >
                        {deletingReceiptId === item._id ? (
                          <FaSyncAlt className="aiscan-loading-icon" />
                        ) : (
                          <FaTrash />
                        )}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      {viewingReceiptImage?.imageUrl && (
        <div
          role="presentation"
          className="aiscan-receipt-modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setViewingReceiptImage(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Receipt image preview"
            className="aiscan-receipt-modal"
          >
            <button
              type="button"
              onClick={() => setViewingReceiptImage(null)}
              aria-label="Close receipt image"
              title="Close"
              className="aiscan-receipt-modal-close"
            >
              <FaTimes />
            </button>

            <div className="aiscan-receipt-modal-header">
              <div>
                <h3>
                  {viewingReceiptImage.merchant || "Receipt"}
                </h3>

                <p>
                  {formatHistoryDate(
                    viewingReceiptImage.date
                  )}
                </p>
              </div>
            </div>

            <div className="aiscan-receipt-modal-image-wrapper">
              <img
                className="aiscan-receipt-modal-image"
                src={viewingReceiptImage.imageUrl}
                alt={`${
                  viewingReceiptImage.merchant || "Receipt"
                } receipt`}
              />
            </div>
          </div>
        </div>
      )}

      {editingReceipt && (
        <div
          role="presentation"
          className="aiscan-action-modal-overlay"
          onClick={(event) => {
            if (
              event.target === event.currentTarget &&
              !editingReceiptId
            ) {
              closeEditReceipt();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="aiscan-edit-title"
            className="aiscan-action-modal"
          >
            <div className="aiscan-action-modal-header">
              <div className="aiscan-action-modal-heading">
                <div className="aiscan-action-modal-icon aiscan-edit-modal-icon">
                  <FaEdit />
                </div>

                <div>
                  <h2 id="aiscan-edit-title">
                    Edit Receipt
                  </h2>

                  <p>
                    Update the saved receipt information.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="aiscan-action-modal-close"
                onClick={closeEditReceipt}
                disabled={Boolean(editingReceiptId)}
                aria-label="Close edit receipt"
                title="Close"
              >
                <FaTimes />
              </button>
            </div>

            <div className="aiscan-action-modal-body">
              <div className="aiscan-modal-form-grid">
                <label className="aiscan-modal-field">
                  <span>
                    <FaStore />
                    Merchant
                  </span>

                  <input
                    type="text"
                    value={editForm.merchant}
                    onChange={(event) =>
                      handleEditFormChange(
                        "merchant",
                        event.target.value
                      )
                    }
                    placeholder="Merchant name"
                    disabled={Boolean(editingReceiptId)}
                    autoFocus
                  />
                </label>

                <label className="aiscan-modal-field">
                  <span>
                    <FaCalendarAlt />
                    Receipt Date
                  </span>

                  <input
                    type="text"
                    value={editForm.date}
                    onChange={(event) =>
                      handleEditFormChange(
                        "date",
                        event.target.value
                      )
                    }
                    placeholder="DD-MM-YYYY or YYYY-MM-DD"
                    disabled={Boolean(editingReceiptId)}
                  />
                </label>

                <label className="aiscan-modal-field aiscan-modal-field-full">
                  <span>
                    <FaRupeeSign />
                    Total Amount
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.total}
                    onChange={(event) =>
                      handleEditFormChange(
                        "total",
                        event.target.value
                      )
                    }
                    placeholder="Enter total amount"
                    disabled={Boolean(editingReceiptId)}
                  />
                </label>
              </div>
            </div>

            <div className="aiscan-action-modal-footer">
              <button
                type="button"
                className="aiscan-modal-cancel-btn"
                onClick={closeEditReceipt}
                disabled={Boolean(editingReceiptId)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="aiscan-modal-primary-btn"
                onClick={handleEditHistoryReceipt}
                disabled={Boolean(editingReceiptId)}
              >
                {editingReceiptId ? (
                  <>
                    <FaSyncAlt className="aiscan-loading-icon" />
                    Updating...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteReceipt && (
        <div
          role="presentation"
          className="aiscan-action-modal-overlay"
          onClick={(event) => {
            if (
              event.target === event.currentTarget &&
              !deletingReceiptId
            ) {
              closeDeleteReceipt();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="aiscan-delete-title"
            className="aiscan-action-modal aiscan-delete-modal"
          >
            <div className="aiscan-action-modal-header">
              <div className="aiscan-action-modal-heading">
                <div className="aiscan-action-modal-icon aiscan-delete-modal-icon">
                  <FaExclamationTriangle />
                </div>

                <div>
                  <h2 id="aiscan-delete-title">
                    Delete Receipt
                  </h2>

                  <p>
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="aiscan-action-modal-close"
                onClick={closeDeleteReceipt}
                disabled={Boolean(deletingReceiptId)}
                aria-label="Close delete confirmation"
                title="Close"
              >
                <FaTimes />
              </button>
            </div>

            <div className="aiscan-delete-modal-body">
              <div className="aiscan-delete-receipt-preview">
                {deleteReceipt.imageUrl ? (
                  <img
                    src={deleteReceipt.imageUrl}
                    alt={
                      deleteReceipt.merchant ||
                      "Receipt preview"
                    }
                  />
                ) : (
                  <div className="aiscan-delete-receipt-placeholder">
                    <FaReceipt />
                  </div>
                )}

                <div>
                  <strong>
                    {deleteReceipt.merchant ||
                      "Unknown Merchant"}
                  </strong>

                  <span>
                    {formatHistoryDate(deleteReceipt.date)}
                  </span>

                  <b>
                    {currencySymbol(
                      deleteReceipt.currency
                    )}
                    {formatAmount(deleteReceipt.total)}
                  </b>
                </div>
              </div>

              <div className="aiscan-delete-warning">
                <FaExclamationTriangle />

                <div>
                  <strong>
                    Delete this saved receipt?
                  </strong>

                  <p>
                    If this receipt has a linked transaction,
                    that transaction will also be deleted and
                    the account balance will be updated.
                  </p>
                </div>
              </div>
            </div>

            <div className="aiscan-action-modal-footer">
              <button
                type="button"
                className="aiscan-modal-cancel-btn"
                onClick={closeDeleteReceipt}
                disabled={Boolean(deletingReceiptId)}
              >
                Keep Receipt
              </button>

              <button
                type="button"
                className="aiscan-modal-delete-btn"
                onClick={handleDeleteHistoryReceipt}
                disabled={Boolean(deletingReceiptId)}
              >
                {deletingReceiptId ? (
                  <>
                    <FaSyncAlt className="aiscan-loading-icon" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <FaTrash />
                    Delete Receipt
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {isCameraOpen && (
        <div
          role="presentation"
          className="aiscan-camera-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeCamera();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="aiscan-camera-title"
            className="aiscan-camera-dialog"
          >
            <div className="aiscan-camera-header">
              <div>
                <h2 id="aiscan-camera-title">
                  Capture Receipt
                </h2>

                <p>
                  Position your receipt inside the camera frame.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCamera}
                aria-label="Close camera"
                title="Close camera"
                className="aiscan-camera-close"
              >
                <FaTimes />
              </button>
            </div>

            <div className="aiscan-camera-view">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="aiscan-camera-video"
              />

              {isCameraLoading && (
                <div className="aiscan-camera-loading">
                  <FaSyncAlt className="aiscan-loading-icon" />
                  Starting camera...
                </div>
              )}
            </div>

            <div className="aiscan-camera-actions">
              <button
                type="button"
                onClick={closeCamera}
                className="aiscan-change-btn"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={capturePhoto}
                className="aiscan-scan-btn"
                disabled={isCameraLoading}
              >
                <FaCamera />
                Capture Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIScan;