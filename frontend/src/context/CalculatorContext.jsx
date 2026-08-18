import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

const CalculatorContext =
  createContext(null);

export function CalculatorProvider({
  children,
}) {
  const [calculatorOpen, setCalculatorOpen] =
    useState(false);

  const [
    calculatorMinimized,
    setCalculatorMinimized,
  ] = useState(false);

  const [display, setDisplay] =
    useState("");

  const [history, setHistory] =
    useState([]);

  const [memory, setMemory] =
    useState(0);

  const openCalculator = () => {
    setCalculatorOpen(true);
    setCalculatorMinimized(false);
  };

  const closeCalculator = () => {
    setCalculatorOpen(false);
    setCalculatorMinimized(false);
  };

  const toggleCalculator = () => {
    setCalculatorOpen((current) => {
      if (!current) {
        setCalculatorMinimized(false);
      }

      return !current;
    });
  };

  const minimizeCalculator = () => {
    setCalculatorMinimized(true);
  };

  const restoreCalculator = () => {
    setCalculatorOpen(true);
    setCalculatorMinimized(false);
  };

  const append = (value) => {
    setDisplay((current) => {
      if (current === "Error") {
        return value;
      }

      if (!current) {
        if (
          ["+", "*", "/", "%"].includes(
            value
          )
        ) {
          return current;
        }

        return value;
      }

      const operators = [
        "+",
        "-",
        "*",
        "/",
      ];

      const lastCharacter =
        current[current.length - 1];

      if (
        operators.includes(value)
      ) {
        if (
          operators.includes(
            lastCharacter
          )
        ) {
          return (
            current.slice(0, -1) +
            value
          );
        }

        return current + value;
      }

      if (value === "%") {
        if (
          !/[0-9)]/.test(
            lastCharacter
          )
        ) {
          return current;
        }

        return current + value;
      }

      if (value === ".") {
        const parts =
          current.split(
            /[+\-*/%]/
          );

        const currentNumber =
          parts[parts.length - 1];

        if (
          currentNumber.includes(".")
        ) {
          return current;
        }

        if (
          !currentNumber ||
          currentNumber === "-"
        ) {
          return current + "0.";
        }

        return current + ".";
      }

      return current + value;
    });
  };

  const clear = () => {
    setDisplay("");
  };

  const backspace = () => {
    setDisplay((current) =>
      current.slice(0, -1)
    );
  };

  const calculate = () => {
    setDisplay((currentDisplay) => {
      if (
        !currentDisplay ||
        currentDisplay === "Error"
      ) {
        return currentDisplay;
      }

      let expression =
        currentDisplay;

      while (
        expression.length > 0 &&
        ["+", "-", "*", "/"].includes(
          expression[
            expression.length - 1
          ]
        )
      ) {
        expression =
          expression.slice(0, -1);
      }

      if (!expression) {
        return currentDisplay;
      }

      try {
        const safeExpression =
          expression.replace(
            /(\d+(?:\.\d+)?)%/g,
            "($1/100)"
          );

        const result = Function(
          `"use strict"; return (${safeExpression})`
        )();

        if (
          typeof result !== "number" ||
          !Number.isFinite(result)
        ) {
          throw new Error(
            "Invalid result"
          );
        }

        const formattedResult =
          Number.isInteger(result)
            ? result.toString()
            : Number(
                result.toFixed(12)
              ).toString();

        setHistory((currentHistory) => [
          {
            expression,
            result: formattedResult,
          },
          ...currentHistory,
        ]);

        return formattedResult;
      } catch {
        return "Error";
      }
    });
  };

  const memoryClear = () => {
    setMemory(0);
  };

  const memoryRecall = () => {
    setDisplay(memory.toString());
  };

  const memoryAdd = () => {
    setDisplay((currentDisplay) => {
      if (
        !currentDisplay ||
        currentDisplay === "Error"
      ) {
        return currentDisplay;
      }

      try {
        const expression =
          currentDisplay.replace(
            /(\d+(?:\.\d+)?)%/g,
            "($1/100)"
          );

        const result = Function(
          `"use strict"; return (${expression})`
        )();

        if (
          typeof result !== "number" ||
          !Number.isFinite(result)
        ) {
          return currentDisplay;
        }

        setMemory(
          (currentMemory) =>
            currentMemory + result
        );

        return currentDisplay;
      } catch {
        return currentDisplay;
      }
    });
  };

  const memorySubtract = () => {
    setDisplay((currentDisplay) => {
      if (
        !currentDisplay ||
        currentDisplay === "Error"
      ) {
        return currentDisplay;
      }

      try {
        const expression =
          currentDisplay.replace(
            /(\d+(?:\.\d+)?)%/g,
            "($1/100)"
          );

        const result = Function(
          `"use strict"; return (${expression})`
        )();

        if (
          typeof result !== "number" ||
          !Number.isFinite(result)
        ) {
          return currentDisplay;
        }

        setMemory(
          (currentMemory) =>
            currentMemory - result
        );

        return currentDisplay;
      } catch {
        return currentDisplay;
      }
    });
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const useHistoryResult = (
    result
  ) => {
    setDisplay(
      result?.toString() || ""
    );
  };

  const value = useMemo(
    () => ({
      calculatorOpen,
      calculatorMinimized,

      display,
      history,
      memory,

      openCalculator,
      closeCalculator,
      toggleCalculator,

      minimizeCalculator,
      restoreCalculator,

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
    }),
    [
      calculatorOpen,
      calculatorMinimized,
      display,
      history,
      memory,
    ]
  );

  return (
    <CalculatorContext.Provider
      value={value}
    >
      {children}
    </CalculatorContext.Provider>
  );
}

export function useCalculator() {
  const context =
    useContext(
      CalculatorContext
    );

  if (!context) {
    throw new Error(
      "useCalculator must be used inside CalculatorProvider"
    );
  }

  return context;
}