export function generateReceiptHTML(cart, subtotal) {
  const receiptDate = new Date().toLocaleString('en-NG', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
  const receiptNumber = Math.floor(Math.random() * 900000) + 100000;

  const itemsHTML = cart.map(item => 
    '<div style="display:flex; justify-content:space-between; margin-bottom:8px;">' +
      '<div>' +
        '<p style="font-weight:bold; margin:0;">' + item.name + '</p>' +
        '<p style="font-size:11px; margin:0; color:#555;">' + item.quantity + ' x ₦' + item.price + '</p>' +
      '</div>' +
      '<p style="font-weight:bold; margin:0;">₦' + (item.price * item.quantity) + '</p>' +
    '</div>'
  ).join('');

  return `
    <html>
      <head>
        <title>Receipt #${receiptNumber}</title>
        <style>
          body { font-family: 'Courier New', monospace; font-size: 13px; width: 300px; margin: 0 auto; padding: 16px; color: #000; }
          .center { text-align: center; }
          .divider { text-align: center; margin: 8px 0; }
          .row { display: flex; justify-content: space-between; margin-bottom: 6px; }
          .total-row { font-size: 16px; font-weight: bold; }
          .footer { font-size: 11px; text-align: center; margin-top: 12px; }
          h1 { font-size: 18px; margin: 0 0 4px 0; }
          p { margin: 2px 0; }
        </style>
      </head>
      <body>
        <div class="center">
          <h1>🏪 MY POS SHOP</h1>
          <p>123 Lagos Street, Nigeria</p>
          <p>Tel: 08012345678</p>
          <p>Date: ${receiptDate}</p>
          <p>Receipt No: #${receiptNumber}</p>
        </div>
        <div class="divider">- - - - - - - - - - - - -</div>
        ${itemsHTML}
        <div class="divider">- - - - - - - - - - - - -</div>
        <div class="row total-row">
          <span>TOTAL</span>
          <span>₦${subtotal}</span>
        </div>
        <div class="row">
          <span>Payment</span>
          <span>Cash</span>
        </div>
        <div class="divider">- - - - - - - - - - - - -</div>
        <div class="footer">
          <p>Thank you for your purchase!</p>
          <p>Please come again 🙏</p>
          <p>Powered by MyPOS v1.0</p>
        </div>
      </body>
    </html>
  `;
}
