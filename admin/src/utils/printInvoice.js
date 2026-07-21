import { formatCurrency, formatWeight, formatDateTime, formatAddress } from './format';
import { ORDER_STATUS_META, BRAND } from './constants';

// Opens a clean, self-contained invoice in a new window and triggers print.
// Kept out of React so it works regardless of the current page's styles.
export function printInvoice(order) {
  if (!order) return;
  const rows = order.items
    .map(
      (i) => `
      <tr>
        <td>${i.emoji || ''} ${i.name}</td>
        <td class="r">${formatWeight(i.grams)}</td>
        <td class="r">${formatCurrency(i.pricePerKg)}/kg</td>
        <td class="r">${formatCurrency(i.lineTotal)}</td>
      </tr>`
    )
    .join('');

  const a = order.deliveryAddress || {};
  const statusLabel = ORDER_STATUS_META[order.status]?.label || order.status;

  const html = `<!doctype html><html><head><meta charset="utf-8" />
    <title>Invoice #${String(order.id).slice(-6).toUpperCase()}</title>
    <style>
      * { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; }
      body { padding: 32px; color: #1a1d1f; }
      h1 { margin: 0; color: ${BRAND.primary}; }
      .muted { color: #6b7280; font-size: 13px; }
      .head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid ${BRAND.primary}; padding-bottom: 16px; margin-bottom: 16px; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th, td { text-align: left; padding: 8px 6px; border-bottom: 1px solid #eee; font-size: 14px; }
      th { color: #6b7280; font-weight: 600; }
      .r { text-align: right; }
      .total { font-size: 18px; font-weight: 700; text-align: right; margin-top: 12px; }
      .box { background:#f7f8fa; border-radius:8px; padding:12px 14px; margin-top: 8px; font-size: 14px; }
    </style></head>
    <body>
      <div class="head">
        <div>
          <h1>🥦 ${BRAND.name}</h1>
          <div class="muted">Fresh vegetables, delivered</div>
        </div>
        <div style="text-align:right">
          <div><strong>Invoice #${String(order.id).slice(-6).toUpperCase()}</strong></div>
          <div class="muted">${formatDateTime(order.createdAt)}</div>
          <div class="muted">Status: ${statusLabel}</div>
        </div>
      </div>

      <strong>Deliver to</strong>
      <div class="box">
        ${a.name || ''} · ${a.phone || ''}<br/>
        ${formatAddress(a)}
      </div>

      <table>
        <thead><tr><th>Item</th><th class="r">Weight</th><th class="r">Rate</th><th class="r">Amount</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="total">Total: ${formatCurrency(order.totalAmount)}</div>

      <script>window.onload = function(){ window.print(); }</script>
    </body></html>`;

  const w = window.open('', '_blank', 'width=800,height=900');
  if (!w) return;
  w.document.write(html);
  w.document.close();
}
