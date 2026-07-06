import { auth } from '@clerk/nextjs/server'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { markOrderFailedAndRestoreStock } from '@/lib/orders'

type Props = {
  searchParams: Promise<{ orderId?: string; status?: string }>
}

async function reconcileIfStale(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } })

  if (!order || order.status !== 'PENDING_PAYMENT' || !order.hitpayPaymentRequestId) {
    return order
  }

  const res = await fetch(
    `${process.env.HITPAY_API_BASE_URL}/payment-requests/${order.hitpayPaymentRequestId}`,
    { headers: { 'X-BUSINESS-API-KEY': process.env.HITPAY_API_KEY! }, cache: 'no-store' }
  )

  if (!res.ok) {
    return order
  }

  const hitpayData = await res.json()
  
  console.log('[hitpay reconcile]', orderId, hitpayData.status, hitpayData)

  if (hitpayData.status === 'completed') {
    return prisma.order.update({ where: { id: orderId }, data: { status: 'PAID' } })
  }

  if (['failed', 'canceled', 'expired'].includes(hitpayData.status)) {
    return markOrderFailedAndRestoreStock(orderId)
  }

  return order
}


export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { orderId, status } = await searchParams

  if (!orderId) {
    notFound()
  }

  const { userId: clerkId } = await auth()
  if (!clerkId) {
    notFound()
  }

  const user = await prisma.user.findUnique({ where: { clerkId } })
  if (!user) {
    notFound()
  }

  const reconciled = await reconcileIfStale(orderId)

  if (!reconciled || reconciled.userId !== user.id) {
    notFound()
  }

  // Cosmetic-only: customer explicitly backed out and it's still within the buffer
  // window, so we haven't verified the real outcome yet. Show cancellation messaging
  // without touching the DB — the order may still complete via webhook if the
  // customer had already scanned the QR code before navigating away.
  const showCosmeticCancel = status === 'canceled' && reconciled.status === 'PENDING_PAYMENT'

  if (showCosmeticCancel) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold mb-2">Payment Cancelled</h1>
        <p className="text-gray-500">Order ID: {orderId}</p>
        <p className="mt-4 text-sm text-gray-600">
          Your payment was not completed. If you had already scanned a QR code, please
          allow a few minutes for it to process before trying again.
        </p>
      </div>
    )
  }

  const messages: Record<string, string> = {
    PENDING_PAYMENT: 'We are confirming your payment status.',
    PAYMENT_FAILED: 'Payment was not completed. Your order has not been placed.',
  }

  if (reconciled.status !== 'PAID') {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold mb-2">Payment Status</h1>
        <p className="text-gray-500">Order ID: {orderId}</p>
        <p className="mt-4 text-sm text-gray-600">
          {messages[reconciled.status] ?? 'We are confirming your payment status.'}
        </p>
      </div>
    )
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  })

  if (!order) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-2xl font-semibold mb-1">Order placed!</h1>
      <p className="text-gray-500 mb-8">Order ID: {order.id}</p>

      <div className="mb-8">
        <h2 className="font-medium mb-3">Items</h2>
        <div className="flex flex-col gap-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm border-b pb-2">
              <div>
                <p>{item.productName}</p>
                <p className="text-gray-500">
                  {Object.entries((item.combination as Record<string, string>) ?? {})
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(', ')}
                </p>
                <p className="text-gray-400">Qty: {item.quantity}</p>
              </div>
              <p>${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="font-medium mb-2">Shipping Address</h2>
        <p className="text-sm text-gray-600">
          Block {order.shippingBlock}
          {order.shippingUnitNumber ? `, ${order.shippingUnitNumber}` : ''}
          <br />
          {order.shippingStreet}
          <br />
          Singapore {order.shippingPostalCode}
        </p>
      </div>

      <div className="text-sm space-y-1">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${order.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>GST</span>
          <span>${order.gstAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-semibold pt-1 border-t">
          <span>Total</span>
          <span>${order.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}