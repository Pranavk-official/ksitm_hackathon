"use client";

import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    name: string;
    error?: string;
};

export function FormInput({ label, name, error, ...rest }: Props) {
    return (
        <label className="flex flex-col gap-2 text-sm">
            {label && <span className="font-medium">{label}</span>}
            <input
                name={name}
                aria-label={label ?? name}
                aria-invalid={!!error}
                className={`border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-500 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                    }`}
                {...rest}
            />
            {error && <span className="text-red-600 text-xs">{error}</span>}
        </label>
    );
}
