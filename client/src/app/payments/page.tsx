"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../providers/AuthProvider";
import { useMyPayments } from "../hooks/useServiceRequestHooks";
import { Button } from "../components/auth/Button";

export default function PaymentsPage() {
    const router = useRouter();
    const { user, isLoading, isAuthenticated } = useAuth();
    const { data: payments, isLoading: paymentsLoading } = useMyPayments();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/auth/login");
        }
    }, [isLoading, isAuthenticated, router]);

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'SUCCESS': return 'bg-green-100 text-green-800';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'FAILED': return 'bg-red-100 text-red-800';
            case 'REFUNDED': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleViewReceipt = (paymentId: string) => {
        // In a real implementation, this would open a receipt modal or navigate to a receipt page
        alert(`Receipt for Payment ID: ${paymentId}`);
    };

    if (isLoading || paymentsLoading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="text-center">Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-semibold">Payment History</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        View your payment transactions and receipts
                    </p>
                </div>
                <Button
                    onClick={() => router.push("/dashboard")}
                    className="bg-gray-600 hover:bg-gray-700"
                >
                    Back to Dashboard
                </Button>
            </div>

            <div className="p-6 bg-white dark:bg-slate-800 rounded-lg border">
                <h4 className="text-lg font-medium mb-4">My Payments</h4>
                {payments && payments.length > 0 ? (
                    <div className="space-y-3">
                        {payments.map((payment) => (
                            <div key={payment.id} className="p-4 border rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h5 className="font-medium">Order #{payment.orderId}</h5>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Request ID: {payment.requestId}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(payment.status)}`}>
                                            {payment.status}
                                        </span>
                                        {payment.status === 'SUCCESS' && (
                                            <Button
                                                onClick={() => handleViewReceipt(payment.paymentId || payment.id)}
                                                className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700"
                                            >
                                                View Receipt
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Amount: {payment.amount} {payment.currency}</span>
                                    <span>{new Date(payment.createdAt).toLocaleDateString()}</span>
                                </div>
                                {payment.paymentId && (
                                    <div className="text-sm text-gray-500 mt-1">
                                        Payment ID: {payment.paymentId}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        No payments found.
                    </div>
                )}
            </div>
        </div>
    );
}
