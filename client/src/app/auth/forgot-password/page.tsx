"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { FormInput } from "../../components/auth/FormInput";
import { Button } from "../../components/auth/Button";
import { useForgotPassword } from "../../hooks/useAuthHooks";

const schema = z.object({
    email: z.string().email("Invalid email address"),
});

type ForgotPasswordFormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
    const router = useRouter();
    const forgotPasswordMutation = useForgotPassword();

    const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(schema)
    });

    async function onSubmit(data: ForgotPasswordFormData) {
        try {
            const response = await forgotPasswordMutation.mutateAsync(data);
            // In development, the token is returned in the response
            if (response.data?.resetToken) {
                router.push(`/auth/reset-password?token=${response.data.resetToken}&email=${data.email}`);
            } else {
                router.push("/auth/login?message=Password reset instructions sent to your email");
            }
        } catch (error) {
            // Error is handled by the mutation
            console.error('Forgot password failed:', error);
        }
    }

    return (
        <div className="max-w-xl mx-auto p-6">
            <h2 className="text-2xl font-semibold mb-4">Forgot Password</h2>
            <p className="text-gray-600 mb-6">
                Enter your email address and we&apos;ll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
                <FormInput
                    label="Email"
                    type="email"
                    {...register("email")}
                    error={errors.email?.message}
                />

                {forgotPasswordMutation.error && (
                    <div className="text-red-600 text-sm">
                        {(forgotPasswordMutation.error as Error).message}
                    </div>
                )}

                {forgotPasswordMutation.isSuccess && (
                    <div className="text-green-600 text-sm">
                        Password reset instructions sent to your email.
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={forgotPasswordMutation.isPending}
                >
                    {forgotPasswordMutation.isPending ? "Sending..." : "Send Reset Link"}
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
