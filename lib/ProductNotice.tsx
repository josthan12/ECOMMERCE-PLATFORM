// Shown on every product page. Edit the copy here and it updates everywhere.
export default function PurchaseNotice() {
  return (
    <div className="mt-6 rounded-lg border border-border-light bg-surface-muted p-4 text-sm leading-relaxed text-text-muted">
      <p className="font-medium text-text">Please read carefully before purchasing:</p>

      <p className="mt-2">
        <span className="font-medium text-text">Product Art:</span> Random art will be given unless otherwise
        stated.
      </p>
      <p className="mt-2">
        <span className="font-medium text-text">Condition:</span> Product condition is not guaranteed. Minor
        imperfections such as dents, scratches, shrink wrap tears, or other packaging defects may be present. If you
        require perfect display condition, please purchase in-store products after inspecting in person.
      </p>
      <p className="mt-2">
        <span className="font-medium text-text">Refund Policy:</span> All sales are final.
      </p>
      <p className="mt-2">
        <span className="font-medium text-text">Updates:</span> Arrival and collection updates will be posted in our
        Official Telegram Channel once stock is ready.
      </p>

      <p className="mt-3">
        By purchasing this product, you acknowledge and accept the above conditions. See our FAQ/T&amp;Cs for more
        details.
      </p>

      <p className="mt-3">
        Don&apos;t miss a presales event for new products! Join our Telegram to get notified of new releases,
        restock, and announcements!
      </p>
    </div>
  )
}