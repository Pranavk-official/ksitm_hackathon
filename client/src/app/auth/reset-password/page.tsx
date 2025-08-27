"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { FormInput } from "../../components/auth/FormInput";
import { Button } from "../../components/auth/Button";
import { useResetPassword } from "../../hooks/useAuthHooks";

const schema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof schema>;

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [token, setToken] = useState<string | null>(null);
    const resetPasswordMutation = useResetPassword();

    useEffect(() => {
        const tokenParam = searchParams.get('token');
        setToken(tokenParam);
    }, [searchParams]);

    const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(schema)
    });

    async function onSubmit(data: ResetPasswordFormData) {
        if (!token) {
            alert('Invalid reset token');
            return;
        }

        try {
            await resetPasswordMutation.mutateAsync({
                token,
                newPassword: data.password
            });
            router.push("/auth/login?message=Password reset successful. Please log in with your new password.");
        } catch (error) {
            // Error is handled by the mutation
            console.error('Reset password failed:', error);
        }
    }

    if (token === null) {
        return <div>Loading...</div>;
    }

    if (!token) {
        return (
            <div className="max-w-xl mx-auto p-6">
                <h2 className="text-2xl font-semibold mb-4">Invalid Reset Link</h2>
                <p className="text-gray-600 mb-6">
                    This password reset link is invalid or has expired.
                </p>
                <Link href="/auth/forgot-password" className="text-blue-600 hover:underline">
                    Request a new reset link
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto p-6">
            <h2 className="text-2xl font-semibold mb-4">Reset Password</h2>
            <p className="text-gray-600 mb-6">
                Enter your new password below.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
                <FormInput
                    label="New Password"
                    type="password"
                    {...register("password")}
                    error={errors.password?.message}
                />

                <FormInput
                    label="Confirm New Password"
                    type="password"
                    {...register("confirmPassword")}
                    error={errors.confirmPassword?.message}
                />

                {resetPasswordMutation.error && (
                    <div className="text-red-600 text-sm">
                        {(resetPasswordMutation.error as Error).message}
                    </div>
                )}

                {resetPasswordMutation.isSuccess && (
                    <div className="text-green-600 text-sm">
                        Password reset successful! Redirecting to login...
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={resetPasswordMutation.isPending}
                >
                    {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
                </Button>
            </form>

            <div className="mt-6 text-center">
                <Link href="/auth/login" className="text-blue-600 hover:underline">
                    Back to Login
                </Link>
            </div>
        </div>
    );
}

function ResetPasswordPageWithSearchParams() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}

export default function ResetPasswordPage() {
    return <ResetPasswordPageWithSearchParams />;
}
