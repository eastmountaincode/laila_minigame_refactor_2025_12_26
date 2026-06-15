import Link from "next/link";
import type { CSSProperties } from "react";
import { getSafeAngerNextPath } from "@/lib/anger-access";

const WIN95_FONT = `"Pixelated MS Sans Serif", Arial, sans-serif`;
const CLOSE_ICON = `url("data:image/svg+xml;charset=utf-8,%3Csvg width='8' height='7' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M0 0h2v1h1v1h2V1h1V0h2v1H7v1H6v1H5v1h1v1h1v1h1v1H6V6H5V5H3v1H2v1H0V6h1V5h1V4h1V3H2V2H1V1H0V0z' fill='%23000'/%3E%3C/svg%3E")`;
const HELP_ICON = `url("data:image/svg+xml;charset=utf-8,%3Csvg width='6' height='9' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23000' d='M0 1h2v2H0zM1 0h4v1H1zM4 1h2v2H4zM3 3h2v1H3zM2 4h2v2H2zM2 7h2v2H2z'/%3E%3C/svg%3E")`;

const titleBarBtnStyle: CSSProperties = {
  display: "block",
  background: "silver",
  boxShadow:
    "inset -1px -1px #0a0a0a, inset 1px 1px #fff, inset -2px -2px grey, inset 2px 2px #dfdfdf",
  border: "none",
  minWidth: 16,
  minHeight: 14,
  padding: 0,
  cursor: "pointer",
  backgroundRepeat: "no-repeat",
};

const dialogBtnStyle: CSSProperties = {
  background: "silver",
  border: "none",
  boxShadow:
    "inset -1px -1px #0a0a0a, inset 1px 1px #fff, inset -2px -2px grey, inset 2px 2px #dfdfdf",
  padding: "0 12px",
  fontSize: 11,
  fontFamily: WIN95_FONT,
  WebkitFontSmoothing: "none",
  cursor: "pointer",
  minWidth: 75,
  minHeight: 23,
  color: "#222",
};

const defaultBtnStyle: CSSProperties = {
  ...dialogBtnStyle,
  boxShadow:
    "inset -2px -2px #0a0a0a, inset 1px 1px #0a0a0a, inset 2px 2px #fff, inset -3px -3px grey, inset 3px 3px #dfdfdf",
};

const inputStyle: CSSProperties = {
  background: "#fff",
  border: "none",
  boxShadow:
    "inset -1px -1px #fff, inset 1px 1px grey, inset -2px -2px #dfdfdf, inset 2px 2px #0a0a0a",
  padding: "3px 4px",
  fontSize: 11,
  fontFamily: WIN95_FONT,
  WebkitFontSmoothing: "none",
  color: "#222",
  width: "100%",
  height: 21,
  outline: "none",
};

type AngerPasswordPageProps = {
  searchParams?: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function AngerPasswordPage({
  searchParams,
}: AngerPasswordPageProps) {
  const params = await searchParams;
  const next = getSafeAngerNextPath(params?.next);
  const error = params?.error;

  return (
    <main
      className="grid min-h-dvh place-items-center bg-black p-5"
      style={{ fontFamily: WIN95_FONT }}
    >
      <section
        className="dreadful-dialog"
        style={{
          background: "silver",
          boxShadow:
            "inset -1px -1px #0a0a0a, inset 1px 1px #dfdfdf, inset -2px -2px grey, inset 2px 2px #fff",
          padding: 3,
          minWidth: 300,
          fontFamily: WIN95_FONT,
          fontSize: 11,
          WebkitFontSmoothing: "none",
          userSelect: "none",
          zIndex: 50,
        }}
      >
        <div
          className="dreadful-titlebar"
          style={{
            background: "linear-gradient(90deg, navy, #1084d0)",
            color: "#fff",
            fontWeight: "bold",
            fontSize: 11,
            fontFamily: WIN95_FONT,
            padding: "3px 2px 3px 3px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ letterSpacing: 0, marginRight: 24 }}>
            Attention: You chose anger.
          </span>
          <div style={{ display: "flex" }}>
            <button
              type="button"
              className="win95-btn"
              style={{
                ...titleBarBtnStyle,
                backgroundImage: HELP_ICON,
                backgroundPosition: "top 2px left 5px",
              }}
              aria-label="Help"
              tabIndex={-1}
            />
            <button
              type="button"
              className="win95-btn"
              style={{
                ...titleBarBtnStyle,
                backgroundImage: CLOSE_ICON,
                backgroundPosition: "top 3px left 4px",
                marginLeft: 2,
              }}
              aria-label="Close"
              tabIndex={-1}
            />
          </div>
        </div>
        <div
          className="dreadful-body"
          style={{ margin: 8 }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 14,
              padding: "8px 4px",
            }}
          >
            <img
              src="/assets/win95/warning_icon.png"
              alt=""
              width={32}
              height={32}
              style={{ flexShrink: 0, imageRendering: "pixelated" }}
            />
            <p style={{ margin: 0, paddingTop: 6, color: "#222" }}>
              This pathway is not open yet. Enter the password to continue.
            </p>
          </div>

          <form action="/api/anger-access" method="post" style={{ padding: "4px 4px 0" }}>
            <input type="hidden" name="next" value={next} />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <label
                htmlFor="anger-password"
                style={{ color: "#222", whiteSpace: "nowrap" }}
              >
                Password:
              </label>
              <input
                id="anger-password"
                name="password"
                type="password"
                required
                autoFocus
                style={{ ...inputStyle, cursor: "text" }}
              />
            </div>

            {error === "incorrect" && (
              <p style={{ color: "red", margin: "4px 4px 0", fontSize: 11 }}>
                That password did not work.
              </p>
            )}
            {error === "missing-config" && (
              <p style={{ color: "red", margin: "4px 4px 0", fontSize: 11 }}>
                ANGER_ACCESS_PASSWORD is not configured.
              </p>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 6,
                padding: "8px 0 4px",
              }}
            >
              <Link href="/" className="win95-btn" style={dialogBtnStyle}>
                Cancel
              </Link>
              <button
                type="submit"
                className="win95-btn win95-btn-default"
                style={defaultBtnStyle}
              >
                OK
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
