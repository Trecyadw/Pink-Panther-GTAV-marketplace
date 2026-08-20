import dotenv from 'dotenv';
dotenv.config();

const webAppUrl = process.env.GOOGLE_SHEETS_WEB_APP_URL;

export async function appendOrderToSheet(order) {
  try {
    if (!webAppUrl) {
      console.warn('GOOGLE_SHEETS_WEB_APP_URL belum diisi');
      return;
    }

    if (!Array.isArray(order.items) || order.items.length === 0) return;

    // Memetakan setiap item beserta nama Gang-nya untuk dikirim ke Spreadsheet
    const rows = order.items.map((item) => ({
      order_id: order.id,
      order_code: order.order_code,
      order_datetime: order.created_at,
      user_id: order.user_id,
      username: order.username,
      ic_name: order.ic_name,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      order_status: order.order_status,
      notes: order.notes || '',
      product_id: item.product_id,
      product_name: item.product_name,
      price: item.price,
      qty: item.qty,
      subtotal: item.subtotal,
      gang: item.gang, // <-- INI TAMBAHANNYA: Mengirim data Gang ke Spreadsheet
    }));

    const response = await fetch(webAppUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'append',
        rows,
      }),
    });

    const text = await response.text();
    console.log('Response Google Sheets append:', text);
  } catch (error) {
    console.error('Gagal append order ke Google Sheets:', error.message);
  }
}

export async function updateOrderStatusInSheet({ orderId, paymentStatus, orderStatus }) {
  try {
    if (!webAppUrl) {
      console.warn('GOOGLE_SHEETS_WEB_APP_URL belum diisi');
      return;
    }

    const response = await fetch(webAppUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_status',
        order_id: orderId,
        payment_status: paymentStatus,
        order_status: orderStatus,
      }),
    });

    const text = await response.text();
    console.log('Response Google Sheets update:', text);
  } catch (error) {
    console.error('Gagal update status ke Google Sheets:', error.message);
  }
}