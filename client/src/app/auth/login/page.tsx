"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Suspense } from "react";
import { FormInput } from "../../components/auth/FormInput";
import { Button } from "../../components/auth/Button";
import { useLogin } from "../../hooks/useAuthHooks";

const schema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof schema>;

function LoginForm() {
    const router = useRouter();
    const loginMutation = useLogin();

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
        resolver: zodResolver(schema)
    });

    async function onSubmit(data: LoginFormData) {
        try {
            await loginMutation.mutateAsync(data);
            router.push("/dashboard");
        } catch (error) {
            // Error is handled by the mutation
            console.error('Login failed:', error);
        }
    }

    return (
        <div className="max-w-xl mx-auto p-6">
            <h2 className="text-2xl font-semibold mb-4">Login</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
                <FormInput
                    label="Email"
                    type="email"
                    {...register("email")}
                    error={errors.email?.message}
                />
                <FormInput
                    label="Password"
                    type="password"
                    {...register("password")}
                    error={errors.password?.message}
                />
                {loginMutation.error && (
                    <div className="text-red-600 text-sm">
                        {(loginMutation.error as Error).message}
                    </div>
                )}
                <Button
                    type="submit"
                    disabled={loginMutation.isPending}
                >
                    {loginMutation.isPending ? "Logging in..." : "Login"}
                </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
                <Link href="/auth/forgot-password" className="text-blue-600 hover:underline text-sm">
                    Forgot your password?
                </Link>
                <div>
                    <span className="text-gray-600 text-sm">Don&apos;t have an account? </span>
                    <Link href="/auth/signup" className="text-blue-600 hover:underline text-sm">
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    );
}

function LoginPageWithSearchParams() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}

export default function LoginPage() {
    return <LoginPageWithSearchParams />;
}
