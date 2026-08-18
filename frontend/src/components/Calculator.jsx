import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FaCalculator,
  FaBackspace,
  FaTimes,
  FaCopy,
  FaCheck,
  FaRedo,
} from "react-icons/fa";

import { useCalculator } from "../context/CalculatorContext";
import { useCalendar } from "../context/CalendarContext";

import "./styles/calculator.css";

function Calculator() {
  const {
    calculatorOpen,
    calculatorMinimized,
    display,
    history,
    closeCalculator,
    minimizeCalculator,
    append,
    clear,
    backspace,
    calculate,
    memoryClear,
    memoryRecall,
    memoryAdd,
    memorySubtract,
    clearHistory,
    useHistoryResult,
    setDisplay,
  } = useCalculator();

  const { calendarOpen } = useCalendar();

  const [copied, setCopied] = useState(false);
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });
  const [dragging, setDragging] = useState(false);
  const [justCalculated, setJustCalculated] =
    useState(false);

  const displayRef = useRef(null);

  const dragData = useRef({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
  });

  useEffect(() => {
    if (calculatorOpen) {
      setCopied(false);
    }
  }, [calculatorOpen]);

  useEffect(() => {
    if (displayRef.current) {
      displayRef.current.scrollLeft =
        displayRef.current.scrollWidth;
    }
  }, [display]);

  const handleAppend = (value) => {
    const isNumber =
      /^[0-9]$/.test(value);

    const isDecimal =
      value === ".";

    const isOperator =
      ["+", "-", "*", "/", "%"].includes(
        value
      );

    if (justCalculated) {
      if (isNumber || isDecimal) {
        setDisplay(value);
        setJustCalculated(false);
        return;
      }

      if (isOperator) {
        append(value);
        setJustCalculated(false);
        return;
      }

      setJustCalculated(false);
    }

    append(value);
  };

  const handleClear = () => {
    clear();
    setJustCalculated(false);
    setCopied(false);
  };

  const handleBackspace = () => {
    backspace();
    setJustCalculated(false);
  };

  const handleCalculate = () => {
    if (!display || display === "Error") {
      return;
    }

    calculate();
    setJustCalculated(true);
  };

  const handleMemoryRecall = () => {
    memoryRecall();
    setJustCalculated(false);
  };

  const handleMemoryAdd = () => {
    memoryAdd();
    setJustCalculated(false);
  };

  const handleMemorySubtract = () => {
    memorySubtract();
    setJustCalculated(false);
  };

  const handleHistoryResult = (result) => {
    useHistoryResult(result);
    setJustCalculated(true);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        !calculatorOpen ||
        calculatorMinimized
      ) {
        return;
      }

      const target = event.target;

      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        return;
      }

      const key = event.key;

      if (/^[0-9]$/.test(key)) {
        handleAppend(key);
        return;
      }

      if (key === ".") {
        handleAppend(".");
        return;
      }

      if (
        ["+", "-", "*", "/", "%"].includes(
          key
        )
      ) {
        handleAppend(key);
        return;
      }

      if (
        key === "Enter" ||
        key === "="
      ) {
        event.preventDefault();
        handleCalculate();
        return;
      }

      if (key === "Backspace") {
        event.preventDefault();
        handleBackspace();
        return;
      }

      if (key === "Delete") {
        event.preventDefault();
        handleClear();
        return;
      }

      if (key === "Escape") {
        closeCalculator();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    calculatorOpen,
    calculatorMinimized,
    display,
    justCalculated,
    closeCalculator,
  ]);

  const copyResult = async () => {
    if (!display) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        display
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.log(
        "Copy failed:",
        error
      );
    }
  };

  const refreshCalculator = () => {
    setDisplay("");
    setCopied(false);
    setJustCalculated(false);

    setPosition({
      x: 0,
      y: 0,
    });
  };

  const handleDragStart = (event) => {
    if (
      event.target.closest(
        ".calculator-window-actions"
      )
    ) {
      return;
    }

    setDragging(true);

    dragData.current = {
      startX: event.clientX,
      startY: event.clientY,
      initialX: position.x,
      initialY: position.y,
    };

    document.body.style.userSelect =
      "none";
  };

  useEffect(() => {
    if (!dragging) {
      return;
    }

    const handleMouseMove = (event) => {
      const deltaX =
        event.clientX -
        dragData.current.startX;

      const deltaY =
        event.clientY -
        dragData.current.startY;

      setPosition({
        x:
          dragData.current.initialX +
          deltaX,

        y:
          dragData.current.initialY +
          deltaY,
      });
    };

    const handleMouseUp = () => {
      setDragging(false);
      document.body.style.userSelect =
        "";
    };

    window.addEventListener(
      "mousemove",
      handleMouseMove
    );

    window.addEventListener(
      "mouseup",
      handleMouseUp
    );

    return () => {
      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      window.removeEventListener(
        "mouseup",
        handleMouseUp
      );

      document.body.style.userSelect =
        "";
    };
  }, [dragging]);

  if (!calculatorOpen) {
    return null;
  }

  if (calculatorMinimized) {
    return null;
  }

  const calculatorRight =
    calendarOpen
      ? "468px"
      : "28px";

  return (
    <div className="calculator-floating-layer">
      <div
        className={`calculator-window ${
          calendarOpen
            ? "calculator-beside-calendar"
            : ""
        }`}
        style={{
          right: calculatorRight,
          top: "120px",
          transform: `translate(${position.x}px, ${position.y}px)`,
        }}
      >
        <div
          className="calculator-window-header"
          onMouseDown={handleDragStart}
        >
          <div className="calculator-window-title">
            <div className="calculator-window-icon">
              <FaCalculator />
            </div>

            <div>
              <strong>
                SmaXTify Calculator
              </strong>

              <span>
                Smart Expense Tracker
              </span>
            </div>
          </div>

          <div className="calculator-window-actions">
            <button
              type="button"
              title="Refresh Calculator"
              aria-label="Refresh Calculator"
              onClick={refreshCalculator}
            >
              <FaRedo />
            </button>

            <button
              type="button"
              title="Minimize"
              aria-label="Minimize Calculator"
              onClick={minimizeCalculator}
            >
              −
            </button>

            <button
              type="button"
              title="Close"
              aria-label="Close Calculator"
              onClick={closeCalculator}
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="calculator-window-body">
          <div className="calculator-display-area">
            <span>
              Calculator
            </span>

            <input
              ref={displayRef}
              type="text"
              className="calculator-display"
              value={display}
              readOnly
              placeholder="0"
              aria-label="Calculator display"
            />

            <button
              type="button"
              className="calculator-copy-btn"
              title={
                copied
                  ? "Copied"
                  : "Copy result"
              }
              disabled={!display}
              onClick={copyResult}
            >
              {copied ? (
                <FaCheck />
              ) : (
                <FaCopy />
              )}
            </button>
          </div>

          <div className="calculator-memory-row">
            <button
              type="button"
              onClick={memoryClear}
            >
              MC
            </button>

            <button
              type="button"
              onClick={handleMemoryRecall}
            >
              MR
            </button>

            <button
              type="button"
              onClick={handleMemoryAdd}
            >
              M+
            </button>

            <button
              type="button"
              onClick={handleMemorySubtract}
            >
              M-
            </button>
          </div>

          <div className="calculator-grid">
            <button
              type="button"
              className="calculator-clear"
              onClick={handleClear}
            >
              C
            </button>

            <button
              type="button"
              title="Backspace"
              aria-label="Backspace"
              onClick={handleBackspace}
            >
              <FaBackspace />
            </button>

            <button
              type="button"
              className="calculator-operator"
              onClick={() =>
                handleAppend("%")
              }
            >
              %
            </button>

            <button
              type="button"
              className="calculator-operator"
              onClick={() =>
                handleAppend("/")
              }
            >
              ÷
            </button>

            <button
              type="button"
              onClick={() =>
                handleAppend("7")
              }
            >
              7
            </button>

            <button
              type="button"
              onClick={() =>
                handleAppend("8")
              }
            >
              8
            </button>

            <button
              type="button"
              onClick={() =>
                handleAppend("9")
              }
            >
              9
            </button>

            <button
              type="button"
              className="calculator-operator"
              onClick={() =>
                handleAppend("*")
              }
            >
              ×
            </button>

            <button
              type="button"
              onClick={() =>
                handleAppend("4")
              }
            >
              4
            </button>

            <button
              type="button"
              onClick={() =>
                handleAppend("5")
              }
            >
              5
            </button>

            <button
              type="button"
              onClick={() =>
                handleAppend("6")
              }
            >
              6
            </button>

            <button
              type="button"
              className="calculator-operator"
              onClick={() =>
                handleAppend("-")
              }
            >
              −
            </button>

            <button
              type="button"
              onClick={() =>
                handleAppend("1")
              }
            >
              1
            </button>

            <button
              type="button"
              onClick={() =>
                handleAppend("2")
              }
            >
              2
            </button>

            <button
              type="button"
              onClick={() =>
                handleAppend("3")
              }
            >
              3
            </button>

            <button
              type="button"
              className="calculator-operator"
              onClick={() =>
                handleAppend("+")
              }
            >
              +
            </button>

            <button
              type="button"
              className="calculator-sign"
              onClick={() =>
                handleAppend("0")
              }
            >
              0
            </button>

            <button
              type="button"
              onClick={() =>
                handleAppend(".")
              }
            >
              .
            </button>

            <button
              type="button"
              className="calculator-equal"
              style={{
                gridColumn: "span 2",
              }}
              onClick={handleCalculate}
            >
              =
            </button>
          </div>

          <div className="calculator-history">
            <div className="calculator-history-header">
              <div>
                <span>↶</span>
                <span>History</span>
              </div>

              {history.length > 0 && (
                <button
                  type="button"
                  onClick={clearHistory}
                >
                  Clear
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <p className="calculator-empty-history">
                No calculations yet
              </p>
            ) : (
              <div className="calculator-history-list">
                {history.map(
                  (item, index) => (
                    <button
                      type="button"
                      key={`${item.expression}-${index}`}
                      className="calculator-history-item"
                      onClick={() =>
                        handleHistoryResult(
                          item.result
                        )
                      }
                    >
                      <span>
                        {item.expression}
                      </span>

                      <strong>
                        = {item.result}
                      </strong>
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          <p className="calculator-keyboard-hint">
            Keyboard: 0–9 · + − × ÷ · Enter = Calculate ·
            Backspace · Delete · Esc
          </p>
        </div>
      </div>
    </div>
  );
}

export default Calculator;  