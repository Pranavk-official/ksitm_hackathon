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
}

interface CreateServiceRequestData {
    serviceType: string;
    description?: string;
    feeAmount?: number;
}

interface PaymentTransaction {
    id: string;
    requestId: string;
    amount: number;
    currency: string;
    orderId: string;
    paymentId?: string;
    status: string;
    createdAt: string;
}

interface CreateOrderData {
    requestId: string;
}

interface ApiResponse<T = unknown> {
    data: T;
    message: string;
}

export function useCreateServiceRequest() {
    return useMutation({
        mutationFn: (data: CreateServiceRequestData) => api.post("/requests", data) as Promise<ApiResponse<ServiceRequest>>,
    });
}

export function useMyServiceRequests() {
    return useQuery({
        queryKey: ['my-requests'],
        queryFn: () => api.get("/requests/me") as Promise<ApiResponse<ServiceRequest[]>>,
        select: (response: ApiResponse<ServiceRequest[]>) => response.data,
    });
}

export function useServiceFee() {
    return useMutation({
        mutationFn: (serviceType: string) => api.get(`/requests/fee?serviceType=${serviceType}`) as Promise<ApiResponse<{ serviceType: string; fee: number }>>,
    });
}

export function useCreatePaymentOrder() {
    return useMutation({
        mutationFn: (data: CreateOrderData) => api.post("/payments/create-order", data) as Promise<ApiResponse<{ orderId: string; amount: number; currency: string }>>,
    });
}

export function useMyPayments() {
    return useQuery({
        queryKey: ['my-payments'],
        queryFn: () => api.get("/payments/me") as Promise<ApiResponse<PaymentTransaction[]>>,
        select: (response: ApiResponse<PaymentTransaction[]>) => response.data,
    });
}
