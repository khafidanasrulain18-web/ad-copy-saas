import nodemailer from 'nodemailer';

// Kredensial HANYA di backend, sama seperti prinsip OpenAI/Midtrans key
export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendOtpEmail(to, code) {
  await transporter.sendMail({
    from: `"AdCopy" <${process.env.GMAIL_USER}>`,
    to,
    subject: `${code} adalah kode verifikasi AdCopy kamu`,
    html: `
      <div style="font-family: sans-serif; max-width: 420px; margin: 0 auto;">
        <h2>Verifikasi email kamu</h2>
        <p>Gunakan kode berikut untuk mengaktifkan akun AdCopy kamu:</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px;">${code}</p>
        <p style="color: #888; font-size: 13px;">Kode ini berlaku 10 menit. Kalau kamu tidak merasa mendaftar, abaikan email ini.</p>
      </div>
    `,
  });
}