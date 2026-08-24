import { body, validationResult } from 'express-validator';

export function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, data: null });
  }
  next();
}

export const registerValidators = [
  body('email').isEmail().withMessage('Format email tidak valid.').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password minimal 8 karakter.'),
];

export const loginValidators = [
  body('email').isEmail().withMessage('Format email tidak valid.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password wajib diisi.'),
];

export const verifyEmailValidators = [
  body('email').isEmail().withMessage('Format email tidak valid.').normalizeEmail(),
  body('code').isLength({ min: 6, max: 6 }).isNumeric().withMessage('Kode harus 6 digit angka.'),
];

export const resendOtpValidators = [
  body('email').isEmail().withMessage('Format email tidak valid.').normalizeEmail(),
];

export const generateValidators = [
  body('productName').trim().isLength({ min: 1, max: 200 }).withMessage('Nama produk wajib diisi, maksimal 200 karakter.'),
  body('description').trim().isLength({ min: 1, max: 1000 }).withMessage('Deskripsi wajib diisi, maksimal 1000 karakter.'),
  body('audience').trim().isLength({ min: 1, max: 300 }).withMessage('Target audiens wajib diisi, maksimal 300 karakter.'),
  body('tone').isIn(['santai', 'formal', 'persuasif', 'urgent']).withMessage('Tone tidak valid.'),
  body('platform').isIn(['Instagram Ads', 'Facebook Ads', 'Google Ads', 'Umum']).withMessage('Platform tidak valid.'),
  body('variations').isInt({ min: 1, max: 5 }).withMessage('Jumlah variasi harus antara 1-5.'),
];