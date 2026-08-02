import { Body, Container, Head, Heading, Html, Preview, Section, Text, Button } from '@react-email/components';
import { BRAND } from './brand';

export interface PaymentFailedProps {
  orderId: string;
  total: number;
}

export default function PaymentFailedEmail({ orderId, total }: PaymentFailedProps) {
  return (
    <Html>
      <Head />
      <Preview>{`Your ${BRAND.storeName} payment didn't go through`}</Preview>
      <Body style={{ backgroundColor: BRAND.background, fontFamily: 'Helvetica, Arial, sans-serif', margin: 0, padding: '24px 0' }}>
        <Container style={{ backgroundColor: '#FFFFFF', borderRadius: 8, overflow: 'hidden', maxWidth: 560 }}>
          <Section style={{ backgroundColor: BRAND.navy, padding: '24px 32px' }}>
            <Text style={{ color: BRAND.gold, fontSize: 20, fontWeight: 'bold', margin: 0 }}>
              {BRAND.storeName}
            </Text>
          </Section>

          <Section style={{ padding: '32px' }}>
            <Heading style={{ color: BRAND.burgundy, fontSize: 20, margin: '0 0 8px' }}>
              Payment unsuccessful
            </Heading>
            <Text style={{ color: BRAND.text, fontSize: 14, margin: '0 0 16px' }}>
              {`We weren't able to confirm payment for your order (Order ID: ${orderId}, total $${total.toFixed(2)}). `}
              {`This can happen if a payment expired or wasn't completed in time. No charge was made, `}
              and the items have been released back into stock.
            </Text>
            <Text style={{ color: BRAND.text, fontSize: 14, margin: '0 0 24px' }}>
              {`You're welcome to try again whenever you're ready.`}
            </Text>

            <Section style={{ textAlign: 'center', margin: '8px 0' }}>
              <Button
                href={`${process.env.NEXT_PUBLIC_APP_URL}/cart`}
                style={{
                  backgroundColor: BRAND.navy, color: BRAND.buttonText,
                  padding: '12px 24px', borderRadius: 6, fontSize: 14, fontWeight: 'bold',
                }}
              >
                Return to Cart
              </Button>
            </Section>
          </Section>

          <Section style={{ backgroundColor: BRAND.background, padding: '16px 32px', textAlign: 'center' }}>
            <Text style={{ fontSize: 11, color: BRAND.text, opacity: 0.6, margin: 0 }}>
              {BRAND.storeName} · {/* [yourdomain.com] — replace with real store URL once finalized */}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
