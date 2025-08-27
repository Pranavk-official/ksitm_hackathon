"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormInput } from "../../components/auth/FormInput";
import { Button } from "../../components/auth/Button";
import { useSignup } from "@/app/hooks/useAuthHooks";

const schema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    mobile: z.string().min(6, "Mobile number must be at least 6 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof schema>;

export default function SignupPage() {
    const router = useRouter();
    const signupMutation = useSignup();

    const { register, handleSubmit, formState: { errors } } = useForm<SignupFormData>({
        resolver: zodResolver(schema)
    });

    async function onSubmit(data: SignupFormData) {
        try {
            await signupMutation.mutateAsync(data);
            // Redirect to login page after successful signup
            router.push("/auth/login?message=Account created successfully. Please log in.");
        } catch (error) {
            // Error is handled by the mutation
            console.error('Signup failed:', error);
        }
    }

    return (
        <div className="max-w-xl mx-auto p-6">
            <h2 className="text-2xl font-semibold mb-4">Create an account</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
                <FormInput
                    label="Name"
                    {...register("name")}
                    error={errors.name?.message}
                />
                <FormInput
                    label="Email"
                    type="email"
                    {...register("email")}
                    error={errors.email?.message}
                />
                <FormInput
                    label="Mobile"
                    {...register("mobile")}
                    error={errors.mobile?.message}
                />
                <FormInput
                    label="Password"
                    type="password"
                    {...register("password")}
                    error={errors.password?.message}
                />
                <FormInput
                    label="Confirm Password"
                    type="password"
                    {...register("confirmPassword")}
                    error={errors.confirmPassword?.message}
                />
                {signupMutation.error && (
                    <div className="text-red-600 text-sm">
                        {(signupMutation.error as Error).message}
                    </div>
                )}
                <Button
                    type="submit"
                    disabled={signupMutation.isPending}
                >
                    {signupMutation.isPending ? "Creating account..." : "Sign up"}
                </Button>
            </form>
        </div>
    );
}
