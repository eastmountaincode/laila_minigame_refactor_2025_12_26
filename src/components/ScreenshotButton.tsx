"use client";

import html2canvas from "html2canvas";

export function ScreenshotButton() {
  const handleScreenshot = async () => {
    const canvas = await html2canvas(document.body, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#000",
    });
    const link = document.createElement("a");
    link.download = `denial-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <button
      onClick={handleScreenshot}
      aria-label="Take screenshot"
      title="Take screenshot"
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 40,
        width: 36,
        height: 36,
        background: "#c0c0c0",
        border: "2px solid",
        borderColor: "#ffffff #808080 #808080 #ffffff",
        boxShadow: "inset 1px 1px 0 #dfdfdf, inset -1px -1px 0 #0a0a0a",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        fontSize: 18,
        lineHeight: 1,
      }}
    >
      📷
    </button>
  );
}
