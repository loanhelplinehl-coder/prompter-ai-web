"use client";

export default function Page() {
  return (
    <main className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Prompter AI</h1>

      <a
        className="inline-block px-4 py-2 rounded-lg border hover:bg-gray-100"
        href="/api/auth/signin"
      >
        Sign in
      </a>

      <button
        className="px-3 py-2 rounded bg-black text-white"
        onClick={async () => {
          const r = await fetch("/api/prompt/use", { method: "POST" });
          alert(await r.text());
        }}
      >
        Use 1 prompt
      </button>

      <a
        className="inline-block px-4 py-2 rounded-lg border"
        href="/api/ping"
      >
        Test /api/ping
      </a>
    </main>
  );
}
