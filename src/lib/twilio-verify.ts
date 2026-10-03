import { createHmac, randomInt, timingSafeEqual } from 'crypto';

interface TwilioSmsConfiguration {
  accountSid: string;
  authToken: string;
  fromNumber: string;
  adminPhone: string;
}

export class TwilioSmsError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'TwilioSmsError';
  }
}

function getConfiguration(): TwilioSmsConfiguration {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER, ADMIN_LOGIN_OTP_PHONE } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER || !ADMIN_LOGIN_OTP_PHONE) {
    throw new Error('Admin SMS delivery is not configured.');
  }
  if (!/^AC[\da-f]{32}$/i.test(TWILIO_ACCOUNT_SID)) {
    throw new Error('Twilio account configuration is invalid.');
  }
  if (!/^\+[1-9]\d{7,14}$/.test(TWILIO_FROM_NUMBER) || !/^\+[1-9]\d{7,14}$/.test(ADMIN_LOGIN_OTP_PHONE)) {
    throw new Error('Twilio sender and admin destination must use E.164 format.');
  }
  return {
    accountSid: TWILIO_ACCOUNT_SID,
    authToken: TWILIO_AUTH_TOKEN,
    fromNumber: TWILIO_FROM_NUMBER,
    adminPhone: ADMIN_LOGIN_OTP_PHONE,
  };
}

function getOtpHmacKey() {
  const key = process.env.JWT_SECRET;
  if (!key) throw new Error('JWT_SECRET must be configured to protect admin SMS codes.');
  return key;
}

export function getAdminOtpPhone() {
  return getConfiguration().adminPhone;
}

export function generateAdminLoginCode() {
  return String(randomInt(100000, 1000000));
}

export function hashAdminLoginCode(code: string) {
  return createHmac('sha256', getOtpHmacKey()).update(code).digest('hex');
}

export function verifyAdminLoginCode(code: string, expectedHash: string) {
  const actual = Buffer.from(hashAdminLoginCode(code), 'hex');
  const expected = Buffer.from(expectedHash, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function sendAdminLoginCode(code: string) {
  const config = getConfiguration();
  const auth = Buffer.from(`${config.accountSid}:${config.authToken}`).toString('base64');
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      To: config.adminPhone,
      From: config.fromNumber,
      Body: `Your AyurCare admin login code is ${code}. It expires in 5 minutes. Do not share this code.`,
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new TwilioSmsError(response.status, 'Twilio SMS request failed.');
}