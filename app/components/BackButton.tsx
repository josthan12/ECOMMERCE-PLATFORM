'use client'

import { useRouter } from 'next/navigation'

export default function BackButton() {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="text-sm text-gray-600 hover:text-gray-800 mb-4 inline-flex items-center gap-1"
    >
      ← Back
    </button>
  )
}