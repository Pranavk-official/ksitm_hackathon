"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../utils/api";

interface ServiceRequest {
    id: string;
    serviceType: string;
    description?: string;
    feeAmount: number;
    status: string;
    createdAt: string;
    paymentStatus?: string;
    user: {
        id: string;
        name: string | null;
        email: string;
    };
}

interface UpdateRequestStatusData {
    status: string;
    note?: string;
}

interface ApiResponse<T = unknown> {
    data: T;
    message: string;
}

export function useOfficerRequests() {
    return useQuery({
        queryKey: ['officer-requests'],
        queryFn: () => api.get("/officer/requests") as Promise<ApiResponse<ServiceRequest[]>>,
        select: (response: ApiResponse<ServiceRequest[]>) => response.data,
    });
}

export function useUpdateRequestStatus() {
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateRequestStatusData }) =>
            api.post(`/officer/requests/${id}/status`, data) as Promise<ApiResponse<ServiceRequest>>,
    });
}
