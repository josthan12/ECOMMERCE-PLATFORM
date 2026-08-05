# Payment Direction Options

Date recorded: 2026-08-04

Status: **Decision deferred. No payment replacement is approved for
implementation.**

## Context

The existing checkout and exactly-once order transition logic are implemented
around HitPay. Production payment-request attempts returned `403`, and the
owner subsequently confirmed that activating the required live HitPay account
would involve business verification and sole-proprietorship documentation that
they have not decided to obtain.

The owner will first complete the separately authorized disposable-data reset
and then plan and complete a storefront professionalism pass. Only after those
steps will the payment direction be selected.

## Option A - Register and Retain Automated Payments

Register a sole proprietorship and complete the verification required by
HitPay, or evaluate another regulated provider with equivalent PayNow support.

Benefits:

- Provider-created payment requests and hosted/managed QR presentation.
- Authenticated webhook or status-API confirmation.
- Automatic expiry, reconciliation, refunds, and provider transaction IDs.
- The current HitPay payment architecture can largely remain in place if
  HitPay is retained.

Trade-offs:

- Business registration, identity/entity verification, and provider approval
  are required.
- Provider fees and ongoing account administration apply.
- A different provider would still require integration and production testing.

## Option B - Manual Personal PayNow

Use the owner's OCBC personal PayNow mobile proxy and generate the QR inside
the application. This avoids a payment gateway but does not provide automatic
bank-confirmed settlement.

### Proposed Customer Flow

1. Checkout creates an order in `PENDING_PAYMENT` and reserves stock.
2. `Order.id` is embedded as the PayNow reference, subject to confirming that
   OCBC displays the complete value without truncation.
3. The application generates a PayNow QR containing the exact, non-editable
   SGD amount and a five-minute expiry.
4. The payment page displays a five-minute timer plus two actions:
   - **I have paid** moves the order to `PAYMENT_REVIEW`, keeps stock reserved,
     hides the QR, and alerts the owner by email and in the admin dashboard.
   - **I did not pay** moves the order to `PAYMENT_FAILED`, restores stock,
     sends the normal failure email, and opens the payment-failure screen.
5. If neither action is chosen before expiry, the browser and scheduled job
   race safely to move a still-pending order to `PAYMENT_FAILED`, restore stock
   once, send the failure email once, and show the failure screen.
6. An order already in `PAYMENT_REVIEW` is not failed by expiry. The owner
   checks OCBC for the exact order ID and amount, then confirms paid or unpaid
   from the admin order page.

### Paid-But-Failed Recovery

The owner accepts that a customer may complete payment immediately before
expiry, press the wrong button, or close the page before submitting their
response. The failure page must tell a debited customer not to pay again and
to email the owner with the order ID.

After independently checking OCBC, the owner can recover a failed manual
PayNow order from the admin panel:

- Recovery atomically re-reserves all required stock before changing
  `PAYMENT_FAILED` to `PAID`.
- If any required stock is no longer available, recovery is blocked. The order
  remains failed until the owner refunds the payment or resolves inventory.
- A successful recovery records the verifier and time, creates any applicable
  promotion expense, and sends the normal confirmation email exactly once.

### Technical Boundaries

- Generate the PayNow/SGQR payload on the server and render it with the generic
  `qrcode` package. Do not send the mobile number, order ID, or amount to an
  external QR-generator website at runtime.
- Treat the Full Stack generator only as a development cross-check. It is not
  a payment processor and does not prove that money reached OCBC.
- Do not accept screenshots, customer-entered references, parsed email/push
  notifications, browser scraping, or stored OCBC credentials as payment
  proof.
- Reuse the existing atomic payment-transition and durable email-outbox logic
  so button, timer, cron, and admin races cannot duplicate stock, expenses, or
  email side effects.
- Preserve the HitPay fields and routes during the first manual-PayNow release.
  A provider-mode setting must support `HITPAY`, `MANUAL_PAYNOW`, and
  `DISABLED`; operational rollback uses `DISABLED` unless HitPay authorization
  has been restored.

### Required Validation Before Selection

Before enabling manual PayNow publicly:

1. Confirm that the current 25-character alphanumeric `Order.id` is accepted
   as the PayNow reference.
2. Scan a generated QR with OCBC and at least one other participating bank app
   without paying; verify recipient identity, locked amount, reference, and
   expiry.
3. With separate explicit approval, perform one minimal live payment and
   confirm that the receiving OCBC transaction exposes the complete order ID
   and exact amount for reconciliation.
4. If OCBC omits or truncates the order ID, do not enable this design. Revisit
   a shorter dedicated payment reference instead.
5. Test exactly-once timeout, manual review, failure, recovery, stock,
   promotion-expense, and email behavior before public activation.

## Automatic Verification Boundary

QR generation and payment verification are separate capabilities. A QR can
lock an amount, reference, and expiry without any API, but only the receiving
bank or a regulated payment provider can authoritatively confirm settlement.
No documented OCBC personal-account API was found for this purpose.

Automatic PayNow confirmation remains available only by adopting a provider
or corporate banking product with the required onboarding. Examples considered
during research include HitPay, Stripe PayNow webhooks, OCBC business
collections, and DBS RAPID.

## Decision Gate

Do not implement either direction until the owner has:

1. Separately authorized and completed the disposable-data reset.
2. Defined and completed the desired storefront professionalism pass.
3. Chosen between business registration with automated payments and the manual
   personal-PayNow workflow above.
4. Explicitly authorized the selected payment implementation and its rollout
   test.

## Research References

- Full Stack PayNow QR generator:
  https://www.fullstacksys.com/paynow-qr-code-generator
- Association of Banks in Singapore - PayNow:
  https://abs.org.sg/e-payments/pay-now
- OCBC personal PayNow help:
  https://www.ocbc.com/personal-banking/help-and-support/payments-and-transactions/paynow
- HSBC Singapore PayNow corporate API technical guide:
  https://develop.hsbc.com/sites/default/files/hsbc_pdf/API%20Specification%20and%20Technical%20Integration%20Guide%20of%20HSBC%20Singapore%20PayNow%20Corporates.pdf
- Stripe PayNow documentation:
  https://docs.stripe.com/payments/paynow
- OCBC business collections:
  https://www.ocbc.com/business-banking/smes/transactions/receiving-payments
- DBS RAPID:
  https://www.dbs.com.sg/corporate/solutions/rapid
