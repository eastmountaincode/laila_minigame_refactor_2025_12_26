import Link from "next/link";

export default function AngerPage() {
  return (
    <main className="min-h-dvh bg-black text-white">
      <div className="mx-auto flex min-h-dvh max-w-2xl flex-col items-start justify-center gap-6 px-6">
        <h1 className="text-3xl font-semibold tracking-tight">Anger</h1>
        <p className="text-white/80">Placeholder page — we’ll rebuild this next.</p>
        <Link href="/" className="underline underline-offset-4">
          Back to home
        </Link>
      </div>
    </main>
  );
}





