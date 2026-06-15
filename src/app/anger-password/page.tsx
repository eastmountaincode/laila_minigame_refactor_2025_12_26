import Link from "next/link";
import { getSafeAngerNextPath } from "@/lib/anger-access";

const WIN95_FONT = `"Pixelated MS Sans Serif", Arial, sans-serif`;

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
        className="w-[min(92vw,420px)]"
        style={{
          background: "silver",
          color: "#111",
          boxShadow:
            "inset -1px -1px #0a0a0a, inset 1px 1px #fff, inset -2px -2px grey, inset 2px 2px #dfdfdf",
          padding: 3,
        }}
      >
        <div
          className="title-bar"
          style={{
            alignItems: "center",
            background: "linear-gradient(90deg, navy, #1084d0)",
            color: "#fff",
            display: "flex",
            fontWeight: 700,
            minHeight: 18,
            padding: "2px 3px",
          }}
        >
          <div className="title-bar-text">Pathway unavailable</div>
        </div>
        <div
          className="window-body"
          style={{ background: "silver", color: "#111", padding: 12 }}
        >
          <p className="mb-3">
            This pathway is not open yet. Enter the password to continue.
          </p>

          <form action="/api/anger-access" method="post" className="space-y-3">
            <input type="hidden" name="next" value={next} />
            <div className="field-row">
              <label htmlFor="anger-password">Password:</label>
              <input
                id="anger-password"
                name="password"
                type="password"
                required
                autoFocus
                className="min-w-0 flex-1"
                style={{ background: "#fff", color: "#111" }}
              />
            </div>

            {error === "incorrect" && (
              <p className="text-[12px] font-bold text-red-600">
                That password did not work.
              </p>
            )}
            {error === "missing-config" && (
              <p className="text-[12px] font-bold text-red-600">
                ANGER_ACCESS_PASSWORD is not configured.
              </p>
            )}

            <div className="flex justify-end gap-2">
              <Link href="/" className="win95-btn">
                Cancel
              </Link>
              <button type="submit" className="win95-btn win95-btn-default">
                OK
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
