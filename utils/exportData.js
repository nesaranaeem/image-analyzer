// utils/exportData.js
import jsPDF from "jspdf";

export const exportAsPDF = (data) => {
  const doc = new jsPDF();
  doc.setFontSize(12);
  const text = JSON.stringify(data, null, 2);
  const lines = doc.splitTextToSize(text, 180);
  doc.text(lines, 10, 10);
  doc.save("analysis.pdf");
};

export const exportAsJSON = (data) => {
  const dataStr =
    "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
  const downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "analysis.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};
