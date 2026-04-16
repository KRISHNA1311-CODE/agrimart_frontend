import { User } from "../types";

// Prevent multiple script injections
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (
      document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
      )
    ) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const handlePayRazorpay = async (
  amount: number,
  user: User | null,
  onPaymentSuccess: (paymentId: string) => void,
  onError: (message: string) => void,
) => {
  try {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      return onError(
        "Razorpay SDK failed to load. Please check your connection.",
      );
    }

    // 1. Create Order on Backend
    const response = await fetch("http://localhost:8000/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to initiate transaction");
    }

    const order = await response.json();

    // 2. Configure Razorpay Options
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount, // Amount returned from backend (in paise)
      currency: order.currency || "INR",
      name: "AgriMart",
      description: "Quality Agriculture Products",
      order_id: order.id,
      prefill: {
        name: user?.displayName || "",
        email: user?.email || "",
      },
      theme: { color: "#10b981" },
      // The handler is called after successful authorization
      handler: async (paymentResponse: any) => {
        try {
          const verifyRes = await fetch(
            "http://localhost:8000/verify-payment",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_signature: paymentResponse.razorpay_signature,
              }),
            },
          );

          if (verifyRes.ok) {
            onPaymentSuccess(paymentResponse.razorpay_payment_id);
          } else {
            const errorMsg = await verifyRes.json();
            onError(errorMsg.error || "Payment verification failed");
          }
        } catch (error) {
          onError("Network error during verification");
        }
      },
      modal: {
        ondismiss: () => {
          console.log("Checkout modal closed by user");
        },
      },
    };

    const rzp = new (window as any).Razorpay(options);

    // Handle payment failures (e.g., insufficient funds)
    rzp.on("payment.failed", (response: any) => {
      console.error("Payment Failed Context:", response.error);
      onError(response.error.description || "Payment failed at gateway");
    });

    rzp.open();
  } catch (error: any) {
    console.error("Razorpay Error:", error);
    onError(error.message || "An unexpected error occurred");
  }
};
