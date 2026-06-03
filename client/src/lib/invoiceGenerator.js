/**
 * Invoice Generator — produces a printable HTML invoice in a new window.
 * No external dependencies required.
 */

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(v || 0);

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

/**
 * Generates and opens a printable invoice in a new browser window.
 * @param {Object} order - The order object from the API
 */
export function generateInvoice(order) {
  if (!order) return;

  const invoiceNumber = `INV-${String(order._id).slice(-8).toUpperCase()}`;
  const orderDate = formatDate(order.createdAt);
  const addr = order.shippingAddress || {};

  const itemRows = (order.items || [])
    .map(
      (item, i) => `
      <tr class="${i % 2 === 0 ? 'row-even' : 'row-odd'}">
        <td class="td-left">${item.name}</td>
        <td class="td-center">${formatCurrency(item.price)}</td>
        <td class="td-center">${item.quantity}</td>
        <td class="td-right">${formatCurrency(item.price * item.quantity)}</td>
      </tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice ${invoiceNumber} — NexCart</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fff; color: #111; font-size: 14px; line-height: 1.6; }
    .page { max-width: 780px; margin: 0 auto; padding: 48px 40px; }

    /* Header */
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 28px; border-bottom: 2px solid #F59E0B; }
    .brand { font-size: 28px; font-weight: 800; color: #F59E0B; letter-spacing: -0.5px; }
    .brand-tagline { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 2px; margin-top: 2px; }
    .invoice-meta { text-align: right; }
    .invoice-number { font-size: 18px; font-weight: 700; color: #111; }
    .invoice-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #888; }
    .invoice-date { font-size: 13px; color: #555; margin-top: 4px; }

    /* Addresses */
    .addresses { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 36px; }
    .address-block h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #888; margin-bottom: 8px; }
    .address-block p { font-size: 13px; color: #333; line-height: 1.7; }
    .address-block .name { font-weight: 600; color: #111; font-size: 14px; }

    /* Table */
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
    .items-table thead tr { background: #111; }
    .items-table thead th { padding: 12px 14px; color: #F59E0B; font-size: 11px; text-transform: uppercase; letter-spacing: 1.2px; font-weight: 600; }
    .th-left  { text-align: left; }
    .th-center{ text-align: center; }
    .th-right { text-align: right; }
    .td-left  { text-align: left; padding: 12px 14px; }
    .td-center{ text-align: center; padding: 12px 14px; color: #555; }
    .td-right { text-align: right; padding: 12px 14px; font-weight: 600; }
    .row-even { background: #fff; }
    .row-odd  { background: #f9f9f9; }
    .items-table tbody tr { border-bottom: 1px solid #eee; }
    .items-table tbody td { font-size: 13px; }

    /* Totals */
    .totals { margin-left: auto; width: 280px; margin-bottom: 40px; }
    .totals-row { display: flex; justify-content: space-between; padding: 7px 0; font-size: 13px; color: #555; border-bottom: 1px solid #f0f0f0; }
    .totals-row.total-final { border-top: 2px solid #F59E0B; border-bottom: none; padding-top: 12px; margin-top: 4px; }
    .totals-row.total-final span:first-child { font-size: 15px; font-weight: 700; color: #111; }
    .totals-row.total-final span:last-child  { font-size: 18px; font-weight: 800; color: #F59E0B; }

    /* Status */
    .status-badge { display: inline-block; padding: 3px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
    .status-paid    { background: #dcfce7; color: #15803d; }
    .status-pending { background: #fef9c3; color: #a16207; }
    .status-failed  { background: #fee2e2; color: #b91c1c; }

    /* Footer */
    .footer { border-top: 1px solid #eee; padding-top: 24px; display: flex; justify-content: space-between; align-items: center; }
    .footer-note { font-size: 11px; color: #999; }
    .footer-brand { font-size: 13px; font-weight: 700; color: #F59E0B; }

    /* Payment section */
    .payment-section { background: #f9f9f9; border: 1px solid #eee; border-radius: 10px; padding: 16px 20px; margin-bottom: 32px; display: flex; gap: 40px; }
    .payment-item h4 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 4px; }
    .payment-item p  { font-size: 13px; font-weight: 600; color: #111; }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="page">

    <!-- Header -->
    <div class="header">
      <div>
        <div class="brand">NexCart</div>
        <div class="brand-tagline">Premium Shopping</div>
      </div>
      <div class="invoice-meta">
        <div class="invoice-label">Invoice</div>
        <div class="invoice-number">${invoiceNumber}</div>
        <div class="invoice-date">Issued: ${orderDate}</div>
      </div>
    </div>

    <!-- Addresses -->
    <div class="addresses">
      <div class="address-block">
        <h3>Billed &amp; Shipped To</h3>
        <p class="name">${addr.fullName || '—'}</p>
        <p>${addr.email || ''}</p>
        <p>${addr.phone || ''}</p>
        <p>${addr.addressLine || ''}</p>
        <p>${[addr.city, addr.state].filter(Boolean).join(', ')} ${addr.pincode || ''}</p>
        <p>${addr.country || ''}</p>
      </div>
      <div class="address-block" style="text-align:right">
        <h3>Order Info</h3>
        <p><strong>Order ID:</strong> ${String(order._id).slice(-8).toUpperCase()}</p>
        <p><strong>Order Date:</strong> ${orderDate}</p>
        <p><strong>Payment:</strong>
          <span class="status-badge status-${order.paymentStatus || 'pending'}">
            ${(order.paymentStatus || 'pending').toUpperCase()}
          </span>
        </p>
        ${order.paymentMethod ? `<p><strong>Method:</strong> ${order.paymentMethod}</p>` : ''}
      </div>
    </div>

    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th class="th-left">Item</th>
          <th class="th-center">Unit Price</th>
          <th class="th-center">Qty</th>
          <th class="th-right">Total</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>

    <!-- Totals -->
    <div class="totals">
      <div class="totals-row">
        <span>Subtotal</span>
        <span>${formatCurrency(order.subtotal)}</span>
      </div>
      <div class="totals-row">
        <span>Shipping</span>
        <span>${formatCurrency(order.shippingCost)}</span>
      </div>
      <div class="totals-row">
        <span>Tax (8%)</span>
        <span>${formatCurrency(order.tax)}</span>
      </div>
      <div class="totals-row total-final">
        <span>Total</span>
        <span>${formatCurrency(order.totalAmount)}</span>
      </div>
    </div>

    <!-- Payment Summary -->
    <div class="payment-section">
      <div class="payment-item">
        <h4>Amount Paid</h4>
        <p>${formatCurrency(order.amountPaid || order.totalAmount)}</p>
      </div>
      ${order.transactionDate ? `
      <div class="payment-item">
        <h4>Transaction Date</h4>
        <p>${formatDate(order.transactionDate)}</p>
      </div>` : ''}
      ${order.paymentIntentId ? `
      <div class="payment-item">
        <h4>Transaction ID</h4>
        <p style="font-size:11px;font-family:monospace">${order.paymentIntentId}</p>
      </div>` : ''}
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-note">Thank you for shopping with NexCart.<br/>This is a computer-generated invoice.</div>
      <div class="footer-brand">NexCart</div>
    </div>

    <!-- Print Button (hidden on print) -->
    <div class="no-print" style="margin-top:32px;text-align:center">
      <button onclick="window.print()" style="background:#F59E0B;color:#000;border:none;padding:12px 32px;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;">
        🖨 Print / Save as PDF
      </button>
    </div>

  </div>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) {
    alert('Pop-up blocked. Please allow pop-ups to download invoices.');
    return;
  }
  win.document.write(html);
  win.document.close();
}
