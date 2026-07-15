import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Hr, Button,
} from '@react-email/components';
import { BRAND } from './brand';

export interface ShippingNotificationProps {
  orderId: string;
  trackingNumber?: string | null;
  shippingBlock: string;
  shippingUnitNumber?: string | null;
  shippingStreet: string;
  shippingPostalCode: string;
}

export default function ShippingNotificationEmail({
  orderId, trackingNumber, shippingBlock, shippingUnitNumber, shippingStreet, shippingPostalCode,
}: ShippingNotificationProps) {
  return (
    <Html>
      <Head />
      <Preview>Your {BRAND.storeName} order has shipped</Preview>
      <Body style={{ backgroundColor: BRAND.background, fontFamily: 'Helvetica, Arial, sans-serif', margin: 0, padding: '24px 0' }}>
        <Container style={{ backgroundColor: '#FFFFFF', borderRadius: 8, overflow: 'hidden', maxWidth: 560 }}>
          <Section style={{ backgroundColor: BRAND.navy, padding: '24px 32px' }}>
            <Text style={{ color: BRAND.gold, fontSize: 20, fontWeight: 'bold', margin: 0 }}>
              {BRAND.storeName}
            </Text>
          </Section>

          <Section style={{ padding: '32px 32px 16px' }}>
            <Heading style={{ color: BRAND.text, fontSize: 20, margin: '0 0 8px' }}>
              Your order has shipped
            </Heading>
            <Text style={{ color: BRAND.text, fontSize: 14, margin: '0 0 24px' }}>
              Good news — your order is on its way.
            </Text>

            <Text style={{ color: BRAND.text, fontSize: 12, opacity: 0.7, margin: '0 0 16px' }}>
              Order ID: {orderId}
            </Text>

            {trackingNumber && (
              <Text style={{ color: BRAND.text, fontSize: 14, margin: '0 0 16px' }}>
                Tracking number: <strong>{trackingNumber}</strong>
              </Text>
            )}

            <Hr style={{ borderColor: BRAND.gold, margin: '24px 0' }} />

            <Text style={{ color: BRAND.text, fontSize: 13, fontWeight: 'bold', margin: '0 0 4px' }}>
              Shipping to
            </Text>
            <Text style={{ color: BRAND.text, fontSize: 13, margin: 0 }}>
              Block {shippingBlock}{shippingUnitNumber ? `, ${shippingUnitNumber}` : ''}
            </Text>
            <Text style={{ color: BRAND.text, fontSize: 13, margin: 0 }}>
              {shippingStreet}, Singapore {shippingPostalCode}
            </Text>

            <Section style={{ textAlign: 'center', margin: '32px 0 8px' }}>
              <Button
                href={`${process.env.NEXT_PUBLIC_APP_URL}/account/orders/${orderId}`}
                style={{
                  backgroundColor: BRAND.navy, color: BRAND.buttonText,
                  padding: '12px 24px', borderRadius: 6, fontSize: 14, fontWeight: 'bold',
                }}
              >
                View Order
              </Button>
            </Section>
          </Section>

          <Section style={{ backgroundColor: BRAND.background, padding: '16px 32px', textAlign: 'center' }}>
            <Text style={{ fontSize: 11, color: BRAND.text, opacity: 0.6, margin: 0 }}>
              {BRAND.storeName}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}