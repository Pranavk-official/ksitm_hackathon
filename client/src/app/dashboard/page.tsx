"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../providers/AuthProvider";
import { useLogout } from "../hooks/useAuthHooks";
import { Button } from "../components/auth/Button";
import { CitizenDashboard } from "../components/dashboard/CitizenDashboard";
import { OfficerDashboard } from "../components/dashboard/OfficerDashboard";
import { AdminDashboard } from "../components/dashboard/AdminDashboard";

export default function Dashboard() {
    const router = useRouter();
    const { user, isLoading, isAuthenticated } = useAuth();
    const logoutMutation = useLogout();

    console.log(user, isAuthenticated)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/auth/login");
        }
    }, [isAuthenticated, router]);

    const handleLogout = () => {
        logoutMutation.mutate();
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-center">Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return null; // Will redirect in useEffect
    }

    const renderDashboard = () => {
        const role = user.role as string;
        switch (role) {
            case 'ADMIN':
                return <AdminDashboard />;
            case 'OFFICER':
                return <OfficerDashboard />;
            case 'CITIZEN':
            default:
                return <CitizenDashboard />;
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-semibold">Welcome, {user.name || user.email}</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Role: {user.role || 'Citizen'}
                    </p>
                </div>
                <Button
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="bg-red-600 hover:bg-red-700"
                >
                    {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </Button>
            </div>

            {renderDashboard()}
        </div>
    );
}
