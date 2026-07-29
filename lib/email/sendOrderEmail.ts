import { prisma } from '@/lib/prisma';
import { resend, ORDER_FROM_EMAIL } from './resend';
import OrderConfirmationEmail from './templates/orderConfirmation';
import PaymentFailedEmail from './templates/paymentFailed';
import ShippingNotificationEmail from './templates/shippingNotification';
import ReadyForCollectionEmail from './templates/readyForCollection';
import { SELF_COLLECTION_ADDRESS } from '@/lib/constants';
import { GST_ENABLED, GST_RATE_DISPLAY } from '@/lib/gst';

export async function sendOrderConfirmationEmail(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: true },
    });
    if (!order) {
      console.error('[email] order not found for confirmation email', orderId);
      return;
    }

    await resend.emails.send({
      from: ORDER_FROM_EMAIL,
      to: order.user.email,
      subject: `Order confirmed — ${order.id}`,
      react: OrderConfirmationEmail({
        orderId: order.id,
        items: order.items.map((i) => ({
          productName: i.productName,
          combination: (i.combination ?? {}) as Record<string, string>,
          quantity: i.quantity,
          price: i.price,
        })),
        subtotal: order.subtotal,
        promoCode: order.promoCode,
        discountAmount: order.discountAmount,
        shippingFee: order.shippingFee,
        fulfillmentMethod: order.fulfillmentMethod,
        gstAmount: order.gstAmount,
        gstEnabled: GST_ENABLED,
        gstRateDisplay: GST_RATE_DISPLAY,
        total: order.total,
        shippingBlock: order.shippingBlock ?? '',
        shippingUnitNumber: order.shippingUnitNumber,
        shippingStreet: order.shippingStreet ?? '',
        shippingPostalCode: order.shippingPostalCode ?? '',
      }),
    });
  } catch (err) {
    console.error('[email] failed to send order confirmation', orderId, err);
  }
}

export async function sendPaymentFailedEmail(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });
    if (!order) {
      console.error('[email] order not found for failed-payment email', orderId);
      return;
    }

    await resend.emails.send({
      from: ORDER_FROM_EMAIL,
      to: order.user.email,
      subject: `Payment unsuccessful — ${order.id}`,
      react: PaymentFailedEmail({
        orderId: order.id,
        total: order.total,
      }),
    });
  } catch (err) {
    console.error('[email] failed to send payment-failed email', orderId, err);
  }
}

export async function sendShippingNotificationEmail(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });
    if (!order) {
      console.error('[email] order not found for shipping notification', orderId);
      return;
    }

    await resend.emails.send({
      from: ORDER_FROM_EMAIL,
      to: order.user.email,
      subject: `Your order has shipped — ${order.id}`,
      react: ShippingNotificationEmail({
        orderId: order.id,
        trackingNumber: order.trackingNumber,
        shippingBlock: order.shippingBlock ?? '',
        shippingUnitNumber: order.shippingUnitNumber,
        shippingStreet: order.shippingStreet ?? '',
        shippingPostalCode: order.shippingPostalCode ?? '',
      }),
    });
  } catch (err) {
    console.error('[email] failed to send shipping notification', orderId, err);
  }
}

export async function sendReadyForCollectionEmail(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });
    if (!order) {
      console.error('[email] order not found for ready-for-collection email', orderId);
      return;
    }

    await resend.emails.send({
      from: ORDER_FROM_EMAIL,
      to: order.user.email,
      subject: `Your order is ready for collection — ${order.id}`,
      react: ReadyForCollectionEmail({
        orderId: order.id,
        pickupAddress: SELF_COLLECTION_ADDRESS,
      }),
    });
  } catch (err) {
    console.error('[email] failed to send ready-for-collection email', orderId, err);
  }
}
