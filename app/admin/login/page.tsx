"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      router.replace(searchParams.get("next") || "/admin");
      router.refresh();
    } catch {
      setError("Supabase is not configured for this environment yet.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--cream)] px-5 py-12 text-[var(--ink)]">
      <section className="w-full max-w-md border border-black/10 bg-[var(--paper)] p-7 shadow-[0_20px_60px_rgba(24,21,19,0.08)] sm:p-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--burgundy)]">
          Rosy Boutique
        </p>
        <h1 className="font-display mt-4 text-5xl leading-none">Admin sign in</h1>
        <p className="mt-4 text-sm leading-6 text-black/55">
          Manage products, inventory, and the collection from one quiet workspace.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">Email</span>
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 min-h-12 w-full border border-black/15 bg-transparent px-4 text-base outline-none transition focus:border-[var(--burgundy)]"
            />
          </label>

          <label className="block">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">Password</span>
            <input
              required
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 min-h-12 w-full border border-black/15 bg-transparent px-4 text-base outline-none transition focus:border-[var(--burgundy)]"
            />
          </label>

          {error && <p className="text-sm text-[var(--burgundy)]">{error}</p>}

          <button
            disabled={isLoading}
            className="min-h-12 w-full bg-[var(--ink)] px-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-[var(--burgundy)] disabled:cursor-wait disabled:opacity-60"
          >
            {isLoading ? "Signing in" : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}