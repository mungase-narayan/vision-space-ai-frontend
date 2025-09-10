import React, { createContext, useContext } from "react";
import { useReactToPrint } from "react-to-print";

export const PrintContext = createContext(null);

export const usePrint = () => {
  const context = useContext(PrintContext);
  if (!context) throw Error("Context not found");
  return context;
};

const PrintProvider = ({ children }) => {
  const printRef = React.useRef(null);
  const canvasEl = React.useRef(null);

  const handleAfterPrint = React.useCallback(() => {}, []);
  const handleBeforePrint = React.useCallback(() => {
    return Promise.resolve();
  }, []);

  const printFn = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Report",
    onAfterPrint: handleAfterPrint,
    onBeforePrint: handleBeforePrint,
  });

  React.useEffect(() => {
    const ctx = canvasEl.current?.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.arc(95, 50, 40, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.fillStyle = "rgb(200, 0, 0)";
      ctx.fillRect(85, 40, 20, 20);
      ctx.save();
    }
  }, []);

  return (
    <PrintContext.Provider value={{ printFn, printRef }}>
      {children}
    </PrintContext.Provider>
  );
};

export default PrintProvider;
