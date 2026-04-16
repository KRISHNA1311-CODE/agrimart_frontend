export const sendTelegramNotification = async (message: string) => {
  try {
    const response = await fetch('/api/notifications/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
    return { status: 'error', message: 'Failed to connect to Telegram service' };
  }
};

export const sendLowStockAlert = async (productName: string, stockLevel: number) => {
  const telegramMessage = `⚠️ <b>Low Stock Alert</b>\n\n<b>Product:</b> ${productName}\n<b>Stock Level:</b> ${stockLevel}\n\nPlease restock soon.`;
  return sendTelegramNotification(telegramMessage);
};

export const sendOrderStatusUpdate = async (orderId: string, status: string, customerName: string) => {
  const telegramMessage = `📦 <b>Order Update</b>\n\n<b>Order ID:</b> ${orderId}\n<b>Customer:</b> ${customerName}\n<b>New Status:</b> ${status}`;
  return sendTelegramNotification(telegramMessage);
};

export const sendPaymentReceivedNotification = async (orderId: string, amount: number, customerName: string) => {
  const telegramMessage = `💰 <b>Payment Received</b>\n\n<b>Order ID:</b> ${orderId}\n<b>Customer:</b> ${customerName}\n<b>Amount:</b> ₹${amount}\n<b>Method:</b> COD (Delivered)`;
  return sendTelegramNotification(telegramMessage);
};
