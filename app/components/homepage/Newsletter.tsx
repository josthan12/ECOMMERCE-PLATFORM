'use client'

// Non-functional for now — no email provider wired up yet.
// Submit handler intentionally does nothing beyond preventing default.
export default function Newsletter() {
  return (
    <div className="bg-gray-800 py-12">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-2xl font-bold text-white">Stay in the loop</h2>
        <p className="mt-2 text-gray-300">
          Get updates on new arrivals and promotions.
        </p>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="mt-6 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto"
        >
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 border rounded px-4 py-2 text-sm"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded text-sm font-medium hover:bg-blue-700"
          >
            Subscribe
          </button>
        </form>
      </div>
    </div>
  )
}