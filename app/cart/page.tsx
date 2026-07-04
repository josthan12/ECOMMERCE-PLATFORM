'use client';

import Link from 'next/link';
import { useCartStore } from '@/lib/store/cart';

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const subtotal = useCartStore((state) => state.getSubtotal());

  if (items.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 mb-4">Your cart is empty.</p>
        <Link href="/" className="underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Your Cart</h1>

      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <div
            key={item.variantId}
            className="flex items-center gap-4 border-b border-gray-200 pb-4"
          >
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.productName}
                className="w-20 h-20 object-cover"
              />
            ) : (
              <div className="w-20 h-20 bg-gray-100" />
            )}

            <div className="flex-1">
              <Link href={`/product/${item.productSlug}`} className="font-medium">
                {item.productName}
              </Link>
              <p className="text-sm text-gray-500">
                {Object.entries(item.combination)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(', ')}
              </p>
              <p className="text-sm">${item.price.toFixed(2)}</p>
            </div>

            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) =>
                updateQuantity(item.variantId, parseInt(e.target.value, 10) || 1)
              }
              className="w-16 border border-gray-300 px-2 py-1"
            />

            <button
              onClick={() => removeItem(item.variantId)}
              className="text-sm text-red-600 underline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-between items-center">
        <span className="font-semibold">Subtotal: ${subtotal.toFixed(2)}</span>
      </div>
    </div>
  );
}