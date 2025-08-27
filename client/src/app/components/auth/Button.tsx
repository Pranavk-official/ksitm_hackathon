"use client";

import React from "react";

export function Button({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...rest}
            className={`rounded-md bg-slate-900 text-white px-4 py-2 disabled:opacity-50 ${rest.className ?? ""}`}
        >
            {children}
        </button>
    );
}
