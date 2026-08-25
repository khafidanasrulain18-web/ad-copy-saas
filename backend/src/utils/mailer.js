import { Resend } from 'resend';

// API key HANYA di backend, sama seperti prinsip OpenAI/Midtrans key
const resend = new Resend(process.env.RESEND_API_KEY);

// Ganti FROM_EMAIL setelah domain kamu terverifikasi di Resend.
// Selama masih pakai domain testing, email hanya akan terkirim ke alamat
// yang kamu pakai daftar akun Resend (batasan mode testing/sandbox mereka).
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'AdCopy <onboarding@resend.dev>';

export async function sendOtpEmail(to, code) {
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
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

  if (error) {
    // Lempar sebagai Error biasa supaya tertangkap try-catch di routes/auth.js,
    // sama seperti perilaku nodemailer sebelumnya
    throw new Error(error.message || 'Gagal mengirim email via Resend.');
  }
}