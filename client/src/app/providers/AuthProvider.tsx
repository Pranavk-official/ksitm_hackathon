"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { isAuthenticated, refreshAccessToken, getUserFromToken } from '../utils/tokenStore';

interface User {
    id: string;
    name: string | null;
    email: string;
    mobile: string | null;
    role: string | null;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (user: User) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
    hasRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const queryClient = useQueryClient();

    const login = (userData: User) => {
        setUser(userData);
    };

    const logout = () => {
        setUser(null);
        queryClient.clear();
        router.push('/auth/login');
    };

    const refreshUser = async () => {
        try {
            await refreshAccessToken();
            // After refreshing, we might need to fetch user data again
            // For now, we'll keep the current user data
        } catch (error) {
            console.error('Failed to refresh user:', error);
            logout();
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            if (isAuthenticated()) {
                // Try to get user from token first
                const userFromToken = getUserFromToken();
                if (userFromToken) {
                    setUser(userFromToken);
                }

                // Try to refresh token to ensure it's still valid
                try {
                    await refreshAccessToken();
                    // After refreshing, update user data if needed
                    const updatedUser = getUserFromToken();
                    if (updatedUser) {
                        setUser(updatedUser);
                    }
                } catch (error) {
                    console.error('Initial token refresh failed:', error);
                    // If refresh fails, clear user state
                    setUser(null);
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const hasRole = (roles: string[]): boolean => {
        if (!user || !user.role) return false;
        return roles.includes(user.role);
    };

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
        hasRole,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
