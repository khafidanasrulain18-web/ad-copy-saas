import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
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
  if (error) throw new Error(error.message || 'Gagal mengirim email via Resend.');
}

export async function sendResetPasswordEmail(to, code) {
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `${code} adalah kode reset password AdCopy kamu`,
    html: `
      <div style="font-family: sans-serif; max-width: 420px; margin: 0 auto;">
        <h2>Reset password</h2>
        <p>Gunakan kode berikut untuk atur ulang password akun AdCopy kamu:</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px;">${code}</p>
        <p style="color: #888; font-size: 13px;">Kode ini berlaku 10 menit. Kalau kamu tidak meminta reset password, abaikan email ini — password kamu tetap aman.</p>
      </div>
    `,
  });
  if (error) throw new Error(error.message || 'Gagal mengirim email via Resend.');
}