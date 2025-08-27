"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../utils/api";

interface User {
    id: string;
    name: string | null;
    email: string;
    mobile: string | null;
    role: string | null;
    createdAt: string;
}

interface ApiResponse<T = unknown> {
    data: T;
    message: string;
}

export function useAdminUsers() {
    return useQuery({
        queryKey: ['admin-users'],
        queryFn: () => api.get("/admin/users") as Promise<ApiResponse<User[]>>,
        select: (response: ApiResponse<User[]>) => response.data,
    });
}

export function useSetUserRole() {
    return useMutation({
        mutationFn: ({ id, role }: { id: string; role: string }) =>
            api.post(`/admin/users/${id}/role`, { role }) as Promise<ApiResponse<User>>,
    });
}

// Note: Audit logs endpoint not implemented in backend yet
// export function useAuditLogs() {
//     return useQuery({
//         queryKey: ['audit-logs'],
//         queryFn: () => api.get("/admin/audits") as Promise<ApiResponse<AuditLog[]>>,
//         select: (response: ApiResponse<AuditLog[]>) => response.data,
//     });
// }
