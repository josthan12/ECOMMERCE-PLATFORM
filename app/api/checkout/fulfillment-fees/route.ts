import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    delivery: Number(process.env.SHIPPING_FEE_SGD ?? 5.50),
    selfCollection: Number(process.env.SELF_COLLECTION_FEE_SGD ?? 0),
  })
}