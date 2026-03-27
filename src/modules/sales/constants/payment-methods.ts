export const PAYMENT_METHODS = ['CASH', 'CARD', 'TRANSFER'] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_TRANSLATION_KEY: Record<PaymentMethod, string> = {
  CASH: 'payment.cash',
  CARD: 'payment.card',
  TRANSFER: 'payment.transfer',
};