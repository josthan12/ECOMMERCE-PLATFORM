import {
  Body, Container, Head, Heading, Html, Preview, Section, Text,
  Row, Column, Hr, Button,
} from '@react-email/components';
import { BRAND } from './brand';

export interface OrderConfirmationItem {
  productName: string;
  combination: Record<string, string>;
  quantity: number;
  price: number;
}

export interface OrderConfirmationProps {
  orderId: string;
  items: OrderConfirmationItem[];
  subtotal: number;
  promoCode?: string | null;
  discountAmount: number;
  shippingFee: number;
  fulfillmentMethod: 'DELIVERY' | 'SELF_COLLECTION';
  gstAmount: number;
  gstEnabled: boolean;
  gstRateDisplay: number;
  total: number;
  shippingBlock: string;
  shippingUnitNumber?: string | null;
  shippingStreet: string;
  shippingPostalCode: string;
}

function formatCombination(combo: Record<string, string>) {
  const entries = Object.entries(combo);
  if (entries.length === 0) return null;
  return entries.map(([k, v]) => `${k}: ${v}`).join(', ');
}

export default function OrderConfirmationEmail({
  orderId, items, subtotal, promoCode, discountAmount, shippingFee,
  fulfillmentMethod, gstAmount, gstEnabled, gstRateDisplay, total,
  shippingBlock, shippingUnitNumber, shippingStreet, shippingPostalCode,
}: OrderConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>Your {BRAND.storeName} order is confirmed</Preview>
      <Body style={{ backgroundColor: BRAND.background, fontFamily: 'Helvetica, Arial, sans-serif', margin: 0, padding: '24px 0' }}>
        <Container style={{ backgroundColor: '#FFFFFF', borderRadius: 8, overflow: 'hidden', maxWidth: 560 }}>
          <Section style={{ backgroundColor: BRAND.navy, padding: '24px 32px' }}>
            <Text style={{ color: BRAND.gold, fontSize: 20, fontWeight: 'bold', margin: 0 }}>
              {BRAND.storeName}
            </Text>
          </Section>

          <Section style={{ padding: '32px 32px 16px' }}>
            <Heading style={{ color: BRAND.text, fontSize: 20, margin: '0 0 8px' }}>
              Order confirmed
            </Heading>
            <Text style={{ color: BRAND.text, fontSize: 14, margin: '0 0 24px' }}>
              Thanks for your order! We&apos;ve received your payment and we&apos;re getting it ready.
            </Text>

            <Text style={{ color: BRAND.text, fontSize: 12, opacity: 0.7, margin: '0 0 24px' }}>
              Order ID: {orderId}
            </Text>

            {items.map((item, i) => {
              const comboText = formatCombination(item.combination);
              return (
                <Row key={i} style={{ borderBottom: `1px solid ${BRAND.gold}`, padding: '12px 0' }}>
                  <Column>
                    <Text style={{ color: BRAND.text, fontSize: 14, fontWeight: 'bold', margin: 0 }}>
                      {item.productName}
                    </Text>
                    {comboText && (
                      <Text style={{ color: BRAND.text, fontSize: 12, opacity: 0.7, margin: '2px 0 0' }}>
                        {comboText}
                      </Text>
                    )}
                    <Text style={{ color: BRAND.text, fontSize: 12, opacity: 0.7, margin: '2px 0 0' }}>
                      Qty {item.quantity}
                    </Text>
                  </Column>
                  <Column align="right">
                    <Text style={{ color: BRAND.text, fontSize: 14, margin: 0 }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </Column>
                </Row>
              );
            })}

            <Section style={{ marginTop: 16 }}>
              <Row>
                <Column><Text style={{ fontSize: 13, color: BRAND.text, margin: '4px 0' }}>Subtotal</Text></Column>
                <Column align="right"><Text style={{ fontSize: 13, color: BRAND.text, margin: '4px 0' }}>${subtotal.toFixed(2)}</Text></Column>
              </Row>
              {discountAmount > 0 && (
                <Row>
                  <Column><Text style={{ fontSize: 13, color: BRAND.text, margin: '4px 0' }}>Discount{promoCode ? ` (${promoCode})` : ''}</Text></Column>
                  <Column align="right"><Text style={{ fontSize: 13, color: BRAND.text, margin: '4px 0' }}>-${discountAmount.toFixed(2)}</Text></Column>
                </Row>
              )}
              <Row>
                <Column><Text style={{ fontSize: 13, color: BRAND.text, margin: '4px 0' }}>{fulfillmentMethod === 'SELF_COLLECTION' ? 'Self Collection' : 'Shipping'}</Text></Column>
                <Column align="right"><Text style={{ fontSize: 13, color: BRAND.text, margin: '4px 0' }}>${shippingFee.toFixed(2)}</Text></Column>
              </Row>
              {gstEnabled && (
                <Row>
                  <Column><Text style={{ fontSize: 13, color: BRAND.text, margin: '4px 0' }}>GST ({gstRateDisplay}%)</Text></Column>
                  <Column align="right"><Text style={{ fontSize: 13, color: BRAND.text, margin: '4px 0' }}>${gstAmount.toFixed(2)}</Text></Column>
                </Row>
              )}
              <Row>
                <Column><Text style={{ fontSize: 15, fontWeight: 'bold', color: BRAND.navy, margin: '8px 0' }}>Total</Text></Column>
                <Column align="right"><Text style={{ fontSize: 15, fontWeight: 'bold', color: BRAND.navy, margin: '8px 0' }}>${total.toFixed(2)}</Text></Column>
              </Row>
            </Section>

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
              {BRAND.storeName} · {/* [yourdomain.com] — replace with real store URL once finalized */}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
