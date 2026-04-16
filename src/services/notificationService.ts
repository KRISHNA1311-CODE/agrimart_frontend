export const sendTelegramNotification = async (message: string) => {
  try {
    // Corrected to use the full API URL
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/notifications/telegram`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ message }),
      },
    );

    return await response.json();
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
    return {
      success: false,
      error: "Failed to connect to notification service",
    };
  }
};

export const sendLowStockAlert = async (
  productName: string,
  stockLevel: number,
) => {
  const telegramMessage = `⚠️ <b>Low Stock Alert</b>\n\n<b>Product:</b> ${productName}\n<b>Current Stock:</b> ${stockLevel}\n\nPlease restock soon.`;
  return sendTelegramNotification(telegramMessage);
};

export const sendOrderStatusUpdate = async (
  orderId: string,
  status: string,
  customerName: string,
) => {
  const telegramMessage = `📦 <b>Order Update</b>\n\n<b>Order ID:</b> ${orderId}\n<b>Customer:</b> ${customerName}\n<b>New Status:</b> ${status}`;
  return sendTelegramNotification(telegramMessage);
};

export const sendPaymentReceivedNotification = async (
  orderId: string,
  amount: number,
  customerName: string,
) => {
  // Updated message for consistency with Razorpay integration
  const telegramMessage = `💰 <b>Payment Received</b>\n\n<b>Order ID:</b> ${orderId}\n<b>Customer:</b> ${customerName}\n<b>Amount:</b> ₹${amount}\n<b>Status:</b> Paid via Razorpay`;
  return sendTelegramNotification(telegramMessage);
};
