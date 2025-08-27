"use client";

import { useMutation } from "@tanstack/react-query";
import { saveTokens } from "../utils/tokenStore";
import { useAuth } from "../providers/AuthProvider";
import { api } from "../utils/api";

interface SignupData {
    name: string;
    email: string;
    mobile: string;
    password: string;
    confirmPassword: string;
}

interface LoginData {
    email: string;
    password: string;
}

interface ApiResponse<T = unknown> {
    data: T;
    message: string;
}

interface User {
    id: string;
    name: string | null;
    email: string;
    mobile: string | null;
    role: string | null;
}

export function useSignup() {
    return useMutation({
        mutationFn: (data: SignupData) => api.post("/auth/signup", data) as Promise<ApiResponse<User>>,
        onSuccess: (response: ApiResponse<User>) => {
            // Signup successful, but user needs to login
            console.log("Signup successful:", response.message);
        },
    });
}

export function useLogin() {
    const { login } = useAuth();

    return useMutation({
        mutationFn: async (data: LoginData) => {
            const response = await api.post("/auth/login", data);
            console.log(response)
            return response;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onSuccess: (response: any) => {
            console.log(response)
            saveTokens(response.data.accessToken, response.data.refreshToken || null);
            login(response.data.user);
        },
    });

}

export function useRefresh() {
    const { refreshUser } = useAuth();

    return useMutation({
        mutationFn: () => api.post("/auth/refresh", {}),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onSuccess: async (response: any) => {
            if (response.data?.accessToken) {
                saveTokens(response.data.accessToken, response.data.refreshToken || null);
                await refreshUser();
            }
        },
    });
}

export function useForgotPassword() {
    return useMutation({
        mutationFn: (data: { email: string }) => api.post("/auth/forgot", data) as Promise<ApiResponse<{ resetToken: string }>>,
        onSuccess: (response: ApiResponse<{ resetToken: string }>) => {
            console.log('Forgot password successful:', response.message);
        },
    });
}

export function useResetPassword() {
    return useMutation({
        mutationFn: (data: { token: string; newPassword: string }) => api.post("/auth/reset", data) as Promise<ApiResponse<User>>,
        onSuccess: (response: ApiResponse<User>) => {
            console.log('Reset password successful:', response.message);
        },
    });
}

export function useLogout() {
    const { logout } = useAuth();

    return useMutation({
        mutationFn: () => api.post("/auth/logout", {}) as Promise<ApiResponse<null>>,
        onSettled: () => {
            saveTokens(null, null);
            logout();
        },
    });
}
