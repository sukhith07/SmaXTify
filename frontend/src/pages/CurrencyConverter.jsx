import { useEffect, useRef, useState } from "react";

import {
  FaArrowRightArrowLeft,
  FaCalculator,
  FaCircleInfo,
  FaRotate,
  FaTriangleExclamation,
  FaMagnifyingGlass,
  FaCheck,
  FaChevronDown,
  FaStar,
  FaClock,
  FaTrash,
  FaRepeat,
  FaStar as FaStarSolid,
} from "react-icons/fa6";

import { toast } from "react-toastify";

import API from "../services/api";

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

import "../components/styles/dashboard.css";
import "../components/styles/currencyConverter.css";

function CurrencyConverter() {

  // =====================================================
  // BASIC STATE
  // =====================================================

  const [amount, setAmount] =
    useState("");

  const [fromCurrency, setFromCurrency] =
    useState("INR");

  const [toCurrency, setToCurrency] =
    useState("USD");

  const [convertedAmount, setConvertedAmount] =
    useState(null);

  const [exchangeRate, setExchangeRate] =
    useState(null);

  const [rateDate, setRateDate] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  // =====================================================
  // SEARCHABLE DROPDOWN
  // =====================================================

  const [openDropdown, setOpenDropdown] =
    useState(null);

  const [searchTerm, setSearchTerm] =
    useState("");

  const dropdownRef =
    useRef(null);


  // =====================================================
  // CONVERSION HISTORY
  // =====================================================

  const [recentConversions, setRecentConversions] =
    useState([]);


  // =====================================================
  // FAVORITE PAIRS
  // =====================================================

  const [favoritePairs, setFavoritePairs] =
    useState([]);


  // =====================================================
  // CURRENCIES
  // =====================================================

  const currencies = [

    {
      code: "INR",
      name: "Indian Rupee",
      symbol: "₹",
      flag: "🇮🇳",
    },

    {
      code: "USD",
      name: "US Dollar",
      symbol: "$",
      flag: "🇺🇸",
    },

    {
      code: "EUR",
      name: "Euro",
      symbol: "€",
      flag: "🇪🇺",
    },

    {
      code: "GBP",
      name: "British Pound",
      symbol: "£",
      flag: "🇬🇧",
    },

    {
      code: "JPY",
      name: "Japanese Yen",
      symbol: "¥",
      flag: "🇯🇵",
    },

    {
      code: "AUD",
      name: "Australian Dollar",
      symbol: "A$",
      flag: "🇦🇺",
    },

    {
      code: "CAD",
      name: "Canadian Dollar",
      symbol: "C$",
      flag: "🇨🇦",
    },

    {
      code: "AED",
      name: "UAE Dirham",
      symbol: "د.إ",
      flag: "🇦🇪",
    },

    {
      code: "SGD",
      name: "Singapore Dollar",
      symbol: "S$",
      flag: "🇸🇬",
    },

    {
      code: "CHF",
      name: "Swiss Franc",
      symbol: "CHF",
      flag: "🇨🇭",
    },

    {
      code: "CNY",
      name: "Chinese Yuan",
      symbol: "¥",
      flag: "🇨🇳",
    },

    {
      code: "NZD",
      name: "New Zealand Dollar",
      symbol: "NZ$",
      flag: "🇳🇿",
    },

    {
      code: "HKD",
      name: "Hong Kong Dollar",
      symbol: "HK$",
      flag: "🇭🇰",
    },

    {
      code: "KRW",
      name: "South Korean Won",
      symbol: "₩",
      flag: "🇰🇷",
    },

    {
      code: "SAR",
      name: "Saudi Riyal",
      symbol: "﷼",
      flag: "🇸🇦",
    },

    {
      code: "QAR",
      name: "Qatari Riyal",
      symbol: "﷼",
      flag: "🇶🇦",
    },

    {
      code: "MYR",
      name: "Malaysian Ringgit",
      symbol: "RM",
      flag: "🇲🇾",
    },

    {
      code: "THB",
      name: "Thai Baht",
      symbol: "฿",
      flag: "🇹🇭",
    },

  ];


  // =====================================================
  // POPULAR PAIRS
  // =====================================================

  const popularPairs = [

    {
      from: "INR",
      to: "USD",
    },

    {
      from: "INR",
      to: "EUR",
    },

    {
      from: "INR",
      to: "GBP",
    },

    {
      from: "INR",
      to: "AED",
    },

    {
      from: "INR",
      to: "JPY",
    },

  ];


  // =====================================================
  // LOAD SAVED DATA
  // =====================================================

  useEffect(() => {

    const savedConversions =
      localStorage.getItem(
        "currencyRecentConversions"
      );

    if (savedConversions) {

      try {

        const parsedConversions =
          JSON.parse(savedConversions);

        if (
          Array.isArray(
            parsedConversions
          )
        ) {

          setRecentConversions(
            parsedConversions
          );

        }

      } catch (storageError) {

        console.error(
          "Currency History Error:",
          storageError
        );

        localStorage.removeItem(
          "currencyRecentConversions"
        );

      }

    }


    const savedFavorites =
      localStorage.getItem(
        "currencyFavoritePairs"
      );

    if (savedFavorites) {

      try {

        const parsedFavorites =
          JSON.parse(savedFavorites);

        if (
          Array.isArray(
            parsedFavorites
          )
        ) {

          setFavoritePairs(
            parsedFavorites
          );

        }

      } catch (storageError) {

        console.error(
          "Currency Favorites Error:",
          storageError
        );

        localStorage.removeItem(
          "currencyFavoritePairs"
        );

      }

    }

  }, []);


  // =====================================================
  // GET CURRENCY
  // =====================================================

  const getCurrency = (code) =>

    currencies.find(
      (currency) =>
        currency.code === code
    );


  // =====================================================
  // FILTER CURRENCIES
  // =====================================================

  const filteredCurrencies =
    currencies.filter(
      (currency) => {

        const search =
          searchTerm
            .trim()
            .toLowerCase();

        if (!search) {
          return true;
        }

        return (
          currency.code
            .toLowerCase()
            .includes(search) ||

          currency.name
            .toLowerCase()
            .includes(search) ||

          currency.symbol
            .toLowerCase()
            .includes(search)
        );

      }
    );


  // =====================================================
  // CLOSE DROPDOWN
  // =====================================================

  useEffect(() => {

    const handleOutsideClick =
      (event) => {

        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(
            event.target
          )
        ) {

          setOpenDropdown(null);

          setSearchTerm("");

        }

      };


    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );


    return () => {

      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

    };

  }, []);


  // =====================================================
  // OPEN DROPDOWN
  // =====================================================

  const openCurrencyDropdown = (
    type
  ) => {

    if (
      openDropdown === type
    ) {

      setOpenDropdown(null);

      setSearchTerm("");

      return;

    }

    setOpenDropdown(type);

    setSearchTerm("");

  };


  // =====================================================
  // SELECT CURRENCY
  // =====================================================

  const selectCurrency = (
    type,
    code
  ) => {

    if (type === "from") {

      setFromCurrency(code);

    } else {

      setToCurrency(code);

    }

    setConvertedAmount(null);

    setExchangeRate(null);

    setRateDate(null);

    setError("");

    setOpenDropdown(null);

    setSearchTerm("");

  };


  // =====================================================
  // SELECT POPULAR PAIR
  // =====================================================

  const selectPopularPair = (
    from,
    to
  ) => {

    setFromCurrency(from);

    setToCurrency(to);

    setConvertedAmount(null);

    setExchangeRate(null);

    setRateDate(null);

    setError("");

    setOpenDropdown(null);

    setSearchTerm("");

  };


  // =====================================================
  // CHECK FAVORITE
  // =====================================================

  const isFavoritePair = (
    from,
    to
  ) => {

    return favoritePairs.some(
      (pair) =>
        pair.from === from &&
        pair.to === to
    );

  };


  // =====================================================
  // TOGGLE FAVORITE
  // =====================================================

  const toggleFavoritePair = (
    from,
    to
  ) => {

    const exists =
      isFavoritePair(
        from,
        to
      );


    let updatedFavorites;


    if (exists) {

      updatedFavorites =
        favoritePairs.filter(
          (pair) =>
            !(
              pair.from === from &&
              pair.to === to
            )
        );

      toast.info(
        `${from} → ${to} removed from favorites.`
      );

    } else {

      updatedFavorites = [

        ...favoritePairs,

        {
          from,
          to,
        },

      ];

      toast.success(
        `${from} → ${to} added to favorites.`
      );

    }


    setFavoritePairs(
      updatedFavorites
    );


    localStorage.setItem(
      "currencyFavoritePairs",
      JSON.stringify(
        updatedFavorites
      )
    );

  };


  // =====================================================
  // SELECT FAVORITE
  // =====================================================

  const selectFavoritePair = (
    from,
    to
  ) => {

    setFromCurrency(from);

    setToCurrency(to);

    setConvertedAmount(null);

    setExchangeRate(null);

    setRateDate(null);

    setError("");

  };


  // =====================================================
  // LOAD RECENT CONVERSION
  // =====================================================

  const loadRecentConversion = (
    conversion
  ) => {

    setFromCurrency(
      conversion.from
    );

    setToCurrency(
      conversion.to
    );

    setAmount(
      String(
        conversion.amount
      )
    );

    setConvertedAmount(
      conversion.convertedAmount
    );

    setExchangeRate(
      conversion.rate
    );

    setRateDate(
      conversion.rateDate ||
      conversion.date
    );

    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  };


  // =====================================================
  // REPEAT CONVERSION
  // =====================================================

  const repeatConversion = (
    conversion
  ) => {

    setFromCurrency(
      conversion.from
    );

    setToCurrency(
      conversion.to
    );

    setAmount(
      String(
        conversion.amount
      )
    );

    setConvertedAmount(null);

    setExchangeRate(null);

    setRateDate(null);

    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    toast.info(
      "Conversion loaded. Click Convert Currency to get the latest rate."
    );

  };


  // =====================================================
  // SAVE RECENT CONVERSION
  // =====================================================

  const saveRecentConversion = ({
    from,
    to,
    amount,
    convertedAmount,
    rate,
    rateDate,
  }) => {

    const newConversion = {

      id: Date.now(),

      from,

      to,

      amount,

      convertedAmount,

      rate,

      rateDate:
        rateDate ||
        new Date()
          .toISOString()
          .split("T")[0],

      date:
        new Date().toISOString(),

    };


    const updatedConversions = [

      newConversion,

      ...recentConversions.filter(
        (conversion) =>
          !(
            conversion.from === from &&
            conversion.to === to &&
            Number(
              conversion.amount
            ) === Number(amount)
          )
      ),

    ].slice(0, 10);


    setRecentConversions(
      updatedConversions
    );


    localStorage.setItem(
      "currencyRecentConversions",
      JSON.stringify(
        updatedConversions
      )
    );

  };


  // =====================================================
  // DELETE SINGLE HISTORY ITEM
  // =====================================================

  const deleteRecentConversion = (
    id
  ) => {

    const updatedConversions =
      recentConversions.filter(
        (conversion) =>
          conversion.id !== id
      );


    setRecentConversions(
      updatedConversions
    );


    localStorage.setItem(
      "currencyRecentConversions",
      JSON.stringify(
        updatedConversions
      )
    );


    toast.success(
      "Conversion removed from history."
    );

  };


  // =====================================================
  // CLEAR HISTORY
  // =====================================================

  const clearRecentConversions = () => {

    if (
      recentConversions.length === 0
    ) {
      return;
    }


    setRecentConversions([]);

    localStorage.removeItem(
      "currencyRecentConversions"
    );


    toast.success(
      "Recent conversion history cleared."
    );

  };


  // =====================================================
  // CLEAR FAVORITES
  // =====================================================

  const clearFavoritePairs = () => {

    setFavoritePairs([]);

    localStorage.removeItem(
      "currencyFavoritePairs"
    );


    toast.success(
      "Favorite pairs cleared."
    );

  };


  // =====================================================
  // SWAP
  // =====================================================

  const swapCurrencies = () => {

    setFromCurrency(
      toCurrency
    );

    setToCurrency(
      fromCurrency
    );

    setConvertedAmount(null);

    setExchangeRate(null);

    setRateDate(null);

    setError("");

  };


  // =====================================================
  // CONVERT
  // =====================================================

  const handleConvert = async () => {

    const numericAmount =
      Number(amount);


    if (
      !amount ||
      !Number.isFinite(
        numericAmount
      ) ||
      numericAmount <= 0
    ) {

      setConvertedAmount(null);

      setExchangeRate(null);

      setRateDate(null);

      setError(
        "Please enter a valid amount greater than 0."
      );

      return;

    }


    if (
      fromCurrency ===
      toCurrency
    ) {

      setConvertedAmount(
        numericAmount
      );

      setExchangeRate(1);

      const today =
        new Date()
          .toISOString()
          .split("T")[0];


      setRateDate(today);

      setError("");


      saveRecentConversion({

        from:
          fromCurrency,

        to:
          toCurrency,

        amount:
          numericAmount,

        convertedAmount:
          numericAmount,

        rate: 1,

        rateDate:
          today,

      });


      return;

    }


    setError("");

    setLoading(true);

    setConvertedAmount(null);

    setExchangeRate(null);

    setRateDate(null);


    try {

      const { data } =
        await API.get(
          "/currency/convert",
          {
            params: {

              from:
                fromCurrency,

              to:
                toCurrency,

              amount:
                numericAmount,

            },

          }
        );


      if (!data.success) {

        throw new Error(
          data.message ||
          "Currency conversion failed."
        );

      }


      const result =
        Number(
          data.convertedAmount
        );


      const rate =
        Number(
          data.rate
        );


      const actualRateDate =
        data.date ||
        new Date()
          .toISOString()
          .split("T")[0];


      setConvertedAmount(
        result
      );

      setExchangeRate(
        rate
      );

      setRateDate(
        actualRateDate
      );


      saveRecentConversion({

        from:
          fromCurrency,

        to:
          toCurrency,

        amount:
          numericAmount,

        convertedAmount:
          result,

        rate:
          rate,

        rateDate:
          actualRateDate,

      });

    } catch (error) {

      console.error(
        "Currency Conversion Error:",
        error
      );


      const message =
        error.response?.data?.message ||
        error.message ||
        "Unable to convert currency.";


      setError(message);

      setConvertedAmount(null);

      setExchangeRate(null);

      setRateDate(null);

      toast.error(message);

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // CURRENCY DATA
  // =====================================================

  const from =
    getCurrency(
      fromCurrency
    );

  const to =
    getCurrency(
      toCurrency
    );


  // =====================================================
  // CURRENCY SELECTOR
  // =====================================================

  const renderCurrencySelector = (
    type,
    selectedCurrency
  ) => {

    const isOpen =
      openDropdown === type;


    return (

      <div
        className="currency-custom-select"
        ref={
          isOpen
            ? dropdownRef
            : null
        }
      >

        <button
          type="button"
          className={`currency-custom-select-btn ${
            isOpen
              ? "currency-custom-select-open"
              : ""
          }`}
          onClick={() =>
            openCurrencyDropdown(type)
          }
        >

          <span className="currency-selected-info">

            <span className="currency-selected-flag">

              {selectedCurrency?.flag}

            </span>


            <span className="currency-selected-text">

              <strong>
                {selectedCurrency?.code}
              </strong>

              <small>
                {selectedCurrency?.name}
              </small>

            </span>

          </span>


          <FaChevronDown
            className={
              isOpen
                ? "currency-chevron-open"
                : ""
            }
          />

        </button>


        {isOpen && (

          <div className="currency-dropdown">

            <div className="currency-search">

              <FaMagnifyingGlass />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(
                    e.target.value
                  )
                }
                placeholder="Search currency..."
                autoFocus
              />

            </div>


            <div className="currency-dropdown-list">

              {filteredCurrencies.length > 0 ? (

                filteredCurrencies.map(
                  (currency) => {

                    const selected =
                      currency.code ===
                      selectedCurrency?.code;


                    return (

                      <button
                        type="button"
                        key={currency.code}
                        className={`currency-option ${
                          selected
                            ? "currency-option-selected"
                            : ""
                        }`}
                        onClick={() =>
                          selectCurrency(
                            type,
                            currency.code
                          )
                        }
                      >

                        <span className="currency-option-flag">

                          {currency.flag}

                        </span>


                        <span className="currency-option-info">

                          <strong>
                            {currency.code}
                          </strong>

                          <small>
                            {currency.name}
                          </small>

                        </span>


                        <span className="currency-option-symbol">

                          {currency.symbol}

                        </span>


                        {selected && (

                          <FaCheck
                            className="currency-option-check"
                          />

                        )}

                      </button>

                    );

                  }
                )

              ) : (

                <div className="currency-no-results">

                  <FaMagnifyingGlass />

                  <span>
                    No currency found
                  </span>

                  <small>
                    Try another search
                  </small>

                </div>

              )}

            </div>

          </div>

        )}

      </div>

    );

  };


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="dashboard">

      <Sidebar />


      <div className="dashboard-content">

        <Navbar />


        <main className="dashboard-main">

          {/* =================================================
              HEADER
          ================================================= */}

          <section className="currency-header">

            <div className="currency-header-icon">
              💱
            </div>


            <div className="currency-header-content">

              <h1>
                Currency Converter
              </h1>

              <p>
                Convert currencies quickly using
                up-to-date exchange rates.
              </p>

            </div>

          </section>


          {/* =================================================
              CONVERTER CARD
          ================================================= */}

          <section className="currency-converter-card">

            <div className="currency-card-heading">

              <div>

                <h2>
                  Currency Converter
                </h2>

                <p>
                  Enter an amount and choose
                  your currencies.
                </p>

              </div>


              <div className="currency-card-icon">

                <FaCalculator />

              </div>

            </div>


            {/* AMOUNT */}

            <div className="currency-field">

              <label htmlFor="currency-amount">
                Amount
              </label>


              <div className="currency-amount-input">

                <span>
                  {from?.symbol || "₹"}
                </span>


                <input
                  id="currency-amount"
                  type="number"
                  min="0"
                  step="any"
                  value={amount}
                  onChange={(e) => {

                    setAmount(
                      e.target.value
                    );

                    setConvertedAmount(null);

                    setExchangeRate(null);

                    setRateDate(null);

                    setError("");

                  }}
                  placeholder="Enter amount"
                />

              </div>

            </div>


            {/* CURRENCY SELECTION */}

            <div className="currency-selection-row">

              <div className="currency-field">

                <label>
                  From
                </label>

                {renderCurrencySelector(
                  "from",
                  from
                )}

              </div>


              <button
                type="button"
                className="currency-swap-btn"
                onClick={swapCurrencies}
                aria-label="Swap currencies"
                title="Swap currencies"
              >

                <FaArrowRightArrowLeft />

              </button>


              <div className="currency-field">

                <label>
                  To
                </label>

                {renderCurrencySelector(
                  "to",
                  to
                )}

              </div>

            </div>


            {/* ERROR */}

            {error && (

              <div className="currency-error">

                <FaTriangleExclamation />

                <span>
                  {error}
                </span>

              </div>

            )}


            {/* CONVERT */}

            <button
              type="button"
              className="currency-convert-btn"
              onClick={handleConvert}
              disabled={loading}
            >

              {loading ? (

                <>

                  <FaRotate
                    className="currency-loading-icon"
                  />

                  Getting Live Rate...

                </>

              ) : (

                "Convert Currency"

              )}

            </button>


            {/* RESULT */}

            {convertedAmount !== null && (

              <div className="currency-result">

                <span className="currency-result-label">

                  Converted Amount

                </span>


                <strong>

                  {to?.symbol}

                  {Number(
                    convertedAmount
                  ).toLocaleString(
                    "en-IN",
                    {
                      maximumFractionDigits: 2,
                    }
                  )}

                </strong>


                {exchangeRate !== null && (

                  <div className="currency-rate">

                    1 {fromCurrency}

                    {" = "}

                    {Number(
                      exchangeRate
                    ).toLocaleString(
                      "en-IN",
                      {
                        maximumFractionDigits: 6,
                      }
                    )}

                    {" "}

                    {toCurrency}

                  </div>

                )}


                {rateDate && (

                  <div className="currency-rate-date">

                    Rate date:{" "}

                    {rateDate}

                  </div>

                )}


                {/* FAVORITE CURRENT PAIR */}

                <button
                  type="button"
                  className={`currency-favorite-current ${
                    isFavoritePair(
                      fromCurrency,
                      toCurrency
                    )
                      ? "currency-favorite-active"
                      : ""
                  }`}
                  onClick={() =>
                    toggleFavoritePair(
                      fromCurrency,
                      toCurrency
                    )
                  }
                >

                  {isFavoritePair(
                    fromCurrency,
                    toCurrency
                  ) ? (

                    <FaStarSolid />

                  ) : (

                    <FaStar />

                  )}

                  {isFavoritePair(
                    fromCurrency,
                    toCurrency
                  )
                    ? "Favorited"
                    : "Add to Favorites"}

                </button>

              </div>

            )}


            {/* INFO */}

            <div className="currency-info">

              <FaCircleInfo />

              <span>

                Exchange rates are retrieved
                from the live currency-rate service.

              </span>

            </div>

          </section>


          {/* =================================================
              FAVORITE PAIRS
          ================================================= */}

          {favoritePairs.length > 0 && (

            <section className="currency-secondary-card">

              <div className="currency-secondary-heading">

                <div>

                  <h2>

                    <FaStar />

                    Favorite Pairs

                  </h2>

                  <p>
                    Your frequently used currency pairs.
                  </p>

                </div>


                <button
                  type="button"
                  className="currency-clear-history"
                  onClick={
                    clearFavoritePairs
                  }
                >

                  <FaTrash />

                  Clear Favorites

                </button>

              </div>


              <div className="currency-favorite-grid">

                {favoritePairs.map(
                  (pair) => {

                    const pairFrom =
                      getCurrency(
                        pair.from
                      );

                    const pairTo =
                      getCurrency(
                        pair.to
                      );


                    return (

                      <div
                        className="currency-favorite-item"
                        key={`${pair.from}-${pair.to}`}
                      >

                        <button
                          type="button"
                          className="currency-favorite-select"
                          onClick={() =>
                            selectFavoritePair(
                              pair.from,
                              pair.to
                            )
                          }
                        >

                          <div className="currency-popular-flags">

                            <span>
                              {pairFrom?.flag}
                            </span>

                            <span className="currency-popular-arrow">
                              →
                            </span>

                            <span>
                              {pairTo?.flag}
                            </span>

                          </div>


                          <strong>
                            {pair.from}
                            {" → "}
                            {pair.to}
                          </strong>


                          <small>
                            Click to use pair
                          </small>

                        </button>


                        <button
                          type="button"
                          className="currency-favorite-remove"
                          onClick={() =>
                            toggleFavoritePair(
                              pair.from,
                              pair.to
                            )
                          }
                          title="Remove favorite"
                          aria-label={`Remove ${pair.from} to ${pair.to} favorite`}
                        >

                          <FaStarSolid />

                        </button>

                      </div>

                    );

                  }
                )}

              </div>

            </section>

          )}


          {/* =================================================
              POPULAR CONVERSIONS
          ================================================= */}

          <section className="currency-secondary-card">

            <div className="currency-secondary-heading">

              <div>

                <h2>

                  <FaStar />

                  Popular Conversions

                </h2>

                <p>
                  Quickly select a commonly used
                  currency pair.
                </p>

              </div>

            </div>


            <div className="currency-popular-grid">

              {popularPairs.map(
                (pair) => {

                  const pairFrom =
                    getCurrency(
                      pair.from
                    );

                  const pairTo =
                    getCurrency(
                      pair.to
                    );


                  const favorite =
                    isFavoritePair(
                      pair.from,
                      pair.to
                    );


                  return (

                    <div
                      className="currency-popular-item-wrapper"
                      key={`${pair.from}-${pair.to}`}
                    >

                      <button
                        type="button"
                        className="currency-popular-item"
                        onClick={() =>
                          selectPopularPair(
                            pair.from,
                            pair.to
                          )
                        }
                      >

                        <div className="currency-popular-flags">

                          <span>
                            {pairFrom?.flag}
                          </span>

                          <span className="currency-popular-arrow">
                            →
                          </span>

                          <span>
                            {pairTo?.flag}
                          </span>

                        </div>


                        <strong>

                          {pair.from}
                          {" → "}
                          {pair.to}

                        </strong>


                        <small>

                          {pairFrom?.symbol}
                          {" → "}
                          {pairTo?.symbol}

                        </small>

                      </button>


                      <button
                        type="button"
                        className={`currency-popular-favorite ${
                          favorite
                            ? "currency-favorite-active"
                            : ""
                        }`}
                        onClick={() =>
                          toggleFavoritePair(
                            pair.from,
                            pair.to
                          )
                        }
                        title={
                          favorite
                            ? "Remove favorite"
                            : "Add favorite"
                        }
                        aria-label={
                          favorite
                            ? "Remove favorite"
                            : "Add favorite"
                        }
                      >

                        {favorite ? (
                          <FaStarSolid />
                        ) : (
                          <FaStar />
                        )}

                      </button>

                    </div>

                  );

                }
              )}

            </div>

          </section>


          {/* =================================================
              RECENT CONVERSIONS
          ================================================= */}

          <section className="currency-secondary-card">

            <div className="currency-secondary-heading">

              <div>

                <h2>

                  <FaClock />

                  Recent Conversions

                </h2>

                <p>
                  Your recently completed currency
                  conversions.
                </p>

              </div>


              {recentConversions.length > 0 && (

                <button
                  type="button"
                  className="currency-clear-history"
                  onClick={
                    clearRecentConversions
                  }
                >

                  <FaTrash />

                  Clear History

                </button>

              )}

            </div>


            {recentConversions.length === 0 ? (

              <div className="currency-recent-empty">

                <FaClock />

                <h3>
                  No Recent Conversions
                </h3>

                <p>
                  Your successful conversions
                  will appear here.
                </p>

              </div>

            ) : (

              <div className="currency-recent-list">

                {recentConversions.map(
                  (conversion) => {

                    const conversionFrom =
                      getCurrency(
                        conversion.from
                      );

                    const conversionTo =
                      getCurrency(
                        conversion.to
                      );


                    return (

                      <div
                        className="currency-recent-item"
                        key={conversion.id}
                      >

                        {/* LEFT */}

                        <button
                          type="button"
                          className="currency-recent-main-button"
                          onClick={() =>
                            loadRecentConversion(
                              conversion
                            )
                          }
                        >

                          <div className="currency-recent-main">

                            <div className="currency-recent-pair">

                              <span>
                                {conversionFrom?.flag}
                              </span>

                              <strong>
                                {conversion.from}
                              </strong>

                              <span>
                                →
                              </span>

                              <span>
                                {conversionTo?.flag}
                              </span>

                              <strong>
                                {conversion.to}
                              </strong>

                            </div>


                            <span className="currency-recent-date">

                              {new Date(
                                conversion.date
                              ).toLocaleString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                }
                              )}

                            </span>

                          </div>

                        </button>


                        {/* RIGHT */}

                        <div className="currency-recent-actions">

                          <div className="currency-recent-amount">

                            <strong>

                              {conversionFrom?.symbol}

                              {Number(
                                conversion.amount
                              ).toLocaleString(
                                "en-IN",
                                {
                                  maximumFractionDigits: 2,
                                }
                              )}

                              {" → "}

                              {conversionTo?.symbol}

                              {Number(
                                conversion.convertedAmount
                              ).toLocaleString(
                                "en-IN",
                                {
                                  maximumFractionDigits: 2,
                                }
                              )}

                            </strong>


                            <small>

                              1 {conversion.from}

                              {" = "}

                              {Number(
                                conversion.rate
                              ).toLocaleString(
                                "en-IN",
                                {
                                  maximumFractionDigits: 6,
                                }
                              )}

                              {" "}

                              {conversion.to}

                            </small>

                          </div>


                          {/* REPEAT */}

                          <button
                            type="button"
                            className="currency-history-action currency-repeat-btn"
                            onClick={() =>
                              repeatConversion(
                                conversion
                              )
                            }
                            title="Repeat conversion"
                            aria-label="Repeat conversion"
                          >

                            <FaRepeat />

                          </button>


                          {/* DELETE */}

                          <button
                            type="button"
                            className="currency-history-action currency-delete-btn"
                            onClick={() =>
                              deleteRecentConversion(
                                conversion.id
                              )
                            }
                            title="Delete conversion"
                            aria-label="Delete conversion"
                          >

                            <FaTrash />

                          </button>

                        </div>

                      </div>

                    );

                  }
                )}

              </div>

            )}

          </section>

        </main>

      </div>

    </div>

  );

}

export default CurrencyConverter;