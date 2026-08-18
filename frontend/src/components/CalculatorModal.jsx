import { useState, useEffect } from "react";
import Draggable from "react-draggable";
import {
  FaTimes,
  FaBackspace,
  FaWindowMinimize,
  FaHistory,
} from "react-icons/fa";

import "./styles/calculator.css";

function CalculatorModal({
  isOpen,
  onClose,
}) {

  const [display, setDisplay] = useState("");

  const [history, setHistory] = useState([]);

  const [memory, setMemory] = useState(0);

  const [minimized, setMinimized] = useState(false);

  

  // ==========================
  // Keyboard Support
  // ==========================

  useEffect(() => {

    const handleKeyDown = (e) => {

      const key = e.key;

      if (
        /[0-9]/.test(key) ||
        ["+", "-", "*", "/", ".", "%"].includes(key)
      ) {
        setDisplay(prev => prev + key);
      }

      if (key === "Enter") {

        e.preventDefault();

        calculate();

      }

      if (key === "Backspace") {

        setDisplay(prev => prev.slice(0, -1));

      }

      if (key === "Delete") {

        clear();

      }

      if (key === "Escape") {

        onClose();

      }

    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

  }, [display, onClose]);

  // ==========================
  // Basic Operations
  // ==========================

  const append = (value) => {

    setDisplay(prev => prev + value);

  };

  const clear = () => {

    setDisplay("");

  };

  const backspace = () => {

    setDisplay(prev =>
      prev.slice(0, -1)
    );

  };

  // ==========================
  // Memory
  // ==========================

  const memoryClear = () => {

    setMemory(0);

  };

  const memoryRecall = () => {

    setDisplay(memory.toString());

  };

  const memoryAdd = () => {

    if (!display) return;

    setMemory(prev =>
      prev + Number(display)
    );

  };

  const memorySubtract = () => {

    if (!display) return;

    setMemory(prev =>
      prev - Number(display)
    );

  };

  // ==========================
  // Calculate
  // ==========================
  const calculate = () => {

  if (!display) return;

  try {

    const expression = display.replace(/%/g, "/100");

    const result = Function(
      `"use strict"; return (${expression})`
    )();

    setHistory(prev => [
      `${display} = ${result}`,
      ...prev.slice(0, 9),
    ]);

    setDisplay(result.toString());

  } catch {

    setDisplay("Error");

  }

};

// ==========================
  // Minimized View
  // ==========================


if (minimized) {
  return (
    <div
      className="calculator-mini"
      onClick={() => setMinimized(false)}
    >
      🧮 Calculator
    </div>
  );
}

  // ==========================
  // UI
  // ==========================
  if (!isOpen) {
  return null;
}
  return (
    

    <div
      className="calculator-overlay"
      onClick={onClose}
    >
      

      <Draggable
  handle=".calculator-header"
  bounds="body"
  defaultPosition={{ x: 200, y: 80 }}
>
  <div
    className="calculator-modal"
    onClick={(e) => e.stopPropagation()}
  >

          {/* Header */}

          <div className="calculator-header">

            <h2>🧮 Calculator</h2>

            <div className="calculator-actions">

              <button
                className="mini-btn"
                onClick={() => setMinimized(true)}
              >
                <FaWindowMinimize />
              </button>

              <button
                className="close-btn"
                onClick={onClose}
              >
                <FaTimes />
              </button>

            </div>

          </div>

          {/* Display */}

          <input
            className="calculator-display"
            value={display}
            readOnly
            placeholder="0"
          />

          {/* Memory Buttons */}

          <div className="memory-row">

            <button onClick={memoryClear}>
              MC
            </button>

            <button onClick={memoryRecall}>
              MR
            </button>

            <button onClick={memoryAdd}>
              M+
            </button>

            <button onClick={memorySubtract}>
              M-
            </button>

          </div>

          {/* Calculator Buttons */}

          <div className="calculator-grid">

            <button onClick={clear}>
              C
            </button>

            <button onClick={backspace}>
              <FaBackspace />
            </button>

            <button onClick={() => append("%")}>
              %
            </button>

            <button onClick={() => append("/")}>
              ÷
            </button>

            <button onClick={() => append("7")}>
              7
            </button>

            <button onClick={() => append("8")}>
              8
            </button>

            <button onClick={() => append("9")}>
              9
            </button>

            <button onClick={() => append("*")}>
              ×
            </button>

            <button onClick={() => append("4")}>
              4
            </button>

            <button onClick={() => append("5")}>
              5
            </button>

            <button onClick={() => append("6")}>
              6
            </button>

            <button onClick={() => append("-")}>
              −
            </button>

            <button onClick={() => append("1")}>
              1
            </button>

            <button onClick={() => append("2")}>
              2
            </button>

            <button onClick={() => append("3")}>
              3
            </button>

            <button onClick={() => append("+")}>
              +
            </button>

            <button
              className="zero"
              onClick={() => append("0")}
            >
              0
            </button>

            <button onClick={() => append(".")}>
              .
            </button>

            <button
              className="equal"
              onClick={calculate}
            >
              =
            </button>

          </div>

          {/* History */}

          <div className="history-box">

            <h3>

              <FaHistory />

              History

            </h3>

            {

              history.length === 0 ? (

                <p className="empty-history">

                  No calculations yet

                </p>

              ) : (

                history.map((item, index) => (

                  <div
                    key={index}
                    className="history-item"
                    onClick={() =>
                      setDisplay(
                        item.split("=")[1].trim()
                      )
                    }
                  >

                    {item}

                  </div>

                ))

              )

            }

          </div>

        </div>

      </Draggable>

    </div>
  );
}
export default CalculatorModal;