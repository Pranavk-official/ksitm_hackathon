"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../auth/Button";
import { useAdminUsers, useSetUserRole } from "../../hooks/useAdminHooks";

const setRoleSchema = z.object({
    role: z.enum(["ADMIN", "OFFICER", "CITIZEN"]),
});

type SetRoleFormData = z.infer<typeof setRoleSchema>;

export function AdminDashboard() {
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [showRoleForm, setShowRoleForm] = useState(false);

    const { data: users, isLoading, refetch } = useAdminUsers();
    const setUserRoleMutation = useSetUserRole();

    const { register, handleSubmit, reset, formState: { errors } } = useForm<SetRoleFormData>({
        resolver: zodResolver(setRoleSchema)
    });

    const getRoleColor = (role: string | null) => {
        switch (role) {
            case 'ADMIN': return 'bg-red-100 text-red-800';
            case 'OFFICER': return 'bg-blue-100 text-blue-800';
            case 'CITIZEN': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const onSubmit = async (data: SetRoleFormData) => {
        if (!selectedUser) return;

        try {
            await setUserRoleMutation.mutateAsync({
                id: selectedUser,
                role: data.role,
            });
            reset();
            setShowRoleForm(false);
            setSelectedUser(null);
            refetch(); // Refresh the users list
        } catch (error) {
            console.error('Failed to set user role:', error);
        }
    };

    const handleRoleChangeClick = (userId: string) => {
        setSelectedUser(userId);
        setShowRoleForm(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Admin Dashboard</h3>
                <Button onClick={() => refetch()} disabled={isLoading}>
                    Refresh
                </Button>
            </div>

            {showRoleForm && selectedUser && (
                <div className="p-6 bg-white dark:bg-slate-800 rounded-lg border">
                    <h4 className="text-lg font-medium mb-4">Change User Role</h4>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Role</label>
                            <select
                                {...register("role")}
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="CITIZEN">Citizen</option>
                                <option value="OFFICER">Officer</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                            {errors.role && (
                                <p className="text-red-600 text-sm mt-1">{errors.role.message}</p>
                            )}
                        </div>

                        {setUserRoleMutation.error && (
                            <div className="text-red-600 text-sm">
                                {(setUserRoleMutation.error as Error).message}
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button type="submit" disabled={setUserRoleMutation.isPending}>
                                {setUserRoleMutation.isPending ? "Updating..." : "Update Role"}
                            </Button>
                            <Button
                                type="button"
                                onClick={() => {
                                    setShowRoleForm(false);
                                    setSelectedUser(null);
                                    reset();
                                }}
                                className="bg-gray-500 hover:bg-gray-600"
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="p-6 bg-white dark:bg-slate-800 rounded-lg border">
                <h4 className="text-lg font-medium mb-4">User Management</h4>
                {isLoading ? (
                    <div className="text-center py-4">Loading users...</div>
                ) : users && users.length > 0 ? (
                    <div className="space-y-3">
                        {users.map((user) => (
                            <div key={user.id} className="p-4 border rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h5 className="font-medium">{user.name || 'No name'}</h5>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {user.email}
                                        </p>
                                        {user.mobile && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Mobile: {user.mobile}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                            {user.role || 'CITIZEN'}
                                        </span>
                                        <Button
                                            onClick={() => handleRoleChangeClick(user.id)}
                                            className="text-xs px-2 py-1"
                                        >
                                            Change Role
                                        </Button>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-500">
                                    Joined: {new Date(user.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        No users found.
                    </div>
                )}
            </div>
        </div>
    );
}
