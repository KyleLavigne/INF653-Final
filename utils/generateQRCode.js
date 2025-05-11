const QRCode = require('qrcode');

module.exports = async function generateQRCode(data) {
  try {
    const qr = await QRCode.toDataURL(data);
    return qr;
  } catch (err) {
    console.error('Error generating QR code:', err);
    return null;
  }
};