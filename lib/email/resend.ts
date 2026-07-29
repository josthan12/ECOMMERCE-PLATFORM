import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

const legacyFromEmail = process.env.RESEND_FROM_EMAIL?.trim();

export const ORDER_FROM_EMAIL =
  process.env.RESEND_ORDER_FROM_EMAIL?.trim() ||
  legacyFromEmail ||
  'PokeSunshineTCG Orders <orders@biggyballs69.gay>';

export const NEWSLETTER_FROM_EMAIL =
  process.env.RESEND_NEWSLETTER_FROM_EMAIL?.trim() ||
  legacyFromEmail ||
  'PokeSunshineTCG <newsletters@biggyballs69.gay>';
