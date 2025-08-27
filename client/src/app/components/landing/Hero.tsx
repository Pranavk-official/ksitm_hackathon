"use client";

import Link from "next/link";

export function Hero() {
    return (
        <section className="grid gap-6 items-center md:grid-cols-2">
            <div>
                <h2 className="text-3xl sm:text-4xl font-bold">Citizen Service Requests & Fees</h2>
                <p className="mt-4 text-slate-700 dark:text-slate-300">
                    Streamlined government service requests with secure payment processing and role-based access control.
                </p>

                <div className="mt-6 flex gap-3">
                    <Link href="/auth/signup" className="rounded-md bg-slate-900 text-white px-4 py-2">
                        Get started
                    </Link>
                    <Link href="/auth/login" className="rounded-md border px-4 py-2">
                        Login
                    </Link>
                </div>
            </div>

            <div className="order-first md:order-last">
                <div className="w-full h-48 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                    <span className="text-slate-400">Illustration</span>
                </div>
            </div>
        </section>
    );
}
