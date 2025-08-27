"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Hero } from "./components/landing/Hero";
import { Features } from "./components/landing/Features";
import { useAuth } from "./providers/AuthProvider";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <header className="max-w-5xl mx-auto p-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Citizen Service Requests & Fees</h1>
        <nav className="flex gap-3">
          <Link href="/auth/login" className="text-sm underline-offset-2 hover:text-blue-600">
            Login
          </Link>
          <Link
            href="/auth/signup"
            className="text-sm rounded-full bg-slate-900 text-white px-4 py-2 ml-2 hover:bg-slate-800 transition-colors"
          >
            Signup
          </Link>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <Hero />
        <Features />
      </main>

      <footer className="max-w-5xl mx-auto p-6 text-center text-sm text-slate-600">
        Built for the KSITM hackathon — Citizen Service Requests & Fees System.
      </footer>
    </div>
  );
}
