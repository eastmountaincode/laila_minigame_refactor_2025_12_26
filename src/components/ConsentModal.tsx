"use client";

interface ConsentModalProps {
  isOpen: boolean;
  onAccept: () => void;
  title?: string;
}

export function ConsentModal({
  isOpen,
  onAccept,
  title = "Do you want to contend?",
}: ConsentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-none">
      {/* Windows 95/XP style dialog */}
      <div
        style={{
          background: "#c0c0c0",
          border: "2px solid",
          borderColor: "#ffffff #808080 #808080 #ffffff",
          boxShadow: "inset 1px 1px 0 #dfdfdf, inset -1px -1px 0 #0a0a0a",
          padding: 0,
          minWidth: 280,
          fontFamily: '"MS Sans Serif", "Microsoft Sans Serif", Tahoma, Geneva, sans-serif',
          fontSize: 12,
          userSelect: "none",
        }}
      >
        {/* Title bar */}
        <div
          style={{
            background: "linear-gradient(90deg, #000080, #1084d0)",
            color: "#fff",
            fontWeight: "bold",
            fontSize: 12,
            padding: "3px 4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>denial</span>
          <button
            style={{
              background: "#c0c0c0",
              boxShadow:
                "inset -1px -1px #0a0a0a, inset 1px 1px #fff, inset -2px -2px grey, inset 2px 2px #dfdfdf",
              border: "none",
              width: 16,
              height: 14,
              padding: 0,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              lineHeight: 1,
              fontFamily: "Arial, sans-serif",
              fontWeight: "bold",
              color: "#000",
            }}
            aria-label="Close"
            tabIndex={-1}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "20px 24px 16px",
            display: "flex",
            alignItems: "flex-start",
            gap: 16,
          }}
        >
          {/* Question mark icon */}
          <div
            style={{
              width: 32,
              height: 32,
              minWidth: 32,
              borderRadius: "50%",
              background: "#fff",
              border: "2px solid #000080",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              fontWeight: "bold",
              color: "#000080",
              fontFamily: "serif",
            }}
          >
            ?
          </div>
          <p style={{ margin: 0, color: "#000", lineHeight: 1.4 }}>{title}</p>
        </div>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            padding: "0 24px 16px",
          }}
        >
          <button
            onClick={onAccept}
            style={{
              background: "#c0c0c0",
              border: "2px solid",
              borderColor: "#ffffff #808080 #808080 #ffffff",
              padding: "4px 24px",
              fontSize: 12,
              fontFamily: "inherit",
              cursor: "pointer",
              minWidth: 75,
              color: "#000",
            }}
          >
            OK
          </button>
          <button
            onClick={onAccept}
            style={{
              background: "#c0c0c0",
              border: "2px solid",
              borderColor: "#ffffff #808080 #808080 #ffffff",
              padding: "4px 24px",
              fontSize: 12,
              fontFamily: "inherit",
              cursor: "pointer",
              minWidth: 75,
              color: "#000",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
