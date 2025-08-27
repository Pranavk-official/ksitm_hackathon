"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../auth/Button";
import { useOfficerRequests, useUpdateRequestStatus } from "../../hooks/useOfficerHooks";

const updateStatusSchema = z.object({
    status: z.enum(["APPROVED", "REJECTED"]),
    note: z.string().optional(),
});

type UpdateStatusFormData = z.infer<typeof updateStatusSchema>;

export function OfficerDashboard() {
    const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
    const [showUpdateForm, setShowUpdateForm] = useState(false);

    const { data: requests, isLoading, refetch } = useOfficerRequests();
    const updateStatusMutation = useUpdateRequestStatus();

    const { register, handleSubmit, reset, formState: { errors } } = useForm<UpdateStatusFormData>({
        resolver: zodResolver(updateStatusSchema)
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'APPROVED': return 'bg-green-100 text-green-800';
            case 'REJECTED': return 'bg-red-100 text-red-800';
            case 'COMPLETED': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const onSubmit = async (data: UpdateStatusFormData) => {
        if (!selectedRequest) return;

        // Find the selected request to check payment status
        const request = requests?.find(r => r.id === selectedRequest);
        if (data.status === 'APPROVED' && request && request.feeAmount > 0 && request.paymentStatus !== 'SUCCESS') {
            alert('Cannot approve request: Payment is required before approval.');
            return;
        }

        try {
            await updateStatusMutation.mutateAsync({
                id: selectedRequest,
                data: {
                    status: data.status,
                    note: data.note || "",
                }
            });
            reset();
            setShowUpdateForm(false);
            setSelectedRequest(null);
            refetch(); // Refresh the requests list
        } catch (error) {
            console.error('Failed to update request status:', error);
        }
    };

    const handleUpdateClick = (requestId: string) => {
        setSelectedRequest(requestId);
        setShowUpdateForm(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Officer Dashboard</h3>
                <Button onClick={() => refetch()} disabled={isLoading}>
                    Refresh
                </Button>
            </div>

            {showUpdateForm && selectedRequest && (
                <div className="p-6 bg-white dark:bg-slate-800 rounded-lg border">
                    <h4 className="text-lg font-medium mb-4">Update Request Status</h4>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Status</label>
                            <select
                                {...register("status")}
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="APPROVED">Approve</option>
                                <option value="REJECTED">Reject</option>
                            </select>
                            {errors.status && (
                                <p className="text-red-600 text-sm mt-1">{errors.status.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Note (Optional)</label>
                            <textarea
                                {...register("note")}
                                rows={3}
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                                placeholder="Add a note about this decision..."
                            />
                        </div>

                        {updateStatusMutation.error && (
                            <div className="text-red-600 text-sm">
                                {(updateStatusMutation.error as Error).message}
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button type="submit" disabled={updateStatusMutation.isPending}>
                                {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
                            </Button>
                            <Button
                                type="button"
                                onClick={() => {
                                    setShowUpdateForm(false);
                                    setSelectedRequest(null);
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
                <h4 className="text-lg font-medium mb-4">Service Requests</h4>
                {isLoading ? (
                    <div className="text-center py-4">Loading requests...</div>
                ) : requests && requests.length > 0 ? (
                    <div className="space-y-3">
                        {requests.map((request) => (
                            <div key={request.id} className="p-4 border rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h5 className="font-medium">{request.serviceType}</h5>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            By: {request.user.name || request.user.email}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                            {request.status}
                                        </span>
                                        {request.feeAmount > 0 && (
                                            <span className="text-xs text-gray-500">
                                                Payment: {request.paymentStatus || 'Not Paid'}
                                            </span>
                                        )}
                                        {request.status === 'PENDING' && (
                                            <Button
                                                onClick={() => handleUpdateClick(request.id)}
                                                className="text-xs px-2 py-1"
                                                disabled={request.feeAmount > 0 && request.paymentStatus !== 'SUCCESS'}
                                            >
                                                {request.feeAmount > 0 && request.paymentStatus !== 'SUCCESS' ? 'Payment Required' : 'Update'}
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
                        No service requests found.
                    </div>
                )}
            </div>
        </div>
    );
}
