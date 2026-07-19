'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function BackButton() {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="mb-4 inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors duration-150 ease-out hover:text-primary"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      Back
    </button>
  )
}