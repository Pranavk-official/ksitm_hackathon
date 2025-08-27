"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../auth/Button";
import { FormInput } from "../auth/FormInput";
import { useCreateServiceRequest, useMyServiceRequests, useServiceFee, useCreatePaymentOrder } from "../../hooks/useServiceRequestHooks";

const serviceRequestSchema = z.object({
    serviceType: z.string().min(1, "Service type is required"),
    description: z.string().optional(),
});

type ServiceRequestFormData = z.infer<typeof serviceRequestSchema>;

export function CitizenDashboard() {
    const [selectedServiceType, setSelectedServiceType] = useState("");
    const [showForm, setShowForm] = useState(false);
    const router = useRouter();

    const createRequestMutation = useCreateServiceRequest();
    const { data: myRequests, isLoading: requestsLoading, refetch } = useMyServiceRequests();
    const serviceFeeMutation = useServiceFee();
    const createPaymentOrderMutation = useCreatePaymentOrder();

    const { register, handleSubmit, reset, formState: { errors } } = useForm<ServiceRequestFormData>({
        resolver: zodResolver(serviceRequestSchema)
    });

    const serviceTypes = [
        "Document Verification",
        "License Renewal",
        "Permit Application",
        "Certificate Request",
        "Complaint Filing",
        "Information Inquiry"
    ];

    const handleServiceTypeChange = async (serviceType: string) => {
        setSelectedServiceType(serviceType);
        if (serviceType) {
            try {
                await serviceFeeMutation.mutateAsync(serviceType);
            } catch (error) {
                console.error('Failed to get service fee:', error);
            }
        }
    };

    const handlePayment = async (requestId: string) => {
        try {
            const response = await createPaymentOrderMutation.mutateAsync({ requestId });
            if (response.data?.orderId) {
                // In a real implementation, this would redirect to payment gateway
                // For now, we'll simulate payment success
                alert(`Payment order created: ${response.data.orderId}. Amount: ${response.data.amount} ${response.data.currency}`);
                refetch(); // Refresh requests to show updated payment status
            }
        } catch (error) {
            console.error('Payment failed:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'APPROVED': return 'bg-green-100 text-green-800';
            case 'REJECTED': return 'bg-red-100 text-red-800';
            case 'COMPLETED': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const onSubmit = async (data: ServiceRequestFormData) => {
        try {
            await createRequestMutation.mutateAsync({
                ...data,
                feeAmount: serviceFeeMutation.data?.data?.fee || 0,
            });
            reset();
            setShowForm(false);
            setSelectedServiceType("");
            refetch(); // Refresh the requests list
        } catch (error) {
            console.error('Failed to create service request:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Citizen Dashboard</h3>
                <div className="flex gap-2">
                    <Button onClick={() => router.push("/payments")}>
                        View Payments
                    </Button>
                    <Button onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : 'New Service Request'}
                    </Button>
                </div>
            </div>

            {showForm && (
                <div className="p-6 bg-white dark:bg-slate-800 rounded-lg border">
                    <h4 className="text-lg font-medium mb-4">Create New Service Request</h4>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Service Type</label>
                            <select
                                value={selectedServiceType}
                                onChange={(e) => handleServiceTypeChange(e.target.value)}
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select a service type</option>
                                {serviceTypes.map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        {serviceFeeMutation.data?.data && (
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                                <p className="text-sm">
                                    <strong>Service Fee:</strong> ${serviceFeeMutation.data.data.fee}
                                </p>
                            </div>
                        )}

                        <FormInput
                            label="Description (Optional)"
                            {...register("description")}
                            error={errors.description?.message}
                        />

                        {createRequestMutation.error && (
                            <div className="text-red-600 text-sm">
                                {(createRequestMutation.error as Error).message}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={createRequestMutation.isPending}
                        >
                            {createRequestMutation.isPending ? "Creating..." : "Create Request"}
                        </Button>
                    </form>
                </div>
            )}

            <div className="p-6 bg-white dark:bg-slate-800 rounded-lg border">
                <h4 className="text-lg font-medium mb-4">My Service Requests</h4>
                {requestsLoading ? (
                    <div className="text-center py-4">Loading requests...</div>
                ) : myRequests && myRequests.length > 0 ? (
                    <div className="space-y-3">
                        {myRequests.map((request) => (
                            <div key={request.id} className="p-4 border rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                    <h5 className="font-medium">{request.serviceType}</h5>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                            {request.status}
                                        </span>
                                        {request.feeAmount > 0 && (
                                            <span className="text-xs text-gray-500">
                                                Payment: {request.paymentStatus || 'Not Paid'}
                                            </span>
                                        )}
                                        {request.feeAmount > 0 && (!request.paymentStatus || request.paymentStatus === 'Not Paid') && (
                                            <Button
                                                onClick={() => handlePayment(request.id)}
                                                disabled={createPaymentOrderMutation.isPending}
                                                className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700"
                                            >
                                                {createPaymentOrderMutation.isPending ? 'Processing...' : 'Pay Now'}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                {request.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        {request.description}
                                    </p>
                                )}
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Fee: ${request.feeAmount}</span>
                                    <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        No service requests found. Create your first request above.
                    </div>
                )}
            </div>
        </div>
    );
}