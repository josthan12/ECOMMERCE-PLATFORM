import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { markOrderFailedAndRestoreStock } from '@/lib/orders'
import { sendOrderConfirmationEmail } from '@/lib/email/sendOrderEmail';
import { recordDiscountExpenseIfApplicable } from '@/lib/recordDiscountExpense'

export async function POST(req: Request) {
  const rawBody = await req.text()
  const signature = req.headers.get('Hitpay-Signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.HITPAY_WEBHOOK_SALT!)
    .update(rawBody)
    .digest('hex')

  const isValid =
    signature.length === expectedSignature.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))

  if (!isValid) {
    console.error('HitPay webhook: invalid signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const payload = JSON.parse(rawBody)
  const orderId = payload.reference_number
  const status = payload.status

  if (!orderId || !status) {
    return NextResponse.json({ error: 'Missing reference_number or status' }, { status: 400 })
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } })

  if (!order) {
    console.error(`HitPay webhook: no Order found for reference_number ${orderId}`)
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  if (order.status !== 'PENDING_PAYMENT') {
    return NextResponse.json({ received: true, note: 'Already processed' }, { status: 200 })
  }

  if (status === 'completed') {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'PAID' },
    })
    await recordDiscountExpenseIfApplicable(orderId)
    await sendOrderConfirmationEmail(order.id)
  } else if (status === 'failed') {
    await markOrderFailedAndRestoreStock(orderId)
  }

  return NextResponse.json({ received: true }, { status: 200 })
}