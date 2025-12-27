"use client";

import { useState } from "react";
import Image from "next/image";

export default function CompletePage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to subscribe");
      }

      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage("Oops! Something went wrong while submitting the form.");
    }
  };

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-black text-white">
      {/* Animated GIF Background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Image
          src="/assets/webflow/images/cropped-picmix.gif"
          alt=""
          width={1486}
          height={1000}
          className="h-full w-full object-cover opacity-60"
          unoptimized
          priority
        />
      </div>

      {/* Yellow Triangle Popup */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-6">
        {/* Triangle Container */}
        <div className="relative">
          <Image
            src="/assets/webflow/images/yellow-triangle-pop-up.png"
            alt=""
            width={600}
            height={500}
            className="h-auto w-[80vw] max-w-[600px]"
            priority
          />

          {/* Text and Form overlaid on triangle */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
            <p className="text-sm font-bold text-black md:text-base">
              Attention: You chose denial.
            </p>
            <p className="text-base font-medium text-black md:text-lg">
              Are you a cartographer of your own inner world?
            </p>

            {status === "success" ? (
              <div className="rounded bg-green-100 p-4 text-green-800">
                Thank you! Your submission has been received!
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex w-full max-w-xs flex-col gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="enter your email to receive"
                  required
                  className="rounded border border-gray-300 px-4 py-2 text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="rounded bg-yellow-500 px-4 py-2 font-medium text-black transition-colors hover:bg-yellow-600 disabled:opacity-50"
                >
                  {status === "loading" ? "Please wait..." : "Submit"}
                </button>
              </form>
            )}

            {status === "error" && (
              <div className="rounded bg-red-100 p-2 text-sm text-red-800">
                {errorMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
