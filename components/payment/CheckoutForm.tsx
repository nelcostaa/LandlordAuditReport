"use client";

import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";

export function CheckoutForm({ price }: { price: number }) {
  const stripe = useStripe();
  const elements = useElements();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return; // Stripe hasn't loaded yet

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Redirect to our payment success page
        return_url: window.location.origin + "/payment/success",
      },
    });

    if (error) {
      setErrorMessage(error.message ?? "An unknown error occurred.");
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-4">
      <div className="p-4 border rounded-lg bg-white">
        <PaymentElement />
      </div>

      {errorMessage && (
        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
          {errorMessage}
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 h-12 text-lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" /> Pay £{price}
          </>
        )}
      </Button>
    </form>
  );
}
