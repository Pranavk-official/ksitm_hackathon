"use client";

export function Features() {
    const items = [
        { title: "Service Requests", desc: "Citizens can submit various service requests with transparent fee structures." },
        { title: "Secure Payments", desc: "Integrated payment gateway for processing service fees securely." },
        { title: "Role-Based Access", desc: "Different dashboards for Citizens, Officers, and Administrators." },
    ];

    return (
        <section className="mt-10 grid gap-6 sm:grid-cols-3">
            {items.map((it) => (
                <div key={it.title} className="p-4 rounded-lg border bg-white/50 dark:bg-slate-800/60">
                    <h3 className="font-semibold">{it.title}</h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{it.desc}</p>
                </div>
            ))}
        </section>
    );
}
