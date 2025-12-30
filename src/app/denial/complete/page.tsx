"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function CompletePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
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

      // Redirect to i-love-you page on success
      router.push("/denial/i-love-you");
    } catch {
      setStatus("error");
      setErrorMessage("Oops! Something went wrong while submitting the form.");
    }
  };

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-black">
      {/* Animated GIF Background */}
      <div className="absolute inset-0">
        <Image
          src="/assets/webflow/images/cropped-picmix.gif"
          alt=""
          width={1486}
          height={1000}
          className="h-full w-full object-cover"
          unoptimized
          priority
        />
      </div>

      {/* Dialog Box - using actual image */}
      <div className="relative z-10 w-[95vw] max-w-[600px] md:w-[70vw] md:max-w-[900px]">
        {/* Dialog background image */}
        <Image
          src="/assets/webflow/images/yellow-triangle-pop-up.png"
          alt=""
          width={1790}
          height={400}
          className="h-[240px] w-full object-fill md:h-[280px] md:object-fill"
          unoptimized
          priority
        />

        {/* Title bar text - positioned relative to dialog */}
        <div
          className="absolute left-0 right-0 top-[4%] text-center font-pixel text-[14px] text-white md:text-[20px]"
        >
          Attention: You chose denial.
        </div>

        <div
          className="absolute left-0 right-0 text-center font-pixel text-[16px] text-black md:text-[24px]"
          style={{ top: "27%" }}
        >
          Are you a cartographer of your own inner world?
        </div>

        {/* Input - positioned separately */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: "45%" }}
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="enter your email to receive"
            required
            form="email-form"
            className="w-[280px] border-none bg-white px-3 py-[1px] font-pixel-alt text-[30px] text-black placeholder:text-[30px] md:w-[400px] md:py-[1px] md:text-[30px] md:placeholder:text-[30px]"
            style={{ outline: "2px dotted #cc0000" }}
          />
        </div>

        {/* Submit button - positioned separately */}
        <form id="email-form" onSubmit={handleSubmit} className="absolute left-1/2 -translate-x-1/2" style={{ top: "70%" }}>
          <button
            type="submit"
            disabled={status === "loading"}
            className="h-[50px] w-[160px] cursor-pointer bg-[url('/assets/webflow/images/Screenshot-2023-11-19-at-14.00.16.png')] bg-contain bg-center bg-no-repeat font-pixel text-[24px] text-black disabled:opacity-50 md:h-[50px] md:w-[180px] md:text-[30px]"
          >
            {status === "loading" ? "Please wait..." : "Submit"}
          </button>
        </form>

        {status === "error" && (
          <div className="absolute left-1/2 -translate-x-1/2 font-pixel text-[10px] text-red-600" style={{ top: "250%" }}>
            {errorMessage}
          </div>
        )}
      </div>
    </main>
  );
}
