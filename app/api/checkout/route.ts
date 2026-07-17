import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateTotalWithGST } from '@/lib/gst'
import { validateShippingAddress } from '@/lib/validateAddress'
import { markOrderFailedAndRestoreStock } from '@/lib/orders'
import { Prisma } from '@/app/generated/prisma/client'

export async function POST(req: Request) {
  const SHIPPING_FEE = Number(process.env.SHIPPING_FEE_SGD ?? 5.50)
  const SELF_COLLECTION_FEE = Number(process.env.SELF_COLLECTION_FEE_SGD ?? 0)
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { clerkId } })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const body = await req.json()
  const { items, fulfillmentMethod, shippingBlock, shippingUnitNumber, shippingStreet, shippingPostalCode } = body

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
  }
  if (fulfillmentMethod !== 'DELIVERY' && fulfillmentMethod !== 'SELF_COLLECTION') {
    return NextResponse.json({ error: 'Invalid fulfillment method' }, { status: 400 })
  }

  const validationError = validateShippingAddress({
    fulfillmentMethod,
    shippingBlock,
    shippingUnitNumber,
    shippingStreet,
    shippingPostalCode,
  })
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }

  let orderId: string | null = null

  try {
    const order = await prisma.$transaction(async (tx) => {
      const orderItemsData: {
        productVariantId: string
        productName: string
        combination: Prisma.InputJsonValue
        price: number
        quantity: number
        sku: string | null
      }[] = []

      for (const { variantId, quantity } of items) {
        if (!variantId || !quantity || quantity <= 0) {
          throw new Error('INVALID_ITEM')
        }

        const result = await tx.productVariant.updateMany({
          where: { id: variantId, stock: { gte: quantity }, product: { archived: false } },
          data: { stock: { decrement: quantity } },
        })

        if (result.count === 0) {
          throw new Error(`OUT_OF_STOCK:${variantId}`)
        }

        const variant = await tx.productVariant.findUnique({
          where: { id: variantId },
          include: { product: true },
        })

        if (!variant) {
          throw new Error('INVALID_ITEM')
        }

        orderItemsData.push({
          productVariantId: variant.id,
          productName: variant.product.name,
          combination: variant.combination ?? {},
          price: variant.price,
          quantity,
          sku: variant.sku,
        })
      }

      const subtotal = orderItemsData.reduce((sum, i) => sum + i.price * i.quantity, 0)
      const shippingFee = fulfillmentMethod === 'SELF_COLLECTION' ? SELF_COLLECTION_FEE : SHIPPING_FEE
      const { gst, total } = calculateTotalWithGST(subtotal, shippingFee)

      return tx.order.create({
        data: {
          userId: user.id,
          fulfillmentMethod,
          shippingBlock: fulfillmentMethod === 'SELF_COLLECTION' ? null : shippingBlock,
          shippingUnitNumber: fulfillmentMethod === 'SELF_COLLECTION' ? null : (shippingUnitNumber || null),
          shippingStreet: fulfillmentMethod === 'SELF_COLLECTION' ? null : shippingStreet,
          shippingPostalCode: fulfillmentMethod === 'SELF_COLLECTION' ? null : shippingPostalCode,
          subtotal,
          shippingFee,
          gstAmount: gst,
          total,
          items: { create: orderItemsData },
        },
      })
      })

  
    orderId = order.id

    const hitpayParams = new URLSearchParams({
      amount: order.total.toString(),
      currency: 'SGD',
      email: user.email,
      'payment_methods[]': "paynow_online",
      reference_number: order.id,
      redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?orderId=${order.id}`,
      send_email:'false',
      expires_after:'5 mins',
    })
    if (user.name) {
      hitpayParams.set('name', user.name)
    }

    const hitpayRes = await fetch(`${process.env.HITPAY_API_BASE_URL}/payment-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest',
        'X-BUSINESS-API-KEY': process.env.HITPAY_API_KEY!,
        
      },
      body: hitpayParams,
    })

    if (!hitpayRes.ok) {
      const errorBody = await hitpayRes.text()
      console.error('HitPay API error:', hitpayRes.status, errorBody)
      throw new Error('HITPAY_REQUEST_FAILED')
    }

    const hitpayData = await hitpayRes.json()

    await prisma.order.update({
      where: { id: order.id },
      data: { hitpayPaymentRequestId: hitpayData.id },
    })

    return NextResponse.json({ orderId: order.id, checkoutUrl: hitpayData.url }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'UNKNOWN'

    // Compensating action: if the Order was created but HitPay failed afterward,
    // this Order can never be paid — restore stock and mark it failed.
    if (message === 'HITPAY_REQUEST_FAILED' && orderId) {
      await markOrderFailedAndRestoreStock(orderId)
      return NextResponse.json({ error: 'Could not initiate payment. Please try again.' }, { status: 502 })
    }

    if (message.startsWith('OUT_OF_STOCK')) {
      return NextResponse.json(
        { error: 'One or more items are no longer available in the requested quantity.' },
        { status: 409 }
      )
    }
    if (message === 'INVALID_ITEM') {
      return NextResponse.json({ error: 'One or more items are invalid.' }, { status: 400 })
    }

    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Failed to place order.' }, { status: 500 })
  }
}